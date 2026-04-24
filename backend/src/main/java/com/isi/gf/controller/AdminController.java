package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Role;
import com.isi.gf.model.User;
import com.isi.gf.repo.RoleRepo;
import com.isi.gf.repo.UserRepo;
import com.isi.gf.service.EmailService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired EmailService emailService; // ✅ AJOUT

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() { return userRepo.findAll(); }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            return ResponseEntity.badRequest().body(new MessageResponse("Username déjà utilisé", false));
        if (req.getEmail() != null && !req.getEmail().isBlank() && userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(new MessageResponse("Email déjà utilisé", false));

        String roleName = req.getRole() != null ? req.getRole() : "ROLE_USER";
        Role role = roleRepo.findByNom(roleName)
            .orElseThrow(() -> new RuntimeException("Rôle introuvable: " + roleName));

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        User saved = userRepo.save(user);

        // ✅ Envoyer email de bienvenue si email fourni
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            try {
                emailService.sendWelcomeEmail(req.getEmail(), req.getUsername(), roleName);
            } catch (Exception e) {
                System.err.println("Email de bienvenue non envoyé : " + e.getMessage());
            }
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody CreateUserRequest req) {
        return userRepo.findById(id).map(u -> {
            u.setUsername(req.getUsername());
            u.setEmail(req.getEmail());
            if (req.getRole() != null)
                roleRepo.findByNom(req.getRole()).ifPresent(u::setRole);
            if (req.getPassword() != null && !req.getPassword().isBlank())
                u.setPassword(passwordEncoder.encode(req.getPassword()));
            return ResponseEntity.ok(userRepo.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé", true));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Role> getAllRoles() { return roleRepo.findAll(); }

    @Data
    public static class CreateUserRequest {
        private String username;
        private String login;
        private String email;
        private String password;
        private String role;
        public String getUsername() { return username != null ? username : login; }
    }
}
