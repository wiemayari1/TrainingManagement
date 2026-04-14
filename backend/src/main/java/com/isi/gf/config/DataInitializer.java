package com.isi.gf.config;

import com.isi.gf.model.User;
import com.isi.gf.repo.RoleRepo;
import com.isi.gf.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;
    @Autowired PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            // Pour chaque utilisateur en base, si le mot de passe n'est pas encore hashé → on le hashe
            userRepo.findAll().forEach(user -> {
                String pwd = user.getPassword();
                // Un hash BCrypt commence toujours par $2a$ ou $2b$
                if (!pwd.startsWith("$2a$") && !pwd.startsWith("$2b$")) {
                    user.setPassword(passwordEncoder.encode(pwd));
                    userRepo.save(user);
                    System.out.println("🔐 Mot de passe hashé pour : " + user.getUsername());
                }
            });
        } catch (Exception e) {
            System.out.println("⚠️ Erreur DataInitializer : " + e.getMessage());
        }
    }
}
