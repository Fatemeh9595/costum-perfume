# Custom Perfume Full-Stack Setup

This project has two separate apps:

- `frontend`: React + TypeScript (Vite)
- `backend`: Node.js + Express + TypeScript

## Run both apps together

From the project root:

```bash
npm run dev
```

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:5000`

The frontend calls the backend using `/api/*` and Vite proxies those requests to port `5000`.

## Run separately

Frontend only:

```bash
npm run dev:frontend
```

Backend only:

```bash
npm run dev:backend
```

## Seed shop perfumes into MongoDB

1. Create `backend/.env` from `backend/.env.example` and set `MONGODB_URI` if needed.
2. Run:

```bash
cd backend
npm run seed:shop-perfumes
```

This seeds `scentcraft.shop-perfumes` (or the DB/collection configured in env).

## Build

```bash
npm run build
```
