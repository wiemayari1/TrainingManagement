package com.isi.gf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "utilisateur",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "username"),
           @UniqueConstraint(columnNames = "email")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Le username est obligatoire")
    @Size(max = 50)
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(max = 120)
    @Column(nullable = false)
    private String password;

    @Size(max = 100)
    @Email(message = "Email invalide")
    @Column(unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idRole", nullable = false)
    private Role role;

    /** 
     * Indique si c'est la première connexion de l'utilisateur.
     * Si true, l'utilisateur doit changer son mot de passe avant d'accéder à l'application.
     */
    @Column(nullable = false)
    private Boolean firstLogin = true;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstLogin = true;
    }

    public String getRole() {
        return role != null ? role.getNom() : null;
    }
}
