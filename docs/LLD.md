# Low Level Design (LLD)

## Backend Directory Structure
```
backend/
├── src/
│   ├── config/          # Environment variables, DB connection, Logger setup
│   ├── controllers/     # Route handlers mapping requests to services
│   ├── middleware/      # Auth, Error handling, Upload validation
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Database interaction logic
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Reusable helper functions (OCR, TTS)
│   └── server.js        # Express app initialization
```

## Request Lifecycle
1. **Route**: Express router matches the URL and HTTP method.
2. **Middleware**: Validates auth token, sanitizes input (Zod), handles file uploads.
3. **Controller**: Extracts data from `req.body` or `req.params`, calls the appropriate Service.
4. **Service**: Executes business logic. May call Repository for DB ops or external APIs.
5. **Repository**: Interacts with Mongoose models.
6. **Controller**: Sends formatted JSON response or passes error to Error Middleware.

## Services
- `AuthService`: `register(data)`, `login(credentials)`
- `OCRService`: `extractTextFromBuffer(buffer)`
- `TranslationService`: `translateText(text, from, to)`, `generateTTS(text, lang)`
- `UserService`: `getProfile(userId)`, `addHistory(userId, translation)`
