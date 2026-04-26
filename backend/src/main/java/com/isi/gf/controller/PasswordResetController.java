package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.PasswordResetToken;
import com.isi.gf.model.User;
import com.isi.gf.repo.PasswordResetTokenRepo;
import com.isi.gf.repo.UserRepo;
import com.isi.gf.service.EmailService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class PasswordResetController {

    @Autowired private UserRepo userRepo;
    @Autowired private PasswordResetTokenRepo tokenRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;   // ← était manquant !

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email obligatoire", false));
        }

        userRepo.findByEmail(req.getEmail().trim()).ifPresent(user -> {
            // Supprimer les anciens tokens de cet utilisateur
            tokenRepo.deleteByUserId(user.getId());

            // Créer un nouveau token
            PasswordResetToken token = new PasswordResetToken(user);
            tokenRepo.save(token);

            // Envoyer l'email (avec fallback console si SMTP KO)
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token.getToken());
                System.out.println("✅ Email de reset envoyé à : " + user.getEmail());
            } catch (Exception e) {
                // Si l'envoi email échoue, on log quand même le token pour le dev
                System.err.println("⚠️ Échec envoi email : " + e.getMessage());
                System.out.println("🔑 [DEV] Lien reset : http://localhost:3000/reset-password?token=" + token.getToken());
            }
        });

        // Réponse identique que l'email existe ou non (sécurité anti-énumération)
        return ResponseEntity.ok(new MessageResponse(
                "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.", true
        ));
    }

    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token manquant", false));
        }
        return tokenRepo.findByToken(token)
                .filter(PasswordResetToken::isValid)
                .map(t -> ResponseEntity.ok(new MessageResponse("Token valide", true)))
                .orElse(ResponseEntity.badRequest().body(
                        new MessageResponse("Token invalide ou expiré", false)
                ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.getToken() == null || req.getToken().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token manquant", false));
        }

        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le mot de passe doit contenir au moins 6 caractères", false));
        }

        PasswordResetToken tokenEntity = tokenRepo.findByToken(req.getToken()).orElse(null);

        if (tokenEntity == null || !tokenEntity.isValid()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token invalide ou expiré", false));
        }

        User user = tokenEntity.getUser();
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFirstLogin(false);
        userRepo.save(user);

        tokenEntity.setUsed(true);
        tokenRepo.save(tokenEntity);

        return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès", true));
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String password;
    }
}