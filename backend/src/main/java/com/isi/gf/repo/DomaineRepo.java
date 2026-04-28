package com.isi.gf.repo;

import com.isi.gf.model.Domaine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DomaineRepo extends JpaRepository<Domaine, Long> {
}
