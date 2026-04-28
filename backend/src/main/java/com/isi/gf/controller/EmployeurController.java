package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Employeur;
import com.isi.gf.repo.EmployeurRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/employeurs")
public class EmployeurController {

    @Autowired
    private EmployeurRepo repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Employeur>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Employeur employeur) {
        repo.save(employeur);
        return ResponseEntity.ok(new MessageResponse("Employeur créé avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Employeur employeur) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        employeur.setId(id);
        repo.save(employeur);
        return ResponseEntity.ok(new MessageResponse("Employeur mis à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Employeur supprimé", true));
    }
}
