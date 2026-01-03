# Mafqood Platform

A full-stack Lost & Found platform — built using **NestJS** (API) + **Vite React TypeScript** (Frontend).  
This repository contains both backend and frontend in one monorepo.

## 🚀 Stack

| Layer       | Tech                                                                 |
|-------------|----------------------------------------------------------------------|
| Backend     | NestJS 11, TypeScript, MongoDB (Mongoose), JWT, Cloudinary, Nodemailer |
| Frontend    | React 18, TypeScript, Vite, shadcn-ui, Tailwind CSS, React Query       |
| DevOps      | Docker (optional), Environment-based configs                          |

## 📂 Structure


---

# Backend (NestJS)

A production-ready NestJS (v11) REST API for the Mafqood platform.

## Features

- Authentication & Authorization (JWT)
- Reports with pagination / search / sort
- Categories, Items, Users
- Cloudinary image upload
- Centralized validation & global exception filters
- MongoDB (Mongoose 8)
- CORS configurable

## Tech Stack

- NestJS 11, TypeScript
- MongoDB + Mongoose
- JWT / Passport
- Multer Memory Storage + Cloudinary
- Nodemailer (email)

### Getting Started

```bash
cd backend
npm ci
npm run start:dev


cd frontend
npm ci
npm run dev


VITE_API_BASE_URL=https://your-domain
VITE_API_VERSION=v1

${VITE_API_BASE_URL}/api/${VITE_API_VERSION}

cd backend
npm run build
node dist/main.js

cd frontend
npm run build
npm run preview


