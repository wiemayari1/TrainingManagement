package com.isi.gf.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FormationDTO {
    private Long id;
    private String titre;
    private Integer annee;
    private Integer duree;
    private Double budget;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String lieu;
    private String statut;
    private String domaineLibelle;
    private Long domaineId;
    private String formateurNom;
    private Long formateurId;
    private Long nbParticipants;
    private Double moyenneNotes;
}
