package com.isi.gf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    @NotNull(message = "L'annee est obligatoire")
    @Min(value = 2020, message = "Annee invalide")
    private Integer annee;

    @NotNull(message = "La duree est obligatoire")
    @Min(value = 1, message = "La duree doit etre d'au moins 1 jour")
    private Integer duree;

    @NotNull(message = "Le budget est obligatoire")
    @Positive(message = "Le budget doit etre positif")
    private Double budget;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Column(length = 200)
    private String lieu;

    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "^(PLANIFIEE|EN_COURS|TERMINEE|ANNULEE)$", message = "Statut invalide")
    @Column(nullable = false, length = 20)
    private String statut = "PLANIFIEE";

    @NotNull(message = "Le domaine est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idDomaine", nullable = false)
    private Domaine domaine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idFormateur")
    private Formateur formateur;

    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Inscription> inscriptions = new ArrayList<>();
}
