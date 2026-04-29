# SKINMATE - Cosmetic Ingredient Safety Checker

SKINMATE is a luxury web application designed to help users analyze cosmetic ingredients (INCI lists) based on their specific skin type using a rule-based logic.

## 🚀 Quick Start

### 1. Prerequisites
* Node.js (v18+)
* Docker (for MySQL database)
* npm

### 2. Database Setup
1. Open Docker Desktop.
2. Run the database container:
```bash
docker start skinmate-mysql
```
*(If setting up for the first time, check `backend/prisma` for migrations and seeding)*

### 3. Running the App

The project is split into a frontend and a backend. You need to run both simultaneously.

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:5000`

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

## 📚 Documentation

Detailed documentation is located in the `/docs` folder:

* [Context](./CONTEXT.md) - Project overview & goals.
* [Rules](./PROJECT-RULES.md) - Coding standards.
* [Database](./DATABASE.md) - Schema & Data models.
* [Architecture](./ARCHITECTURE.md) - System design.
* [API Spec](./API_SPEC.md) - Backend endpoints.

There is also a comprehensive `STATUS.md` file in the root directory that contains the full project status, file structure, and technical explanations.

## 🛠 Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS v4 (Luxury Design System), TypeScript.
* **Backend:** Node.js, Express.js 4, Prisma 5 ORM, TypeScript.
* **Database:** MySQL 8.0.
* **Testing:** Jest.