# Feature 11 - OCR Scanning

> Last verified against code: June 1, 2026

## Backend Files

- `backend/src/modules/ocr/ocrRoutes.ts`
- `backend/src/modules/ocr/ocrController.ts`
- `backend/src/modules/ocr/ocrService.ts`
- `backend/src/modules/ocr/ingredientsExtractor.ts`

## Frontend File

- `frontend/src/components/ImageOCRUploader.tsx`

## Endpoint

```http
POST /api/ocr/ingredients
```

This endpoint is not under `/api/v1`.

Upload:

- `multipart/form-data`
- field name: `file`
- max size: 5 MB
- no auth middleware in current code

## Environment

```env
OCR_API_KEY="replace_me"
```

## Flow

1. `multer` stores uploaded image in memory.
2. Controller validates `req.file`.
3. Service converts buffer to base64 data URL.
4. Service posts to OCR.space with `language=eng` and 15 second timeout.
5. Parser searches for ingredient anchors such as `ingredients`, `composition`, and `contains`.
6. Parser cuts at the first period, splits by comma or semicolon, lowercases, trims, deduplicates, and returns a comma-separated string.

## Error Behavior

- Missing file returns 400.
- Oversized upload returns 413 with `{ error, ingredients: "" }`.
- OCR failure returns 500 with `{ error: "Failed to process image", ingredients: "" }`.
