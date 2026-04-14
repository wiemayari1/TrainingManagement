package com.isi.gf.controller;

import com.isi.gf.dto.MessageResponse;
import com.isi.gf.dto.ParticipantDTO;
import com.isi.gf.model.Participant;
import com.isi.gf.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/participants")
@CrossOrigin(origins = "http://localhost:3000")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<ParticipantDTO>> getAll() {
        return ResponseEntity.ok(participantService.getAllParticipants());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<List<ParticipantDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(participantService.searchParticipants(q));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'RESPONSABLE', 'ADMIN')")
    public ResponseEntity<ParticipantDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(participantService.getParticipantById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody Participant participant) {
        participantService.createParticipant(participant);
        return ResponseEntity.ok(new MessageResponse("Participant créé avec succès", true));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Participant participant) {
        participantService.updateParticipant(id, participant);
        return ResponseEntity.ok(new MessageResponse("Participant mis à jour", true));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.ok(new MessageResponse("Participant supprimé", true));
    }
}
