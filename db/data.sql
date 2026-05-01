USE training_db;

-- =====================================================
-- TABLE : role
-- =====================================================
INSERT INTO role (id, nom) VALUES
                               (1, 'ROLE_USER'),
                               (2, 'ROLE_RESPONSABLE'),
                               (3, 'ROLE_ADMIN');

-- =====================================================
-- TABLE : utilisateur
-- =====================================================
INSERT INTO utilisateur (id, username, password, email, idRole, firstLogin) VALUES
                                                                                (1, 'admin', '$2b$10$Ik7QjiCXtLCcvNiOVJyoCuxMzyn6C62SXFoV65MJloO3WPLfDzMbq', 'admin@excellent-training.tn', 3, 0),
                                                                                (2, 'responsable', '$2b$10$UOMP2Ye6KtyCy5jR/UIiuO/YQWQWQ0WVDQXYog9icuJW0Ad6L1wra', 'responsable@excellent-training.tn', 2, 0),
                                                                                (3, 'user', '$2b$10$aPHGnoaXxzT6B4UfUvvfye4hXyTsWueLjsjMzanzN47Uh6LOrReae', 'user@excellent-training.tn', 1, 0);

-- =====================================================
-- TABLE : domaine
-- =====================================================
INSERT INTO domaine (libelle) VALUES
                                  ('Informatique'), ('Management'), ('Finance'),
                                  ('Comptabilite'), ('Ressources Humaines'), ('Marketing'), ('Juridique');

-- =====================================================
-- TABLE : profil
-- =====================================================
INSERT INTO profil (libelle) VALUES
                                 ('Ingenieur Informatique (Bac+5)'), ('Ingenieur Informatique (Bac+3)'),
                                 ('Gestionnaire'), ('Juriste'), ('Technicien Superieur'), ('Comptable'), ('Manager');

-- =====================================================
-- TABLE : structure
-- =====================================================
INSERT INTO structure (libelle, type) VALUES
                                          ('Direction Centrale IT', 'CENTRALE'),
                                          ('Direction Centrale Financiere', 'CENTRALE'),
                                          ('Direction Regionale Nord', 'REGIONALE'),
                                          ('Direction Centrale RH', 'CENTRALE'),
                                          ('Direction Regionale Sud', 'REGIONALE');

-- =====================================================
-- TABLE : employeur
-- =====================================================
INSERT INTO employeur (nomEmployeur) VALUES
                                         ('Green Building'), ('Externe Corp'), ('Freelance Pro'), ('Cabinet Conseil TN');

-- =====================================================
-- TABLE : formateur
-- =====================================================
INSERT INTO formateur (nom, prenom, email, tel, type, idEmployeur) VALUES
                                                                       ('Ben Ali', 'Ahmed', 'ahmed@greenbuilding.tn', '20123456', 'INTERNE', 1),
                                                                       ('Trabelsi', 'Sarra', 'sarra@externe.com', '98765432', 'EXTERNE', 2),
                                                                       ('Mrabet', 'Karim', 'karim@greenbuilding.tn', '50111222', 'INTERNE', 1),
                                                                       ('Gharbi', 'Rania', 'rania@cabinet.tn', '55667788', 'EXTERNE', 4);

-- =====================================================
-- TABLE : participant
-- =====================================================
INSERT INTO participant (nom, prenom, email, tel, idStructure, idProfil) VALUES
                                                                             ('Hammami', 'Mohamed', 'med.hammami@mail.tn', '23456789', 1, 1),
                                                                             ('Ayadi', 'Fatma', 'fatma.ayadi@mail.tn', '98123456', 2, 3),
                                                                             ('Bouzid', 'Youssef', 'youssef.b@mail.tn', '50234567', 1, 2),
                                                                             ('Sassi', 'Houda', 'houda.sassi@mail.tn', '55342211', 4, 5),
                                                                             ('Jebali', 'Bilel', 'bilel.j@mail.tn', '21567890', 3, 7),
                                                                             ('Mejri', 'Amira', 'amira.m@mail.tn', '50789012', 2, 4),
                                                                             ('Khadhra', 'Omar', 'omar.k@mail.tn', '22113344', 5, 6),
                                                                             ('Ferchichi', 'Nadia', 'nadia.f@mail.tn', '55443322', 1, 3);

