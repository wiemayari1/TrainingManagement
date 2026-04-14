package com.isi.gf.service;

import com.isi.gf.dto.ParticipantDTO;
import com.isi.gf.model.Participant;
import com.isi.gf.repo.PartRepo;
import com.isi.gf.repo.InscriptionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ParticipantService {
    
    @Autowired
    private PartRepo participantRepo;
    
    @Autowired
    private InscriptionRepo inscriptionRepo;
    
    public List<ParticipantDTO> getAllParticipants() {
        return participantRepo.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public ParticipantDTO getParticipantById(Long id) {
        Participant participant = participantRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Participant non trouvé"));
        return convertToDTO(participant);
    }
    
    public List<ParticipantDTO> searchParticipants(String search) {
        return participantRepo.search(search).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Participant createParticipant(Participant participant) {
        return participantRepo.save(participant);
    }
    
    public Participant updateParticipant(Long id, Participant details) {
        Participant participant = participantRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Participant non trouvé"));
        
        participant.setNom(details.getNom());
        participant.setPrenom(details.getPrenom());
        participant.setEmail(details.getEmail());
        participant.setTel(details.getTel());
        participant.setStructure(details.getStructure());
        participant.setProfil(details.getProfil());
        
        return participantRepo.save(participant);
    }
    
    public void deleteParticipant(Long id) {
        participantRepo.deleteById(id);
    }
    
    private ParticipantDTO convertToDTO(Participant p) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(p.getId());
        dto.setNom(p.getNom());
        dto.setPrenom(p.getPrenom());
        dto.setEmail(p.getEmail());
        dto.setTel(p.getTel());
        
        if (p.getStructure() != null) {
            dto.setStructureId(p.getStructure().getId());
            dto.setStructureLibelle(p.getStructure().getLibelle());
        }
        
        if (p.getProfil() != null) {
            dto.setProfilId(p.getProfil().getId());
            dto.setProfilLibelle(p.getProfil().getLibelle());
        }
        
        dto.setNbFormations(p.getInscriptions().size());
        
        return dto;
    }
}
