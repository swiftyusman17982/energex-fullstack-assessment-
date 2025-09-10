# Energex Full-Stack Assessment

A microservice app with Lumen (PHP) API, Node.js cache service, React frontend, MySQL, and Redis. Ships with Docker for a one-command setup.

## Stack
- Backend API: Lumen (PHP 8.1) + JWT auth
- Cache Service: Node.js + Redis
- Frontend: React (CRA) served by Nginx
- Database: MySQL 8
- Realtime: Socket.IO (WebSocket)

## Quick Start (Docker)
```bash
# From repo root
docker-compose up -d --build
```

Services:
- Frontend: http://localhost:3000
- API (Lumen): http://localhost:8000
- Cache (Node): http://localhost:3001

Health:
- API: http://localhost:8000/health

## Default Users (seeded)
Use any of these to log in (password is "password"):
- admin@energex.com (admin)
- testadmin@energex.com (admin)
- john@example.com, jane@example.com, testuser1@example.com, testuser2@example.com (user)
- demo@gmail.com (user)

## Auth & UX Flow
- Registration shows “Registration successful! Please log in.” and redirects to the login page.
- After login, you are redirected to the posts page.
- Frontend persists `token` and `user` in localStorage and attaches Bearer tokens to API calls.

## Environment/Config
- Frontend calls API at `http://localhost:8000/api` and WS at `http://localhost:3001` (configured in `docker-compose.yml`).
- Lumen reads secrets from `/var/www/.env` (mounted from the repo). Ensure there is ONE `JWT_SECRET` line only.

## API Overview
Base URL: `http://localhost:8000/api`

Auth
- POST `/register` – Register a new user (name, email, password ≥ 6)
- POST `/login` – Login (email, password)
- GET  `/me` – Current user (Bearer token)
- POST `/logout` – Invalidate token
- POST `/refresh` – Refresh token

Posts (Bearer token required)
- GET    `/posts` – List posts (cached via Node/Redis)
- POST   `/posts` – Create post { title, content }
- GET    `/posts/{id}` – Get single post (cached)
- PUT    `/posts/{id}` – Update post (owner or admin)
- DELETE `/posts/{id}` – Delete post (owner or admin)

Cache Service (internal, used by API)
- GET `http://localhost:3001/cache/posts`
- GET `http://localhost:3001/cache/posts/{id}`

## Common Tasks
Rebuild frontend after UI changes:
```bash
docker-compose up -d --build frontend
```
Rebuild API after backend changes:
```bash
docker-compose up -d --build backend-lumen
```
Tail Lumen logs:
```bash
docker exec -it energex-lumen sh -lc 'tail -n 100 /var/www/storage/logs/*.log'
```

## Troubleshooting
- 401 “Token could not be parsed” or login fails:
  1) Ensure ONLY one `JWT_SECRET=` exists in `backend-lumen/.env`.
  2) If missing/invalid, set a strong secret inside the container and clear cache:
     ```bash
     docker exec energex-lumen sh -lc "sed -i '/^JWT_SECRET=/d' /var/www/.env; SECRET=$(head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n'); echo JWT_SECRET=$SECRET >> /var/www/.env; rm -rf /var/www/bootstrap/cache/*"
     docker-compose up -d backend-lumen
     ```
- Frontend changes not visible:
  - Rebuild `frontend` service (see above) and hard refresh (Cmd/Ctrl+Shift+R).
- Posts page crashes on load:
  - Fixed in frontend to handle nested API responses; hard refresh and ensure API is reachable at `http://localhost:8000/api`.

## Project Structure
```
energex-backend-assessment/
├── backend-lumen/          # Lumen API
├── backend-node/           # Node cache service
├── frontend/               # React app (Nginx build output)
├── database/               # SQL init/seed
├── docker/                 # Nginx and related configs
└── docker-compose.yml      # Orchestration
```

## Notes
- CI workflows exist under `.github/workflows/` for Compose checks.
- No GraphQL in this project (REST + WebSocket only).
