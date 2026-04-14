package com.isi.gf.service;

import com.isi.gf.dto.FormationDTO;
import com.isi.gf.model.Formation;
import com.isi.gf.repo.FormRepo;
import com.isi.gf.repo.InscriptionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FormationService {
    
    @Autowired
    private FormRepo formationRepo;
    
    @Autowired
    private InscriptionRepo inscriptionRepo;
    
    public List<FormationDTO> getAllFormations(Integer annee) {
        List<Formation> formations = annee != null ? 
            formationRepo.findByAnnee(annee) : formationRepo.findAll();
        return formations.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public FormationDTO getFormationById(Long id) {
        Formation formation = formationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        return convertToDTO(formation);
    }
    
    public Formation createFormation(Formation formation) {
        return formationRepo.save(formation);
    }
    
    public Formation updateFormation(Long id, Formation formationDetails) {
        Formation formation = formationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        
        formation.setTitre(formationDetails.getTitre());
        formation.setAnnee(formationDetails.getAnnee());
        formation.setDuree(formationDetails.getDuree());
        formation.setBudget(formationDetails.getBudget());
        formation.setDateDebut(formationDetails.getDateDebut());
        formation.setDateFin(formationDetails.getDateFin());
        formation.setLieu(formationDetails.getLieu());
        formation.setStatut(formationDetails.getStatut());
        formation.setDomaine(formationDetails.getDomaine());
        formation.setFormateur(formationDetails.getFormateur());
        
        return formationRepo.save(formation);
    }
    
    public void deleteFormation(Long id) {
        formationRepo.deleteById(id);
    }
    
    private FormationDTO convertToDTO(Formation f) {
        FormationDTO dto = new FormationDTO();
        dto.setId(f.getId());
        dto.setTitre(f.getTitre());
        dto.setAnnee(f.getAnnee());
        dto.setDuree(f.getDuree());
        dto.setBudget(f.getBudget());
        dto.setDateDebut(f.getDateDebut());
        dto.setDateFin(f.getDateFin());
        dto.setLieu(f.getLieu());
        dto.setStatut(f.getStatut());
        
        if (f.getDomaine() != null) {
            dto.setDomaineId(f.getDomaine().getId());
            dto.setDomaineLibelle(f.getDomaine().getLibelle());
        }
        
        if (f.getFormateur() != null) {
            dto.setFormateurId(f.getFormateur().getId());
            dto.setFormateurNom(f.getFormateur().getNom() + " " + f.getFormateur().getPrenom());
        }
        
        Long nbParticipants = inscriptionRepo.countByFormation(f.getId());
        dto.setNbParticipants(nbParticipants);
        
        Double moyenne = inscriptionRepo.getAverageNoteByFormation(f.getId());
        dto.setMoyenneNotes(moyenne);
        
        return dto;
    }
}
