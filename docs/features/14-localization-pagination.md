# Feature 14: Vietnamese Localization & Admin Pagination

> **Status: ✅ Implemented**

## 1. Overview

The entire SKINMATE user interface has been localized to Vietnamese for the target audience (Vietnamese Gen Z and skincare beginners). Additionally, admin management pages use server-backed search and pagination to handle large datasets efficiently.

## 2. Vietnamese Localization

### Scope
All user-facing text in the application has been translated to professional, natural-sounding Vietnamese:

- **Navigation labels:** Trang chủ, Phân tích, Lịch sử, Hồ sơ, Quản trị, etc.
- **Admin panel:** Table headers, form labels, placeholders, confirmation messages, sidebar navigation.
- **Analysis page:** Ingredient labels display Vietnamese translations while underlying data remains in English (as stored in the database).
- **Notifications:** Report resolution messages are in Vietnamese.
- **Rate limiting:** Error messages returned to users are in Vietnamese.
- **Form validation:** Error and success messages throughout the app are in Vietnamese.

### Implementation
- No external i18n library is used — translations are hardcoded inline in the component files.
- A mapping function in the analysis page translates common ingredient-related terms for display.
- Database values (ingredient names, effects) remain in **English** for consistency and API compatibility.

## 3. Admin Pagination

### Scope
Applied to three admin management pages:
- `/admin/ingredients`
- `/admin/rules`
- `/admin/products`

### Implementation
- **Page size:** 15 items per page.
- The frontend sends `page`, `limit`, and `search` to the admin list endpoints.
- The backend returns `{ items, total, page, limit }` when any of those query params are present.
- For backward compatibility, admin list endpoints still return the legacy array response when no pagination/search query params are sent.
- Filtering/searching is applied on the server before pagination, so the paginated view respects active search queries without downloading the full dataset.
- Pagination controls are rendered below the data table with Previous/Next buttons and page indicators.
- Resets to page 1 when search query changes.

### Why Server-Backed?
The admin pages can grow with the database without forcing the browser to render or filter every record at once. This keeps the existing UI behavior while reducing network payload and client-side work.
