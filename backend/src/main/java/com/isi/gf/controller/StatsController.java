package com.isi.gf.controller;

import com.isi.gf.dto.DashboardStatsDTO;
import com.isi.gf.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('RESPONSABLE', 'ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @RequestParam(defaultValue = "2025") int annee) {
        return ResponseEntity.ok(statsService.getDashboardStats(annee));
    }
}
