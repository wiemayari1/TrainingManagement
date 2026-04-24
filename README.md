# 🎓 Excellent Training — Application de Gestion de Formation

> Application web complète pour le centre de formation **Excellent Training** de **Green Building**  
> Stack : **Spring Boot 3.2** + **React 18** + **MySQL** + **JWT** + **JavaMail**

---

## 📋 Table des matières

1. [Prérequis](#-prérequis)
2. [Installation rapide](#-installation-rapide)
3. [Configuration](#-configuration)
4. [Structure du projet](#-structure-du-projet)
5. [Fonctionnalités](#-fonctionnalités)
6. [Rôles et permissions](#-rôles-et-permissions)
7. [API Endpoints](#-api-endpoints)
8. [Corrections apportées](#-corrections-apportées)
9. [Résolution de problèmes](#-résolution-de-problèmes)

---

## ✅ Prérequis

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| Java (JDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| MySQL | 8.0+ | `mysql --version` |
| IntelliJ IDEA | 2023+ | (recommandé) |

---

## 🚀 Installation rapide

### 1. Base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter le script d'initialisation
SOURCE /chemin/vers/db/init.sql;

# Exécuter le patch pour les nouvelles fonctionnalités
SOURCE /chemin/vers/backend-fixes/patch.sql;
```

### 2. Backend (Spring Boot)

```bash
cd backend

# Copier et configurer les propriétés
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Éditer application.properties avec vos infos MySQL et SMTP

# Compiler et lancer
mvn clean install
mvn spring-boot:run
```

> ✅ Le backend démarre sur **http://localhost:8081/api**

### 3. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm start
```

> ✅ Le frontend démarre sur **http://localhost:3000**

---

## ⚙️ Configuration

### Backend — `application.properties`

```properties
# Base de données (obligatoire)
spring.datasource.url=jdbc:mysql://localhost:3306/training_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE_MYSQL

# Email (pour reset de mot de passe)
# Option A : Gmail
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre.email@gmail.com
spring.mail.password=votre_app_password

# Option B : Mailtrap (tests sans vrais emails)
# spring.mail.host=smtp.mailtrap.io
# spring.mail.port=2525
# spring.mail.username=USER_MAILTRAP
# spring.mail.password=PASS_MAILTRAP
```

> ⚠️ Pour Gmail : activez la validation en 2 étapes puis créez un **App Password** sur  
> https://myaccount.google.com/apppasswords

### Email désactivé temporairement

Si vous ne voulez pas configurer l'email maintenant, ajoutez dans `application.properties`:

```properties
# Désactiver l'envoi email (mode développement)
spring.mail.host=localhost
spring.mail.port=25
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration
```

---

## 📁 Structure du projet

```
gestion-formation/
├── backend/
│   ├── src/main/java/com/isi/gf/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       ← Configuration Spring Security
│   │   │   ├── JwtUtils.java             ← Génération/validation JWT
│   │   │   └── JwtAuthFilter.java        ← Filtre JWT sur chaque requête
│   │   ├── controller/
│   │   │   ├── AuthController.java       ← Login / Register
│   │   │   ├── PasswordResetController.java ← ✅ NOUVEAU: Reset mot de passe
│   │   │   ├── FormationController.java
│   │   │   ├── ParticipantController.java
│   │   │   ├── FormateurController.java
│   │   │   ├── InscriptionController.java
│   │   │   ├── StatsController.java
│   │   │   └── AdminController.java      ← ✅ AMÉLIORÉ: Email de bienvenue
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   ├── PasswordResetToken.java   ← ✅ NOUVEAU
│   │   │   ├── Formation.java
│   │   │   ├── Participant.java
│   │   │   ├── Formateur.java
│   │   │   ├── Inscription.java
│   │   │   ├── Domaine.java
│   │   │   ├── Structure.java
│   │   │   ├── Profil.java
│   │   │   └── Employeur.java
│   │   ├── service/
│   │   │   ├── EmailService.java         ← ✅ NOUVEAU: Envoi d'emails HTML
│   │   │   ├── FormationService.java
│   │   │   ├── ParticipantService.java
│   │   │   ├── FormateurService.java
│   │   │   └── StatsService.java
│   │   └── repo/
│   │       ├── UserRepo.java             ← ✅ AMÉLIORÉ: findByEmail()
│   │       ├── PasswordResetTokenRepo.java ← ✅ NOUVEAU
│   │       └── ... (autres repos)
│   └── pom.xml                           ← ✅ AMÉLIORÉ: spring-boot-starter-mail
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx                 ← ✅ REDESIGN complet
│   │   │   ├── ForgotPassword.jsx        ← ✅ NOUVEAU: Reset mot de passe
│   │   │   ├── Stats.jsx                 ← ✅ AMÉLIORÉ: Multi-années + 5 onglets
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Formations.jsx
│   │   │   ├── Participants.jsx
│   │   │   ├── Formateurs.jsx
│   │   │   └── Admin/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── InscriptionsDialog.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/api.js
│   │   ├── store/authStore.js
│   │   └── App.js                        ← ✅ AMÉLIORÉ: nouvelles routes
│   └── package.json
│
└── db/
    ├── init.sql                          ← Script initial
    └── patch.sql                         ← ✅ NOUVEAU: Tables reset + index
```

---

## 🔐 Fonctionnalités

### Authentification & Sécurité
- ✅ Login JWT avec refresh automatique
- ✅ **Nouveau** : Réinitialisation de mot de passe par email
- ✅ **Nouveau** : Email de bienvenue à la création de compte
- ✅ Protection des routes par rôle (frontend + backend)
- ✅ Tokens JWT avec expiration 24h
- ✅ BCrypt pour les mots de passe

### Gestion des Formations
- ✅ CRUD complet (création, modification, suppression)
- ✅ Filtres : statut, domaine, recherche textuelle
- ✅ Gestion des inscriptions (ajouter, modifier statut, noter)
- ✅ Notes de 0 à 20 par participant

### Statistiques (améliorées ✅)
- ✅ **Comparaison multi-années** (jusqu'à 3 ans simultanément)
- ✅ **Courbes de tendance** avec sélecteur Formations/Participants/Budget
- ✅ **5 onglets** : Évolution, Répartition, Comparaison, Performance, Budget
- ✅ Tableau comparatif KPIs avec calcul d'évolution en %
- ✅ Donut chart des statuts avec pourcentages
- ✅ Graphique barres groupées par domaine et année
- ✅ Jauge circulaire taux de présence
- ✅ Budget par trimestre vs objectif

---

## 👥 Rôles et permissions

| Fonctionnalité | Utilisateur | Responsable | Administrateur |
|---------------|:-----------:|:-----------:|:--------------:|
| Tableau de bord | ✅ | ✅ | ✅ |
| Gérer formations | ✅ | ❌ | ✅ |
| Gérer participants | ✅ | ❌ | ✅ |
| Gérer formateurs | ✅ | ❌ | ✅ |
| Voir statistiques | ❌ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |
| Gérer domaines/structures | ❌ | ❌ | ✅ |

### Comptes de démo

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| `admin` | `password123` | Administrateur |
| `responsable` | `password123` | Responsable |
| `user` | `password123` | Utilisateur |

---

## 🌐 API Endpoints

### Authentification (public)
```
POST   /api/auth/login                    ← Connexion
POST   /api/auth/register                 ← Inscription
POST   /api/auth/forgot-password          ← ✅ Demande reset
GET    /api/auth/reset-password/verify    ← ✅ Vérifier token
POST   /api/auth/reset-password           ← ✅ Nouveau mot de passe
```

### Formations
```
GET    /api/formations              ← Liste (avec filtre ?annee=2025)
GET    /api/formations/{id}         ← Détail
POST   /api/formations              ← Créer
PUT    /api/formations/{id}         ← Modifier
DELETE /api/formations/{id}         ← Supprimer
```

### Participants
```
GET    /api/participants             ← Liste
GET    /api/participants/search?q=  ← Recherche
POST   /api/participants            ← Créer
PUT    /api/participants/{id}        ← Modifier
DELETE /api/participants/{id}        ← Supprimer
```

### Inscriptions
```
GET    /api/inscriptions/formation/{id}  ← Par formation
POST   /api/inscriptions                 ← Inscrire
PUT    /api/inscriptions/{id}            ← Modifier (statut, note)
DELETE /api/inscriptions/{id}            ← Supprimer
```

### Statistiques (ROLE_RESPONSABLE + ROLE_ADMIN)
```
GET    /api/stats/dashboard?annee=2025   ← KPIs + tous les graphiques
```

### Administration (ROLE_ADMIN uniquement)
```
GET/POST/PUT/DELETE  /api/admin/users
GET/POST/PUT/DELETE  /api/domaines
GET/POST/PUT/DELETE  /api/structures
GET/POST/PUT/DELETE  /api/profils
GET/POST/PUT/DELETE  /api/employeurs
```

---

## 🔧 Corrections apportées

### Backend
1. **`UserRepo.java`** — Ajout de `findByEmail()` (requis pour reset de mot de passe)
2. **`PasswordResetToken.java`** — Nouveau model pour les tokens de reset
3. **`PasswordResetTokenRepo.java`** — Nouveau repo
4. **`PasswordResetController.java`** — Nouveau controller (3 endpoints)
5. **`EmailService.java`** — Service d'envoi d'emails HTML (reset + bienvenue)
6. **`AdminController.java`** — Email de bienvenue à la création de compte
7. **`pom.xml`** — Ajout `spring-boot-starter-mail`
8. **`application.properties`** — Configuration SMTP complète
9. **`patch.sql`** — Table `password_reset_token` + index

### Frontend
1. **`Login.jsx`** — Redesign complet (design sombre, typographie Syne, particules)
2. **`Stats.jsx`** — Comparaison multi-années, 5 onglets, plus de graphiques
3. **`ForgotPassword.jsx`** — Nouveau: pages de reset mot de passe
4. **`App.js`** — Ajout routes `/forgot-password` et `/reset-password`

---

## 🐛 Résolution de problèmes

### ❌ `No qualifying bean of type 'JavaMailSender'`
> Email mal configuré. Soit configurer correctement le SMTP, soit désactiver:
```properties
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration
```

### ❌ `CORS error` depuis le frontend
> Vérifier que le backend tourne sur le port **8081** et le frontend sur **3000**.  
> Si changement de port, mettre à jour `SecurityConfig.java` et `api.js`.

### ❌ `401 Unauthorized` sur toutes les requêtes
> Le JWT a expiré. Se reconnecter ou augmenter `jwt.expiration` dans `application.properties`.

### ❌ `Access Denied` sur `/api/stats/dashboard`
> Vérifier que l'utilisateur a le rôle `ROLE_RESPONSABLE` ou `ROLE_ADMIN`.

### ❌ `Cannot find module 'framer-motion'`
```bash
cd frontend && npm install framer-motion
```

### ❌ Mailtrap ne reçoit pas les emails (tests)
> Vérifier que les credentials Mailtrap sont corrects et que le port **2525** n'est pas bloqué.

---

## 📊 Accès rapide

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8081/api |
| Login | http://localhost:3000/login |
| Stats | http://localhost:3000/stats |
| Admin | http://localhost:3000/admin |
| Reset mot de passe | http://localhost:3000/forgot-password |

---

*© 2026 Excellent Training — Green Building | Université de Tunis El Manar — ISI*
