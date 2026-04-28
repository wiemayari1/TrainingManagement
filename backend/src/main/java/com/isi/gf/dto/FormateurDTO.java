package com.isi.gf.dto;

import lombok.Data;

@Data
public class FormateurDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String tel;
    private String type;
    private String employeurNom;
    private Long employeurId;
    private Integer nbFormations;
    private Double moyenneNotes;
}
