# Roomy

Roomy is a full-stack property rental platform with a React frontend and an Express + MongoDB backend.

## Stack

- Frontend: React 18, React Router, CSS, React Scripts
- Backend: Express, Mongoose, Nodemailer, JWT auth
- Database: MongoDB

## Project Structure

```text
roomy/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── data/
│   └── src/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── postcss.config.cjs
│   └── tailwind.config.js
├── docker/
└── package.json
```

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Create env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. From project root, run:

```bash
npm run dev
```

Frontend runs on http://localhost:3000 and backend runs on http://localhost:5001.

## Root Scripts

- npm run dev: runs frontend + backend together
- npm start: runs frontend
- npm run server: runs backend
- npm run build: builds frontend

## API

- GET /api/health
- GET /api/cms
- POST /api/admin/login
- PUT /api/admin/cms
- POST /api/admin/seed
- GET /api/admin/bookings
- PATCH /api/admin/bookings/:id
- PATCH /api/admin/bookings/:id/status

## Notes

- Twilio integration has been removed.
- No dummy CMS JSON files are auto-created by backend startup.
- If backend/data/cms.json is missing or invalid, seed endpoint returns 404 with cms: null.
- Frontend dummy fallback cards/slides are hidden when CMS data is absent.

## Local Data

- CMS source file (optional for manual seed): backend/data/cms.json
- Booking source file (optional for migration): backend/data/bookings.json

If these files are missing, backend runs normally and uses MongoDB state.
