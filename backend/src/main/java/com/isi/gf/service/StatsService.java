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
        Long totalPresents = inscriptionRepo.countTotalPresents(annee);
        Long totalInscriptions = inscriptionRepo.countTotalInscriptions(annee);
        double tauxPresence = totalInscriptions > 0
                ? (double) totalPresents / totalInscriptions * 100 : 0;
        stats.setTauxPresence(Math.round(tauxPresence * 10.0) / 10.0);

        // ── Note moyenne globale ─────────────────────────────────
        Double noteMoyGlobale = inscriptionRepo.getAverageNoteGlobal(annee);
        stats.setNoteMoyenneGlobale(noteMoyGlobale != null
                ? Math.round(noteMoyGlobale * 10.0) / 10.0 : null);

        // ── Formations par domaine ───────────────────────────────
        List<Object[]> domaineStats = formRepo.statsByDomaine(annee);
        List<Map<String, Object>> formationsParDomaine = new ArrayList<>();
        for (Object[] row : domaineStats) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);
            map.put("value", row[1]);
            map.put("budget", row[2]);
            formationsParDomaine.add(map);
        }
        stats.setFormationsParDomaine(formationsParDomaine);

        // ── Notes moyennes par domaine ───────────────────────────
        List<Object[]> notesDomaine = inscriptionRepo.getAverageNoteByDomaineAndAnnee(annee);
        List<Map<String, Object>> notesMoyennesParDomaine = new ArrayList<>();
        for (Object[] row : notesDomaine) {
            Map<String, Object> m = new HashMap<>();
            double note = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            note = Math.round(note * 10.0) / 10.0;
            m.put("domaine", row[0]);
            m.put("note", note);
            m.put("pourcentage", Math.round(note / 20.0 * 100));
            notesMoyennesParDomaine.add(m);
        }
        stats.setNotesMoyennesParDomaine(notesMoyennesParDomaine);

        // ── Évolution mensuelle ──────────────────────────────────
        List<Object[]> monthlyStats = formRepo.countByMonth(annee);
        List<Object[]> monthlyParticipants = inscriptionRepo.countParticipantsByMonth(annee);
        List<Object[]> monthlyBudget = formRepo.sumBudgetByMonth(annee);

        String[] moisLabels = {"Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"};
        List<Map<String, Object>> evolution = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("mois", moisLabels[i]);
            m.put("formations", 0L);
            m.put("participants", 0L);
            m.put("budget", 0.0);
            evolution.add(m);
        }
        for (Object[] row : monthlyStats) {
            int month = ((Number) row[0]).intValue() - 1;
            if (month >= 0 && month < 12)
                evolution.get(month).put("formations", row[1]);
        }
        for (Object[] row : monthlyParticipants) {
            int month = ((Number) row[0]).intValue() - 1;
            if (month >= 0 && month < 12)
                evolution.get(month).put("participants", row[1]);
        }
        for (Object[] row : monthlyBudget) {
            int month = ((Number) row[0]).intValue() - 1;
            if (month >= 0 && month < 12)
                evolution.get(month).put("budget", row[1]);
        }
        stats.setEvolutionMensuelle(evolution);

        // ── Statuts des formations ───────────────────────────────
        List<Map<String, Object>> statuts = new ArrayList<>();
        Map<String, String[]> statutConfig = new LinkedHashMap<>();
        statutConfig.put("TERMINEE",  new String[]{"Terminées",  "#10B981"});
        statutConfig.put("EN_COURS",  new String[]{"En cours",   "#F59E0B"});
        statutConfig.put("PLANIFIEE", new String[]{"Planifiées", "#6366F1"});
        statutConfig.put("ANNULEE",   new String[]{"Annulées",   "#EF4444"});

        for (Map.Entry<String, String[]> entry : statutConfig.entrySet()) {
            long count = formRepo.findByAnneeAndStatut(annee, entry.getKey()).size();
            Map<String, Object> m = new HashMap<>();
            m.put("name", entry.getValue()[0]);
            m.put("value", count);
            m.put("color", entry.getValue()[1]);
            m.put("statut", entry.getKey());
            statuts.add(m);
        }
        stats.setFormationsParStatut(statuts);

        // ── Budget par trimestre ─────────────────────────────────
        List<Object[]> budgetTrim = formRepo.sumBudgetByTrimestre(annee);
        Map<Integer, Double> trimMap = new HashMap<>();
        for (Object[] row : budgetTrim) {
            int trim = ((Number) row[0]).intValue();
            double bud = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            trimMap.put(trim, bud);
        }
        double totalBudget = stats.getBudgetTotal() != null ? stats.getBudgetTotal() : 0;
        double objectifParTrim = totalBudget > 0 ? totalBudget / 4 : 10000;

        List<Map<String, Object>> budgetTrimestriel = new ArrayList<>();
        for (int t = 1; t <= 4; t++) {
            Map<String, Object> m = new HashMap<>();
            double bud = trimMap.getOrDefault(t, 0.0);
            m.put("trimestre", "T" + t);
            m.put("budget", Math.round(bud));
            m.put("objectif", Math.round(objectifParTrim));
            budgetTrimestriel.add(m);
        }
        stats.setBudgetParTrimestre(budgetTrimestriel);

        // ── Top formateurs ───────────────────────────────────────
        List<Object[]> topFormat = formateurRepo.findTopFormateursWithStats(annee);
        List<Map<String, Object>> topFormateurs = new ArrayList<>();
        for (Object[] row : topFormat) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", row[0]);
            m.put("nom", row[1] + " " + row[2]);
            m.put("prenom", row[2]);
            m.put("type", row[3]);
            m.put("nbFormations", row[4]);
            double note = row[5] != null ? Math.round(((Number) row[5]).doubleValue() * 10.0) / 10.0 : 0.0;
            m.put("noteMoyenne", note);
            m.put("satisfaction", note > 0 ? Math.round(note / 20.0 * 5.0 * 10.0) / 10.0 : 0.0);
            topFormateurs.add(m);
        }
        stats.setTopFormateurs(topFormateurs);

        // ── Participants par structure ────────────────────────────
        List<Object[]> partStruct = partRepo.countParticipantsByStructureAndYear(annee);
        List<Map<String, Object>> participantsParStructure = new ArrayList<>();
        for (Object[] row : partStruct) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]);
            m.put("participants", row[1]);
            participantsParStructure.add(m);
        }
        stats.setParticipantsParStructure(participantsParStructure);

        return stats;
    }
}