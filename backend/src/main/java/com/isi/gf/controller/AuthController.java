package com.isi.gf.controller;

import com.isi.gf.config.JwtUtils;
import com.isi.gf.dto.LoginRequest;
import com.isi.gf.dto.JwtResponse;
import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.PasswordResetToken;
import com.isi.gf.model.User;
import com.isi.gf.repo.PasswordResetTokenRepo;
import com.isi.gf.repo.UserRepo;
import com.isi.gf.repo.RoleRepo;
import com.isi.gf.service.EmailService;
import com.isi.gf.service.UserDetailsImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${app.frontend.url:http://localhost:3000}", allowCredentials = "true")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepo userRepository;

    @Autowired
    RoleRepo roleRepository;

    @Autowired
    PasswordResetTokenRepo tokenRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    // ── LOGIN ──────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                userDetails.getFirstLogin()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                new MessageResponse("Identifiants incorrects", false)
            );
        }
    }

    // ── REGISTER ───────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        if (signUpRequest.getUsername() == null || signUpRequest.getUsername().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Erreur: Le username est obligatoire!", false));
        }
        if (signUpRequest.getPassword() == null || signUpRequest.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Erreur: Le mot de passe doit contenir au moins 6 caractères!", false));
        }

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Erreur: Ce username est déjà utilisé!", false));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Erreur: Cet email est déjà utilisé!", false));
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstLogin(true);

        roleRepository.findByNom("ROLE_USER").ifPresent(user::setRole);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès!", true));
    }

    // ── FORGOT PASSWORD ────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Veuillez entrer votre email.", false));
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(new MessageResponse(
                "Si cet email existe, vous recevrez un lien de réinitialisation.", true));
        }

        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, 60);
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email de réinitialisation à {} : {}", user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body(
                new MessageResponse("Erreur lors de l'envoi de l'email. Réessayez plus tard.", false));
        }

        return ResponseEntity.ok(new MessageResponse(
            "Si cet email existe, vous recevrez un lien de réinitialisation.", true));
    }

    // ── VERIFY RESET TOKEN ─────────────────────────────────────────────────
    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Token manquant.", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null || resetToken.isExpired() || resetToken.isUsed()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Ce lien est invalide ou a expiré.", false));
        }

        return ResponseEntity.ok(new MessageResponse("Token valide.", true));
    }

    // ── RESET PASSWORD ─────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Token manquant.", false));
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Le mot de passe doit contenir au moins 6 caractères.", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken()).orElse(null);

        if (resetToken == null || resetToken.isExpired() || resetToken.isUsed()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Ce lien est invalide ou a expiré.", false));
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        resetToken.markAsUsed();
        tokenRepository.save(resetToken);

        return ResponseEntity.ok(new MessageResponse(
            "Mot de passe réinitialisé avec succès.", true));
    }

    // ── CHANGE PASSWORD ────────────────────────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Non authentifié", false));
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Utilisateur non trouvé", false));
        }

        if (!Boolean.TRUE.equals(user.getFirstLogin())) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe requis", false));
            }
            if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe incorrect", false));
            }
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Le nouveau mot de passe doit contenir au moins 6 caractères", false));
        }

        if (request.getNewPassword().equals(request.getOldPassword()) && !Boolean.TRUE.equals(user.getFirstLogin())) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Le nouveau mot de passe doit être différent de l'ancien", false));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Mot de passe changé avec succès", true));
    }

    // ── TEST EMAIL (admin only) ────────────────────────────────────────────
    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Veuillez fournir une adresse email de test.", false));
        }
        try {
            emailService.sendPasswordResetEmail(to, UUID.randomUUID().toString());
            log.info("Email de test envoyé à {}", to);
            return ResponseEntity.ok(new MessageResponse("Email de test envoyé à " + to, true));
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email de test à {} : {}", to, e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(new MessageResponse("Échec de l'envoi : " + e.getMessage(), false));
        }
    }

    // ── DTOs internes ──────────────────────────────────────────────────────
    @lombok.Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @lombok.Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @lombok.Data
    public static class ResetPasswordRequest {
        private String token;
        private String password;
    }
}
