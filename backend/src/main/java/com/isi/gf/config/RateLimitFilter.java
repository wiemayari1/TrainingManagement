package com.isi.gf.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ✅ FIX 2 — Rate limiting sur /auth/login
 * Max 5 tentatives par minute par adresse IP.
 * Utilise Bucket4j avec un cache ConcurrentHashMap en mémoire.
 * En production avec plusieurs instances : remplacer par un cache Redis.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${app.ratelimit.login.capacity:5}")
    private int capacity;

    @Value("${app.ratelimit.login.refill-tokens:5}")
    private int refillTokens;

    @Value("${app.ratelimit.login.refill-minutes:1}")
    private long refillMinutes;

    // Cache IP → Bucket (TTL géré par éviction basique)
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Applique uniquement sur POST /api/auth/login
        if (!isLoginEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);
        Bucket bucket = buckets.computeIfAbsent(ip, this::createBucket);

        if (bucket.tryConsume(1)) {
            // Ajoute les headers de quota restant
            long remaining = bucket.getAvailableTokens();
            response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            filterChain.doFilter(request, response);
        } else {
            // Trop de tentatives
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("X-RateLimit-Limit", String.valueOf(capacity));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After", String.valueOf(refillMinutes * 60));
            objectMapper.writeValue(response.getWriter(), Map.of(
                "message", "Trop de tentatives de connexion. Réessayez dans " + refillMinutes + " minute(s).",
                "success", false
            ));
        }
    }

    private boolean isLoginEndpoint(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
            && request.getRequestURI().endsWith("/auth/login");
    }

    private Bucket createBucket(String ip) {
        Refill refill = Refill.intervally(refillTokens, Duration.ofMinutes(refillMinutes));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * Récupère l'IP réelle même derrière un reverse proxy (Nginx, etc.)
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
