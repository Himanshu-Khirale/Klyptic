# Klyptic Backend (Express)

## Overview
The backend application for Klyptic handles authentication, JWT, MongoDB CRUD operations, file uploads, and serves as a proxy to the AI work performed by the FastAPI engine. It is crucial that the frontend interacts with this service only, and never directly with FastAPI.

Application backend for Klyptic. Owns authentication, JWT, MongoDB CRUD, file uploads, dashboard APIs, and proxies AI work to the FastAPI engine.

The frontend must call **this** service only — never FastAPI directly.

## Running the Application
To run the application, use the following command:
```bash
npm start
```

## Running Tests
To run the tests, use:
```bash
npm test
```

## Stack
- **Node.js** 20+
- **Express** 5
- **MongoDB** + Mongoose
- **JWT** (`jsonwebtoken` + `bcryptjs`)
- **Zod** validation
- **Multer** for file uploads
- **Helmet**, **CORS**, and rate limiting for security.

- Node.js 20+
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken` + `bcryptjs`)
- Zod validation
- Multer uploads
- Helmet, CORS, rate limiting

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure your environment variables.

```bash
cd Backend
cp .env.example .env
# fill in MONGODB_URI and JWT_SECRET (see credentials list below)
npm install
npm run dev
```

API base: `http://localhost:5000/api`

## Credentials you need to provide

| Variable | Required | What it is |
| --- | --- | --- |
| `MONGODB_URI` | **Yes** | MongoDB Atlas or local connection string |
| `JWT_SECRET` | **Yes** | Long random string (32+ chars) used to sign tokens |
| `CORS_ORIGIN` | Recommended | Frontend URL, e.g. `http://localhost:5173` |
| `PORT` | Optional | Defaults to `5000` |
| `JWT_EXPIRES_IN` | Optional | Defaults to `7d` |
| `AI_ENGINE_URL` | Optional until AI engine exists | Defaults to `http://localhost:8000` |
| `AI_ENGINE_TIMEOUT_MS` | Optional | Defaults to `60000` |
| `UPLOAD_MAX_BYTES` | Optional | Defaults to 25MB |

No OpenAI/Gemini keys belong in Express — those go in the FastAPI `ai-engine` later.

## API map

All JSON responses use:

```json
{ "success": true, "message": "...", "data": {} }
```

Protected routes require: `Authorization: Bearer <token>`

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Liveness + mongo/ai status |
| POST | `/api/auth/signup` | No | `{ name, email, password }` |
| POST | `/api/auth/login` | No | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/auth/logout` | Yes | Client-side token discard |
| GET | `/api/knowledge` | Yes | List (`type`, `topic`, `q`, `sort`, `page`, `limit`) |
| POST | `/api/knowledge` | Yes | Create from text content |
| POST | `/api/knowledge/capture` | Yes | Quick capture (`kind`, `content`, `url`, …) |
| POST | `/api/knowledge/upload` | Yes | Multipart `file` (+ optional `kind`, `title`, `topic`) |
| GET | `/api/knowledge/:id` | Yes | Detail + related items |
| PATCH | `/api/knowledge/:id` | Yes | Update fields |
| DELETE | `/api/knowledge/:id` | Yes | Delete item (+ file) |
| GET | `/api/search?q=` | Yes | Semantic search (AI) with lexical fallback |
| POST | `/api/chat` | Yes | RAG chat (`message`, `history`) |
| GET | `/api/chat/suggestions` | Yes | Suggested questions |
| GET | `/api/dashboard` | Yes | Stats, recent, weekly insights |
| GET | `/api/insights` | Yes | Growth series + narrative cards |
| GET | `/api/topics` | Yes | Topic list with counts |
| GET | `/api/topics/:name` | Yes | Items in a topic |
| PATCH | `/api/users/me` | Yes | Profile |
| PATCH | `/api/users/me/preferences` | Yes | Settings toggles |
| GET | `/api/users/me/export?format=json\|markdown` | Yes | Export library |
| DELETE | `/api/users/me` | Yes | Delete workspace |

## Capture kinds → stored types

| Quick Capture `kind` | Stored `type` |
| --- | --- |
| text / note | note |
| pdf | pdf |
| image | screenshot |
| url / docs | article |
| youtube | video |
| code | code |
| repo | repo |
| chat | chat |

## AI engine contract (FastAPI — later)

Express calls these when available; otherwise it degrades gracefully:

- `POST /api/v1/ingest` — enrich a knowledge item
- `POST /api/v1/search` — semantic search
- `POST /api/v1/chat` — RAG answer
- `POST /api/v1/insights` — optional narrative insights
- `POST /api/v1/knowledge/delete` — vector cleanup
- `POST /api/v1/user/purge` — wipe user vectors
- `GET /health`

Every AI request includes header `X-User-Id` and body `userId`.

## Folder layout

```
Backend/
  app.js
  server.js
  uploads/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    validators/
```

## Scripts

- `npm run dev` — watch mode
- `npm start` — production start
