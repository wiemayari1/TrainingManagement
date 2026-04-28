package com.isi.gf.controller;

import com.isi.gf.dto.FormateurDTO;
import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Formateur;
import com.isi.gf.service.FormateurService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/formateurs")
public class FormateurController {

    @Autowired
    private FormateurService formateurService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<FormateurDTO>> getAll() {
        return ResponseEntity.ok(formateurService.getAllFormateurs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<FormateurDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formateurService.getFormateurById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Formateur formateur) {
        formateurService.createFormateur(formateur);
        return ResponseEntity.ok(new MessageResponse("Formateur créé avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Formateur formateur) {
        formateurService.updateFormateur(id, formateur);
        return ResponseEntity.ok(new MessageResponse("Formateur mis à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        formateurService.deleteFormateur(id);
        return ResponseEntity.ok(new MessageResponse("Formateur supprimé", true));
    }
}
