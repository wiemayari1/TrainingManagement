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
    
    boolean existsByFormationIdAndParticipantId(Long formationId, Long participantId);
}
