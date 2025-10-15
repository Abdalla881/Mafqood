# Mafqood Frontend (Vite + React + TypeScript)

A modern frontend for the Mafqood platform. Implements listing, searching, sorting, pagination of reports, user authentication/profile management, image uploads, and polished UI with shadcn-ui and Tailwind CSS.

## Features

- React 18, TypeScript, Vite
- shadcn-ui components, Tailwind CSS
- React Router v6
- React Query for data fetching
- Axios API client with auth token
- Env-driven API base URL and version
- Server-side pagination/search/sort for reports
- Profile editing with avatar upload
- Polished UX (animations, responsive)

## Prerequisites

- Node.js ≥ 18
- Running backend API (NestJS) with CORS allowing this origin

## Environment Variables

Create `frontend/.env` (Vite requires VITE\_ prefix):

```ini
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
VITE_API_TIMEOUT=10000
```

## Getting Started

```bash
npm ci
npm run dev
```

App runs on `http://localhost:5173` by default.

## Build & Preview

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  main.tsx
  App.tsx
  components/
    Layout.tsx
    Header.tsx
    Footer.tsx
    ItemCard.tsx
    ...
  contexts/
    AuthContext.tsx
  hooks/
    useReports.ts
    useCategories.ts
  pages/
    Home.tsx
    LostItems.tsx
    ItemDetail.tsx
    AddReport.tsx
    Profile.tsx
  types/
  utils/
  config.ts
```

## API Integration

- Base URL: `${VITE_API_BASE_URL}/api/${VITE_API_VERSION}`
- `useReports` supports: `page`, `limit`, `search`, `sortBy=createdAt`, `sortOrder=ASC|DESC`
- 404 on list returns empty UI (not an error)

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # serve built app
npm run lint      # eslint
```

## Favicon

Configured at `public/favicon.svg` and linked in `index.html`.

## Deployment

- Set env vars in your host
- Build with `npm run build`
- Serve `dist/` using any static host
- Ensure backend CORS allows your deployed origin

## License

Your application code is under your repository’s license.
