package com.isi.gf.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.isi.gf.service.UserDetailsImpl;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}")
    private int jwtExpirationMs;

    private final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "ERREUR SECURITE : JWT_SECRET non defini. Minimum 64 caracteres."
            );
        }
        if (jwtSecret.length() < 64) {
            throw new IllegalStateException(
                    "ERREUR SECURITE : JWT_SECRET trop court (" + jwtSecret.length() +
                            " chars). Minimum : 64 caracteres."
            );
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ========== GENERATION TOKEN ==========

    public String generateToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String tokenId = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(tokenId)
                .subject(userPrincipal.getUsername())
                .claim("id", userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .claim("roles", userPrincipal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // ========== EXTRACTION DONNEES ==========

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public String getUserNameFromJwtToken(String token) {
        return getUsernameFromToken(token);
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseClaims(token);
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?> roles && !roles.isEmpty() && roles.get(0) instanceof String) {
            return (String) roles.get(0);
        }
        return "ROLE_USER";
    }

    public String getTokenId(String token) {
        return parseClaims(token).getId();
    }

    // ========== BLACKLIST ==========

    public void blacklistToken(String token) {
        try {
            String jti = getTokenId(token);
            if (jti != null) {
                blacklistedTokens.add(jti);
            }
        } catch (Exception ignored) {}
    }

    // ========== VALIDATION ==========

    public boolean validateToken(String authToken) {
        try {
            Claims claims = parseClaims(authToken);
            String jti = claims.getId();
            if (jti != null && blacklistedTokens.contains(jti)) {
                return false;
            }
            return true;
        } catch (SecurityException e) {
            System.err.println("Signature JWT invalide: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("Token JWT malforme: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("Token JWT expire: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("Token JWT non supporte: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("Token JWT vide: " + e.getMessage());
        }
        return false;
    }

    public boolean validateJwtToken(String authToken) {
        return validateToken(authToken);
    }

    // ========== PARSING INTERNE ==========

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims getAllClaimsFromToken(String token) {
        return parseClaims(token);
    }
}