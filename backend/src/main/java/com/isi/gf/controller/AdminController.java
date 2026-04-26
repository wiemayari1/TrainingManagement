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

import java.security.SecureRandom;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired EmailService emailService;

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
            return ResponseEntity.badRequest().body(new MessageResponse("Username deja utilise", false));
        if (req.getEmail() != null && !req.getEmail().isBlank() && userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(new MessageResponse("Email deja utilise", false));

        String roleName = req.getRole() != null ? req.getRole() : "ROLE_USER";
        Role role = roleRepo.findByNom(roleName)
            .orElseThrow(() -> new RuntimeException("Role introuvable: " + roleName));

        String rawPassword = req.getPassword();
        boolean generated = false;
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = generateTempPassword(10);
            generated = true;
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        User saved = userRepo.save(user);

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            emailService.sendCredentialsEmail(saved.getEmail(), saved.getUsername(), rawPassword, role.getNom());
        }

        String msg = generated 
            ? "Utilisateur cree avec succes. Un email avec le mot de passe a ete envoye." 
            : "Utilisateur cree avec succes.";
        return ResponseEntity.ok(new MessageResponse(msg, true));
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
        return ResponseEntity.ok(new MessageResponse("Utilisateur supprime", true));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Role> getAllRoles() { return roleRepo.findAll(); }

    private String generateTempPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

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
