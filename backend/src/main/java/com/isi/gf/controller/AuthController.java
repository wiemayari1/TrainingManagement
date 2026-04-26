package com.isi.gf.controller;

import com.isi.gf.config.JwtUtils;
import com.isi.gf.dto.LoginRequest;
import com.isi.gf.dto.JwtResponse;
import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.User;
import com.isi.gf.repo.UserRepo;
import com.isi.gf.repo.RoleRepo;
import com.isi.gf.service.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepo userRepository;

    @Autowired
    RoleRepo roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

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

            // Récupérer l'utilisateur complet pour avoir firstLogin
            User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                user.getFirstLogin()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                new MessageResponse("Identifiants incorrects", false)
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
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
        user.setFirstLogin(true); // Nouveau utilisateur doit changer son mot de passe

        roleRepository.findByNom("ROLE_USER").ifPresent(user::setRole);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès!", true));
    }

    /**
     * Endpoint pour changer le mot de passe (première connexion ou changement volontaire)
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        // Récupérer l'utilisateur authentifié depuis le token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Non authentifié", false));
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Utilisateur non trouvé", false));
        }

        // Vérifier l'ancien mot de passe (sauf si firstLogin)
        if (!Boolean.TRUE.equals(user.getFirstLogin())) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe requis", false));
            }
            if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Ancien mot de passe incorrect", false));
            }
        }

        // Validation du nouveau mot de passe
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Le nouveau mot de passe doit contenir au moins 6 caractères", false)
            );
        }

        if (request.getNewPassword().equals(request.getOldPassword()) && !Boolean.TRUE.equals(user.getFirstLogin())) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Le nouveau mot de passe doit être différent de l'ancien", false)
            );
        }

        // Mettre à jour le mot de passe
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setFirstLogin(false); // Plus première connexion
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Mot de passe changé avec succès", true));
    }

    @lombok.Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }
}
