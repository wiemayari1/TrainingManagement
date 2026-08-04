# Training Management System

## Overview

Training Management System is a modern web application designed to digitalize and simplify the management of professional training within **Excellent Training - Green Building**.

The platform replaces manual processes (Excel files, paper documents, and manual tracking) with an automated solution for:

* Training session management
* Participant and trainer management
* Organization and employer management
* Dashboard analytics and statistics
* User authentication and authorization
* Email notifications

The application provides a secure role-based access system for administrators, managers, and users.

---

# Features

## Dashboard & Analytics

* Dynamic statistics visualization
* Training activity monitoring
* Budget and training indicators
* Data analysis through interactive charts

## Training Management

* Create and manage training sessions
* Track training lifecycle
* Manage domains and structures
* Assign trainers and participants

## User Management

* User authentication
* Role-based access control (RBAC)
* User management by administrators
* Secure password handling

## Email Notification System

The application provides automated email notifications:

* Account creation notifications
* Password reset emails
* Training assignment notifications
* Training start reminders

## Security

* JWT-based authentication
* BCrypt password hashing
* Role-Based Access Control (RBAC)
* API endpoint protection
* Input validation using Jakarta Validation
* Secure communication between services

---

# Architecture

The application is deployed using Docker containers:

```
                    User
                     |
                     |
              Frontend (React)
              Nginx Container
              Port: 3000
                     |
                     |
              Backend API
          Spring Boot Container
              Port: 8081
                     |
                     |
              MySQL Database
              MySQL Container
              Port: 3306
```

## Docker Services

| Service  | Technology    | Description                  |
| -------- | ------------- | ---------------------------- |
| frontend | React + Nginx | User interface and API proxy |
| backend  | Spring Boot 3 | REST API and business logic  |
| mysql    | MySQL 8.4     | Relational database          |

---

# Technologies

## Backend

* Java 17
* Spring Boot 3
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate ORM
* MySQL
* Spring Mail

## Frontend

* React.js
* Material UI
* Framer Motion
* Recharts
* Nginx

## DevOps

* Docker
* Docker Compose
* Multi-stage Docker builds
* Containerized deployment

---

# Prerequisites

Before running the project, install:

* Docker Engine
* Docker Compose plugin

Verify installation:

```bash
docker --version
docker compose version
```

---

# Installation with Docker

## 1. Clone the repository

```bash
git clone https://github.com/wiemayari1/TrainingManagement.git

cd TrainingManagement
```

---

## 2. Configure environment variables

Create your local environment file:

```bash
cp env.example .env
```

Edit the `.env` file:

```bash
nano .env
```

Configure:

```env
JWT_SECRET=your_secure_secret

MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=trainingmanagement
MYSQL_USER=training_user
MYSQL_PASSWORD=your_database_password

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_application_password
```

⚠️ The `.env` file contains sensitive information and must never be committed to GitHub.

---

## 3. Build and start containers

Run:

```bash
docker compose up --build
```

Docker will:

1. Build the backend image
2. Build the frontend image
3. Create the MySQL database
4. Execute database initialization scripts
5. Start all application services

---

# Application Access

After successful startup:

## Frontend

```
http://localhost:3000
```

## Backend API

```
http://localhost:8081/api
```

## Database

```
Host: localhost
Port: 3306
Database: trainingmanagement
```

---

# Default Accounts

The file:

```
db/data.sql
```

creates demonstration accounts.

| Role          | Username    | Password    |
| ------------- | ----------- | ----------- |
| Administrator | admin       | password123 |
| Responsable   | responsable | password123 |
| User          | user        | password123 |

---

# Useful Docker Commands

## Check running containers

```bash
docker compose ps
```

## View logs

All services:

```bash
docker compose logs -f
```

Backend only:

```bash
docker compose logs -f backend
```

Database only:

```bash
docker compose logs -f mysql
```

## Stop the application

```bash
docker compose down
```

## Stop and remove database volume

⚠️ This deletes database data:

```bash
docker compose down -v
```

## Rebuild after changes

```bash
docker compose up --build
```

---

# Database Initialization

The database is automatically initialized using:

```
db/schema.sql
db/data.sql
```

The scripts are mounted into the MySQL container:

```
/docker-entrypoint-initdb.d/
```

The first startup creates:

* Tables
* Relationships
* Default roles
* Demo users
* Sample data

---

# Security Implementation

## Authentication

The application uses JWT authentication:

```
User Login
     |
     |
Spring Security
     |
     |
JWT Token
     |
     |
Protected API
```

## Authorization

Three roles are implemented:

### ADMIN

* Full system access
* User management
* Administrative operations

### RESPONSABLE

* Dashboard access
* Training monitoring
* Management operations

### USER

* Access to functional features

---

# Project Structure

```
TrainingManagement/

├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/

├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/

├── db/
│   ├── schema.sql
│   └── data.sql

├── docker-compose.yml
├── env.example
├── README.md
└── LICENSE
```

---

# Technical Challenges

## Secure Authentication

Implementation of JWT authentication with Spring Security and BCrypt password encryption.

## Docker Deployment

Containerization of frontend, backend, and database services with Docker Compose.

## Database Management

Automatic database initialization and relational data management using MySQL.

## API Security

Protection of REST endpoints using authentication filters and role permissions.

---

# Future Improvements

Possible future enhancements:

* HTTPS deployment with SSL certificates
* Cloud deployment
* Automated CI/CD pipeline
* Backup and disaster recovery strategy
* Participant personal workspace
* Automatic certificate generation
