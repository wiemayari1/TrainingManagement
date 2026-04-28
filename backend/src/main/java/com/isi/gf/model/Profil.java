package com.isi.gf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profil")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le libellé est obligatoire")
    @Column(nullable = false, unique = true, length = 100)
    private String libelle;

    @OneToMany(mappedBy = "profil")
    @JsonIgnore
    private List<Participant> participants = new ArrayList<>();
}
