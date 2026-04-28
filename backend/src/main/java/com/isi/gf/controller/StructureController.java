package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Structure;
import com.isi.gf.repo.StructureRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/structures")
public class StructureController {

    @Autowired
    private StructureRepo repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Structure>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Structure structure) {
        repo.save(structure);
        return ResponseEntity.ok(new MessageResponse("Structure créée avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Structure structure) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        structure.setId(id);
        repo.save(structure);
        return ResponseEntity.ok(new MessageResponse("Structure mise à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Structure supprimée", true));
    }
}
