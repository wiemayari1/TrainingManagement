package com.isi.gf.repo;

import com.isi.gf.model.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeurRepo extends JpaRepository<Employeur, Long> {
}
