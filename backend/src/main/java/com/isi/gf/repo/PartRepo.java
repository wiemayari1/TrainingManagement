package com.isi.gf.repo;

import com.isi.gf.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartRepo extends JpaRepository<Participant, Long> {

    @Query("SELECT p FROM Participant p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Participant> search(@Param("search") String search);

    List<Participant> findByStructureId(Long structureId);
    List<Participant> findByProfilId(Long profilId);

    @Query("SELECT COUNT(p) FROM Participant p")
    Long countTotal();

    @Query("SELECT COUNT(DISTINCT i.participant.id) FROM Inscription i WHERE i.formation.annee = :annee")
    Long countParticipantsByYear(@Param("annee") Integer annee);

    /** Participants par structure pour une année donnée */
    @Query("SELECT s.libelle, COUNT(DISTINCT i.participant.id) " +
            "FROM Inscription i " +
            "JOIN i.participant p " +
            "JOIN p.structure s " +
            "WHERE i.formation.annee = :annee " +
            "GROUP BY s.id, s.libelle " +
            "ORDER BY COUNT(DISTINCT i.participant.id) DESC")
    List<Object[]> countParticipantsByStructureAndYear(@Param("annee") Integer annee);
}