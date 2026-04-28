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
import com.isi.gf.service.TokenBlacklistService;
import com.isi.gf.service.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired AuthenticationManager    authenticationManager;
    @Autowired UserRepo                 userRepository;
    @Autowired RoleRepo                 roleRepository;
    @Autowired PasswordResetTokenRepo   tokenRepository;
    @Autowired PasswordEncoder          encoder;
    @Autowired JwtUtils                 jwtUtils;
    @Autowired EmailService             emailService;
    // ✅ FIX 5 — Blacklist pour logout sécurisé
    @Autowired TokenBlacklistService    tokenBlacklistService;

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

    // ✅ FIX 5 — LOGOUT sécurisé : révoque le token côté serveur
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.revoke(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Déconnexion réussie", true));
    }

    // ── REGISTER ───────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Ce username est déjà utilisé", false));
        }
        if (signUpRequest.getEmail() != null && userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Cet email est déjà utilisé", false));
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstLogin(true);
        roleRepository.findByNom("ROLE_USER").ifPresent(user::setRole);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès", true));
    }

    // ── FORGOT PASSWORD ────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Veuillez entrer votre email.", false));
        }

        String emailTrimmed = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(emailTrimmed);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getEmail().trim());
        }

        // Toujours retourner 200 (ne pas révéler si l'email existe)
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse(
                    "Si cet email existe, vous recevrez un lien de réinitialisation.", true));
        }

        User user = userOpt.get();

        try {
            tokenRepository.deleteByUserId(user.getId());
            tokenRepository.flush();
        } catch (Exception e) {
            System.err.println("Suppression anciens tokens (ignorée): " + e.getMessage());
        }

        String token;
        try {
            token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, user, 60);
            tokenRepository.save(resetToken);
        } catch (Exception e) {
            System.err.println("Erreur création token: " + e.getMessage());
            return ResponseEntity.status(500).body(
                    new MessageResponse("Erreur lors de la création du token. Réessayez.", false));
        }

        try {
            // ✅ FIX 6 — On envoie un LIEN de définition, pas un mot de passe en clair
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            System.err.println("Email non envoyé: " + e.getMessage());
        }

        return ResponseEntity.ok(new MessageResponse(
                "Si cet email existe, vous recevrez un lien de réinitialisation.", true));
    }

    // ── VERIFY RESET TOKEN ─────────────────────────────────────────────────
    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token manquant.", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null)       return ResponseEntity.badRequest().body(new MessageResponse("Ce lien est invalide.", false));
        if (resetToken.isExpired())   return ResponseEntity.badRequest().body(new MessageResponse("Ce lien a expiré.", false));
        if (resetToken.isUsed())      return ResponseEntity.badRequest().body(new MessageResponse("Ce lien a déjà été utilisé.", false));

        return ResponseEntity.ok(new MessageResponse("Token valide.", true));
    }

    // ── RESET PASSWORD ─────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token manquant.", false));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                    new MessageResponse("Le mot de passe doit contenir au moins 6 caractères.", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken()).orElse(null);

        if (resetToken == null)      return ResponseEntity.badRequest().body(new MessageResponse("Ce lien est invalide.", false));
        if (resetToken.isExpired())  return ResponseEntity.badRequest().body(new MessageResponse("Ce lien a expiré.", false));
        if (resetToken.isUsed())     return ResponseEntity.badRequest().body(new MessageResponse("Ce lien a déjà été utilisé.", false));

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès.", true));
    }

    // ── CHANGE PASSWORD (utilisateur connecté) ─────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Non authentifié", false));
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Utilisateur non trouvé", false));
        }

        // Vérification ancien mot de passe (sauf première connexion)
        if (!Boolean.TRUE.equals(user.getFirstLogin())) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe requis", false));
            }
            if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe incorrect", false));
            }
            if (request.getNewPassword().equals(request.getOldPassword())) {
                return ResponseEntity.badRequest().body(
                        new MessageResponse("Le nouveau mot de passe doit être différent de l'ancien", false));
            }
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                    new MessageResponse("Le nouveau mot de passe doit contenir au moins 6 caractères", false));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        // ✅ FIX 5 — Révoquer l'ancien token après changement de mot de passe
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenBlacklistService.revoke(authHeader.substring(7));
        }

        return ResponseEntity.ok(new MessageResponse("Mot de passe changé avec succès", true));
    }

    // ── DTOs internes ──────────────────────────────────────────────────────
    @lombok.Data public static class ChangePasswordRequest { private String oldPassword; private String newPassword; }
    @lombok.Data public static class ForgotPasswordRequest  { private String email; }
    @lombok.Data public static class ResetPasswordRequest   { private String token; private String password; }
}