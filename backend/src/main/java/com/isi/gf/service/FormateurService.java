package com.isi.gf.service;

import com.isi.gf.dto.FormateurDTO;
import com.isi.gf.model.Formateur;
import com.isi.gf.repo.FormateurRepo;
import com.isi.gf.repo.InscriptionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FormateurService {
    
    @Autowired
    private FormateurRepo formateurRepo;
    
    @Autowired
    private InscriptionRepo inscriptionRepo;
    
    public List<FormateurDTO> getAllFormateurs() {
        return formateurRepo.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public FormateurDTO getFormateurById(Long id) {
        Formateur formateur = formateurRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Formateur non trouvé"));
        return convertToDTO(formateur);
    }
    
    public Formateur createFormateur(Formateur formateur) {
        return formateurRepo.save(formateur);
    }
    
    public Formateur updateFormateur(Long id, Formateur details) {
        Formateur formateur = formateurRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Formateur non trouvé"));
        
        formateur.setNom(details.getNom());
        formateur.setPrenom(details.getPrenom());
        formateur.setEmail(details.getEmail());
        formateur.setTel(details.getTel());
        formateur.setType(details.getType());
        formateur.setEmployeur(details.getEmployeur());
        
        return formateurRepo.save(formateur);
    }
    
    public void deleteFormateur(Long id) {
        formateurRepo.deleteById(id);
    }
    
    private FormateurDTO convertToDTO(Formateur f) {
        FormateurDTO dto = new FormateurDTO();
        dto.setId(f.getId());
        dto.setNom(f.getNom());
        dto.setPrenom(f.getPrenom());
        dto.setEmail(f.getEmail());
        dto.setTel(f.getTel());
        dto.setType(f.getType());
        
        if (f.getEmployeur() != null) {
            dto.setEmployeurId(f.getEmployeur().getId());
            dto.setEmployeurNom(f.getEmployeur().getNomEmployeur());
        }
        
        dto.setNbFormations(f.getFormations().size());
        
        // Calculer la moyenne des notes sur toutes les formations
        double totalMoyenne = 0;
        int count = 0;
        for (var formation : f.getFormations()) {
            Double moy = inscriptionRepo.getAverageNoteByFormation(formation.getId());
            if (moy != null) {
                totalMoyenne += moy;
                count++;
            }
        }
        dto.setMoyenneNotes(count > 0 ? totalMoyenne / count : null);
        
        return dto;
    }
}
