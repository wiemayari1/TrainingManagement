# TrainingManagement - Corrections Complètes

## 🚀 Démarrage rapide (Password Reset local)

### Prérequis
- Java 17+, Maven 3.8+
- Node.js 18+, npm
- MySQL 8+

### 1. Initialiser la base de données
```bash
mysql -u root -p < db/init.sql
```

### 2. Lancer le backend
```bash
cd backend
mvn spring-boot:run
```
Le backend démarre sur **http://localhost:8081/api**.

> **Mail désactivé par défaut** (`app.mail.enabled=false`). Le lien de réinitialisation s'affiche dans les logs backend :
> `WARN  c.i.g.s.EmailService - Mail is disabled. Password reset link for <email>: http://localhost:3000/reset-password?token=<token>`
> Copiez ce lien dans le navigateur pour tester le reset.

#### Activer l'envoi d'email réel (optionnel)
Définissez ces variables d'environnement avant de lancer le backend :
```bash
export MAIL_ENABLED=true
export MAIL_HOST=sandbox.smtp.mailtrap.io   # ou votre serveur SMTP
export MAIL_PORT=587
export MAIL_USERNAME=<votre_username>
export MAIL_PASSWORD=<votre_password>
```

### 3. Lancer le frontend
```bash
cd frontend
cp .env.example .env   # Facultatif — la valeur par défaut est déjà correcte
npm install
npm start
```
Le frontend démarre sur **http://localhost:3000**.

### 4. Tester le password reset
1. Accédez à `http://localhost:3000/forgot-password`
2. Entrez un email existant (ex: `admin@excellent-training.tn`)
3. Regardez les logs backend pour le lien de reset (si `MAIL_ENABLED=false`)
4. Ouvrez le lien → entrez un nouveau mot de passe → validez

### Variables d'environnement résumé
| Variable | Défaut | Description |
|----------|--------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8081/api` | URL de base du backend (frontend) |
| `MYSQL_USER` | `root` | Utilisateur MySQL |
| `MYSQL_PASSWORD` | `root123` | Mot de passe MySQL |
| `MAIL_ENABLED` | `false` | Activer l'envoi d'emails |
| `MAIL_HOST` | `sandbox.smtp.mailtrap.io` | Serveur SMTP |
| `MAIL_PORT` | `587` | Port SMTP |
| `MAIL_USERNAME` | _(vide)_ | Login SMTP |
| `MAIL_PASSWORD` | _(vide)_ | Mot de passe SMTP |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend (pour les liens email) |
| `JWT_SECRET` | _(clé par défaut)_ | Clé secrète JWT |

---

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
