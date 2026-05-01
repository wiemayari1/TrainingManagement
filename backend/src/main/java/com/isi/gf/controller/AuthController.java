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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired AuthenticationManager authenticationManager;
    @Autowired UserRepo userRepository;
    @Autowired RoleRepo roleRepository;
    @Autowired PasswordResetTokenRepo tokenRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;
    @Autowired EmailService emailService;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    // ========== LOGIN ==========

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        if (username == null || username.isBlank() || username.length() > 50) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Identifiants invalides", false));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username.trim(), loginRequest.getPassword())
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

    // ========== LOGOUT ==========

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            jwtUtils.blacklistToken(token);
        }
        return ResponseEntity.ok(new MessageResponse("Deconnexion reussie", true));
    }

    // ========== FORGOT PASSWORD ==========

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.ok(new MessageResponse(
                    "Si cet email existe, vous recevrez un lien de reinitialisation.", true));
        }

        String email = request.getEmail().trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(email).matches() || email.length() > 100) {
            return ResponseEntity.ok(new MessageResponse(
                    "Si cet email existe, vous recevrez un lien de reinitialisation.", true));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            try { Thread.sleep(200); } catch (InterruptedException ignored) {}
            return ResponseEntity.ok(new MessageResponse(
                    "Si cet email existe, vous recevrez un lien de reinitialisation.", true));
        }

        User user = userOpt.get();

        try {
            tokenRepository.deleteByUserId(user.getId());
            tokenRepository.flush();
        } catch (Exception e) {
            System.err.println("Avertissement suppression token: " + e.getMessage());
        }

        try {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, user, 60);
            tokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            System.err.println("Erreur envoi email reset: " + e.getMessage());
        }

        return ResponseEntity.ok(new MessageResponse(
                "Si cet email existe, vous recevrez un lien de reinitialisation.", true));
    }

    // ========== VERIFY RESET TOKEN ==========

    @GetMapping("/reset-password/verify")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        if (token == null || token.isBlank() || token.length() > 100) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token invalide.", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);
        if (resetToken == null || !resetToken.isValid()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Ce lien est invalide ou a expire.", false));
        }

        return ResponseEntity.ok(new MessageResponse("Token valide.", true));
    }

    // ========== RESET PASSWORD ==========

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank() || request.getToken().length() > 100) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token invalide.", false));
        }

        String newPwd = request.getPassword();
        if (newPwd == null || newPwd.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le mot de passe doit contenir au moins 8 caracteres.", false));
        }
        if (newPwd.length() > 128) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mot de passe trop long (max 128 caracteres).", false));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken()).orElse(null);
        if (resetToken == null || !resetToken.isValid()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Ce lien est invalide ou a expire.", false));
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(newPwd));
        user.setFirstLogin(false);
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return ResponseEntity.ok(new MessageResponse("Mot de passe reinitialise avec succes.", true));
    }

    // ========== CHANGE PASSWORD ==========

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request,
                                            HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Non authentifie", false));
        }

        String newPwd = request.getNewPassword();
        if (newPwd == null || newPwd.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Le mot de passe doit contenir au moins 8 caracteres.", false));
        }
        if (newPwd.length() > 128) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mot de passe trop long.", false));
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Utilisateur non trouve", false));
        }

        if (!Boolean.TRUE.equals(user.getFirstLogin())) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Ancien mot de passe requis", false));
            }
            if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Ancien mot de passe incorrect", false));
            }
            if (newPwd.equals(request.getOldPassword())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Le nouveau mot de passe doit etre different de l'ancien.", false));
            }
        }

        user.setPassword(encoder.encode(newPwd));
        user.setFirstLogin(false);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Mot de passe change avec succes.", true));
    }

    // ========== DTOs INTERNES ==========

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