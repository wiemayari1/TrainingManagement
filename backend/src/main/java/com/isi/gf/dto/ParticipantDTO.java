package com.isi.gf.dto;

import lombok.Data;

@Data
public class ParticipantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String tel;
    private String structureLibelle;
    private Long structureId;
    private String profilLibelle;
    private Long profilId;
    private Integer nbFormations;
}
