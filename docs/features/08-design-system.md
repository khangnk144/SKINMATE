# Feature 08: Luxury UI/UX Design System

> **Status: ✅ Implemented**

## 1. Aesthetic Concept: "Modern Clean Beauty"

**Vibe:** Luxury, feminine, high-end — inspired by Glossier, Sephora, and Korean aesthetic clinics.

## 2. Typography

| Usage | Font | Source |
|-------|------|--------|
| Headings & display text | **Playfair Display** (serif) | Google Fonts |
| Body text & UI labels | **Inter** (sans-serif) | Google Fonts |

Both fonts are loaded via `next/font/google` in `frontend/src/app/layout.tsx`.

## 3. Color Palette

| Role | Color | TailwindCSS Class |
|------|-------|-------------------|
| Primary accent (BAD/rose) | Dusty Rose | `rose-300`, `rose-400`, `rose-500` |
| Secondary accent (GOOD/sage) | Sage Green | `emerald-300`, `emerald-400` |
| Background | Cream white | `white`, `rose-50` |
| Text primary | Slate | `slate-800`, `slate-900` |
| Text secondary | Muted slate | `slate-500`, `slate-600` |
| Neutral (not found) | Soft gray | `gray-400`, `gray-500` |

## 4. Core Visual Patterns

### Glassmorphism Cards
Used on auth forms, analysis cards, and modals:
```html
<div class="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
```

### Gradient Aura Backgrounds
Soft color blobs layered behind page content (home page, analysis page):
```html
<div class="absolute top-0 right-0 w-96 h-96 bg-rose-200/50 rounded-full blur-3xl -z-10"></div>
<div class="absolute bottom-0 left-0 w-96 h-96 bg-pink-100/60 rounded-full blur-3xl -z-10"></div>
```

### Split-Screen Layouts
Login, Register, and Analysis pages use a two-column grid on large screens:
```html
<div class="grid lg:grid-cols-2 min-h-screen">
  <!-- Left: Decorative image column -->
  <!-- Right: Interactive form column -->
</div>
```

## 5. Component Standards

| Element | Style Rule |
|---------|-----------|
| Cards | `rounded-3xl`, large soft shadow, `bg-white/70 backdrop-blur` |
| Buttons (primary) | Rose gradient `from-rose-400 to-pink-500`, `rounded-full`, hover scale |
| Buttons (secondary) | `border border-rose-200`, ghost style |
| Inputs | `rounded-2xl`, `border-rose-100`, focus ring in rose |
| Headings | Playfair Display, `tracking-tight`, large scale |
| Badges (GOOD) | Sage green background, rounded-full |
| Badges (BAD) | Dusty rose background, rounded-full |
| Badges (NEUTRAL) | Soft gray background, rounded-full |

## 6. Animations & Interactions

* **Hover effects:** Scale transform on cards and buttons (`hover:scale-105`, `transition-transform`).
* **Page transitions:** Subtle fade-in on route change.
* **Loading states:** Animated gradient shimmer or spinner in rose tones.
* **Micro-animations:** Icon and badge entrance animations on analysis results.

## 7. Image Handling

* External product images are served via Next.js `<Image>` component.
* Allowed remote domains are configured in `next.config.ts` under `images.remotePatterns`.
* Currently configured: `i.postimg.cc`.
* All images use `object-cover`, `w-full`, `h-full` for consistent layout.

## 8. Anti-Patterns (Never Do)

* ❌ No inline styles — use TailwindCSS classes exclusively.
* ❌ No plain colors (pure red, pure blue) — always use the curated rose/sage palette.
* ❌ No sharp corners — use `rounded-2xl` or `rounded-3xl` on cards/inputs.
* ❌ No default browser fonts — always apply Playfair Display or Inter.