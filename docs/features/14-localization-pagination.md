# Feature 14 - Localization And Pagination

> Last verified against code: June 1, 2026

## Localization

The app is intended for Vietnamese users. The frontend root layout sets:

```tsx
<html lang="vi">
```

Current implementation uses inline text in TSX files rather than an i18n library.

Important caveat: several Vietnamese strings and comments appear as mojibake in the repository. This documentation records code behavior and does not change source strings.

## API URL Localization/Environment

Frontend API base URL is centralized in `frontend/src/lib/api.ts`:

```ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const API_ROOT_URL = API_URL.replace(/\/api\/v1\/?$/, '');
```

OCR uses `API_ROOT_URL` because OCR routes are mounted at `/api/ocr`, not `/api/v1`.

## Admin Pagination

Backend support is in:

- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

Frontend helpers are in:

- `frontend/src/lib/api.ts`

Paginated admin list endpoints:

- `GET /api/v1/admin/ingredients`
- `GET /api/v1/admin/rules`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/users`

Query params:

- `page`
- `limit`
- `search`

If any of these params are present, response shape is:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

If none are present, the backend keeps legacy array responses.

The service caps `limit` at 100. The frontend admin pages commonly request 15 items per page.
