-- ============================================
-- Base de donnees : Gestion de Formation
-- ============================================

DROP DATABASE IF EXISTS training_db;
CREATE DATABASE training_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE training_db;

-- =====================================================
-- TABLE : role
-- =====================================================
CREATE TABLE role (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      nom VARCHAR(50) NOT NULL UNIQUE
);

-- =====================================================
-- TABLE : utilisateur
-- =====================================================
CREATE TABLE utilisateur (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             username VARCHAR(50) NOT NULL UNIQUE,
                             password VARCHAR(120) NOT NULL,
                             email VARCHAR(100) UNIQUE,
                             idRole BIGINT NOT NULL,
                             firstLogin TINYINT(1) NOT NULL DEFAULT 0,
                             FOREIGN KEY (idRole) REFERENCES role(id)
);

-- =====================================================
-- TABLE : password_reset_token
-- =====================================================
CREATE TABLE password_reset_token (
                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      token VARCHAR(255) NOT NULL UNIQUE,
                                      user_id BIGINT NOT NULL,
                                      expiryDate DATETIME NOT NULL,
                                      used BOOLEAN NOT NULL DEFAULT FALSE,
                                      FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);
CREATE INDEX idx_reset_token ON password_reset_token(token);
CREATE INDEX idx_reset_token_user ON password_reset_token(user_id);

-- =====================================================
-- TABLE : domaine
-- =====================================================
CREATE TABLE domaine (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         libelle VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- TABLE : profil
-- =====================================================
CREATE TABLE profil (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        libelle VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- TABLE : structure
-- =====================================================
CREATE TABLE structure (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           libelle VARCHAR(100) NOT NULL UNIQUE,
                           type VARCHAR(20) NOT NULL DEFAULT 'CENTRALE'
);

-- =====================================================
-- TABLE : employeur
-- =====================================================
CREATE TABLE employeur (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           nomEmployeur VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- TABLE : formateur
-- =====================================================
CREATE TABLE formateur (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           nom VARCHAR(50) NOT NULL,
                           prenom VARCHAR(50) NOT NULL,
                           email VARCHAR(100),
                           tel VARCHAR(20),
                           type VARCHAR(20) NOT NULL,
                           idEmployeur BIGINT,
                           FOREIGN KEY (idEmployeur) REFERENCES employeur(id)
);

-- =====================================================
-- TABLE : participant
-- =====================================================
CREATE TABLE participant (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             nom VARCHAR(50) NOT NULL,
                             prenom VARCHAR(50) NOT NULL,
                             email VARCHAR(100),
                             tel VARCHAR(20),
                             idStructure BIGINT,
                             idProfil BIGINT,
                             FOREIGN KEY (idStructure) REFERENCES structure(id),
                             FOREIGN KEY (idProfil) REFERENCES profil(id)
);

-- =====================================================
-- TABLE : formation
-- =====================================================
CREATE TABLE formation (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           titre VARCHAR(200) NOT NULL,
                           annee INT NOT NULL,
                           duree INT NOT NULL,
                           budget DOUBLE NOT NULL,
                           idDomaine BIGINT NOT NULL,
                           idFormateur BIGINT,
                           dateDebut DATE,
                           dateFin DATE,
                           lieu VARCHAR(200),
                           statut VARCHAR(50) NOT NULL DEFAULT 'PLANIFIEE',
                           FOREIGN KEY (idDomaine) REFERENCES domaine(id),
                           FOREIGN KEY (idFormateur) REFERENCES formateur(id)
);

-- =====================================================
-- TABLE : inscription
-- =====================================================
CREATE TABLE inscription (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             idParticipant BIGINT NOT NULL,
                             idFormation BIGINT NOT NULL,
                             statut VARCHAR(50) NOT NULL DEFAULT 'INSCRIT',
                             note DOUBLE,
                             FOREIGN KEY (idParticipant) REFERENCES participant(id),
                             FOREIGN KEY (idFormation) REFERENCES formation(id),
                             UNIQUE KEY unique_inscription (idParticipant, idFormation)
);
