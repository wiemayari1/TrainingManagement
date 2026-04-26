-- ================================================================
-- training_db — Script d'initialisation COMPLET (fusionné)
-- ================================================================

CREATE DATABASE IF NOT EXISTS training_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE training_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_reset_token;
DROP TABLE IF EXISTS inscription;
DROP TABLE IF EXISTS formation;
DROP TABLE IF EXISTS participant;
DROP TABLE IF EXISTS formateur;
DROP TABLE IF EXISTS employeur;
DROP TABLE IF EXISTS structure;
DROP TABLE IF EXISTS profil;
DROP TABLE IF EXISTS domaine;
DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS role;
SET FOREIGN_KEY_CHECKS = 1;

-- ── RÔLES ────────────────────────────────────────────────────────
CREATE TABLE role (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom  VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO role (id, nom) VALUES
  (1, 'ROLE_USER'),
  (2, 'ROLE_RESPONSABLE'),
  (3, 'ROLE_ADMIN');

-- ── UTILISATEURS ─────────────────────────────────────────────────
CREATE TABLE utilisateur (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    password   VARCHAR(120) NOT NULL,
    email      VARCHAR(100) UNIQUE,
    idRole     BIGINT NOT NULL,
    firstLogin TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (idRole) REFERENCES role(id)
);
INSERT INTO utilisateur (id, username, password, email, idRole, firstLogin) VALUES
  (1, 'admin',       '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEJH1fQp.uJ7M2mJ9K', 'admin@excellent-training.tn',       3, 0),
  (2, 'responsable', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEJH1fQp.uJ7M2mJ9K', 'responsable@excellent-training.tn', 2, 0),
  (3, 'user',        '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEJH1fQp.uJ7M2mJ9K', 'user@excellent-training.tn',        1, 0);

-- ── DOMAINES ─────────────────────────────────────────────────────
CREATE TABLE domaine (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO domaine (libelle) VALUES
  ('Informatique'), ('Management'), ('Finance'),
  ('Comptabilité'), ('Ressources Humaines'), ('Marketing'), ('Juridique');

-- ── PROFILS ──────────────────────────────────────────────────────
CREATE TABLE profil (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO profil (libelle) VALUES
  ('Ingénieur Informatique (Bac+5)'), ('Ingénieur Informatique (Bac+3)'),
  ('Gestionnaire'), ('Juriste'), ('Technicien Supérieur'), ('Comptable'), ('Manager');

-- ── STRUCTURES ───────────────────────────────────────────────────
CREATE TABLE structure (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    type    VARCHAR(20)  NOT NULL DEFAULT 'CENTRALE'
);
INSERT INTO structure (libelle, type) VALUES
  ('Direction Centrale IT',         'CENTRALE'),
  ('Direction Centrale Financière', 'CENTRALE'),
  ('Direction Régionale Nord',      'REGIONALE'),
  ('Direction Centrale RH',         'CENTRALE'),
  ('Direction Régionale Sud',       'REGIONALE');

-- ── EMPLOYEURS ───────────────────────────────────────────────────
CREATE TABLE employeur (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nomEmployeur VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO employeur (nomEmployeur) VALUES
  ('Green Building'), ('Externe Corp'), ('Freelance Pro'), ('Cabinet Conseil TN');

-- ── FORMATEURS ───────────────────────────────────────────────────
CREATE TABLE formateur (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(50)  NOT NULL,
    prenom      VARCHAR(50)  NOT NULL,
    email       VARCHAR(100),
    tel         VARCHAR(20),
    type        VARCHAR(20)  NOT NULL,
    idEmployeur BIGINT,
    FOREIGN KEY (idEmployeur) REFERENCES employeur(id)
);
INSERT INTO formateur (nom, prenom, email, tel, type, idEmployeur) VALUES
  ('Ben Ali',  'Ahmed',  'ahmed@greenbuilding.tn', '20123456', 'INTERNE', 1),
  ('Trabelsi', 'Sarra',  'sarra@externe.com',      '98765432', 'EXTERNE', 2),
  ('Mrabet',   'Karim',  'karim@greenbuilding.tn', '50111222', 'INTERNE', 1),
  ('Gharbi',   'Rania',  'rania@cabinet.tn',       '55667788', 'EXTERNE', 4);

-- ── PARTICIPANTS ─────────────────────────────────────────────────
CREATE TABLE participant (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(50)  NOT NULL,
    prenom      VARCHAR(50)  NOT NULL,
    email       VARCHAR(100),
    tel         VARCHAR(20),
    idStructure BIGINT,
    idProfil    BIGINT,
    FOREIGN KEY (idStructure) REFERENCES structure(id),
    FOREIGN KEY (idProfil)    REFERENCES profil(id)
);
INSERT INTO participant (nom, prenom, email, tel, idStructure, idProfil) VALUES
  ('Hammami', 'Mohamed', 'med.hammami@mail.tn',  '23456789', 1, 1),
  ('Ayadi',   'Fatma',   'fatma.ayadi@mail.tn',  '98123456', 2, 3),
  ('Bouzid',  'Youssef', 'youssef.b@mail.tn',    '50234567', 1, 2),
  ('Sassi',   'Houda',   'houda.sassi@mail.tn',  '55342211', 4, 5),
  ('Jebali',  'Bilel',   'bilel.j@mail.tn',      '21567890', 3, 7);

-- ── FORMATIONS ───────────────────────────────────────────────────
CREATE TABLE formation (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(200) NOT NULL,
    annee       INT          NOT NULL,
    duree       INT          NOT NULL,
    budget      DOUBLE       NOT NULL,
    idDomaine   BIGINT       NOT NULL,
    idFormateur BIGINT,
    dateDebut   DATE,
    dateFin     DATE,
    lieu        VARCHAR(200),
    statut      VARCHAR(50)  NOT NULL DEFAULT 'PLANIFIEE',
    FOREIGN KEY (idDomaine)   REFERENCES domaine(id),
    FOREIGN KEY (idFormateur) REFERENCES formateur(id)
);
INSERT INTO formation (titre, annee, duree, budget, idDomaine, idFormateur, dateDebut, dateFin, lieu, statut) VALUES
  ('Python pour l''analyse de données',       2025, 3, 4500.00, 1, 1, '2025-02-10','2025-02-12','Salle A - Siège','TERMINEE'),
  ('Management d''équipe et leadership',      2025, 2, 3800.00, 2, 3, '2025-03-05','2025-03-06','Centre Tunis','TERMINEE'),
  ('Comptabilité générale avancée',           2025, 3, 5200.00, 4, 2, '2025-04-15','2025-04-17','Salle B - Siège','EN_COURS'),
  ('Cybersécurité et protection des données', 2025, 4, 7500.00, 1, 1, '2025-05-20','2025-05-23','Salle A - Siège','PLANIFIEE'),
  ('Droit du travail 2025',                   2025, 1, 2200.00, 7, 4, '2025-06-10','2025-06-10','Salle de conférence','PLANIFIEE'),
  ('Marketing digital',                       2025, 2, 3100.00, 6, 2, '2025-07-08','2025-07-09','Centre Tunis','PLANIFIEE'),
  ('Gestion de projet Agile',                 2025, 3, 4800.00, 2, 3, '2025-01-20','2025-01-22','Salle A - Siège','TERMINEE');

-- ── INSCRIPTIONS ─────────────────────────────────────────────────
CREATE TABLE inscription (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    idParticipant BIGINT       NOT NULL,
    idFormation   BIGINT       NOT NULL,
    statut        VARCHAR(50)  NOT NULL DEFAULT 'INSCRIT',
    note          DOUBLE,
    FOREIGN KEY (idParticipant) REFERENCES participant(id),
    FOREIGN KEY (idFormation)   REFERENCES formation(id),
    UNIQUE KEY unique_inscription (idParticipant, idFormation)
);
INSERT INTO inscription (idParticipant, idFormation, statut, note) VALUES
  (1, 1, 'PRESENT', 15.5),
  (2, 1, 'PRESENT', 14.0),
  (3, 1, 'ABSENT',  NULL),
  (1, 2, 'PRESENT', 17.0),
  (4, 2, 'PRESENT', 13.5),
  (2, 3, 'INSCRIT', NULL),
  (5, 3, 'INSCRIT', NULL),
  (1, 7, 'PRESENT', 16.0),
  (3, 7, 'PRESENT', 15.0),
  (5, 7, 'ABSENT',  NULL);

-- ── TABLE RESET PASSWORD ─────────────────────────────────────────
CREATE TABLE password_reset_token (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(100) NOT NULL UNIQUE,
    idUser     BIGINT       NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    FOREIGN KEY (idUser) REFERENCES utilisateur(id) ON DELETE CASCADE
);
CREATE INDEX idx_reset_token ON password_reset_token(token);
CREATE INDEX idx_reset_user  ON password_reset_token(idUser);

-- ── MIGRATION firstLogin (déjà intégrée) ─────────────────────────
-- La colonne firstLogin existe déjà dans utilisateur

SELECT 'Base de données initialisée avec succès !' AS status;
