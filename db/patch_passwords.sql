-- ============================================
-- PATCH : Correction des mots de passe en clair
-- Problème : Les mots de passe dans init.sql sont stockés en clair
--            mais Spring Security utilise BCryptPasswordEncoder
-- Solution : Mettre à jour les mots de passe avec des hash BCrypt
-- ============================================

-- Hash BCrypt pour 'password123' (générés avec BCryptPasswordEncoder)
-- Ces hash sont valides et testés

-- Option 1 : Mettre à jour les comptes existants
UPDATE utilisateur SET password = '$2b$10$Ik7QjiCXtLCcvNiOVJyoCuxMzyn6C62SXFoV65MJloO3WPLfDzMbq' WHERE username = 'admin';
UPDATE utilisateur SET password = '$2b$10$UOMP2Ye6KtyCy5jR/UIiuO/YQWQWQ0WVDQXYog9icuJW0Ad6L1wra' WHERE username = 'responsable';
UPDATE utilisateur SET password = '$2b$10$aPHGnoaXxzT6B4UfUvvfye4hXyTsWueLjsjMzanzN47Uh6LOrReae' WHERE username = 'user';

-- Vérification
SELECT username, password, LENGTH(password) as hash_length FROM utilisateur;
-- Les hash BCrypt font généralement 60 caractères
-- Si hash_length < 20, le mot de passe est encore en clair !

-- ============================================
-- ALTERNATIVE : Réinsérer les comptes (si table vide)
-- ============================================
-- DELETE FROM utilisateur WHERE id IN (1, 2, 3);
-- INSERT INTO utilisateur (id, username, email, password, firstLogin, role_id) VALUES
-- (1, 'admin', 'admin@training.tn', '$2b$10$Ik7QjiCXtLCcvNiOVJyoCuxMzyn6C62SXFoV65MJloO3WPLfDzMbq', 0, 3),
-- (2, 'responsable', 'responsable@training.tn', '$2b$10$UOMP2Ye6KtyCy5jR/UIiuO/YQWQWQ0WVDQXYog9icuJW0Ad6L1wra', 0, 2),
-- (3, 'user', 'user@training.tn', '$2b$10$aPHGnoaXxzT6B4UfUvvfye4hXyTsWueLjsjMzanzN47Uh6LOrReae', 0, 1);
