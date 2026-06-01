# SKINMATE Frontend

> Last verified against code: June 1, 2026

This is the Next.js frontend for SKINMATE.

## Stack

- Next.js 16.2.4 App Router
- React 19.2.4
- TypeScript
- TailwindCSS 4
- Lucide React
- Recharts

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

Development URL:

```text
http://localhost:3000
```

## Backend Dependency

The frontend expects the backend API to be available at:

```text
http://localhost:5000/api/v1
```

Override with:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

OCR calls use the root derived from this URL and then call `/api/ocr/ingredients`.

## Optional Environment

```env
NEXT_PUBLIC_ENABLE_HEALTH_CHECK="true"
```

The home page checks this flag before running the health check behavior.

## Structure

```text
src/
|-- app/
|   |-- layout.tsx
|   |-- page.tsx
|   |-- login/page.tsx
|   |-- register/page.tsx
|   |-- profile/page.tsx
|   |-- analysis/page.tsx
|   |-- history/page.tsx
|   |-- community/reports/page.tsx
|   `-- admin/
|       |-- layout.tsx
|       |-- page.tsx
|       |-- ingredients/page.tsx
|       |-- rules/page.tsx
|       |-- products/page.tsx
|       |-- users/page.tsx
|       |-- reports/page.tsx
|       |-- community-reports/page.tsx
|       `-- import-export/page.tsx
|-- components/
|-- context/
`-- lib/
```

## Important Files

- `src/context/AuthContext.tsx`: auth state, token/user localStorage.
- `src/lib/api.ts`: API base URL, pagination helpers.
- `src/components/Navbar.tsx`: navigation and auth/admin display.
- `src/components/NotificationBell.tsx`: notification dropdown.
- `src/components/ImageOCRUploader.tsx`: upload to OCR endpoint.
- `src/components/ProtectedRoute.tsx`: user route guard.
- `src/components/AdminProtectedRoute.tsx`: admin route guard.
- `next.config.ts`: image remote patterns and `allowedDevOrigins`.
