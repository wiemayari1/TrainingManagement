package com.isi.gf.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@excellent-training.tn}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[Excellent Training] Réinitialisation de votre mot de passe");

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            String htmlContent = buildResetEmailHtml(username, resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email de reset envoyé à : " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email : " + e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email de réinitialisation", e);
        }
    }

    /**
     * Email de bienvenue lors de la création d'un compte
     */
    public void sendWelcomeEmail(String toEmail, String username, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[Excellent Training] Bienvenue sur la plateforme");

            String htmlContent = buildWelcomeEmailHtml(username, role);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email bienvenue : " + e.getMessage());
        }
    }

    // ── Templates HTML ──────────────────────────────────────────────────────────
    private String buildResetEmailHtml(String username, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0;">
              <div style="max-width: 580px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #302b63, #0f0c29); padding: 36px 40px; text-align: center;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366F1); border-radius: 14px; padding: 12px 20px; margin-bottom: 16px;">
                    <span style="color: #fff; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;">ET</span>
                  </div>
                  <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 0.85rem;">Excellent Training · Green Building</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px;">
                  <h2 style="color: #0F172A; font-size: 1.4rem; margin: 0 0 12px; font-weight: 700;">
                    Réinitialisation de votre mot de passe
                  </h2>
                  <p style="color: #64748B; line-height: 1.7; margin: 0 0 24px;">
                    Bonjour <strong style="color: #0F172A;">%s</strong>,<br>
                    Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366F1); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 8px 24px rgba(139,92,246,0.3);">
                      Réinitialiser mon mot de passe →
                    </a>
                  </div>
                  
                  <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 16px; margin: 24px 0;">
                    <p style="color: #92400E; margin: 0; font-size: 0.85rem;">
                      ⚠️ Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
                    </p>
                  </div>
                  
                  <p style="color: #94A3B8; font-size: 0.8rem; margin: 24px 0 0;">
                    Ou copiez ce lien dans votre navigateur :<br>
                    <span style="color: #6366F1; word-break: break-all;">%s</span>
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="padding: 24px 40px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="color: #94A3B8; font-size: 0.75rem; margin: 0;">
                    © 2026 Excellent Training — Green Building<br>
                    Cet email a été envoyé automatiquement, merci de ne pas répondre.
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(username, resetLink, resetLink);
    }

    private String buildWelcomeEmailHtml(String username, String role) {
        String roleFr = switch (role) {
            case "ROLE_ADMIN" -> "Administrateur";
            case "ROLE_RESPONSABLE" -> "Responsable";
            default -> "Utilisateur";
        };
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0;">
              <div style="max-width: 580px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #302b63, #0f0c29); padding: 36px 40px; text-align: center;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366F1); border-radius: 14px; padding: 12px 20px; margin-bottom: 16px;">
                    <span style="color: #fff; font-size: 1.4rem; font-weight: 800;">ET</span>
                  </div>
                </div>
                <div style="padding: 40px;">
                  <h2 style="color: #0F172A; font-size: 1.4rem; margin: 0 0 12px;">Bienvenue, %s ! 🎉</h2>
                  <p style="color: #64748B; line-height: 1.7;">
                    Votre compte a été créé avec le rôle <strong style="color: #6366F1;">%s</strong> sur la plateforme <strong>Excellent Training</strong>.
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366F1); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600;">
                      Accéder à la plateforme →
                    </a>
                  </div>
                </div>
                <div style="padding: 20px 40px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="color: #94A3B8; font-size: 0.75rem; margin: 0;">© 2026 Excellent Training</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(username, roleFr);
    }
}
