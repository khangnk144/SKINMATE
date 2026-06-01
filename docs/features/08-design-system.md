# Feature 08 - Design System

> Last verified against code: June 1, 2026

## Frontend Stack

- Next.js 16 App Router.
- React 19.
- TailwindCSS 4 through `@tailwindcss/postcss`.
- Fonts from `next/font/google`: Playfair Display and Inter.
- Icons from `lucide-react`.
- Charts from `recharts`.

## Global Files

- `frontend/src/app/layout.tsx`
- `frontend/src/app/globals.css`
- `frontend/next.config.ts`

## Visual Pattern In Code

The UI uses:

- Soft rose and slate color accents.
- Serif headings with Playfair Display.
- Inter for body text.
- White/rose panels, rounded shapes, subtle borders and shadows.
- Responsive layouts with Tailwind utility classes.
- `next/image` for image-heavy pages/components where used.

## Routing And Layout

`app/layout.tsx` wraps the whole app with:

- HTML `lang="vi"`.
- Font variables.
- `AuthProvider`.
- Sticky header with `Navbar`.
- Footer.

`app/admin/layout.tsx` wraps admin pages.

## Current Caveat

Some source comments and UI strings appear as mojibake text in the repository. This docs update records structure and behavior but does not modify code strings.
