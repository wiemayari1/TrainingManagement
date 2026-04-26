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
            // Vérifier que les rôles existent d'abord
            if (roleRepo.count() == 0) {
                System.out.println("⚠️ Aucun rôle trouvé - Skip du hashage automatique");
                return;
            }

            userRepo.findAll().forEach(user -> {
                String pwd = user.getPassword();
                // Un hash BCrypt commence toujours par $2a$ ou $2b$ ou $2y$
                if (pwd != null && !pwd.startsWith("$2")) {
                    user.setPassword(passwordEncoder.encode(pwd));
                    userRepo.save(user);
                    System.out.println("🔐 Mot de passe hashé pour : " + user.getUsername());
                }
                // S'assurer que firstLogin n'est pas null pour les users existants
                if (user.getFirstLogin() == null) {
                    user.setFirstLogin(false); // Users existants = déjà connectés
                    userRepo.save(user);
                }
            });
        } catch (Exception e) {
            System.err.println("⚠️ Erreur DataInitializer (non bloquant) : " + e.getMessage());
        }
    }
}
