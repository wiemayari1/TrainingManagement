package com.isi.gf.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service d'audit léger.
 *
 * En production, remplacer le logger par une table SQL `audit_log`
 * ou un flux vers un SIEM (Elasticsearch, Splunk…).
 *
 * Usage dans un contrôleur :
 *   auditLog.log("DELETE_FORMATION", "id=" + id);
 */
@Service
public class AuditLogService {

    private static final Logger audit = LoggerFactory.getLogger("AUDIT");
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void log(String action, String details) {
        String user = getCurrentUser();
        String timestamp = LocalDateTime.now().format(FMT);
        // Format structuré : facile à parser par un SIEM
        audit.info("[AUDIT] timestamp={} user={} action={} details={}",
                timestamp, user, action, sanitize(details));
    }

    public void logFailure(String action, String reason) {
        String user = getCurrentUser();
        String timestamp = LocalDateTime.now().format(FMT);
        audit.warn("[AUDIT-FAILURE] timestamp={} user={} action={} reason={}",
                timestamp, user, action, sanitize(reason));
    }

    private String getCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "anonymous";
    }

    /** Supprime les retours à la ligne pour éviter le log injection */
    private String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("[\r\n\t]", " ").substring(0, Math.min(input.length(), 500));
    }
}
