# 🎓 Application de Gestion de Formation Continue

**Année Universitaire :** 2025/2026  
**Institut :** Institut Supérieur d’Informatique (Université de Tunis El Manar)  
**Auteurs :** Wiem Ayari & Sakroufi Aya

Une plateforme web moderne, sécurisée et hautement performante conçue pour numériser et optimiser la gestion centralisée des formations professionnelles continues au sein du centre de formation **« Excellent Training »** de la société **« Green Building »**. 

L'application élimine la gestion manuelle (fichiers Excel, courriers papiers) en automatisant le suivi des formations, l'affectation des participants et des formateurs, tout en offrant aux responsables une vue analytique pointue sur l'activité annuelle de l'entreprise.

---

## 🚀 Fonctionnalités Principales

- **📊 Tableau de Bord Analytique Dynamique** : Visualisation en temps réel des statistiques clés (KPIs, suivi des budgets, répartition des formations par domaine et par structure) grâce à des graphiques interactifs.
- **📅 Gestion Avancée des Formations** : Création, planification et gestion complète du cycle de vie des sessions de formation.
- **👥 Gestion Complète des Acteurs** : Suivi précis des formateurs (internes et externes) et gestion du parcours de chaque participant.
- **✉️ Système de Notifications Intelligentes par E-mail** : 
  - Envoi automatique des informations de connexion (identifiant / mot de passe) aux nouveaux utilisateurs.
  - Gestion sécurisée de la réinitialisation des accès via la fonctionnalité "Mot de passe oublié".
  - Notification instantanée des participants lorsqu'ils sont affectés à une nouvelle formation.
  - Envoi de rappels automatiques aux participants le jour même du début de leur formation (avec intégration dynamique du logo de l'entreprise).
- **🔒 Sécurité Renforcée (RBAC & JWT)** : Système de connexion robuste sans état basé sur les rôles (ADMIN, RESPONSABLE, USER) avec chiffrement des mots de passe (BCrypt).

---

## 🛠 Technologies Utilisées

### ⚙️ Backend (API REST)
- **Java & Spring Boot 3** : Framework robuste offrant d'excellentes performances.
- **Spring Security & JWT** : Sécurisation complète des accès et des endpoints.
- **Spring Data JPA & Hibernate** : Mapping objet-relationnel (ORM) strict pour garantir l'intégrité des données.
- **MySQL** : Base de données relationnelle.
- **Spring Mail** : Intégration SMTP pour le système de notifications par messagerie.

### 🎨 Frontend (Interface Utilisateur)
- **React.js** : Construction d'une Single Page Application (SPA) réactive.
- **Material UI (MUI)** : Design system professionnel, ergonomique et accessible.
- **Framer Motion** : Micro-animations fluides pour une expérience utilisateur très soignée ("Premium").
- **Recharts** : Création des tableaux de bord analytiques dynamiques.

---

## 💻 Guide d'Installation (Windows)

Voici les étapes claires et détaillées pour exécuter le projet localement sous Windows.

### 1️⃣ Prérequis
Assurez-vous d'avoir installé les outils suivants sur votre machine :
- **Node.js** (version 18 ou supérieure)
- **Java JDK** (version 17 ou supérieure)
- **MySQL Server** (version 8.0 ou supérieure)
- Un IDE pour Java (ex: **IntelliJ IDEA**, **Eclipse** ou **VS Code**)

### 2️⃣ Configuration de la Base de Données
1. Ouvrez votre client MySQL (ex: **MySQL Workbench** ou **phpMyAdmin** via WAMP/XAMPP).
2. Ouvrez le fichier `db/schema.sql` situé dans le code source et exécutez tout son contenu. Cela créera la base `training_db` et l'ensemble des tables nécessaires.
3. *(Optionnel)* Ouvrez et exécutez le fichier `db/data.sql` pour remplir la base avec un jeu de données de démonstration très riche.

### 3️⃣ Démarrage du Backend (Spring Boot)
1. Ouvrez le dossier `backend` dans votre IDE (ex: IntelliJ IDEA).
2. À la racine du dossier `backend/`, créez un fichier nommé `.env` (sans nom avant le point) et ajoutez vos variables d'environnement (nécessaires pour la base de données et l'envoi des e-mails) :
   ```env
   DATASOURCE_URL=jdbc:mysql://localhost:3306/training_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   MYSQL_USER=root
   MYSQL_PASSWORD=votre_mot_de_passe_mysql
   JWT_SECRET=CleSuperSecretePourJWTDeLApplicationFormationGreenBuilding
   MAIL_USERNAME=votre_email@gmail.com
   MAIL_PASSWORD=votre_mot_de_passe_d_application_gmail
   ```
3. Laissez Maven télécharger les dépendances (cela peut prendre quelques minutes lors du premier lancement).
4. Lancez l'application en exécutant la classe principale (`GfApplication.java`). Le serveur démarrera sur le port `8081`.

### 4️⃣ Démarrage du Frontend (React)
1. Ouvrez une invite de commande (Terminal ou PowerShell) et naviguez dans le dossier `frontend` :
   ```bash
   cd chemin\vers\TrainingManagement\frontend
   ```
2. Installez les dépendances du projet en tapant :
   ```bash
   npm install
   ```
3. Démarrez l'interface utilisateur avec la commande :
   ```bash
   npm start
   ```
4. Votre navigateur s'ouvrira automatiquement à l'adresse `http://localhost:3000`. Vous pourrez vous connecter avec les comptes de démonstration (ex: `admin` / `password123`).

---

## 🛡️ Architecture de Sécurité et Validations

La sécurité a été conçue pour répondre aux plus hauts standards académiques et industriels :
- **Validations strictes (`@Valid`)** : Toutes les données entrantes (ex: création d'un utilisateur ou d'une formation) sont scrupuleusement vérifiées côté backend avant l'insertion en base, garantissant ainsi une parfaite fiabilité des données (conformément au cahier des charges).
- **Protection des accès** : Chaque action de l'API est filtrée (`@PreAuthorize`). L'Administrateur a les pleins pouvoirs, le Responsable gère l'analytique et l'évaluation, et le simple Utilisateur gère le fonctionnel opérationnel (Formations, Participants).

---

## 🧗 Défis Techniques Relevés

1. **Intégration du système d'E-mailing complet** : Développer un mécanisme robuste pour notifier les acteurs de manière proactive (informations de connexion, mots de passe oubliés, alertes de formation) avec des modèles de courriels professionnels intégrant des images incrustées.
2. **Analytique en Temps Réel** : Remplacer l'ancien système manuel (Excel) par des graphiques interactifs qui lisent dynamiquement les données relationnelles complexes de la base.
3. **Sécurité et CORS** : Gestion approfondie des filtres JWT pour bloquer correctement les accès non autorisés (401/403) sans rompre la communication entre le front-end React et l'API Spring Boot.
