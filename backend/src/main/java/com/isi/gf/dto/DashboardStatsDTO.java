package com.isi.gf.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * DTO enrichi pour les statistiques du dashboard.
 * Champs ajoutés pour répondre aux exigences du prof :
 * "indicateurs permettant de suivre et évaluer l'activité du centre"
 */
@Data
public class DashboardStatsDTO {
    // KPIs principaux
    private Long totalFormations;
    private Long totalParticipants;
    private Long totalFormateurs;
    private Double budgetTotal;
    private Double tauxPresence;
    private Double satisfactionMoyenne;

    // Formateurs internes vs externes
    private Integer formateursInternes;
    private Integer formateursExternes;

    // Graphiques
    private List<Map<String, Object>> formationsParDomaine;   // BarChart + PieChart
    private List<Map<String, Object>> evolutionMensuelle;     // AreaChart (courbe)
    private List<Map<String, Object>> formationsParStatut;    // Donut chart
    private List<Map<String, Object>> budgetParTrimestre;     // BarChart groupé
    private List<Map<String, Object>> topFormateurs;          // Tableau classement
    private List<Map<String, Object>> topStructures;          // Barres horizontales
    private List<Map<String, Object>> competencesRadar;       // Radar chart
}
