package com.isi.gf.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * DTO enrichi pour les statistiques du dashboard.
 * ✅ CORRECTION : ajout des champs manquants utilisés par Stats.jsx
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

    // ✅ AJOUTÉ : note moyenne globale
    private Double noteMoyenneGlobale;

    // Formateurs internes vs externes
    private Integer formateursInternes;
    private Integer formateursExternes;

    // Graphiques
    private List<Map<String, Object>> formationsParDomaine;        // BarChart + PieChart
    private List<Map<String, Object>> evolutionMensuelle;          // AreaChart (courbe)
    private List<Map<String, Object>> formationsParStatut;         // Donut chart
    private List<Map<String, Object>> budgetParTrimestre;          // BarChart groupé
    private List<Map<String, Object>> topFormateurs;               // Tableau classement
    private List<Map<String, Object>> topStructures;               // Barres horizontales
    private List<Map<String, Object>> competencesRadar;            // Radar chart

    // ✅ AJOUTÉ : notes moyennes par domaine (utilisé par Stats.jsx onglet Notes)
    private List<Map<String, Object>> notesMoyennesParDomaine;

    // ✅ AJOUTÉ : participants par structure (utilisé par Stats.jsx onglet Répartition)
    private List<Map<String, Object>> participantsParStructure;
}