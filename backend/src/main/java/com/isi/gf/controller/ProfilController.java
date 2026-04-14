package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Profil;
import com.isi.gf.repo.ProfilRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/profils")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfilController {

    @Autowired
    private ProfilRepo repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Profil>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Profil profil) {
        repo.save(profil);
        return ResponseEntity.ok(new MessageResponse("Profil créé avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Profil profil) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        profil.setId(id);
        repo.save(profil);
        return ResponseEntity.ok(new MessageResponse("Profil mis à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Profil supprimé", true));
    }
}
