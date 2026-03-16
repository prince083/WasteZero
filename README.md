# WasteZero ♻️
**Smart Waste Management & Recycling Ecosystem**

WasteZero is a community-driven platform designed to bridge the gap between households, NGOs, and volunteers. By digitizing pickup requests and streamlining recycling efforts, we aim to make high-impact waste management accessible to everyone.

[![Node.js](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)](https://tailwindcss.com/)

---

## 📑 Table of Contents
- [Prerequisites](#-prerequisites)
- [Project Setup](#-project-setup)
  - [1. Clone Repository](#1-clone-the-repository)
  - [2. Backend Configuration](#2-backend-setup-server)
  - [3. Frontend Configuration](#3-frontend-setup-client)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Troubleshooting](#-troubleshooting)
- [Contribution Guide](#-contribution-guide)

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your local machine:
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher) or **yarn**
* **MongoDB Community Server** (Local) or **MongoDB Atlas** (Cloud)

---

## 🚀 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/priyaw5/wastezero_project.git
cd wastezero_project
```

### 2. Backend Setup (Server)
The backend manages authentication, automated OTPs, and the core recycling logic.

1.  **Navigate to backend**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**: Create a `.env` file in the `backend/` directory:
    ```env
    PORT=3000
    NODE_ENV=development
    DATABASE_URL=mongodb://127.0.0.1:27017/watezero
    JWT_SECRET=your_jwt_secret_key
    
    # Email Configuration (Nodemailer)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_specific_password

    # Admin Registration Security
    ADMIN_SECURITY_CODE=your_secret_admin_code
    ```
    > **⚠️ Security Tip**: Never commit your `.env` file. It contains sensitive credentials.

4.  **Run Server**:
    ```bash
    npm run dev
    ```
    *The API will be available at `http://localhost:3000`*

---

### 3. Frontend Setup (Client)
The frontend is a modern, responsive Single Page Application (SPA).

1.  **Navigate to frontend**:
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Launch Dashboard**:
    ```bash
    npm run dev
    ```
    *The application will open at `http://localhost:5173`*

---

## ✨ Features
*   **Role-Based Access Control**: Separate interfaces for Users, NGOs, and Admins.
*   **Waste Pickups**: Schedule and track waste collections in real-time.
*   **NGO Opportunities**: Browse and participate in recycling/waste management initiatives.
*   **Interactive Maps**: Pinpoint pickup locations accurately using OpenStreetMap.
*   **Admin Dashboard**: Real-time waste analytics and trend visualization using Recharts.
*   **OTP Authentication**: Secure login and registration via email verification.
*   **Smart Matching**: Connects users to nearby NGO opportunities based on location.

---

## 🛠 Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Real-time** | Socket.io |
| **Testing** | Joi (Validation), Postman |

---

## 🏗 Project Architecture

### Backend Structures
*   `controllers/`: Request handling logic.
*   `models/`: Mongoose schemas (User, WasteStats, Pickup, etc.).
*   `routes/`: API endpoint definitions.
*   `middlewares/`: `auth.js` (JWT), `role.js` (RBAC), `errorHandler.js`.
*   `socket/`: Real-time notification logic.

### Frontend Structures
*   `src/pages/`: Role-specific dashboards and main views.
*   `src/components/`: Modular UI elements (Navbar, Sidebar, MapPicker).
*   `src/context/`: `AuthContext` (User State), `ThemeContext` (Dark Mode).
*   `src/services/`: Centralized Axios API handlers.

---

## 🔍 Troubleshooting

**1. MongoDB Connection Refused**
*   Ensure your MongoDB service is running (`services.msc` on Windows).
*   Verify the `DATABASE_URL` in `.env`.

**2. OTP Not Sending**
*   If using Gmail, ensure you have generated an **App Password**. Regular passwords will not work.
*   Check if `EMAIL_USER` is correct.

**3. Port 3000 Already in Use**
*   On Windows: `netstat -ano | findstr :3000` -> `taskkill /F /PID <pid>`.
*   Or change the `PORT` in `.env`.

**4. Map Not Appearing**
*   The Map requires a parent container with a defined height. If you are creating new pages, ensure the Leaflet container has style prop `height`.

---

## 🤝 Contribution Guide
We use a structured branching strategy to keep the codebase clean.

1.  **Pull latest changes**: `git pull origin pawnesh-dev`
2.  **Stay Decoupled**: Work on your respective branch. If you need a backend endpoint that doesn't exist yet, use mock data until the backend is merged.
3.  **Clean Code**: Maintain the established architectural patterns (Controllers/Services).
4.  **Audit**: Run the app locally and check the console for errors before pushing.

---
*Developed for Milestone 4 - Reporting & Administration*
