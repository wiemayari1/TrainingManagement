package com.isi.gf.service;

import com.isi.gf.repo.PasswordResetTokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenCleanupService {

    @Autowired
    private PasswordResetTokenRepo tokenRepo;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanup() {
        tokenRepo.deleteAllExpired(LocalDateTime.now());
    }
}
