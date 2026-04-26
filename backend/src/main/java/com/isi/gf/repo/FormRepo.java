package com.isi.gf.repo;

import com.isi.gf.model.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FormRepo extends JpaRepository<Formation, Long> {
    
    List<Formation> findByAnnee(Integer annee);
    
    List<Formation> findByStatut(String statut);
    
    List<Formation> findByDomaineId(Long domaineId);
    
    List<Formation> findByFormateurId(Long formateurId);
    
    @Query("SELECT COUNT(f) FROM Formation f WHERE f.annee = :annee")
    Long countByAnnee(@Param("annee") Integer annee);
    
    @Query("SELECT COALESCE(SUM(f.budget), 0) FROM Formation f WHERE f.annee = :annee")
    Double sumBudgetByAnnee(@Param("annee") Integer annee);
    
    @Query("SELECT d.libelle, COUNT(f), COALESCE(SUM(f.budget), 0) " +
           "FROM Formation f JOIN f.domaine d " +
           "WHERE f.annee = :annee " +
           "GROUP BY d.id, d.libelle")
    List<Object[]> statsByDomaine(@Param("annee") Integer annee);
    
    @Query("SELECT FUNCTION('MONTH', f.dateDebut), COUNT(f) " +
           "FROM Formation f " +
           "WHERE f.annee = :annee AND f.dateDebut IS NOT NULL " +
           "GROUP BY FUNCTION('MONTH', f.dateDebut) " +
           "ORDER BY FUNCTION('MONTH', f.dateDebut)")
    List<Object[]> countByMonth(@Param("annee") Integer annee);
    
    @Query("SELECT f FROM Formation f WHERE f.annee = :annee AND f.statut = :statut")
    List<Formation> findByAnneeAndStatut(@Param("annee") Integer annee, @Param("statut") String statut);
}
