package com.isi.gf.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) throws MessagingException {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("L'adresse email destinataire est obligatoire.");
        }
        if (!to.matches(EMAIL_REGEX)) {
            throw new IllegalArgumentException("L'adresse email destinataire est invalide : " + to);
        }
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Le token de réinitialisation est obligatoire.");
        }

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        log.info("Envoi de l'email de réinitialisation à {}", to);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Réinitialisation de votre mot de passe - Excellent Training");
        helper.setText(buildResetEmail(resetLink), true);
        mailSender.send(message);

        log.info("Email de réinitialisation envoyé avec succès à {}", to);
    }

    public void sendCredentialsEmail(String to, String username, String password, String role) throws MessagingException {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("L'adresse email destinataire est obligatoire.");
        }
        if (!to.matches(EMAIL_REGEX)) {
            throw new IllegalArgumentException("L'adresse email destinataire est invalide : " + to);
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Le nom d'utilisateur est obligatoire.");
        }

        log.info("Envoi des identifiants de connexion à {}", to);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Votre compte Excellent Training a été créé");
        helper.setText(buildWelcomeEmail(username, role, password), true);
        mailSender.send(message);

        log.info("Email d'identifiants envoyé avec succès à {}", to);
    }

    private String buildResetEmail(String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px;">
                <h2 style="color: #6366F1;">Réinitialisation de votre mot de passe</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <a href="%s" style="display:inline-block;padding:12px 24px;background:#6366F1;color:#fff;text-decoration:none;border-radius:6px;">Réinitialiser mon mot de passe</a>
                <p style="margin-top:20px;font-size:12px;color:#666;">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
                <p style="font-size:12px;color:#999;">© 2026 Excellent Training — Green Building</p>
              </div>
            </body>
            </html>
            """.formatted(resetLink);
    }

    private String buildWelcomeEmail(String username, String role, String password) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 30px;">
                <h2 style="color: #10B981;">Votre compte a été créé</h2>
                <p>Bonjour <strong>%s</strong>,</p>
                <p>Un compte avec le rôle <strong>%s</strong> vient d'être créé.</p>
                <div style="background:#F9FAFB;padding:15px;border-radius:6px;margin:15px 0;">
                  <p style="margin:5px 0;"><strong>Nom d'utilisateur :</strong> %s</p>
                  <p style="margin:5px 0;"><strong>Mot de passe :</strong> %s</p>
                </div>
                <p style="color:#EF4444;font-size:13px;">⚠️ Pensez à changer votre mot de passe dès votre première connexion.</p>
                <p style="font-size:12px;color:#999;">© 2026 Excellent Training — Green Building</p>
              </div>
            </body>
            </html>
            """.formatted(username, role, username, password);
    }
}
