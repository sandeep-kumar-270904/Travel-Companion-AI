# Database Schema

## `users` Collection
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique)
- `passwordHash`: String (required)
- `preferences`: Object
  - `defaultFromLang`: String
  - `defaultToLang`: String
- `createdAt`: Date
- `updatedAt`: Date

## `translation_history` Collection
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `originalText`: String (required)
- `translatedText`: String (required)
- `fromLang`: String
- `toLang`: String
- `isFavorite`: Boolean (default: false)
- `createdAt`: Date

## `phrases` Collection
- `_id`: ObjectId
- `category`: String (required)
- `items`: Array of Objects
  - `english`: String
  - `translation`: String (in various languages)
  - `audioPath`: String
