# Training Management Application

**Academic Year:** 2025/2026  
**Institute:** Institut Supérieur d'Informatique (Université de Tunis El Manar)  
**Authors:** Wiem Ayari & Sakroufi Aya

A modern, secure, and highly performant web platform designed to digitize and optimize the centralized management of continuing professional training programs within the "Excellent Training" training center of the "Green Building" company.

The application eliminates manual management (Excel files, paper mail) by automating training tracking, the assignment of participants and trainers, while offering managers a sharp analytical view of the company's annual activity.

---

## Main Features

- **Dynamic Analytical Dashboard**: Real-time visualization of key statistics (KPIs, budget tracking, breakdown of training programs by domain and structure) through interactive charts.
- **Advanced Training Management**: Creation, scheduling, and complete management of the training session lifecycle.
- **Comprehensive Actor Management**: Precise tracking of trainers (internal and external) and management of each participant's journey.
- **Smart Email Notification System**:
  - Automatic sending of login information (username / password) to new users.
  - Secure management of access reset via the "Forgot Password" feature.
  - Instant notification of participants when they are assigned to a new training program.
  - Automatic reminders sent to participants on the day their training begins (with dynamic integration of the company logo).
- **Enhanced Security (RBAC & JWT)**: Robust, stateless, role-based login system (ADMIN, RESPONSABLE, USER) with password encryption (BCrypt).

---

## Technologies Used

### Backend (REST API)
- **Java & Spring Boot 3**: Robust framework offering excellent performance.
- **Spring Security & JWT**: Complete security of access and endpoints.
- **Spring Data JPA & Hibernate**: Strict object-relational mapping (ORM) to guarantee data integrity.
- **MySQL**: Relational database.
- **Spring Mail**: SMTP integration for the email notification system.

### Frontend (User Interface)
- **React.js**: Building a reactive Single Page Application (SPA).
- **Material UI (MUI)**: Professional, ergonomic, and accessible design system.
- **Framer Motion**: Smooth micro-animations for a highly polished user experience.
- **Recharts**: Creation of dynamic analytical dashboards.

---

## Default Accounts

If you have run the demo data script (`db/data.sql`), the following 3 accounts are automatically created with the password **`password123`**:
- **Administrator**: username `admin` / password `password123`
- **Manager**: username `responsable` / password `password123`
- **User**: username `user` / password `password123`

---

## Installation Guide

Here are the detailed steps to run the project locally on Windows and Ubuntu/Linux.

### 1. Prerequisites (Common)
Make sure you have the following tools installed on your machine:
- Node.js (version 18 or higher)
- Java JDK (version 17 or higher)
- MySQL Server (version 8.0 or higher)
- Maven (3.8+)
- A Java IDE (IntelliJ IDEA, Eclipse, or VS Code)

### 2. JWT Secret Configuration
For the JWT_SECRET environment variable (which we will configure below in the .env file), you must use a long, secure random string (at least 256 bits).
You can use online generators (such as a SHA-256 generator), or enter a long robust phrase yourself, for example:
`JWT_SECRET=MaCleSuperSecreteEtTresLonguePourLeProjetDeFormation2026!`

### 3. Deployment on Windows

**Database:**
1. Open your MySQL client (e.g., MySQL Workbench or phpMyAdmin via WAMP/XAMPP).
2. Open the `db/schema.sql` file located in the source code and execute its entire content. This will create the `training_db` database and all the necessary tables.
3. *(Optional)* Open and execute the `db/data.sql` file to populate the database with a set of demo data.

**Backend (Spring Boot):**
1. Open the `backend` folder in your IDE.
2. At the root of the `backend/` folder, you will find a file named `.env.example`. Rename it or copy it to `.env` (no name before the dot) and update your environment variables:
   ```env
   DATASOURCE_URL=jdbc:mysql://localhost:3306/training_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   JWT_SECRET=YourJWTSecretKeyGeneratedInStep2
   MAIL_USERNAME=your_email@gmail.com
   # Important: Use an "Application password" (16 characters) generated from your Google account security settings, not your real password.
   MAIL_PASSWORD=your_gmail_application_password
   ```
3. Run the application by executing the main class (`GfApplication.java`). The server will start on port 8081.

**Frontend (React):**
1. Open PowerShell and navigate to the `frontend` folder:
   ```bash
   cd path\to\TrainingManagement\frontend
   ```
2. Install the dependencies and run the application:
   ```bash
   npm install
   npm start
   ```

### 4. Deployment on Ubuntu / Linux

**Database:**
1. Open a terminal and run the SQL scripts:
   ```bash
   mysql -u root -p < db/schema.sql
   mysql -u root -p < db/data.sql
   ```

**Backend (Spring Boot):**
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the `.env.example` file to `.env` and adjust the variables with the same information as for Windows:
   ```bash
   cp .env.example .env
   nano .env
   # Add your variables and save (Ctrl+O, Enter, Ctrl+X)
   ```
3. Export the environment variables and start the server with Maven:
   ```bash
   export $(cat .env | grep -v '^#' | xargs)
   mvn spring-boot:run
   ```

**Frontend (React):**
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies and run the frontend:
   ```bash
   npm install
   npm start
   ```

---

## Advanced Security Architecture and Validations

Security is a major component of the application, designed to protect sensitive data and meet industry standards:
- **Stateless Authentication (JWT)**: The application uses JSON Web Tokens (JWT) for optimal security of exchanges between the React frontend and the Spring Boot API.
- **Cryptographic Hashing (BCrypt)**: All passwords are irreversibly hashed using the BCrypt algorithm before being stored in the database.
- **Role-Based Access Control (RBAC)**: API routes and methods are strictly locked down (via `@PreAuthorize`) according to three privilege levels:
  - **Administrator**: Full access to the system and management of user accounts.
  - **Manager**: Access to statistics and the analytical dashboard.
  - **User**: Access to functional tracking (Training programs, Participants, Trainers).
- **Strict Validations (@Valid)**: All data entered by users is systematically validated by the backend (Jakarta Validation) to guarantee the integrity and reliability of information in the database, in accordance with the requirements of the specifications.

---

## Technical Challenges Addressed

1. **Integration of the complete Emailing system**: Developing a robust mechanism to proactively notify actors with professional email templates incorporating embedded images.
2. **Real-Time Analytics**: Replacing the old manual system (Excel) with interactive charts that dynamically read complex relational data from the database.
3. **Security and CORS**: In-depth management of JWT filters to correctly block unauthorized access (401/403) without breaking communication between the React front-end and the Spring Boot API.

---

## Future Prospects

To further improve the application in the future, here are some possible development prospects:
- **Independent Participant Space**: Evolving the platform into a complete training center application by integrating personal, dedicated accounts for participants and trainers.
- **Certificate Generation**: Automatic creation of attendance and completion certificates in PDF format for participants at the end of a training program.
- **Interactive Calendar Integration**: Adding a calendar view (such as FullCalendar) to provide a comprehensive time-based visualization of all scheduled training sessions.
- **HTTPS Security & SSL Certificate**: Setting up an SSL/TLS certificate to enforce HTTPS traffic and guarantee end-to-end encryption of communications in production.
