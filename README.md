# Application de Gestion de Formation 

**Année Universitaire :** 2025/2026  
**Institut :** Institut Supérieur d'Informatique (Université de Tunis El Manar)  
**Auteurs :** Wiem Ayari & Sakroufi Aya

Une plateforme web moderne, sécurisée et hautement performante conçue pour numériser et optimiser la gestion centralisée des formations professionnelles continues au sein du centre de formation « Excellent Training » de la société « Green Building ». 

L'application élimine la gestion manuelle (fichiers Excel, courriers papiers) en automatisant le suivi des formations, l'affectation des participants et des formateurs, tout en offrant aux responsables une vue analytique pointue sur l'activité annuelle de l'entreprise.

---

## Fonctionnalités Principales

- **Tableau de Bord Analytique Dynamique** : Visualisation en temps réel des statistiques clés (KPIs, suivi des budgets, répartition des formations par domaine et par structure) grâce à des graphiques interactifs.
- **Gestion Avancée des Formations** : Création, planification et gestion complète du cycle de vie des sessions de formation.
- **Gestion Complète des Acteurs** : Suivi précis des formateurs (internes et externes) et gestion du parcours de chaque participant.
- **Système de Notifications Intelligentes par E-mail** : 
  - Envoi automatique des informations de connexion (identifiant / mot de passe) aux nouveaux utilisateurs.
  - Gestion sécurisée de la réinitialisation des accès via la fonctionnalité "Mot de passe oublié".
  - Notification instantanée des participants lorsqu'ils sont affectés à une nouvelle formation.
  - Envoi de rappels automatiques aux participants le jour même du début de leur formation (avec intégration dynamique du logo de l'entreprise).
- **Sécurité Renforcée (RBAC & JWT)** : Système de connexion robuste sans état basé sur les rôles (ADMIN, RESPONSABLE, USER) avec chiffrement des mots de passe (BCrypt).

---

## Technologies Utilisées

### Backend (API REST)
- **Java & Spring Boot 3** : Framework robuste offrant d'excellentes performances.
- **Spring Security & JWT** : Sécurisation complète des accès et des endpoints.
- **Spring Data JPA & Hibernate** : Mapping objet-relationnel (ORM) strict pour garantir l'intégrité des données.
- **MySQL** : Base de données relationnelle.
- **Spring Mail** : Intégration SMTP pour le système de notifications par messagerie.

### Frontend (Interface Utilisateur)
- **React.js** : Construction d'une Single Page Application (SPA) réactive.
- **Material UI (MUI)** : Design system professionnel, ergonomique et accessible.
- **Framer Motion** : Micro-animations fluides pour une expérience utilisateur très soignée.
- **Recharts** : Création des tableaux de bord analytiques dynamiques.

---

## Guide d'Installation

Voici les étapes détaillées pour exécuter le projet localement sous Windows et Ubuntu/Linux.

### 1. Prérequis (Communs)
Assurez-vous d'avoir installé les outils suivants sur votre machine :
- Node.js (version 18 ou supérieure)
- Java JDK (version 17 ou supérieure)
- MySQL Server (version 8.0 ou supérieure)
- Maven (3.8+)
- Un IDE pour Java (IntelliJ IDEA, Eclipse ou VS Code)

### 2. Configuration du JWT Secret
Pour la variable d'environnement JWT_SECRET (que nous configurerons plus bas dans le fichier .env), vous devez utiliser une longue chaîne de caractères aléatoire et sécurisée (au moins 256 bits).
Vous pouvez utiliser des générateurs en ligne (comme un générateur SHA-256), ou bien saisir vous-même une longue phrase robuste, par exemple :
`JWT_SECRET=MaCleSuperSecreteEtTresLonguePourLeProjetDeFormation2026!`

### 3. Déploiement sur Windows

**Base de données :**
1. Ouvrez votre client MySQL (ex: MySQL Workbench ou phpMyAdmin via WAMP/XAMPP).
2. Ouvrez le fichier `db/schema.sql` situé dans le code source et exécutez tout son contenu. Cela créera la base `training_db` et l'ensemble des tables nécessaires.
3. *(Optionnel)* Ouvrez et exécutez le fichier `db/data.sql` pour remplir la base avec un jeu de données de démonstration.

**Backend (Spring Boot) :**
1. Ouvrez le dossier `backend` dans votre IDE.
2. À la racine du dossier `backend/`, créez un fichier nommé `.env` et ajoutez vos variables d'environnement :
   ```env
   DATASOURCE_URL=jdbc:mysql://localhost:3306/training_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   MYSQL_USER=root
   MYSQL_PASSWORD=votre_mot_de_passe_mysql
   JWT_SECRET=VotreCleSecreteJWTGenereeEtape2
   MAIL_USERNAME=votre_email@gmail.com
   MAIL_PASSWORD=votre_mot_de_passe_d_application_gmail
   ```
3. Lancez l'application en exécutant la classe principale (`GfApplication.java`). Le serveur démarrera sur le port 8081.

**Frontend (React) :**
1. Ouvrez PowerShell et naviguez dans le dossier `frontend` :
   ```bash
   cd chemin\vers\TrainingManagement\frontend
   ```
2. Installez les dépendances et lancez l'application :
   ```bash
   npm install
   npm start
   ```

### 4. Déploiement sur Ubuntu / Linux

**Base de données :**
1. Ouvrez un terminal et exécutez les scripts SQL :
   ```bash
   mysql -u root -p < db/schema.sql
   mysql -u root -p < db/data.sql
   ```

**Backend (Spring Boot) :**
1. Naviguez dans le dossier backend :
   ```bash
   cd backend
   ```
2. Créez le fichier `.env` avec les mêmes informations que pour Windows :
   ```bash
   nano .env
   # Ajoutez vos variables et sauvegardez (Ctrl+O, Enter, Ctrl+X)
   ```
3. Exportez les variables d'environnement et démarrez le serveur avec Maven :
   ```bash
   export $(cat .env | grep -v '^#' | xargs)
   mvn spring-boot:run
   ```

**Frontend (React) :**
1. Naviguez dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances et lancez le frontend :
   ```bash
   npm install
   npm start
   ```

---

## Architecture de Sécurité Avancée et Validations

La sécurité est une composante majeure de l'application, conçue pour protéger les données sensibles et répondre aux normes industrielles :
- **Authentification sans état (JWT)** : L'application utilise les JSON Web Tokens (JWT) pour une sécurisation optimale des échanges entre le frontend React et l'API Spring Boot.
- **Hachage cryptographique (BCrypt)** : Tous les mots de passe sont hachés de manière irréversible avec l'algorithme BCrypt avant leur stockage en base de données.
- **Contrôle d'Accès Basé sur les Rôles (RBAC)** : Les routes et méthodes de l'API sont strictement verrouillées (via `@PreAuthorize`) selon trois niveaux de privilèges :
  - **Administrateur** : Accès total au système et gestion des comptes utilisateurs.
  - **Responsable** : Accès aux statistiques et au tableau de bord analytique.
  - **Utilisateur** : Accès au suivi fonctionnel (Formations, Participants, Formateurs).
- **Validations strictes (@Valid)** : Toutes les données saisies par les utilisateurs sont systématiquement validées par le backend (Jakarta Validation) pour garantir l'intégrité et la fiabilité des informations en base, conformément aux exigences du cahier des charges.

---

## Défis Techniques Relevés

1. **Intégration du système d'E-mailing complet** : Développer un mécanisme robuste pour notifier les acteurs de manière proactive avec des modèles de courriels professionnels intégrant des images incrustées.
2. **Analytique en Temps Réel** : Remplacer l'ancien système manuel (Excel) par des graphiques interactifs qui lisent dynamiquement les données relationnelles complexes de la base.
3. **Sécurité et CORS** : Gestion approfondie des filtres JWT pour bloquer correctement les accès non autorisés (401/403) sans rompre la communication entre le front-end React et l'API Spring Boot.

---

## Perspectives d'Évolution

Afin d'améliorer encore l'application dans le futur, voici quelques perspectives d'évolution envisageables :
- **Génération d'Attestations** : Création automatique d'attestations de présence et de réussite au format PDF pour les participants à la fin d'une formation.
- **Déploiement Cloud / Docker** : Conteneuriser l'application avec Docker pour simplifier et automatiser son déploiement sur des serveurs cloud.
- **Intégration d'un Calendrier Interactif** : Ajouter une vue calendrier (type FullCalendar) pour offrir une visualisation temporelle globale de toutes les sessions de formation planifiées.
