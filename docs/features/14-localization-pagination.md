# Feature 14: Vietnamese Localization & Client-Side Pagination

> **Status: ✅ Implemented**

## 1. Overview

The entire SKINMATE user interface has been localized to Vietnamese for the target audience (Vietnamese Gen Z and skincare beginners). Additionally, admin management pages use client-side pagination to handle large datasets efficiently.

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

## 3. Client-Side Pagination

### Scope
Applied to three admin management pages:
- `/admin/ingredients`
- `/admin/rules`
- `/admin/products`

### Implementation
- **Page size:** 15 items per page.
- All data is fetched from the API in a single request (no server-side pagination).
- Filtering/searching is applied **before** pagination — the paginated view respects active search queries.
- Pagination controls are rendered below the data table with Previous/Next buttons and page indicators.
- Resets to page 1 when search query changes.

### Why Client-Side?
The dataset sizes (hundreds to low thousands) are manageable in memory. This approach avoids additional API complexity while providing a responsive filtering experience.
