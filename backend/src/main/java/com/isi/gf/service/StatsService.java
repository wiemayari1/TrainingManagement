package com.isi.gf.service;

import com.isi.gf.dto.DashboardStatsDTO;
import com.isi.gf.repo.FormRepo;
import com.isi.gf.repo.PartRepo;
import com.isi.gf.repo.FormateurRepo;
import com.isi.gf.repo.InscriptionRepo;
import com.isi.gf.repo.StructureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StatsService {

    @Autowired private FormRepo formRepo;
    @Autowired private PartRepo partRepo;
    @Autowired private FormateurRepo formateurRepo;
    @Autowired private InscriptionRepo inscriptionRepo;
    @Autowired private StructureRepo structureRepo;

    public DashboardStatsDTO getDashboardStats(Integer annee) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // ── KPIs principaux ──────────────────────────────────────
        stats.setTotalFormations(formRepo.countByAnnee(annee));
        stats.setTotalParticipants(partRepo.countParticipantsByYear(annee));
        stats.setTotalFormateurs((long) formateurRepo.findAll().size());
        stats.setBudgetTotal(formRepo.sumBudgetByAnnee(annee));

        // Formateurs internes vs externes
        Long internes = formateurRepo.countByType("INTERNE");
        Long externes = formateurRepo.countByType("EXTERNE");
        stats.setFormateursInternes(internes != null ? internes.intValue() : 0);
        stats.setFormateursExternes(externes != null ? externes.intValue() : 0);

        // ── Taux de présence ─────────────────────────────────────
        Long totalPresents     = inscriptionRepo.countTotalPresents(annee);
        Long totalInscriptions = inscriptionRepo.countTotalInscriptions(annee);
        double tauxPresence = totalInscriptions > 0
                ? (double) totalPresents / totalInscriptions * 100 : 0;
        stats.setTauxPresence(Math.round(tauxPresence * 10.0) / 10.0);

        // ── Note moyenne globale depuis la DB ────────────────────
        Double noteMoyenneDB = inscriptionRepo.getAverageNoteGlobal(annee);
        stats.setNoteMoyenneGlobale(noteMoyenneDB != null
                ? Math.round(noteMoyenneDB * 10.0) / 10.0 : null);

        // ── Formations par domaine ───────────────────────────────
        List<Object[]> domaineStats = formRepo.statsByDomaine(annee);
        List<Map<String, Object>> formationsParDomaine = new ArrayList<>();
        for (Object[] row : domaineStats) {
            Map<String, Object> map = new HashMap<>();
            map.put("name",   row[0]);
            map.put("value",  row[1]);
            map.put("budget", row[2]);
            formationsParDomaine.add(map);
        }
        stats.setFormationsParDomaine(formationsParDomaine);

        // ── Notes moyennes par domaine (vraies données DB) ───────
        List<Map<String, Object>> notesDomaines = new ArrayList<>();
        try {
            List<Object[]> notesParDomaine = inscriptionRepo.getAverageNoteByDomaineAndAnnee(annee);
            for (Object[] row : notesParDomaine) {
                String domaineName = (String) row[0];
                Double note = row[1] != null ? Math.round(((Number) row[1]).doubleValue() * 10.0) / 10.0 : null;
                if (note != null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("domaine", domaineName);
                    m.put("note", note);
                    m.put("pourcentage", (int) Math.round(note / 20.0 * 100));
                    notesDomaines.add(m);
                }
            }
        } catch (Exception e) {
            // Fallback si requête échoue
        }

        // Compléter avec les domaines sans notes
        for (Object[] row : domaineStats) {
            String domaineName = (String) row[0];
            boolean exists = notesDomaines.stream()
                    .anyMatch(m -> domaineName.equals(m.get("domaine")));
            if (!exists) {
                Map<String, Object> m = new HashMap<>();
                m.put("domaine", domaineName);
                m.put("note", null);
                m.put("pourcentage", 0);
                notesDomaines.add(m);
            }
        }
        stats.setNotesMoyennesParDomaine(notesDomaines);

        // Recalculer la moyenne globale si pas encore définie
        if (stats.getNoteMoyenneGlobale() == null && !notesDomaines.isEmpty()) {
            double avg = notesDomaines.stream()
                    .filter(m -> m.get("note") != null)
                    .mapToDouble(m -> ((Number) m.get("note")).doubleValue())
                    .average().orElse(0.0);
            stats.setNoteMoyenneGlobale(avg > 0 ? Math.round(avg * 10.0) / 10.0 : null);
        }

        // ── Évolution mensuelle (vraies données DB) ──────────────
        String[] moisLabels = {"Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"};
        List<Map<String, Object>> evolution = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("mois",         moisLabels[i]);
            m.put("formations",   0L);
            m.put("participants", 0L);
            m.put("budget",       0.0);
            evolution.add(m);
        }

        // Formations par mois
        List<Object[]> monthlyFormations = formRepo.countByMonth(annee);
        for (Object[] row : monthlyFormations) {
            int month = ((Number) row[0]).intValue() - 1;
            if (month >= 0 && month < 12) {
                evolution.get(month).put("formations", row[1]);
            }
        }

        // Budget par mois
        List<Object[]> monthlyBudget = formRepo.sumBudgetByMonth(annee);
        for (Object[] row : monthlyBudget) {
            int month = ((Number) row[0]).intValue() - 1;
            if (month >= 0 && month < 12) {
                evolution.get(month).put("budget", row[1]);
            }
        }

        // Participants par mois
        try {
            List<Object[]> monthlyParticipants = inscriptionRepo.countParticipantsByMonth(annee);
            for (Object[] row : monthlyParticipants) {
                int month = ((Number) row[0]).intValue() - 1;
                if (month >= 0 && month < 12) {
                    evolution.get(month).put("participants", row[1]);
                }
            }
        } catch (Exception ignored) {}

        stats.setEvolutionMensuelle(evolution);

        // ── Statuts des formations ───────────────────────────────
        List<Map<String, Object>> statuts = new ArrayList<>();
        for (String statut : new String[]{"TERMINEE", "EN_COURS", "PLANIFIEE", "ANNULEE"}) {
            long count = formRepo.findByAnneeAndStatut(annee, statut).size();
            if (count > 0) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", switch (statut) {
                    case "TERMINEE"  -> "Terminées";
                    case "EN_COURS"  -> "En cours";
                    case "PLANIFIEE" -> "Planifiées";
                    default          -> "Annulées";
                });
                m.put("value", count);
                m.put("color", switch (statut) {
                    case "TERMINEE"  -> "#10B981";
                    case "EN_COURS"  -> "#F59E0B";
                    case "PLANIFIEE" -> "#6366F1";
                    default          -> "#EF4444";
                });
                statuts.add(m);
            }
        }
        stats.setFormationsParStatut(statuts);

        // ── Budget par trimestre (données réelles) ───────────────
        List<Object[]> trimData = formRepo.sumBudgetByTrimestre(annee);
        String[] trimLabels = {"T1", "T2", "T3", "T4"};
        double totalBudget = stats.getBudgetTotal() != null ? stats.getBudgetTotal() : 0;
        List<Map<String, Object>> budgetTrimestriel = new ArrayList<>();

        Map<Integer, Double> trimMap = new HashMap<>();
        for (Object[] row : trimData) {
            int q = ((Number) row[0]).intValue() - 1;
            trimMap.put(q, ((Number) row[1]).doubleValue());
        }

        for (int t = 0; t < 4; t++) {
            Map<String, Object> m = new HashMap<>();
            m.put("trimestre", trimLabels[t]);
            m.put("budget", (long) Math.round(trimMap.getOrDefault(t, 0.0)));
            m.put("objectif", (long) Math.round(totalBudget * 0.25));
            budgetTrimestriel.add(m);
        }
        stats.setBudgetParTrimestre(budgetTrimestriel);

        // ── Participants par structure (vraies données) ──────────
        List<Map<String, Object>> parStructure = new ArrayList<>();
        try {
            List<Object[]> structData = partRepo.countParticipantsByStructureAndYear(annee);
            for (Object[] row : structData) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", row[0]);
                m.put("participants", row[1]);
                parStructure.add(m);
            }
        } catch (Exception e) {
            // Fallback
        }
        stats.setParticipantsParStructure(parStructure);

        // ── Top formateurs (vraies données) ─────────────────────
        List<Map<String, Object>> topFormateurs = new ArrayList<>();
        try {
            List<Object[]> topData = formateurRepo.findTopFormateursWithStats(annee);
            for (Object[] row : topData) {
                if (topFormateurs.size() >= 5) break;
                Map<String, Object> m = new HashMap<>();
                m.put("id",           row[0]);
                m.put("nom",          row[1]);
                m.put("prenom",       row[2]);
                m.put("type",         row[3]);
                m.put("nbFormations", row[4] != null ? ((Number)row[4]).longValue() : 0L);
                Double note = row[5] != null ? Math.round(((Number)row[5]).doubleValue() * 10.0) / 10.0 : null;
                m.put("noteMoyenne",  note);
                topFormateurs.add(m);
            }
        } catch (Exception e) {
            // Fallback
        }
        stats.setTopFormateurs(topFormateurs);

        return stats;
    }
}