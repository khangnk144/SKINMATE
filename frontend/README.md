# SKINMATE Frontend

This is the frontend web application for SKINMATE, built with [Next.js 16](https://nextjs.org) (App Router), React 19, and TailwindCSS v4.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

> **Note:** The backend server must be running on `http://localhost:5000` for the app to function. See the [main docs](../docs/README.md) for full setup instructions.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TailwindCSS v4
- **Typography:** Playfair Display (headings) + Inter (body) via `next/font/google`
- **Charts:** Recharts 3 (admin reports)
- **Icons:** Lucide React
- **Language:** TypeScript

## Project Structure

```
src/
├── app/            ← Pages (folder name = URL path)
│   ├── layout.tsx      Root layout (fonts, AuthProvider, Navbar, Footer)
│   ├── page.tsx        Home page (/)
│   ├── login/          Login page
│   ├── register/       Register page
│   ├── profile/        User profile & skin type
│   ├── analysis/       INCI analysis + OCR upload + recommendations + report buttons
│   ├── history/        Analysis history
│   ├── community/      Community features
│   │   └── reports/    Browse & vote on ingredient reports
│   └── admin/          Admin panel (ingredients, rules, products, users, reports, community-reports, import-export)
├── components/     ← Reusable UI (Navbar, ProductCard, ProtectedRoute, AdminProtectedRoute, NotificationBell, ImageOCRUploader)
└── context/        ← AuthContext (login state management)
```
