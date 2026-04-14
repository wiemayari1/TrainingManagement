-- ================================================================
-- training_db — Script d'initialisation complet
-- Les mots de passe sont en clair : le DataInitializer Spring Boot
-- les hashera automatiquement au 1er démarrage via BCrypt.
-- ================================================================

CREATE DATABASE IF NOT EXISTS training_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE training_db;

-- ── RÔLES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) UNIQUE NOT NULL
);
INSERT IGNORE INTO role (id, nom) VALUES
  (1, 'ROLE_USER'),
  (2, 'ROLE_RESPONSABLE'),
  (3, 'ROLE_ADMIN');

-- ── UTILISATEURS ─────────────────────────────────────────────────
-- Mots de passe en clair (hashés automatiquement par DataInitializer.java)
CREATE TABLE IF NOT EXISTS utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    email VARCHAR(100) UNIQUE,
    idRole INT NOT NULL,
    FOREIGN KEY (idRole) REFERENCES role(id)
);
INSERT IGNORE INTO utilisateur (id, username, password, email, idRole) VALUES
  (1, 'admin',       'password123', 'admin@excellent-training.tn',       3),
  (2, 'responsable', 'password123', 'responsable@excellent-training.tn', 2),
  (3, 'user',        'password123', 'user@excellent-training.tn',        1);

-- ── DOMAINES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domaine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE
);
INSERT IGNORE INTO domaine (libelle) VALUES
  ('Informatique'), ('Management'), ('Finance'),
  ('Comptabilité'), ('Ressources Humaines'), ('Marketing'), ('Juridique');

-- ── PROFILS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE
);
INSERT IGNORE INTO profil (libelle) VALUES
  ('Ingénieur Informatique (Bac+5)'), ('Ingénieur Informatique (Bac+3)'),
  ('Gestionnaire'), ('Juriste'), ('Technicien Supérieur'), ('Comptable'), ('Manager');

-- ── STRUCTURES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'CENTRALE'
);
INSERT IGNORE INTO structure (libelle, type) VALUES
  ('Direction Centrale IT',          'CENTRALE'),
  ('Direction Centrale Financière',  'CENTRALE'),
  ('Direction Régionale Nord',       'REGIONALE'),
  ('Direction Centrale RH',          'CENTRALE'),
  ('Direction Régionale Sud',        'REGIONALE');

-- ── EMPLOYEURS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employeur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomEmployeur VARCHAR(100) NOT NULL UNIQUE
);
INSERT IGNORE INTO employeur (nomEmployeur) VALUES
  ('Green Building'), ('Externe Corp'), ('Freelance Pro'), ('Cabinet Conseil TN');

-- ── FORMATEURS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    tel VARCHAR(20),
    type VARCHAR(20) NOT NULL CHECK (type IN ('INTERNE', 'EXTERNE')),
    idEmployeur INT,
    FOREIGN KEY (idEmployeur) REFERENCES employeur(id)
);
INSERT IGNORE INTO formateur (nom, prenom, email, tel, type, idEmployeur) VALUES
  ('Ben Ali',  'Ahmed',  'ahmed@greenbuilding.tn', '20123456', 'INTERNE', 1),
  ('Trabelsi', 'Sarra',  'sarra@externe.com',      '98765432', 'EXTERNE', 2),
  ('Mrabet',   'Karim',  'karim@greenbuilding.tn', '50111222', 'INTERNE', 1),
  ('Gharbi',   'Rania',  'rania@cabinet.tn',       '55667788', 'EXTERNE', 4);

-- ── PARTICIPANTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    tel VARCHAR(20),
    idStructure INT,
    idProfil INT,
    FOREIGN KEY (idStructure) REFERENCES structure(id),
    FOREIGN KEY (idProfil) REFERENCES profil(id)
);
INSERT IGNORE INTO participant (nom, prenom, email, tel, idStructure, idProfil) VALUES
  ('Hammami', 'Mohamed', 'med.hammami@mail.tn',  '23456789', 1, 1),
  ('Ayadi',   'Fatma',   'fatma.ayadi@mail.tn',  '98123456', 2, 3),
  ('Bouzid',  'Youssef', 'youssef.b@mail.tn',    '50234567', 1, 2),
  ('Sassi',   'Houda',   'houda.sassi@mail.tn',  '55342211', 4, 5),
  ('Jebali',  'Bilel',   'bilel.j@mail.tn',      '21567890', 3, 7);

-- ── FORMATIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    annee INT NOT NULL,
    duree INT NOT NULL,
    budget DOUBLE NOT NULL,
    idDomaine INT NOT NULL,
    idFormateur INT,
    dateDebut DATE,
    dateFin DATE,
    lieu VARCHAR(200),
    statut VARCHAR(50) NOT NULL DEFAULT 'PLANIFIEE',
    FOREIGN KEY (idDomaine) REFERENCES domaine(id),
    FOREIGN KEY (idFormateur) REFERENCES formateur(id),
    CHECK (statut IN ('PLANIFIEE','EN_COURS','TERMINEE','ANNULEE'))
);
INSERT IGNORE INTO formation (titre, annee, duree, budget, idDomaine, idFormateur, dateDebut, dateFin, lieu, statut) VALUES
  ('Python pour l''analyse de données',      2025, 3, 4500.00, 1, 1, '2025-02-10','2025-02-12','Salle A - Siège','TERMINEE'),
  ('Management d''équipe et leadership',     2025, 2, 3800.00, 2, 3, '2025-03-05','2025-03-06','Centre Tunis','TERMINEE'),
  ('Comptabilité générale avancée',          2025, 3, 5200.00, 4, 2, '2025-04-15','2025-04-17','Salle B - Siège','EN_COURS'),
  ('Cybersécurité et protection des données',2025, 4, 7500.00, 1, 1, '2025-05-20','2025-05-23','Salle A - Siège','PLANIFIEE'),
  ('Droit du travail 2025',                  2025, 1, 2200.00, 7, 4, '2025-06-10','2025-06-10','Salle de conférence','PLANIFIEE'),
  ('Marketing digital',                      2025, 2, 3100.00, 6, 2, '2025-07-08','2025-07-09','Centre Tunis','PLANIFIEE'),
  ('Gestion de projet Agile',               2025, 3, 4800.00, 2, 3, '2025-01-20','2025-01-22','Salle A - Siège','TERMINEE');

-- ── INSCRIPTIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inscription (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idParticipant INT NOT NULL,
    idFormation INT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'INSCRIT',
    note FLOAT,
    commentaires TEXT,
    FOREIGN KEY (idParticipant) REFERENCES participant(id),
    FOREIGN KEY (idFormation) REFERENCES formation(id),
    UNIQUE KEY unique_inscription (idParticipant, idFormation),
    CHECK (statut IN ('INSCRIT','PRESENT','ABSENT'))
);
INSERT IGNORE INTO inscription (idParticipant, idFormation, statut, note) VALUES
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
