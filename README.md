# Captain Culinary Kids

A culinary-education web app for young chefs aged 7–19, with age-tiered
lesson paths, badges, family challenges, global-food missions, and
food-truck / restaurant concept builders. The frontend is local-first and
fully usable without the backend; the backend acts as an optional cloud
sync layer.

## Project layout

```
backend/        FastAPI + Motor (MongoDB) API
frontend/       Create React App + craco (React 19, Tailwind, Radix UI)
scripts/        One-off Python tooling (illustration generation, etc.)
tests/          Placeholder for cross-cutting tests
backend/tests/  pytest suite for the API
test_result.md  Agent-coordination log (do not edit headers)
```

## Prerequisites

| Tool   | Version              |
|--------|----------------------|
| Node   | 18.x – 22.x          |
| Yarn   | 1.22 classic         |
| Python | 3.11+                |
| Mongo  | 6.x (local or Atlas) |

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in MONGO_URL, DB_NAME, CORS_ORIGINS
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

API will be available at `http://localhost:8000/api/`. The health check
is `GET /api/`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # set REACT_APP_BACKEND_URL=http://localhost:8000
yarn install --ignore-optional   # see "Visual-edits dev plugin" below
yarn start
```

The app runs at `http://localhost:3000`. The frontend stores progress in
`localStorage`, so it works without the backend. When
`REACT_APP_BACKEND_URL` is reachable it syncs progress and persists
builder concepts to Mongo.

### 3. Backend tests

```bash
cd backend
REACT_APP_BACKEND_URL=http://localhost:8000 pytest tests
```

## Environment variables

| Variable                | Where    | Purpose                                  |
|-------------------------|----------|------------------------------------------|
| `MONGO_URL`             | backend  | MongoDB connection string                |
| `DB_NAME`               | backend  | Logical database name                    |
| `CORS_ORIGINS`          | backend  | Comma-separated allowed origins (or `*`) |
| `REACT_APP_BACKEND_URL` | frontend | Base URL of the FastAPI backend          |
| `ENABLE_HEALTH_CHECK`   | frontend | `true` enables dev-server `/health/*`    |

See `backend/.env.example` and `frontend/.env.example` for templates.

## Visual-edits dev plugin

`@emergentbase/visual-edits` is hosted at `https://assets.emergent.sh` and
the tarball is gated. It is declared under `optionalDependencies` so a
build host that cannot reach the asset will not fail. The craco config
already tolerates a missing module and logs a single warning. In
environments where you do not have access (CI, Vercel, Render, sandboxed
containers), pass `--ignore-optional` to yarn.

## Deployment notes

- **Frontend** is a CRA build (`yarn build` → `build/` directory). Any
  static host (Vercel static, Netlify, S3+CloudFront, Render static
  site) will serve it; ensure `REACT_APP_BACKEND_URL` is set at build
  time on the host.
- **Backend** is an ASGI app (`server:app`). Run with `uvicorn` on
  Render, Fly, Railway, or as a container. A persistent MongoDB
  instance is required for the progress-sync and builder endpoints;
  without it the app still functions in local-only mode.

## License

Proprietary — Blue Collar Apps. All rights reserved.
