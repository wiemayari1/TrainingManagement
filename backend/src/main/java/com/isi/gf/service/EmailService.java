package com.isi.gf.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Envoi d'un email de réinitialisation (2 args — compatible AuthController)
     */
    public void sendPasswordResetEmail(String to, String token) {
        sendPasswordResetEmail(to, null, token);
    }

    /**
     * Envoi d'un email de réinitialisation (3 args — compatible PasswordResetController)
     */
    public void sendPasswordResetEmail(String to, String username, String token) {
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String greeting = (username != null && !username.isBlank())
                ? "Bonjour <strong>" + username + "</strong>,"
                : "Bonjour,";

        String subject = "Excellent Training - Reinitialisation de votre mot de passe";

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .content p { color: #374151; line-height: 1.6; }
                    .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .link-box { background: #F3F4F6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4B5563; }
                    .footer { padding: 20px 30px; background: #F9FAFB; text-align: center; font-size: 12px; color: #9CA3AF; }
                    .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 16px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Excellent Training</h1>
                        <p>Green Building</p>
                    </div>
                    <div class="content">
                        <h2>Reinitialisation de votre mot de passe</h2>
                        <p>%s</p>
                        <p>Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en creer un nouveau.</p>
                        <div style="text-align: center;">
                            <a href="%s" class="button">Reinitialiser mon mot de passe</a>
                        </div>
                        <div class="warning">
                            <strong>⚠ Important :</strong> Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
                        </div>
                        <p style="font-size: 13px; color: #6B7280;">Ou copiez ce lien dans votre navigateur :</p>
                        <div class="link-box">%s</div>
                    </div>
                    <div class="footer">
                        <p>© 2026 Excellent Training — Green Building</p>
                        <p>Cet email a ete envoye automatiquement, merci de ne pas repondre.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(greeting, resetLink, resetLink);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Envoi d'un email de bienvenue avec identifiants (4 args — compatible AdminController)
     */
    public void sendCredentialsEmail(String to, String username, String password, String role) {
        String subject = "Excellent Training - Votre compte a ete cree";

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .content p { color: #374151; line-height: 1.6; }
                    .credentials { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 16px 0; }
                    .credentials h3 { margin-top: 0; color: #059669; }
                    .credential-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #DCFCE7; }
                    .credential-row:last-child { border-bottom: none; }
                    .label { font-weight: 600; color: #374151; }
                    .value { font-family: monospace; background: white; padding: 4px 12px; border-radius: 4px; color: #059669; }
                    .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 16px 0; border-radius: 4px; }
                    .footer { padding: 20px 30px; background: #F9FAFB; text-align: center; font-size: 12px; color: #9CA3AF; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Excellent Training</h1>
                        <p>Green Building</p>
                    </div>
                    <div class="content">
                        <h2>Votre compte a ete cree</h2>
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Un compte avec le role <strong>%s</strong> vient d'etre cree pour vous sur la plateforme <strong>Excellent Training</strong>.</p>
                        <div class="credentials">
                            <h3>🔐 Vos identifiants</h3>
                            <div class="credential-row">
                                <span class="label">Nom d'utilisateur</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="credential-row">
                                <span class="label">Mot de passe</span>
                                <span class="value">%s</span>
                            </div>
                        </div>
                        <div class="warning">
                            <strong>⚠ Pour des raisons de securite, pensez a changer votre mot de passe des votre premiere connexion.</strong>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2026 Excellent Training — Green Building</p>
                        <p>Cet email a ete envoye automatiquement, merci de ne pas repondre.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(username, role, username, password);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Methode generique d'envoi d'email HTML
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail.isEmpty() ? "noreply@excellent-training.com" : fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email envoye avec succes a : " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email a " + to + " : " + e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email", e);
        }
    }
}