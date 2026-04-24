# SKINMATE - API Specification (v1)

## 1. General Info
* **Base URL:** `/api/v1`
* **Content-Type:** `application/json`
* **Authentication:** Bearer Token (JWT) in the `Authorization` header.

## 2. Standard Response Format
### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "..." }
}
````

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

## 3\. Core Endpoints

### Auth

  * `POST /auth/register`: Register new user (Username, Password, SkinType).
  * `POST /auth/login`: Returns JWT.

### Analysis (The Core Feature)

  * **POST /analysis/check**
      * **Body:** `{ "inciString": "Water, Glycerin, ..." }`
      * **Logic:** Requires Auth. Matches ingredients against User's skin type.
      * **Response:** List of ingredients with safety effects (GOOD/BAD/NEUTRAL).

### Products

  * `GET /products/recommendations`: Returns top safe products based on user's skin type.

### History

  * `GET /history`: Returns the authenticated user's analysis history, ordered by most recent.

### User Profile

  * `GET /users/profile`: Get authenticated user's profile.
  * `PUT /users/profile`: Update authenticated user's skin type.

### Admin CRUD (Protected - ADMIN role only)

  * **Ingredients:**
    * `GET /admin/ingredients`: List all ingredients.
    * `POST /admin/ingredients`: Create a new ingredient.
    * `PUT /admin/ingredients/:id`: Update an ingredient.
    * `DELETE /admin/ingredients/:id`: Delete an ingredient.
  * **Rules:**
    * `GET /admin/rules`: List all safety rules.
    * `POST /admin/rules`: Create/Update a safety rule.
    * `DELETE /admin/rules/:id`: Delete a safety rule.
  * **Products:**
    * `GET /admin/products`: List all products.
    * `POST /admin/products`: Create a new product.
    * `PUT /admin/products/:id`: Update a product.
    * `DELETE /admin/products/:id`: Delete a product.

## 4\. Error Codes

  * `AUTH_FAILED`: Invalid credentials.
  * `UNAUTHORIZED`: Missing or invalid token.
  * `VALIDATION_ERROR`: Input format is incorrect (e.g., empty INCI string).
  * `DB_ERROR`: Database connection or query issue.