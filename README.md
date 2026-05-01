# Application de Gestion de Formation Continue

**Annee Universitaire :** 2025/2026  
**Institut :** Institut Superieur d'Informatique (Universite de Tunis El Manar)  
**Auteurs :** Wiem Ayari & Sakroufi Aya

Une plateforme web moderne, securisee et hautement performante concue pour numeriser et optimiser la gestion centralisee des formations professionnelles continues au sein du centre de formation "Excellent Training" de la societe "Green Building". 

L'application elimine la gestion manuelle (fichiers Excel, courriers papiers) en automatisant le suivi des formations, l'affectation des participants et des formateurs, tout en offrant aux responsables une vue analytique pointue sur l'activite annuelle de l'entreprise.

---

## Fonctionnalites Principales

- **Tableau de Bord Analytique Dynamique** : Visualisation en temps reel des statistiques cles (KPIs, suivi des budgets, repartition des formations par domaine et par structure) grace a des graphiques interactifs.
- **Gestion Avancee des Formations** : Creation, planification et gestion complete du cycle de vie des sessions de formation.
- **Gestion Complete des Acteurs** : Suivi precis des formateurs (internes et externes) et gestion du parcours de chaque participant.
- **Systeme de Notifications Intelligentes par E-mail** : 
  - Envoi automatique des informations de connexion (identifiant / mot de passe) aux nouveaux utilisateurs.
  - Gestion securisee de la reinitialisation des acces via la fonctionnalite "Mot de passe oublie".
  - Notification instantanee des participants lorsqu'ils sont affectes a une nouvelle formation.
  - Envoi de rappels automatiques aux participants le jour meme du debut de leur formation (avec integration dynamique du logo de l'entreprise).
- **Securite Renforcee (RBAC & JWT)** : Systeme de connexion robuste sans etat base sur les roles (ADMIN, RESPONSABLE, USER) avec chiffrement des mots de passe (BCrypt).

---

## Technologies Utilisees

### Backend (API REST)
- **Java & Spring Boot 3** : Framework robuste offrant d'excellentes performances.
- **Spring Security & JWT** : Securisation complete des acces et des endpoints.
- **Spring Data JPA & Hibernate** : Mapping objet-relationnel (ORM) strict pour garantir l'integrite des donnees.
- **MySQL** : Base de donnees relationnelle.
- **Spring Mail** : Integration SMTP pour le systeme de notifications par messagerie.

### Frontend (Interface Utilisateur)
- **React.js** : Construction d'une Single Page Application (SPA) reactive.
- **Material UI (MUI)** : Design system professionnel, ergonomique et accessible.
- **Framer Motion** : Micro-animations fluides pour une experience utilisateur tres soignee.
- **Recharts** : Creation des tableaux de bord analytiques dynamiques.

---

## Guide d'Installation

Voici les etapes detaillees pour executer le projet localement sous Windows et Ubuntu/Linux.

### 1. Prerequis (Communs)
Assurez-vous d'avoir installe les outils suivants sur votre machine :
- Node.js (version 18 ou superieure)
- Java JDK (version 17 ou superieure)
- MySQL Server (version 8.0 ou superieure)
- Maven (3.8+)
- Un IDE pour Java (IntelliJ IDEA, Eclipse ou VS Code)

### 2. Configuration du JWT Secret
Pour la variable d'environnement JWT_SECRET (que nous configurerons plus bas dans le fichier .env), vous devez utiliser une longue chaine de caracteres aleatoire et securisee (au moins 256 bits).
Vous pouvez utiliser des generateurs en ligne (comme un generateur SHA-256), ou bien saisir vous-meme une longue phrase robuste, par exemple :
`JWT_SECRET=MaCleSuperSecreteEtTresLonguePourLeProjetDeFormation2026!`

### 3. Deploiement sur Windows

**Base de donnees :**
1. Ouvrez votre client MySQL (ex: MySQL Workbench ou phpMyAdmin via WAMP/XAMPP).
2. Ouvrez le fichier `db/schema.sql` situe dans le code source et executez tout son contenu. Cela creera la base `training_db` et l'ensemble des tables necessaires.
3. *(Optionnel)* Ouvrez et executez le fichier `db/data.sql` pour remplir la base avec un jeu de donnees de demonstration.

**Backend (Spring Boot) :**
1. Ouvrez le dossier `backend` dans votre IDE.
2. A la racine du dossier `backend/`, creez un fichier nomme `.env` et ajoutez vos variables d'environnement :
   ```env
   DATASOURCE_URL=jdbc:mysql://localhost:3306/training_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   MYSQL_USER=root
   MYSQL_PASSWORD=votre_mot_de_passe_mysql
   JWT_SECRET=VotreCleSecreteJWTGenereeEtape2
   MAIL_USERNAME=votre_email@gmail.com
   MAIL_PASSWORD=votre_mot_de_passe_d_application_gmail
   ```
3. Lancez l'application en executant la classe principale (`GfApplication.java`). Le serveur demarrera sur le port 8081.

**Frontend (React) :**
1. Ouvrez PowerShell et naviguez dans le dossier `frontend` :
   ```bash
   cd chemin\vers\TrainingManagement\frontend
   ```
2. Installez les dependances et lancez l'application :
   ```bash
   npm install
   npm start
   ```

### 4. Deploiement sur Ubuntu / Linux

**Base de donnees :**
1. Ouvrez un terminal et executez les scripts SQL :
   ```bash
   mysql -u root -p < db/schema.sql
   mysql -u root -p < db/data.sql
   ```

**Backend (Spring Boot) :**
1. Naviguez dans le dossier backend :
   ```bash
   cd backend
   ```
2. Creez le fichier `.env` avec les memes informations que pour Windows :
   ```bash
   nano .env
   # Ajoutez vos variables et sauvegardez (Ctrl+O, Enter, Ctrl+X)
   ```
3. Exportez les variables d'environnement et demarrez le serveur avec Maven :
   ```bash
   export $(cat .env | grep -v '^#' | xargs)
   mvn spring-boot:run
   ```

**Frontend (React) :**
1. Naviguez dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dependances et lancez le frontend :
   ```bash
   npm install
   npm start
   ```

---

## Architecture de Securite et Validations

La securite a ete concue pour repondre aux plus hauts standards academiques et industriels :
- **Validations strictes (@Valid)** : Toutes les donnees entrantes (ex: creation d'un utilisateur ou d'une formation) sont scrupuleusement verifiees cote backend avant l'insertion en base, garantissant ainsi une parfaite fiabilite des donnees (conformement au cahier des charges).
- **Protection des acces** : Chaque action de l'API est filtree (@PreAuthorize). L'Administrateur a les pleins pouvoirs, le Responsable gere l'analytique et l'evaluation, et le simple Utilisateur gere le fonctionnel operationnel (Formations, Participants).

---

## Defis Techniques Releves

1. **Integration du systeme d'E-mailing complet** : Developper un mecanisme robuste pour notifier les acteurs de maniere proactive avec des modeles de courriels professionnels integrant des images incrustees.
2. **Analytique en Temps Reel** : Remplacer l'ancien systeme manuel (Excel) par des graphiques interactifs qui lisent dynamiquement les donnees relationnelles complexes de la base.
3. **Securite et CORS** : Gestion approfondie des filtres JWT pour bloquer correctement les acces non autorises (401/403) sans rompre la communication entre le front-end React et l'API Spring Boot.
