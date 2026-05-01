package com.isi.gf.service;

import com.isi.gf.dto.FormationDTO;
import com.isi.gf.model.Formation;
import com.isi.gf.model.Inscription;
import com.isi.gf.model.Participant;
import com.isi.gf.repo.FormRepo;
import com.isi.gf.repo.InscriptionRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FormationNotificationService {

    private static final Logger log = LoggerFactory.getLogger(FormationNotificationService.class);

    @Autowired
    private FormRepo formRepo;

    @Autowired
    private InscriptionRepo inscriptionRepo;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Notification d'affectation à une formation
    //    Appelée depuis InscriptionController lors d'une inscription
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Envoie un email au participant quand il est inscrit à une formation.
     * Ne plante pas si l'email échoue (log only).
     */
    public void notifyParticipantAssigned(Inscription inscription) {
        Participant participant = inscription.getParticipant();
        Formation formation = inscription.getFormation();

        if (participant == null || formation == null) return;
        if (participant.getEmail() == null || participant.getEmail().isBlank()) {
            log.warn("Participant {} {} n'a pas d'email — notification ignorée",
                    participant.getPrenom(), participant.getNom());
            return;
        }

        String participantName = participant.getPrenom() + " " + participant.getNom();
        FormationDTO dto = toDTO(formation);

        try {
            emailService.sendFormationAssignmentEmail(participant.getEmail(), participantName, dto);
            log.info("Notification d'affectation envoyée à {} pour la formation '{}'",
                    participant.getEmail(), formation.getTitre());
        } catch (Exception e) {
            log.error("Impossible d'envoyer l'email d'affectation à {} : {}",
                    participant.getEmail(), e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Rappel le jour J — planifié chaque matin à 07h00
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tous les matins à 07h00, cherche les formations qui commencent aujourd'hui
     * et envoie un email de rappel à tous les participants inscrits.
     */
    @Scheduled(cron = "0 0 7 * * *")
    public void sendDayOfReminders() {
        LocalDate today = LocalDate.now();
        log.info("Rappels du jour J — recherche des formations démarrant le {}", today);

        List<Formation> formationsToday = formRepo.findAll().stream()
                .filter(f -> today.equals(f.getDateDebut()))
                .toList();

        if (formationsToday.isEmpty()) {
            log.info("Aucune formation ne commence aujourd'hui.");
            return;
        }

        for (Formation formation : formationsToday) {
            log.info("Formation '{}' commence aujourd'hui — envoi des rappels", formation.getTitre());
            List<Inscription> inscriptions = inscriptionRepo.findByFormationId(formation.getId());
            FormationDTO dto = toDTO(formation);

            for (Inscription inscription : inscriptions) {
                Participant participant = inscription.getParticipant();
                if (participant == null || participant.getEmail() == null || participant.getEmail().isBlank()) {
                    continue;
                }

                try {
                    String message = "Bonjour " + participant.getPrenom()
                            + ", n'oubliez pas : votre formation commence aujourd'hui. Bonne journée !";
                    emailService.sendFormationStartingTodayEmail(participant.getEmail(), dto, message);
                    log.info("Rappel jour J envoyé à {}", participant.getEmail());
                } catch (Exception e) {
                    log.error("Impossible d'envoyer le rappel à {} : {}",
                            participant.getEmail(), e.getMessage());
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitaire
    // ─────────────────────────────────────────────────────────────────────────

    private FormationDTO toDTO(Formation f) {
        FormationDTO dto = new FormationDTO();
        dto.setId(f.getId());
        dto.setTitre(f.getTitre());
        dto.setDateDebut(f.getDateDebut());
        dto.setDateFin(f.getDateFin());
        dto.setDuree(f.getDuree());
        dto.setLieu(f.getLieu());
        dto.setStatut(f.getStatut());
        if (f.getDomaine() != null) {
            dto.setDomaineId(f.getDomaine().getId());
            dto.setDomaineLibelle(f.getDomaine().getLibelle());
        }
        if (f.getFormateur() != null) {
            dto.setFormateurId(f.getFormateur().getId());
            dto.setFormateurNom(f.getFormateur().getPrenom() + " " + f.getFormateur().getNom());
        }
        return dto;
    }
}
