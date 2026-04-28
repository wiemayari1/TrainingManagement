package com.isi.gf.repo;

import com.isi.gf.model.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfilRepo extends JpaRepository<Profil, Long> {
}
