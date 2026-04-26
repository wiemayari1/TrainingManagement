package com.isi.gf.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_token")
@Data
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idUser", nullable = false)
    private User user;

    // FIX: La colonne MySQL s'appelle "expires_at" (snake_case)
    // Hibernate par défaut mappe "expiresAt" → "expiresAt" (sans underscore)
    // Il faut donc préciser le nom de colonne explicitement.
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public PasswordResetToken(User user) {
        this.token = UUID.randomUUID().toString();
        this.user = user;
        this.expiresAt = LocalDateTime.now().plusHours(1); // expire dans 1h
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }
}
