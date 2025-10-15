# Mafqood API (NestJS)

A production-ready NestJS (v11) REST API for the Mafqood platform. It powers lost-and-found reports with pagination, search, sorting, authentication, image uploads (Cloudinary), email, and robust error handling.

## Features

- Authentication and authorization (JWT)
- Reports module with server-side pagination, search, and sorting
- Categories, Items, Users modules
- Image uploads via Cloudinary (memory storage + provider)
- Centralized validation (class-validator) and transformation (class-transformer)
- Global exception filters and response interceptor
- MongoDB (Mongoose) with providers-based architecture
- CORS enabled and configurable
- Structured, modular NestJS codebase

## Tech Stack

- NestJS 11, TypeScript
- MongoDB + Mongoose 8
- JWT, Passport
- class-validator, class-transformer
- Cloudinary, Multer memory storage
- Nodemailer (email)
- Morgan (logging)

## Prerequisites

- Node.js ≥ 18
- MongoDB instance
- Cloudinary account (for image hosting)
- SMTP creds (optional: for email)

## Getting Started

1. Install dependencies

```bash
npm ci
```

2. Create a `.env` file in `backend/`

```bash
# Server
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/mafqood

# JWT
JWT_SECRET=replace_me
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
```

3. Run the server

```bash
# development
npm run start:dev

# production
npm run build && npm run start:prod
```

The API starts on `http://localhost:${PORT}` with a global prefix `api/v1`.

> Note: In `src/main.ts` CORS is enabled. Adjust `origin` (default was `http://localhost:8080`) to your frontend origin (e.g., `http://localhost:5173`).

## API

### Reports – List with pagination/search/sort

GET `/api/v1/reports`

Query parameters:

- `page` (number, default 1)
- `limit` (number, default 12 or backend default)
- `search` (string, optional) — searches across `title`
- `sortBy` (string, e.g. `createdAt`)
- `sortOrder` (`ASC` | `DESC`, default `DESC`)

Response (shape based on service):

```json
{
  "message": "Get All Reports Successfully",
  "total": 123,
  "page": 1,
  "totalPages": 11,
  "reports": []
}
```

### Auth, Users, Items, Categories

Modules exist for these features. Endpoints typically live under `/api/v1/<module>` and follow NestJS best practices. Check the corresponding `src/<module>` directories.

## Project Structure

```
src/
  app.module.ts
  main.ts
  auth/
  users/
  reports/
  categories/
  items/
  cloudinary/
  common/
    dto/
    filters/
    interceptors/
    utils/
```

### Notable Common Utilities

- `common/dto/query-options.dto.ts` — `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `common/utils/query.util.ts` — `paginateAndFilter()` helper (Mongoose)
- `common/filters/*` — exception filters
- `common/interceptors/response.interceptor.ts` — response envelope/interception

## Scripts

```bash
npm run start         # start
npm run start:dev     # dev with watch
npm run build         # compile to dist
npm run lint          # eslint
npm run test          # unit tests (jest)
npm run test:e2e      # e2e tests
```

## Deployment

- Provide proper `.env` values
- Build: `npm run build`
- Run: `node dist/main.js`
- Ensure CORS `origin` matches your deployed frontend URL

## License

This project uses various OSS dependencies. Your application code is under your repository’s license.