-- =====================================================
-- TABLE : formation
-- =====================================================
INSERT INTO formation (titre, annee, duree, budget, idDomaine, idFormateur, dateDebut, dateFin, lieu, statut) VALUES
                                                                                                                  ('Initiation a Python',           2021, 2, 2800.00, 1, 1, '2021-03-15', '2021-03-16', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Gestion de projet classique',   2021, 3, 3500.00, 2, 3, '2021-05-10', '2021-05-12', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Comptabilite de base',          2021, 2, 2200.00, 4, 2, '2021-09-20', '2021-09-21', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Marketing digital debutant',    2021, 2, 2500.00, 6, 2, '2021-11-08', '2021-11-09', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Developpement Web Full Stack',  2022, 4, 5200.00, 1, 1, '2022-02-14', '2022-02-17', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Leadership et communication',   2022, 2, 3200.00, 2, 3, '2022-04-18', '2022-04-19', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Finance entreprise',            2022, 3, 4100.00, 3, 2, '2022-06-06', '2022-06-08', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Recrutement et selection',      2022, 1, 1800.00, 5, 4, '2022-10-03', '2022-10-03', 'Salle de conference', 'TERMINEE'),
                                                                                                                  ('Droit des contrats',            2022, 2, 2400.00, 7, 4, '2022-12-12', '2022-12-13', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Data Science avec Python',      2023, 4, 6000.00, 1, 1, '2023-01-23', '2023-01-26', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Management Agile',              2023, 2, 3400.00, 2, 3, '2023-03-13', '2023-03-14', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Analyse financiere avancee',    2023, 3, 4800.00, 3, 2, '2023-05-15', '2023-05-17', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Gestion de la paie',            2023, 2, 2600.00, 5, 4, '2023-09-11', '2023-09-12', 'Salle de conference', 'TERMINEE'),
                                                                                                                  ('SEO et referencement naturel',  2023, 1, 1500.00, 6, 2, '2023-11-20', '2023-11-20', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Cybersecurite fondamentale',    2024, 3, 5500.00, 1, 1, '2024-02-05', '2024-02-07', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Negociation commerciale',       2024, 2, 2900.00, 2, 3, '2024-04-22', '2024-04-23', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Controle de gestion',           2024, 3, 4200.00, 3, 2, '2024-06-17', '2024-06-19', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Gestion des talents',           2024, 2, 3100.00, 5, 4, '2024-09-09', '2024-09-10', 'Salle de conference', 'TERMINEE'),
                                                                                                                  ('Strategie marketing B2B',       2024, 2, 3300.00, 6, 2, '2024-11-18', '2024-11-19', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Python pour analyse de donnees',             2025, 3, 4500.00, 1, 1, '2025-02-10', '2025-02-12', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Management equipe et leadership',            2025, 2, 3800.00, 2, 3, '2025-03-05', '2025-03-06', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Comptabilite generale avancee',              2025, 3, 5200.00, 4, 2, '2025-04-15', '2025-04-17', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Cybersecurite et protection des donnees',    2025, 4, 7500.00, 1, 1, '2025-05-20', '2025-05-23', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Droit du travail 2025',                      2025, 1, 2200.00, 7, 4, '2025-06-10', '2025-06-10', 'Salle de conference', 'TERMINEE'),
                                                                                                                  ('Marketing digital avance',                   2025, 2, 3100.00, 6, 2, '2025-07-08', '2025-07-09', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Gestion de projet Agile',                    2025, 3, 4800.00, 2, 3, '2025-01-20', '2025-01-22', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Fiscalite des entreprises',                  2025, 2, 3600.00, 3, 2, '2025-09-15', '2025-09-16', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Communication professionnelle',              2025, 2, 2700.00, 2, 3, '2025-10-06', '2025-10-07', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Developpement mobile Flutter',               2025, 4, 6200.00, 1, 1, '2025-11-10', '2025-11-13', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Intelligence Artificielle et Machine Learning', 2026, 5, 9500.00, 1, 1, '2026-01-12', '2026-01-16', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Leadership strategique',                        2026, 3, 5200.00, 2, 3, '2026-01-27', '2026-01-29', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('Audit et controle interne',                     2026, 3, 4800.00, 3, 2, '2026-02-10', '2026-02-12', 'Salle B - Siege',     'TERMINEE'),
                                                                                                                  ('Transformation digitale',                       2026, 2, 4100.00, 1, 1, '2026-02-24', '2026-02-25', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Droit social et RGPD',                          2026, 2, 3200.00, 7, 4, '2026-03-10', '2026-03-11', 'Salle de conference', 'TERMINEE'),
                                                                                                                  ('Marketing des reseaux sociaux',                 2026, 2, 3400.00, 6, 2, '2026-03-24', '2026-03-25', 'Centre Tunis',        'TERMINEE'),
                                                                                                                  ('DevOps et CI/CD',                               2026, 4, 7200.00, 1, 1, '2026-04-07', '2026-04-10', 'Salle A - Siege',     'TERMINEE'),
                                                                                                                  ('Gestion des ressources humaines avancee',       2026, 3, 4500.00, 5, 4, '2026-04-22', '2026-04-24', 'Salle de conference', 'EN_COURS'),
                                                                                                                  ('Comptabilite analytique',                       2026, 2, 3700.00, 4, 2, '2026-05-12', '2026-05-13', 'Salle B - Siege',     'PLANIFIEE'),
                                                                                                                  ('Negociation et gestion des conflits',           2026, 2, 3000.00, 2, 3, '2026-05-26', '2026-05-27', 'Centre Tunis',        'PLANIFIEE'),
                                                                                                                  ('Securite des systemes d information',           2026, 3, 6800.00, 1, 1, '2026-06-09', '2026-06-11', 'Salle A - Siege',     'PLANIFIEE'),
                                                                                                                  ('Fiscalite internationale',                      2026, 2, 4200.00, 3, 2, '2026-06-23', '2026-06-24', 'Salle B - Siege',     'PLANIFIEE');

-- =====================================================
-- TABLE : inscription
-- =====================================================
INSERT INTO inscription (idParticipant, idFormation, statut, note) VALUES
                                                                       (1, 1, 'PRESENT', 14.0), (2, 1, 'PRESENT', 12.5), (3, 1, 'ABSENT', NULL),
                                                                       (1, 2, 'PRESENT', 15.5), (4, 2, 'PRESENT', 13.0), (5, 2, 'PRESENT', 16.0),
                                                                       (2, 3, 'PRESENT', 11.0), (6, 3, 'PRESENT', 14.5),
                                                                       (3, 4, 'PRESENT', 13.5), (7, 4, 'ABSENT',  NULL),
                                                                       (1, 5, 'PRESENT', 16.5), (2, 5, 'PRESENT', 15.0), (4, 5, 'PRESENT', 14.0),
                                                                       (3, 6, 'PRESENT', 13.0), (5, 6, 'ABSENT',  NULL),  (6, 6, 'PRESENT', 15.5),
                                                                       (1, 7, 'PRESENT', 17.0), (7, 7, 'PRESENT', 12.0),
                                                                       (2, 8, 'PRESENT', 14.5), (8, 8, 'PRESENT', 13.5),
                                                                       (4, 9, 'PRESENT', 15.0), (5, 9, 'PRESENT', 16.5),
                                                                       (1, 10, 'PRESENT', 17.5), (3, 10, 'PRESENT', 16.0), (5, 10, 'ABSENT',  NULL),
                                                                       (2, 11, 'PRESENT', 14.0), (6, 11, 'PRESENT', 15.5), (7, 11, 'PRESENT', 13.0),
                                                                       (1, 12, 'PRESENT', 15.0), (4, 12, 'PRESENT', 14.5), (8, 12, 'ABSENT',  NULL),
                                                                       (3, 13, 'PRESENT', 13.5), (5, 13, 'PRESENT', 14.0),
                                                                       (2, 14, 'PRESENT', 12.0), (6, 14, 'PRESENT', 15.0),
                                                                       (1, 15, 'PRESENT', 16.0), (2, 15, 'PRESENT', 15.5), (7, 15, 'PRESENT', 14.0),
                                                                       (3, 16, 'PRESENT', 13.5), (5, 16, 'ABSENT',  NULL),  (8, 16, 'PRESENT', 14.5),
                                                                       (1, 17, 'PRESENT', 15.5), (4, 17, 'PRESENT', 16.0), (6, 17, 'PRESENT', 14.0),
                                                                       (2, 18, 'PRESENT', 15.0), (7, 18, 'PRESENT', 13.5),
                                                                       (3, 19, 'PRESENT', 14.0), (5, 19, 'PRESENT', 15.5), (8, 19, 'ABSENT',  NULL),
                                                                       (1, 20, 'PRESENT', 15.5), (2, 20, 'PRESENT', 14.0), (3, 20, 'ABSENT',  NULL),
                                                                       (1, 21, 'PRESENT', 17.0), (4, 21, 'PRESENT', 13.5), (6, 21, 'PRESENT', 15.0),
                                                                       (2, 22, 'PRESENT', 13.0), (5, 22, 'PRESENT', 14.5), (7, 22, 'PRESENT', 12.5),
                                                                       (1, 23, 'PRESENT', 16.5), (3, 23, 'PRESENT', 15.0), (8, 23, 'ABSENT',  NULL),
                                                                       (4, 24, 'PRESENT', 14.0), (6, 24, 'PRESENT', 13.5),
                                                                       (2, 25, 'PRESENT', 15.5), (5, 25, 'PRESENT', 14.0), (7, 25, 'ABSENT',  NULL),
                                                                       (1, 26, 'PRESENT', 16.0), (3, 26, 'PRESENT', 15.0), (5, 26, 'ABSENT',  NULL),
                                                                       (2, 27, 'PRESENT', 13.5), (4, 27, 'PRESENT', 14.5), (8, 27, 'PRESENT', 13.0),
                                                                       (1, 28, 'PRESENT', 15.0), (6, 28, 'PRESENT', 16.0), (7, 28, 'PRESENT', 14.5),
                                                                       (3, 29, 'PRESENT', 14.0), (5, 29, 'PRESENT', 15.5), (8, 29, 'ABSENT',  NULL),
                                                                       (1, 30, 'PRESENT', 17.0), (2, 30, 'PRESENT', 16.0), (3, 30, 'PRESENT', 15.5), (4, 30, 'ABSENT',  NULL),
                                                                       (1, 31, 'PRESENT', 16.5), (5, 31, 'PRESENT', 15.0), (6, 31, 'PRESENT', 14.5),
                                                                       (2, 32, 'PRESENT', 14.0), (4, 32, 'PRESENT', 15.5), (7, 32, 'ABSENT',  NULL),
                                                                       (1, 33, 'PRESENT', 15.0), (3, 33, 'PRESENT', 16.0), (8, 33, 'PRESENT', 14.5),
                                                                       (5, 34, 'PRESENT', 13.5), (6, 34, 'PRESENT', 14.0), (7, 34, 'ABSENT',  NULL),
                                                                       (2, 35, 'PRESENT', 15.5), (4, 35, 'PRESENT', 14.0), (8, 35, 'PRESENT', 13.5),
                                                                       (1, 36, 'PRESENT', 17.5), (3, 36, 'PRESENT', 16.5), (5, 36, 'ABSENT',  NULL),
                                                                       (2, 37, 'PRESENT', NULL), (6, 37, 'PRESENT', NULL), (7, 37, 'INSCRIT', NULL),
                                                                       (4, 38, 'INSCRIT', NULL), (5, 38, 'INSCRIT', NULL), (8, 38, 'INSCRIT', NULL),
                                                                       (1, 39, 'INSCRIT', NULL), (3, 39, 'INSCRIT', NULL),
                                                                       (2, 40, 'INSCRIT', NULL), (4, 40, 'INSCRIT', NULL), (6, 40, 'INSCRIT', NULL),
                                                                       (5, 41, 'INSCRIT', NULL), (7, 41, 'INSCRIT', NULL);

SELECT 'Base de donnees initialisee avec succes !' AS status;
