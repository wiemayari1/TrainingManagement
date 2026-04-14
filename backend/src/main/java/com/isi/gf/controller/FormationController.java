package com.isi.gf.controller;

import com.isi.gf.dto.FormationDTO;
import com.isi.gf.dto.MessageResponse;
import com.isi.gf.model.Formation;
import com.isi.gf.service.FormationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/formations")
@CrossOrigin(origins = "http://localhost:3000")
public class FormationController {

    @Autowired
    private FormationService formationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<FormationDTO>> getAll(@RequestParam(required = false) Integer annee) {
        return ResponseEntity.ok(formationService.getAllFormations(annee));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<FormationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getFormationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Formation formation) {
        Formation created = formationService.createFormation(formation);
        return ResponseEntity.ok(new MessageResponse("Formation créée avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        formationService.updateFormation(id, formation);
        return ResponseEntity.ok(new MessageResponse("Formation mise à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.ok(new MessageResponse("Formation supprimée", true));
    }
}
