package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.PasswordResetToken;
import com.isi.gf.model.User;
import com.isi.gf.repo.PasswordResetTokenRepo;
import com.isi.gf.repo.UserRepo;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    @Autowired private UserRepo userRepo;
    @Autowired private PasswordResetTokenRepo tokenRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        userRepo.findByEmail(req.getEmail()).ifPresent(user -> {
            tokenRepo.deleteByUserId(user.getId());
            PasswordResetToken token = new PasswordResetToken(user);
            tokenRepo.save(token);
            // Email désactivé temporairement - log en console
            System.out.println("🔑 Token reset pour " + user.getEmail() + ": " + token.getToken());
        });

        return ResponseEntity.ok(new MessageResponse(
            "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.", true
        ));
    }

    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        return tokenRepo.findByToken(token)
            .filter(PasswordResetToken::isValid)
            .map(t -> ResponseEntity.ok(new MessageResponse("Token valide", true)))
            .orElse(ResponseEntity.badRequest().body(
                new MessageResponse("Token invalide ou expiré", false)
            ));
    }

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
