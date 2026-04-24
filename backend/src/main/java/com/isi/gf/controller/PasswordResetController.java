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
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    // ── Étape 1 : Demande de reset ────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        // On ne révèle pas si l'email existe ou non (sécurité)
        userRepo.findByEmail(req.getEmail()).ifPresent(user -> {
            // Supprimer les anciens tokens
            tokenRepo.deleteByUserId(user.getId());

            // Créer nouveau token
            PasswordResetToken token = new PasswordResetToken(user);
            tokenRepo.save(token);

            // Envoyer email
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token.getToken());
            } catch (Exception e) {
                System.err.println("Email non envoyé : " + e.getMessage());
            }
        });

        return ResponseEntity.ok(new MessageResponse(
            "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.", true
        ));
    }

    // ── Étape 2 : Vérifier token ──────────────────────────────────────────────
    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        return tokenRepo.findByToken(token)
            .filter(PasswordResetToken::isValid)
            .map(t -> ResponseEntity.ok(new MessageResponse("Token valide", true)))
            .orElse(ResponseEntity.badRequest().body(
                new MessageResponse("Token invalide ou expiré", false)
            ));
    }

    // ── Étape 3 : Nouveau mot de passe ────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Le mot de passe doit contenir au moins 6 caractères", false)
            );
        }

        PasswordResetToken tokenEntity = tokenRepo.findByToken(req.getToken())
            .orElse(null);

        if (tokenEntity == null || !tokenEntity.isValid()) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Token invalide ou expiré", false)
            );
        }

        User user = tokenEntity.getUser();
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepo.save(user);

        // Invalider le token
        tokenEntity.setUsed(true);
        tokenRepo.save(tokenEntity);

        return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès", true));
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────
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
