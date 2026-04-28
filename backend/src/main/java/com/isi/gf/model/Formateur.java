package com.isi.gf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 50)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false, length = 50)
    private String prenom;

    @Email(message = "Email invalide")
    @Column(length = 100)
    private String email;

    @Pattern(regexp = "^[0-9]{8,20}$", message = "Téléphone invalide")
    @Column(length = 20)
    private String tel;

    @NotBlank(message = "Le type est obligatoire")
    @Pattern(regexp = "^(INTERNE|EXTERNE)$", message = "Type doit être INTERNE ou EXTERNE")
    @Column(nullable = false, length = 10)
    private String type; // INTERNE ou EXTERNE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idEmployeur")
    private Employeur employeur;

    @OneToMany(mappedBy = "formateur")
    @JsonIgnore
    private List<Formation> formations = new ArrayList<>();
}
