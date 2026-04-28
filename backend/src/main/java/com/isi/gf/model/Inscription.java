package com.isi.gf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "inscription", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"idFormation", "idParticipant"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La formation est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idFormation", nullable = false)
    private Formation formation;

    @NotNull(message = "Le participant est obligatoire")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idParticipant", nullable = false)
    private Participant participant;

    @Min(value = 0, message = "La note minimale est 0")
    @Max(value = 20, message = "La note maximale est 20")
    private Double note;

    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "^(INSCRIT|PRESENT|ABSENT)$", message = "Statut invalide")
    @Column(nullable = false, length = 20)
    private String statut = "INSCRIT";
}
