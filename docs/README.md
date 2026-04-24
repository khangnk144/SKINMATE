# SKINMATE - Cosmetic Ingredient Safety Checker

SKINMATE is a web application designed to help users analyze cosmetic ingredients (INCI lists) based on their specific skin type using a rule-based logic.

## 🚀 Quick Start

### 1. Prerequisites
* Node.js (v18+)
* npm / pnpm / yarn
* PostgreSQL or MySQL database

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Initialize Prisma
npx prisma init
````

### 3\. Database Setup

1.  Configure your `DATABASE_URL` in the `.env` file.
2.  Apply migrations:

<!-- end list -->

```bash
npx prisma migrate dev --name init_db
```

3.  (Optional) Seed the database with sample ingredients:

<!-- end list -->

```bash
npx prisma db seed
```

### 4\. Running the App

```bash
# Development mode
npm run dev
```

## 📚 Documentation

Detailed documentation is located in the `/docs` folder:

  * [Context](https://www.google.com/search?q=./docs/CONTEXT.md) - Project overview & goals.
  * [Rules](https://www.google.com/search?q=./docs/PROJECT-RULES.md) - Coding standards.
  * [Database](https://www.google.com/search?q=./docs/DATABASE.md) - Schema & Data models.
  * [Architecture](https://www.google.com/search?q=./docs/ARCHITECTURE.md) - System design.
  * [API Spec](https://www.google.com/search?q=./docs/API_SPEC.md) - Backend endpoints.

## 🛠 Tech Stack

  * **Frontend:** Next.js (React), TailwindCSS v4 (Luxury Design System), TypeScript.
  * **Backend:** Node.js, Express.js, Prisma ORM.
  * **Testing:** Jest.