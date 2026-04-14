package com.isi.gf.repo;

import com.isi.gf.model.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FormateurRepo extends JpaRepository<Formateur, Long> {
    
    List<Formateur> findByType(String type);
    
    @Query("SELECT f FROM Formateur f WHERE " +
           "LOWER(f.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Formateur> search(@Param("search") String search);
    
    @Query("SELECT COUNT(f) FROM Formateur f WHERE f.type = :type")
    Long countByType(@Param("type") String type);
    
    @Query("SELECT f, AVG(i.note) FROM Formateur f " +
           "JOIN f.formations fo " +
           "JOIN fo.inscriptions i " +
           "WHERE i.note IS NOT NULL " +
           "GROUP BY f.id " +
           "ORDER BY AVG(i.note) DESC")
    List<Object[]> findTopFormateurs();
}
