package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Role;
import com.isi.gf.model.User;
import com.isi.gf.repo.RoleRepo;
import com.isi.gf.repo.UserRepo;
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
        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(new MessageResponse("Email déjà utilisé", false));

        String roleName = req.getRole() != null ? req.getRole() : "ROLE_USER";
        Role role = roleRepo.findByNom(roleName)
            .orElseThrow(() -> new RuntimeException("Rôle introuvable: " + roleName));

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        return ResponseEntity.ok(userRepo.save(user));
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

    public static class CreateUserRequest {
        private String username;
        private String login; // alias pour compatibilité frontend
        private String email;
        private String password;
        private String role;

        public String getUsername() { return username != null ? username : login; }
        public void setUsername(String u) { this.username = u; }
        public String getLogin() { return login; }
        public void setLogin(String l) { this.login = l; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
        public String getRole() { return role; }
        public void setRole(String r) { this.role = r; }
    }
}
