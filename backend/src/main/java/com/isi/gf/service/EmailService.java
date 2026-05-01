package com.isi.gf.service;

import com.isi.gf.dto.FormationDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Adresse expéditeur affichée dans les emails.
     * Par défaut = spring.mail.username si app.mail.from n'est pas défini.
     */
    @Value("${app.mail.from:${spring.mail.username:noreply@excellent-training.tn}}")
    private String fromAddress;

    /**
     * Nom affiché de l'expéditeur.
     */
    @Value("${app.mail.from-name:Excellent Training}")
    private String fromName;

    // ─────────────────────────────────────────────────────────────────────────
    // API publique
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Envoie un email de réinitialisation de mot de passe.
     */
    public void sendPasswordResetEmail(String to, String token) throws MessagingException {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String html = buildResetEmail(resetLink);
        sendEmail(to, "Réinitialisation de votre mot de passe – Excellent Training", html);
        log.info("Email de réinitialisation envoyé à {}", maskEmail(to));
    }

    /**
     * Envoie les identifiants de connexion à un nouvel utilisateur.
     */
    public void sendCredentialsEmail(String to, String username, String password, String role)
            throws MessagingException {
        String html = buildWelcomeEmail(username, role, password);
        sendEmail(to, "Vos identifiants Excellent Training", html);
        log.info("Email de bienvenue envoyé à {}", maskEmail(to));
    }

    /**
     * Envoie un email de notification : formation qui commence aujourd'hui.
     */
    public void sendFormationStartingTodayEmail(String toEmail, FormationDTO formation, String message)
            throws MessagingException {
        String subject = "Formation qui commence aujourd'hui : " + (formation.getTitre() != null ? formation.getTitre() : "");
        String html = buildFormationStartingEmail(formation, message);
        sendEmail(toEmail, subject, html);
        log.info("Email 'formation aujourd'hui' envoyé à {}", maskEmail(toEmail));
    }

    /**
     * Envoie un email de notification : affectation à une formation.
     */
    public void sendFormationAssignmentEmail(String toEmail, String participantName, FormationDTO formation)
            throws MessagingException {
        String subject = "Affectation à une formation : " + (formation.getTitre() != null ? formation.getTitre() : "");
        String html = buildFormationAssignmentEmail(participantName, formation);
        sendEmail(toEmail, subject, html);
        log.info("Email 'affectation formation' envoyé à {}", maskEmail(toEmail));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Méthode d'envoi commune
    // ─────────────────────────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String htmlContent)
            throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Expéditeur avec nom affiché
            try {
                helper.setFrom(new InternetAddress(fromAddress, fromName, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                helper.setFrom(fromAddress);
            }

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Ajout du logo en pièce jointe intégrée (inline)
            File logoFile = new File("../frontend/public/assets/logo.png");
            if (!logoFile.exists()) {
                logoFile = new File("frontend/public/assets/logo.png");
            }
            
            if (logoFile.exists()) {
                helper.addInline("logo", new FileSystemResource(logoFile));
            } else {
                log.warn("Logo non trouve pour l'email aux chemins essayes. Chemin absolu actuel : " + logoFile.getAbsolutePath());
            }

            mailSender.send(message);

        } catch (MailException e) {
            log.error("Échec d'envoi d'email vers {} : {}", maskEmail(to), e.getMessage());
            // On relance en MessagingException pour compatibilité avec les contrôleurs existants
            throw new MessagingException("Échec d'envoi d'email : " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Logo PNG (doit être dans frontend/public/assets/logo.png)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Bloc logo : image PNG hébergée sur le frontend.
     * Le fichier logo.png doit être dans le dossier frontend/public/assets/
     */
    private String logoBlock() {
        return """
            <img src="cid:logo" width="48" height="48"
                 style="display:block;margin:0 auto;border:0;"
                 alt="Excellent Training">
            """;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Builders HTML — Authentification
    // ─────────────────────────────────────────────────────────────────────────

    private String buildResetEmail(String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%%;">

                    <!-- En-tête violet -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#312E81,#4C1D95);
                                 padding:36px 40px;text-align:center;">
                        <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                    border-radius:12px;padding:14px 18px;margin-bottom:16px;">
                          %s
                        </div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                          Excellent Training
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                          Centre de Formation Professionnelle
                        </p>
                      </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                      <td style="padding:40px;">
                        <h2 style="margin:0 0 16px;color:#0F172A;font-size:20px;font-weight:700;">
                          Réinitialisation de mot de passe
                        </h2>
                        <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.6;">
                          Vous avez demandé la réinitialisation de votre mot de passe.
                          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                        </p>
                        <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;">
                          Ce lien est valable pendant <strong>1 heure</strong>.
                        </p>

                        <!-- Bouton CTA -->
                        <div style="text-align:center;margin:28px 0;">
                          <a href="%s"
                             style="display:inline-block;padding:14px 36px;
                                    background:linear-gradient(135deg,#6366F1,#8B5CF6);
                                    color:#ffffff;text-decoration:none;border-radius:8px;
                                    font-size:15px;font-weight:600;letter-spacing:0.2px;">
                            Réinitialiser mon mot de passe
                          </a>
                        </div>

                        <!-- Lien alternatif -->
                        <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin-top:24px;">
                          <p style="margin:0 0 8px;color:#64748B;font-size:13px;">
                            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                          </p>
                          <p style="margin:0;word-break:break-all;color:#6366F1;font-size:12px;">
                            %s
                          </p>
                        </div>

                        <hr style="border:none;border-top:1px solid #E2E8F0;margin:28px 0;">
                        <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.5;">
                          Si vous n'avez pas demandé cette réinitialisation,
                          ignorez cet email — votre mot de passe ne sera pas modifié.
                        </p>
                      </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                      <td style="background:#F8FAFC;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E2E8F0;">
                        <p style="margin:0;color:#94A3B8;font-size:12px;">
                          © 2026 Excellent Training — Green Building · Tous droits réservés
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(logoBlock(), resetLink, resetLink);
    }

    private String buildWelcomeEmail(String username, String role, String password) {
        String roleLabel = switch (role) {
            case "ROLE_ADMIN"       -> "Administrateur";
            case "ROLE_RESPONSABLE" -> "Responsable";
            default                 -> "Utilisateur";
        };
        String loginUrl = frontendUrl + "/login";

        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%%;">

                    <!-- En-tête vert -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#047857,#065F46);
                                 padding:36px 40px;text-align:center;">
                        <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                    border-radius:12px;padding:14px 18px;margin-bottom:16px;">
                          %s
                        </div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                          Excellent Training
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                          Centre de Formation Professionnelle
                        </p>
                      </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                      <td style="padding:40px;">
                        <div style="margin-bottom:24px;">
                          <span style="display:inline-block;background:#DCFCE7;color:#15803D;
                                       font-size:12px;font-weight:700;padding:4px 12px;
                                       border-radius:20px;letter-spacing:0.3px;">
                            ✓ Compte créé avec succès
                          </span>
                        </div>

                        <h2 style="margin:0 0 16px;color:#0F172A;font-size:20px;font-weight:700;">
                          Bienvenue, %s !
                        </h2>
                        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                          Un compte a été créé pour vous sur la plateforme
                          <strong>Excellent Training</strong> avec le rôle
                          <strong>%s</strong>.
                          Voici vos identifiants de connexion :
                        </p>

                        <!-- Bloc identifiants -->
                        <div style="background:#F8FAFC;border:1px solid #E2E8F0;
                                    border-radius:10px;padding:24px;margin-bottom:28px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Nom d'utilisateur
                                </span>
                                <br>
                                <span style="color:#0F172A;font-size:16px;font-weight:700;
                                             font-family:monospace;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Mot de passe temporaire
                                </span>
                                <br>
                                <span style="color:#6366F1;font-size:16px;font-weight:700;
                                             font-family:monospace;letter-spacing:1px;">
                                  %s
                                </span>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- Bouton connexion -->
                        <div style="text-align:center;margin:28px 0;">
                          <a href="%s"
                             style="display:inline-block;padding:14px 36px;
                                    background:linear-gradient(135deg,#10B981,#059669);
                                    color:#ffffff;text-decoration:none;border-radius:8px;
                                    font-size:15px;font-weight:600;">
                            Se connecter maintenant
                          </a>
                        </div>

                        <!-- Avertissement sécurité -->
                        <div style="background:#FEF3C7;border-left:4px solid #F59E0B;
                                    border-radius:0 8px 8px 0;padding:14px 18px;">
                          <p style="margin:0;color:#78350F;font-size:13px;line-height:1.5;">
                            <strong>⚠ Action requise :</strong>
                            Vous devrez changer votre mot de passe lors de votre première connexion.
                            Ne partagez jamais vos identifiants.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                      <td style="background:#F8FAFC;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E2E8F0;">
                        <p style="margin:0;color:#94A3B8;font-size:12px;">
                          © 2026 Excellent Training — Green Building · Tous droits réservés
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(logoBlock(), username, roleLabel, username, password, loginUrl);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Builders HTML — Formations
    // ─────────────────────────────────────────────────────────────────────────

    private String buildFormationStartingEmail(FormationDTO formation, String message) {
        String dashboardUrl = frontendUrl + "/dashboard/formations";

        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%%;">

                    <!-- En-tête orange (urgence) -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#D97706,#B45309);
                                 padding:36px 40px;text-align:center;">
                        <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                    border-radius:12px;padding:14px 18px;margin-bottom:16px;">
                          %s
                        </div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                          Excellent Training
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                          Centre de Formation Professionnelle
                        </p>
                      </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                      <td style="padding:40px;">
                        <div style="margin-bottom:24px;">
                          <span style="display:inline-block;background:#FEF3C7;color:#92400E;
                                       font-size:12px;font-weight:700;padding:4px 12px;
                                       border-radius:20px;letter-spacing:0.3px;">
                            📅 Aujourd'hui
                          </span>
                        </div>

                        <h2 style="margin:0 0 16px;color:#0F172A;font-size:20px;font-weight:700;">
                          Une formation commence aujourd'hui
                        </h2>

                        <!-- Bloc infos formation -->
                        <div style="background:#F8FAFC;border:1px solid #E2E8F0;
                                    border-radius:10px;padding:24px;margin-bottom:28px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Titre
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:700;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Date de début
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Durée
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s jour(s)
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Lieu
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Domaine
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- Message personnalisé -->
                        <div style="background:#FFFBEB;border-left:4px solid #F59E0B;
                                    border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                          <p style="margin:0;color:#78350F;font-size:14px;line-height:1.6;">
                            %s
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                      <td style="background:#F8FAFC;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E2E8F0;">
                        <p style="margin:0;color:#94A3B8;font-size:12px;">
                          © 2026 Excellent Training — Green Building · Tous droits réservés
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                logoBlock(),
                formation.getTitre() == null ? "Non renseignée" : escapeHtml(formation.getTitre()),
                formation.getDateDebut() == null ? "Non renseignée" : formation.getDateDebut(),
                formation.getDuree() == null ? "Non renseignée" : formation.getDuree(),
                formation.getLieu() == null ? "Non renseigné" : escapeHtml(formation.getLieu()),
                formation.getDomaineLibelle() == null ? "Non renseigné" : escapeHtml(formation.getDomaineLibelle()),
                message == null ? "" : escapeHtml(message)
        );
    }

    private String buildFormationAssignmentEmail(String participantName, FormationDTO formation) {
        String dashboardUrl = frontendUrl + "/dashboard/formations";

        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%%;">

                    <!-- En-tête indigo -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#312E81,#4C1D95);
                                 padding:36px 40px;text-align:center;">
                        <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                    border-radius:12px;padding:14px 18px;margin-bottom:16px;">
                          %s
                        </div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                          Excellent Training
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">
                          Centre de Formation Professionnelle
                        </p>
                      </td>
                    </tr>

                    <!-- Corps -->
                    <tr>
                      <td style="padding:40px;">
                        <div style="margin-bottom:24px;">
                          <span style="display:inline-block;background:#EEF2FF;color:#4338CA;
                                       font-size:12px;font-weight:700;padding:4px 12px;
                                       border-radius:20px;letter-spacing:0.3px;">
                            🎓 Nouvelle affectation
                          </span>
                        </div>

                        <h2 style="margin:0 0 16px;color:#0F172A;font-size:20px;font-weight:700;">
                          Bonjour %s,
                        </h2>
                        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                          Vous avez été affecté(e) à une nouvelle formation. Voici les détails :
                        </p>

                        <!-- Bloc infos formation -->
                        <div style="background:#F8FAFC;border:1px solid #E2E8F0;
                                    border-radius:10px;padding:24px;margin-bottom:28px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Titre
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:700;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Date de début
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Durée
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s jour(s)
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Lieu
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Domaine
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:10px 0;">
                                <span style="color:#64748B;font-size:13px;font-weight:600;
                                             text-transform:uppercase;letter-spacing:0.5px;">
                                  Formateur
                                </span><br>
                                <span style="color:#0F172A;font-size:15px;font-weight:600;">
                                  %s
                                </span>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>

                    <!-- Pied de page -->
                    <tr>
                      <td style="background:#F8FAFC;padding:20px 40px;text-align:center;
                                 border-top:1px solid #E2E8F0;">
                        <p style="margin:0;color:#94A3B8;font-size:12px;">
                          © 2026 Excellent Training — Green Building · Tous droits réservés
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                logoBlock(),
                participantName == null || participantName.isBlank() ? "Participant" : escapeHtml(participantName),
                formation.getTitre() == null ? "Non renseignée" : escapeHtml(formation.getTitre()),
                formation.getDateDebut() == null ? "Non renseignée" : formation.getDateDebut(),
                formation.getDuree() == null ? "Non renseignée" : formation.getDuree(),
                formation.getLieu() == null ? "Non renseigné" : escapeHtml(formation.getLieu()),
                formation.getDomaineLibelle() == null ? "Non renseigné" : escapeHtml(formation.getDomaineLibelle()),
                formation.getFormateurNom() == null ? "Non renseigné" : escapeHtml(formation.getFormateurNom())
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitaires
    // ─────────────────────────────────────────────────────────────────────────

    /** Masque l'email dans les logs : john.doe@gmail.com → jo****@gmail.com */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) return "**@" + domain;
        return local.substring(0, 2) + "****@" + domain;
    }

    /** Échappe les caractères HTML pour éviter les injections XSS dans les emails. */
    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}