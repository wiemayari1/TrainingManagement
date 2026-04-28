package com.isi.gf.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import java.util.Map;

/**
 * ✅ FIX 5 — Blacklist de tokens JWT révoqués (logout sécurisé).
 *
 * Implémentation en mémoire avec auto-nettoyage.
 * En production multi-instances : remplacer par Redis.
 *
 * Fonctionnement :
 *  - Au logout, le token est ajouté avec son expiration.
 *  - JwtAuthFilter vérifie si le token est blacklisté avant d'autoriser.
 *  - Les entrées expirées sont nettoyées à chaque opération pour éviter
 *    une fuite mémoire sans dépendance externe.
 */
@Service
public class TokenBlacklistService {

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    // token → timestamp d'expiration (epoch ms)
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    /**
     * Ajoute un token révoqué à la blacklist.
     * @param token  le JWT complet
     * @param expiry l'instant d'expiration du token
     */
    public void revoke(String token, Instant expiry) {
        cleanExpired();
        blacklist.put(token, expiry.toEpochMilli());
    }

    /**
     * Révoque un token dont on ne connaît pas l'expiration exacte :
     * on utilise la durée maximale JWT configurée.
     */
    public void revoke(String token) {
        revoke(token, Instant.now().plusMillis(jwtExpirationMs));
    }

    /**
     * Vérifie si un token est révoqué.
     */
    public boolean isRevoked(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) return false;
        // Si expiré, on peut l'effacer maintenant
        if (Instant.now().toEpochMilli() > expiry) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Nettoyage périodique des entrées expirées.
     * Appelé automatiquement lors de chaque révocation.
     */
    private void cleanExpired() {
        long now = Instant.now().toEpochMilli();
        blacklist.entrySet().removeIf(e -> e.getValue() < now);
    }

    /** Pour les tests ou monitoring. */
    public int blacklistSize() {
        cleanExpired();
        return blacklist.size();
    }
}
