package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Domaine;
import com.isi.gf.repo.DomaineRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/domaines")
@CrossOrigin(origins = "http://localhost:3000")
public class DomaineController {

    @Autowired
    private DomaineRepo repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Domaine>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Domaine domaine) {
        repo.save(domaine);
        return ResponseEntity.ok(new MessageResponse("Domaine créé avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Domaine domaine) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        domaine.setId(id);
        repo.save(domaine);
        return ResponseEntity.ok(new MessageResponse("Domaine mis à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Domaine supprimé", true));
    }
}
