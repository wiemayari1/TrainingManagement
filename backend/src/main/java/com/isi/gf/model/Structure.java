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
@Table(name = "structure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Structure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le libellé est obligatoire")
    @Column(nullable = false, unique = true, length = 100)
    private String libelle;

    @NotBlank(message = "Le type est obligatoire")
    @Column(nullable = false, length = 20)
    private String type; // CENTRALE ou REGIONALE

    @OneToMany(mappedBy = "structure")
    @JsonIgnore
    private List<Participant> participants = new ArrayList<>();
}
