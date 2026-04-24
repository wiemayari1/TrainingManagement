-- ================================================================
-- PATCH SQL — Excellent Training
-- ================================================================

USE training_db;

-- Table de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    idUser INT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (idUser) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Index (sans IF NOT EXISTS car MySQL ne le supporte pas)
CREATE INDEX idx_reset_token ON password_reset_token(token);
CREATE INDEX idx_reset_user ON password_reset_token(idUser);

-- Vérification emails
UPDATE utilisateur SET email = 'admin@excellent-training.tn' WHERE username = 'admin' AND (email IS NULL OR email = '');
UPDATE utilisateur SET email = 'responsable@excellent-training.tn' WHERE username = 'responsable' AND (email IS NULL OR email = '');
UPDATE utilisateur SET email = 'user@excellent-training.tn' WHERE username = 'user' AND (email IS NULL OR email = '');

SELECT 'Patch applique avec succes' as status;
