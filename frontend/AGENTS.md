# Frontend Agent Notes

> Last verified against code: June 1, 2026

This project uses Next.js 16.2.4. Before changing frontend code, check the installed Next.js docs in `node_modules/next/dist/docs/` when behavior is version-sensitive.

Use `frontend/src/lib/api.ts` for API URLs. Do not reintroduce hardcoded `http://localhost:5000/api/v1` calls in pages/components.

Keep route guards in place:

- `ProtectedRoute` for authenticated user pages.
- `AdminProtectedRoute` for admin pages.

Run `npm run lint` after frontend code changes.
