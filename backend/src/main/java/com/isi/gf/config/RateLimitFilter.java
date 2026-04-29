package com.isi.gf.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiter simple en mémoire pour les endpoints sensibles.
 * En production, utiliser Redis + Bucket4j pour la distribution.
 *
 * Limites :
 *   - /auth/login          : 10 requêtes / minute / IP
 *   - /auth/forgot-password: 3  requêtes / minute / IP
 *   - Autres /auth/**      : 20 requêtes / minute / IP
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private record RateEntry(AtomicInteger count, long windowStart) {}

    private final Map<String, RateEntry> loginAttempts      = new ConcurrentHashMap<>();
    private final Map<String, RateEntry> forgotAttempts     = new ConcurrentHashMap<>();
    private final Map<String, RateEntry> generalAuthAttempts = new ConcurrentHashMap<>();

    private static final long  WINDOW_MS        = 60_000L;
    private static final int   LOGIN_LIMIT       = 10;
    private static final int   FORGOT_LIMIT      = 3;
    private static final int   GENERAL_AUTH_LIMIT = 20;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        if (!path.startsWith("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);

        boolean limited;
        if (path.equals("/auth/login")) {
            limited = isRateLimited(ip, loginAttempts, LOGIN_LIMIT);
        } else if (path.equals("/auth/forgot-password")) {
            limited = isRateLimited(ip, forgotAttempts, FORGOT_LIMIT);
        } else {
            limited = isRateLimited(ip, generalAuthAttempts, GENERAL_AUTH_LIMIT);
        }

        if (limited) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            response.getWriter().write(
                    "{\"message\":\"Trop de tentatives. Réessayez dans 60 secondes.\",\"success\":false}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String ip, Map<String, RateEntry> store, int limit) {
        long now = System.currentTimeMillis();
        store.compute(ip, (key, entry) -> {
            if (entry == null || now - entry.windowStart() > WINDOW_MS) {
                return new RateEntry(new AtomicInteger(1), now);
            }
            entry.count().incrementAndGet();
            return entry;
        });
        RateEntry entry = store.get(ip);
        return entry != null && entry.count().get() > limit;
    }

    private String getClientIp(HttpServletRequest request) {
        // Respecte les proxies (nginx, load balancer)
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri.trim();
        }
        return request.getRemoteAddr();
    }
}