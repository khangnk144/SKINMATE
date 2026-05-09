# Feature 11: OCR Ingredient Extraction (Product Label Scanning)

> **Status: ✅ Implemented**

## 1. Overview

Users can upload a photo of a product label to automatically extract the INCI ingredient list, instead of manually typing or copy-pasting it. The extracted text is parsed by a rule-based engine to isolate the ingredient list, which is then returned as a comma-separated string ready for analysis.

## 2. Backend Implementation (`/backend`)

**Module:** `src/modules/ocr/` (self-contained feature module)

| File | Responsibility |
|------|----------------|
| `ocrRoutes.ts` | Routes: `POST /api/ocr/ingredients` with multer file upload |
| `ocrController.ts` | Controller: validates file, calls service, returns result |
| `ocrService.ts` | Calls OCR.space API with base64-encoded image |
| `ingredientsExtractor.ts` | Rule-based text parser that extracts ingredient list from OCR output |

**API Endpoint:** `POST /api/ocr/ingredients`
- **Auth:** None required (public endpoint).
- **Input:** `multipart/form-data` with a `file` field (image file).
- **Process:**
  1. Convert uploaded image buffer to base64.
  2. Send to OCR.space API for text recognition.
  3. Pass raw OCR text through `extractIngredients()` parser.
  4. Return the extracted comma-separated ingredient list.
- **Response:** `{ ingredients: "water, glycerin, niacinamide, ..." }`

**Ingredient Extraction Algorithm (`ingredientsExtractor.ts`):**
1. **Find keyword anchor:** Regex match for "ingredients", "thành phần", "composition", or "contains" (case-insensitive).
2. **Extract text after keyword:** Take everything after the matched keyword.
3. **Stop at period:** Truncate at the first `.` character.
4. **Normalize tokens:** Split by comma/semicolon, lowercase, trim whitespace, remove garbage characters.
5. **Deduplicate:** Use a `Set` to remove duplicate entries.
6. **Return:** Single comma-separated string.

## 3. Frontend Implementation (`/frontend`)

**Component:** `src/components/ImageOCRUploader.tsx`

- Rendered on the `/analysis` page alongside the textarea input.
- **Upload flow:** User selects an image → preview displayed → send to OCR API → extracted ingredients populate the textarea.
- Supports common image formats (JPEG, PNG, etc.).

## 4. Dependencies

| Package | Purpose |
|---------|---------|
| `axios` | HTTP client for OCR.space API calls |
| `multer` | File upload middleware (memory storage) |

## 5. External API

- **OCR.space API** — Free tier with rate limits. API key is hardcoded in `ocrService.ts` for the free tier.
