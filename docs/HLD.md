# High Level Design (HLD)

## Overview
The Travel Companion AI is a modern web application consisting of a React/Vite frontend and a Node/Express backend. It provides text translation, voice-to-voice translation, OCR image translation, phrasebooks, and AI travel assistant features.

## Architecture
- **Client Tier**: React SPA (Single Page Application) built with Vite and Tailwind CSS.
- **API Tier**: Node.js and Express.js REST API providing business logic, authentication, and integration with third-party translation/OCR services.
- **Data Tier**: MongoDB Atlas for persistent storage of user profiles, settings, translation history, and phrases.

## Core Components
- **Auth Service**: Handles user registration, login, and JWT token management.
- **Translation Service**: Integrates with Google Translate API (`google-translate-api-x`) and Tesseract for OCR.
- **User Service**: Manages user profiles, preferences, and translation history.
- **Phrasebook Service**: Manages predefined phrases and categories.

## Security
- JWT for Authentication.
- Helmet for HTTP security headers.
- Express Rate Limit to prevent brute-force and DoS attacks.
- Input validation via Zod.
- Secure file uploads with MIME type validation.
