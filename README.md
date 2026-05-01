# Application de Gestion de Formation Continue

**Année Universitaire :** 2025/2026  
**Institut :** Institut Supérieur d’Informatique (Université de Tunis El Manar)

Une plateforme web moderne et performante pour la gestion centralisée des formations professionnelles continues au sein du centre de formation « Excllent Training » de la société « Green Building ». Cette application permet de suivre les formations, d'affecter des participants et formateurs, de gérer les budgets, et fournit un tableau de bord analytique avancé.
## 🚀 Fonctionnalités Principales

- **Tableau de Bord Analytique** : Visualisation en temps réel des statistiques (KPIs, budgets, répartition par domaine).
- **Gestion des Formations** : Création, planification et suivi des sessions de formation.
- **Gestion des Acteurs** : Suivi des formateurs (internes/externes) et des participants.
- **Gestion Administrative** : Configuration des structures, domaines, profils et employeurs.
- **Sécurité et Authentification** : Système de connexion sécurisé (JWT) basé sur trois rôles (ADMIN, RESPONSABLE, USER) avec hachage BCrypt.
- **Notifications Automatiques** : Envoi de courriels pour l'affectation à une formation et pour les rappels de début de formation, avec intégration dynamique de logo (CID).

---

## 🛠 Technologies Utilisées

### Backend
- **Java & Spring Boot 3** : Cœur de l'application et API REST.
- **Spring Security & JWT** : Authentification et autorisation sans état.
- **Spring Data JPA & Hibernate** : ORM pour l'interaction avec la base de données.
- **MySQL** : Base de données relationnelle.
- **Spring Mail** : Service d'envoi d'e-mails.

### Frontend
- **React.js** : Interface utilisateur réactive.
- **Material UI (MUI)** : Composants graphiques et système de design.
- **Framer Motion** : Animations et transitions fluides.
- **Recharts** : Génération des graphiques analytiques (tableaux de bord).

---

## 🛡️ Architecture de Sécurité

La sécurité est une composante majeure de l'application, conçue autour des standards de l'industrie :
- **Authentification Stateless (JWT)** : Utilisation de JSON Web Tokens pour gérer les sessions sans stocker d'état côté serveur, immunisant l'application contre les attaques CSRF classiques.
- **Hachage Fort (BCrypt)** : Les mots de passe sont protégés par l'algorithme `BCryptPasswordEncoder` avant leur stockage en base de données.
- **Contrôle d'Accès Basé sur les Rôles (RBAC)** : Les routes et les actions sont strictement verrouillées côté serveur (`@PreAuthorize`) selon trois niveaux de privilèges (USER, RESPONSABLE, ADMIN).
- **Protection des Endpoints** : Les erreurs d'authentification (401) et d'autorisation (403) sont capturées pour renvoyer des réponses JSON génériques, empêchant la fuite d'informations techniques (StackTraces).

*(Note : Pour une mise en production complète sur le web, la configuration actuelle est prête à être enveloppée par un certificat SSL/TLS (HTTPS) afin de chiffrer les données en transit sur le réseau).*

---

## 💻 Guide d'Installation

### Prérequis (Communs)
- Node.js (v18+)
- Java (JDK 17+)
- Maven (3.8+)
- MySQL (8.0+)

### 🪟 Déploiement sur Windows

1. **Base de données** :
   - Ouvrez MySQL Workbench ou la ligne de commande MySQL.
   - Exécutez le script `db/schema.sql` pour créer la base et les tables.
   - Exécutez le script `db/data.sql` si vous souhaitez injecter les données de démonstration.
2. **Backend (Spring Boot)** :
   - Ouvrez le dossier `backend` dans votre IDE (IntelliJ IDEA ou Eclipse).
   - Créez un fichier `.env` à la racine de `backend/` contenant vos variables (SMTP, mot de passe BDD, clé JWT).
   - Lancez la classe `TrainingManagementApplication.java`.
3. **Frontend (React)** :
   - Ouvrez un terminal PowerShell dans le dossier `frontend`.
   - Exécutez `npm install` pour installer les dépendances.
   - Exécutez `npm start` pour démarrer l'application (http://localhost:3000).

### 🐧 Déploiement sur Ubuntu / Linux

1. **Base de données** :
   ```bash
   mysql -u root -p < db/schema.sql
   mysql -u root -p < db/data.sql
   ```
2. **Backend** :
   ```bash
   cd backend
   # Assurez-vous d'avoir créé le fichier .env
   export $(cat .env | grep -v '^#' | xargs)
   mvn spring-boot:run
   ```
3. **Frontend** :
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 🔮 Perspectives d'Évolution

- **Déploiement Cloud / Conteneurisation** : Dockeriser l'application (Dockerfile et docker-compose.yml) pour automatiser le déploiement sur le Cloud.
- **Implémentation de HTTPS** : Sécuriser la communication réseau en intégrant un certificat SSL/TLS pour garantir le chiffrement des tokens JWT en production.
- **Génération d'Attestations** : Ajout d'une fonctionnalité pour générer et télécharger automatiquement des attestations de réussite en format PDF pour les participants.
- **Calendrier Interactif** : Intégrer un module calendrier global (type FullCalendar) pour visualiser rapidement la planification des sessions.

---

## 🧗 Différentes Difficultés Rencontrées

1. **Gestion des Redirections de Sécurité (CORS / 401)** : La distinction stricte entre les requêtes de validation (400) et de sécurité (401) par Spring Security causait des déconnexions inattendues côté client. Cela a nécessité un ajustement fin des filtres JWT et de la configuration de sécurité.
2. **Contraintes et Cohérence de la Base de Données** : Assurer la cohérence des données tout au long du développement (particulièrement entre les champs optionnels) en respectant les contraintes JPA, sans déclencher des ConstraintViolationExceptions.
3. **Notifications par E-mail** : Gérer l'incorporation asynchrone des ressources multimédias (comme le logo) directement au sein du corps du courriel (Content-ID inline) pour éviter les blocages des boîtes de messagerie et assurer un affichage professionnel.
4. **Tableau de Bord Dynamique** : Refondre l'intégration des statistiques pour passer d'un système statique à une restitution 100% en temps réel, impliquant une gestion fine des jointures SQL et de la structuration des données sur Recharts.

---

**Auteurs** : Wiem Ayari & Sakroufi Aya
