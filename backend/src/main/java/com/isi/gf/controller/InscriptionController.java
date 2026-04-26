package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Inscription;
import com.isi.gf.repo.InscriptionRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/inscriptions")
public class InscriptionController {

    @Autowired
    private InscriptionRepo repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Inscription>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/formation/{formationId}")
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<Inscription>> getByFormation(@PathVariable Long formationId) {
        return ResponseEntity.ok(repo.findByFormationId(formationId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Inscription inscription) {
        boolean exists = repo.existsByFormationIdAndParticipantId(
            inscription.getFormation().getId(),
            inscription.getParticipant().getId()
        );
        if (exists) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Ce participant est déjà inscrit à cette formation", false));
        }
        repo.save(inscription);
        return ResponseEntity.ok(new MessageResponse("Inscription créée avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Inscription inscription) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        inscription.setId(id);
        repo.save(inscription);
        return ResponseEntity.ok(new MessageResponse("Inscription mise à jour", true));
    }

    @PutMapping("/{id}/note")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> updateNote(@PathVariable Long id, @RequestBody Double note) {
        return repo.findById(id).map(inscription -> {
            inscription.setNote(note);
            repo.save(inscription);
            return ResponseEntity.ok(new MessageResponse("Note mise à jour", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Inscription supprimée", true));
    }
}
