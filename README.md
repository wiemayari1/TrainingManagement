# TrainingManagement - Corrections Complètes

## 🔴 PROBLÈME CRITIQUE : "Identifiants incorrects mais il existe déjà"

### Cause
Les mots de passe dans `db/init.sql` sont stockés **EN CLAIR** (`'password123'`) mais Spring Security utilise `BCryptPasswordEncoder`.

### Solution
Utilisez `db/init_corrected.sql` qui contient :
- Hash BCrypt pour les mots de passe
- Colonne `idRole` (compatible avec User.java JPA)
- Toutes les données de démo (5 ans de formations)

```bash
mysql -u root -p < db/init_corrected.sql
```

---

## 🔴 PROBLÈME : Unknown column 'u1_0.idRole'

### Cause
Le fichier SQL original utilise `idRole` comme nom de colonne (dans `utilisateur` et `formation`), mais mon premier `init_corrected.sql` utilisait `role_id`.

### Solution
Le nouveau `init_corrected.sql` utilise maintenant les bons noms de colonnes :
- `idRole` (pas `role_id`)
- `idDomaine`, `idFormateur`, `idStructure`, `idProfil`, `idEmployeur`, `idParticipant`

---

## Fichiers corrigés

### 🔴 CRITIQUES
1. **frontend/src/App.js** — Fichier JSX vide → Routes complètes
2. **backend/.../EmailService.java** — HTML au lieu de Java → Classe fonctionnelle
3. **frontend/src/pages/Login.jsx** — Rendu tronqué → Formulaire complet
4. **frontend/src/pages/Stats.jsx** — Rendu tronqué → 6 onglets fonctionnels
5. **frontend/src/components/Layout.jsx** — Rendu tronqué → Sidebar responsive
6. **frontend/src/pages/Dashboard.jsx** — Rendu tronqué → Dashboard avec graphiques
7. **db/init_corrected.sql** — Mots de passe en clair → Hash BCrypt + colonnes compatibles JPA

### 🟡 HAUTE
8. **AuthController.java** — Validation null register
9. **AdminController.java** — Vérification doublons updateUser
10. **InscriptionController.java** — Vérification doublon update
11. **JwtUtils.java** — Cast sécurisé getRoleFromToken
12. **StatsController.java** — Suppression @CrossOrigin redondant

### 🟢 MOYENNE
13. **api.js** — Callback logout programmatique
14. **authStore.js** — Méthode checkAuth()
15. **FirstLogin.jsx** — Utilisation service api
16. **ProtectedRoute.jsx** — Redirections corrigées
17. **PasswordResetTokenRepo.java** — deleteAllExpired()
18. **TokenCleanupService.java** — Nettoyage auto
19. **application.properties** — Variables d'environnement

## Instructions

### 1. Recréer la base de données
```bash
cd ~/TrainingManagement
mysql -u root -p < db/init_corrected.sql
```

### 2. Vérifier la structure
```bash
mysql -u root -p -e "DESC training_db.utilisateur"
```
Doit afficher `idRole` (pas `role_id`).

### 3. Vérifier les mots de passe
```bash
mysql -u root -p -e "SELECT username, LENGTH(password) FROM training_db.utilisateur"
```
Doit afficher `60` pour les 3 comptes.

### 4. Copier les fichiers corrigés
Remplacez les fichiers existants par ceux du dossier `trainingmanagement-fixes`.

### 5. Ajouter @EnableScheduling
```java
@SpringBootApplication
@EnableScheduling
public class TrainingManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrainingManagementApplication.class, args);
    }
}
```

### 6. Lancer
```bash
cd backend && mvn clean install && mvn spring-boot:run
cd frontend && npm start
```

## Comptes démo (mot de passe: password123)
| Login | Rôle |
|-------|------|
| admin | Administrateur |
| responsable | Responsable |
| user | Utilisateur |
