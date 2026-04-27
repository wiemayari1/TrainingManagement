package com.isi.gf.repo;

import com.isi.gf.model.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InscriptionRepo extends JpaRepository<Inscription, Long> {

    @Query("SELECT i FROM Inscription i WHERE i.formation.id = :formationId")
    List<Inscription> findByFormationId(@Param("formationId") Long formationId);

    @Query("SELECT i FROM Inscription i WHERE i.participant.id = :participantId")
    List<Inscription> findByParticipantId(@Param("participantId") Long participantId);

    @Query("SELECT AVG(i.note) FROM Inscription i WHERE i.formation.id = :formationId AND i.note IS NOT NULL")
    Double getAverageNoteByFormation(@Param("formationId") Long formationId);

    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.formation.id = :formationId AND i.statut = 'PRESENT'")
    Long countPresentsByFormation(@Param("formationId") Long formationId);

    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.formation.id = :formationId")
    Long countByFormation(@Param("formationId") Long formationId);

    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.statut = 'PRESENT' AND i.formation.annee = :annee")
    Long countTotalPresents(@Param("annee") Integer annee);

    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.formation.annee = :annee")
    Long countTotalInscriptions(@Param("annee") Integer annee);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Inscription i " +
            "WHERE i.formation.id = :formationId AND i.participant.id = :participantId")
    boolean existsByFormationIdAndParticipantId(@Param("formationId") Long formationId,
                                                @Param("participantId") Long participantId);

    // ── NOUVELLES REQUÊTES POUR LES STATISTIQUES ─────────────────────────────

    /** Note moyenne globale sur toutes les inscriptions d'une année */
    @Query("SELECT AVG(i.note) FROM Inscription i " +
            "WHERE i.formation.annee = :annee AND i.note IS NOT NULL")
    Double getAverageNoteGlobal(@Param("annee") Integer annee);

    /** Notes moyennes par domaine pour une année donnée */
    @Query("SELECT d.libelle, AVG(i.note) " +
            "FROM Inscription i " +
            "JOIN i.formation f " +
            "JOIN f.domaine d " +
            "WHERE f.annee = :annee AND i.note IS NOT NULL " +
            "GROUP BY d.id, d.libelle " +
            "ORDER BY AVG(i.note) DESC")
    List<Object[]> getAverageNoteByDomaineAndAnnee(@Param("annee") Integer annee);

    /** Nombre de participants inscrits par mois pour une année */
    @Query("SELECT FUNCTION('MONTH', f.dateDebut), COUNT(DISTINCT i.participant.id) " +
            "FROM Inscription i " +
            "JOIN i.formation f " +
            "WHERE f.annee = :annee AND f.dateDebut IS NOT NULL " +
            "GROUP BY FUNCTION('MONTH', f.dateDebut) " +
            "ORDER BY FUNCTION('MONTH', f.dateDebut)")
    List<Object[]> countParticipantsByMonth(@Param("annee") Integer annee);
}