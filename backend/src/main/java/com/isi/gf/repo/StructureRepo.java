package com.isi.gf.repo;

import com.isi.gf.model.Structure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StructureRepo extends JpaRepository<Structure, Long> {
    List<Structure> findByType(String type);
}
