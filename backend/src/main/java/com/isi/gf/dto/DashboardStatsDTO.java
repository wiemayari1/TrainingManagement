package com.isi.gf.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsDTO {
    // KPIs principaux
    private Long totalFormations;
    private Long totalParticipants;
    private Long totalFormateurs;
    private Double budgetTotal;
    private Double tauxPresence;
    private Double satisfactionMoyenne;

    // Note moyenne globale (calculée depuis les inscriptions)
    private Double noteMoyenneGlobale;

    // Formateurs internes vs externes
    private Integer formateursInternes;
    private Integer formateursExternes;

    // Graphiques
    private List<Map<String, Object>> formationsParDomaine;
    private List<Map<String, Object>> evolutionMensuelle;
    private List<Map<String, Object>> formationsParStatut;
    private List<Map<String, Object>> budgetParTrimestre;
    private List<Map<String, Object>> topFormateurs;
    private List<Map<String, Object>> participantsParStructure;
    private List<Map<String, Object>> notesMoyennesParDomaine;
    private List<Map<String, Object>> topStructures;
    private List<Map<String, Object>> competencesRadar;
}