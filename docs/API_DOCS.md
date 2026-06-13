# API Documentation

## Authentication
### `POST /api/auth/register`
- **Body**: `{ "email": "user@example.com", "password": "password123", "name": "John" }`
- **Response**: `{ "token": "jwt...", "user": { ... } }`

### `POST /api/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "token": "jwt...", "user": { ... } }`

## User
### `GET /api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile data.

### `GET /api/user/history`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of translation history objects.

## Translation
### `POST /api/translate`
- **Body**: `{ "text": "Hello", "fromLang": "en", "toLang": "es" }`
- **Response**: `{ "translatedText": "Hola", "detectedSourceLanguage": "en" }`

### `POST /api/translate/speak`
- **Body**: `{ "text": "Hola", "lang": "es" }`
- **Response**: `{ "audio": "base64..." }`

## OCR
### `POST /api/ocr/upload`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: `file` (Image buffer)
- **Response**: `{ "text": "Extracted text..." }`

## Phrases
### `GET /api/phrases`
- **Response**: Complete phrasebook JSON.
### `GET /api/phrases/:category`
- **Response**: Phrases for a specific category.
