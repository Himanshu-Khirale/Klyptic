# Klyptic — Complete Project Documentation

> **Tagline:** An Intelligent Clipboard for Everything You Learn  
> **Version:** 1.0 | **Last Updated:** July 2026  
> **Stack:** React · Express.js · FastAPI · MongoDB · ChromaDB · LangChain · Gemini

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Frontend](#4-frontend)
5. [Backend (Express)](#5-backend-express)
6. [AI Engine (FastAPI)](#6-ai-engine-fastapi)
7. [Data Stores](#7-data-stores)
8. [API Reference](#8-api-reference)
9. [Data Flows](#9-data-flows)
10. [Security Model](#10-security-model)
11. [Environment Setup & Running Locally](#11-environment-setup--running-locally)
12. [Key Design Decisions](#12-key-design-decisions)
13. [Known Issues & Limitations](#13-known-issues--limitations)

---

## 1. Project Overview

Klyptic is an **AI-powered Personal Knowledge Workspace**. It lets users save anything — text snippets, URLs, PDFs, articles, code — and then **automatically organise, enrich, and retrieve** that information using AI.

### Core Value Proposition

| Problem | Klyptic's Solution |
|---------|-------------------|
| Too much to read, nowhere to store it | One-click capture from any source |
| Notes become disorganised over time | AI auto-generates titles, summaries, topics, and takeaways |
| Can't find something you saved months ago | Semantic vector search across all your captures |
| Passive reading with no retention | RAG chat answers questions using only your saved knowledge |
| No insight into your learning patterns | AI-generated dashboard cards: trends, gaps, revision suggestions |

### What Klyptic is NOT

- It is **not a chatbot** — the chat only answers from your personal knowledge base.
- It is **not a general search engine** — results are scoped strictly to your captures.
- It is **not a note-taking app** — the AI does the organisation for you.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TanStack Router + Vite + Tailwind CSS | UI, routing, auth screens |
| **Application Backend** | Node.js 20 + Express 5 | Auth, CRUD, business logic, file uploads |
| **AI Engine** | Python 3.11 + FastAPI | LangChain, embeddings, vector search, RAG, LLM calls |
| **Primary Database** | MongoDB (via Mongoose) | Users, knowledge items, metadata |
| **Vector Store** | ChromaDB (local, persisted) | Embeddings + chunk metadata |
| **Embeddings Model** | HuggingFace `all-MiniLM-L6-v2` (local CPU) | Free, no API cost, 384-dim vectors |
| **LLM** | Google Gemini 1.5 Flash (via API) | Enrichment, RAG chat, insights |
| **Auth** | JWT (HS256) | Stateless authentication |
| **HTTP Client** | Node.js native `fetch` | Express → FastAPI communication |

---

## 3. System Architecture

### High-Level Separation of Concerns

```
┌─────────────────────────────────────────────┐
│           REACT FRONTEND (Port 8081)         │
│  - UI / Pages / Navigation                   │
│  - Calls ONLY the Express backend            │
└──────────────────┬──────────────────────────┘
                   │ REST JSON (JWT in header)
                   ▼
┌─────────────────────────────────────────────┐
│       EXPRESS BACKEND (Port 5000)            │
│  - Auth & JWT verification                   │
│  - CRUD operations → MongoDB                 │
│  - File upload handling (Multer)             │
│  - Delegates AI work to FastAPI              │
└──────────────────┬──────────────────────────┘
                   │ Internal HTTP (X-User-Id header)
                   ▼
┌─────────────────────────────────────────────┐
│       FASTAPI AI ENGINE (Port 8000)          │
│  - Document ingestion & chunking             │
│  - Local HuggingFace embeddings              │
│  - ChromaDB vector store                     │
│  - Semantic search (similarity)              │
│  - RAG chat via Gemini 1.5 Flash             │
│  - Dashboard insights generation             │
└─────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
   ChromaDB                 Gemini API
  (local .chroma)          (Google Free Tier)
```

### Communication Rules

- The **Frontend never talks to the AI engine directly** — all requests go through Express.
- Express passes the authenticated `userId` to FastAPI via the `X-User-Id` HTTP header.
- FastAPI uses `userId` to **strictly isolate** each user's vector embeddings in ChromaDB.
- MongoDB is the **single source of truth** for application data.
- ChromaDB is a **supplementary index** — it only stores vectors and references back to MongoDB IDs.

---

## 4. Frontend

### Framework & Tooling

- **React 19** with functional components and hooks
- **TanStack Router** (file-based routing, type-safe)
- **Vite** as the build tool (port 8081)
- **Tailwind CSS** for styling

### Pages / Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.tsx` | Landing page / marketing |
| `/login` | `login.tsx` | JWT login form |
| `/signup` | `signup.tsx` | Registration form |
| `/_workspace` | `_workspace.tsx` | Protected layout shell (sidebar, nav) |
| `/_workspace/dashboard` | `_workspace.dashboard.tsx` | Stats overview, AI insight cards, weekly summary |
| `/_workspace/inbox` | `_workspace.inbox.tsx` | Chronological capture inbox |
| `/_workspace/search` | `_workspace.search.tsx` | Semantic search across knowledge base |
| `/_workspace/chat` | `_workspace.chat.tsx` | Ask Klyptic — RAG chat interface |
| `/_workspace/insights` | `_workspace.insights.tsx` | AI-generated insight cards |
| `/_workspace/topics` | `_workspace.topics.tsx` | Auto-grouped topics view |
| `/_workspace/knowledge/:id` | `_workspace.knowledge.$id.tsx` | Single knowledge item detail |
| `/_workspace/settings` | `_workspace.settings.tsx` | User preferences |

### Key Component

- **`quick-capture-modal.tsx`** — The global "Save" modal that accepts text, URL, or file input and sends it to Express for ingestion.

### Authentication Flow

1. User logs in → Express returns a JWT token.
2. Token is stored in `localStorage` (or a cookie).
3. Every API request includes `Authorization: Bearer <token>` in the header.
4. TanStack Router guards the `/_workspace` layout — unauthenticated users are redirected to `/login`.

---

## 5. Backend (Express)

### Folder Structure

```
Backend/
├── app.js              # Express app factory (CORS, middleware, routes)
├── server.js           # Entry point (connects DB, starts server)
└── src/
    ├── config/
    │   └── env.js          # Zod-validated environment config
    ├── controllers/        # Thin request/response handlers
    │   ├── auth.controller.js
    │   ├── chat.controller.js
    │   ├── knowledge.controller.js
    │   ├── search.controller.js
    │   ├── dashboard.controller.js
    │   ├── insights.controller.js
    │   └── topics.controller.js
    ├── middleware/
    │   ├── auth.js         # JWT verification (requireAuth)
    │   ├── validate.js     # Zod schema validation
    │   └── errorHandler.js # Global error + 404 handler
    ├── models/
    │   ├── User.js         # Mongoose User schema
    │   └── KnowledgeItem.js # Mongoose Knowledge schema
    ├── routes/             # Express router definitions
    ├── services/           # All business logic lives here
    │   ├── ai.service.js       # HTTP client for FastAPI
    │   ├── auth.service.js     # Signup / login / JWT
    │   ├── chat.service.js     # RAG chat orchestration
    │   ├── knowledge.service.js # Capture CRUD + AI enrichment
    │   ├── search.service.js   # Hybrid search (text + vector)
    │   ├── dashboard.service.js # Stats aggregation
    │   ├── insights.service.js  # AI insight card orchestration
    │   └── topics.service.js   # Topic grouping
    ├── utils/
    │   ├── ApiError.js     # Standardised error class
    │   └── serializers.js  # DTO mapping for API responses
    └── validators/         # Zod schemas for request bodies
```

### MongoDB Models

#### User

```
{
  _id, email, passwordHash,
  displayName, avatarUrl,
  createdAt, updatedAt
}
```

#### KnowledgeItem

```
{
  _id, userId,
  title, summary, topic,
  takeaways: [String],
  captureKind: 'text' | 'url' | 'file',
  content, sourceUrl, fileRef,
  aiEnriched: Boolean,
  capturedAt, updatedAt
}
```

### Key Express Services

**`ai.service.js`** — Wraps all FastAPI calls with:
- `request()` — strict call (throws on failure)
- `tryRequest()` — best-effort call (returns `null` on failure, never crashes Express)
- Methods: `ingest()`, `search()`, `chat()`, `tryChat()`, `insights()`, `health()`
- All calls include `X-User-Id` header for multi-tenant isolation.

**`knowledge.service.js`** — Saves captures to MongoDB and calls `aiEngine.ingest()` asynchronously (non-blocking). If the AI engine is down, the capture still saves; AI enrichment is applied later.

**`chat.service.js`** — Calls `aiEngine.tryChat()`. If the engine returns `{ answer: "..." }` it surfaces the RAG answer. Otherwise, it returns a "library preview" fallback showing recent captures.

### Security

- **Helmet.js** — HTTP security headers
- **express-rate-limit** — 500 requests per 15 minutes per IP
- **CORS** — Whitelist of allowed origins (configured in `.env`)
- **Zod** — Input validation on every POST body
- **bcrypt** — Password hashing

---

## 6. AI Engine (FastAPI)

### Folder Structure

```
ai-engine/
├── .env                    # GEMINI_API_KEY, CHROMA_PERSIST_DIRECTORY, HF_TOKEN
├── requirements.txt        # Python dependencies
├── venv/                   # Local virtual environment
└── app/
    ├── main.py             # FastAPI app, CORS, router registration
    ├── api/
    │   └── routes.py       # All FastAPI endpoint definitions
    ├── chains/
    │   ├── enrichment_chain.py  # LLM enrichment (title/summary/topics/takeaways)
    │   ├── chat_chain.py        # RAG chat LCEL chain
    │   └── insights_chain.py   # Dashboard insights LCEL chain
    ├── embeddings/
    │   └── huggingface.py      # Singleton HuggingFaceEmbeddings (all-MiniLM-L6-v2)
    ├── loaders/
    │   └── document_loader.py  # PDF, URL, and plain text loaders
    ├── retrieval/
    │   └── retriever.py        # ChromaDB similarity search with userId filter
    ├── services/
    │   ├── ingestion_service.py # Orchestrates load → chunk → embed → enrich
    │   ├── search_service.py    # Orchestrates embedding → search → return
    │   ├── chat_service.py      # Orchestrates retrieve → LLM → return answer
    │   └── insights_service.py  # Orchestrates stats → LLM → return cards
    └── vectorstore/
        └── client.py           # Thread-safe ChromaDB singleton client
```

### Embedding Layer

- **Model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions:** 384
- **Provider:** HuggingFace (local, CPU, no API cost)
- **Singleton pattern:** Loaded once at startup, reused across all requests.

### LLM Layer

- **Provider:** Google Gemini via `langchain-google-genai`
- **Model:** `gemini-1.5-flash` (free tier)
- **Uses:** Enrichment (structured output via Pydantic), RAG chat (string output), insights (structured output)
- **Graceful degradation:** If `GEMINI_API_KEY` is missing or the model call fails, all chains return `None` and the service falls back to a sensible placeholder response.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/api/v1/ingest` | Ingest a document into ChromaDB |
| `POST` | `/api/v1/search` | Semantic similarity search |
| `POST` | `/api/v1/chat` | RAG chat — returns `{ answer, sources }` |
| `POST` | `/api/v1/insights` | Generate dashboard insight cards |
| `POST` | `/api/v1/knowledge/delete` | Delete chunks from ChromaDB |

### Ingestion Pipeline (Phase 5)

```
Payload (text / PDF / URL)
         │
         ▼
  DocumentLoader
  (PyPDFLoader / WebBaseLoader / TextLoader)
         │
         ▼
  RecursiveCharacterTextSplitter
  (chunk_size=1000, chunk_overlap=200)
         │
         ▼
  HuggingFaceEmbeddings (local)
         │
         ▼
  ChromaDB.add_documents()
  (metadata: { user_id, knowledge_id, source })
         │
         ▼
  Gemini 1.5 Flash (enrichment chain)
  → EnrichmentOutput { title, summary, topic, takeaways }
         │
         ▼
  Return enriched metadata → Express → MongoDB update
```

### RAG Chat Pipeline (Phase 7)

```
User question
     │
     ▼
Embed question (all-MiniLM-L6-v2)
     │
     ▼
ChromaDB similarity search
  WHERE metadata.user_id = current_user
  TOP_K = 5
     │
     ▼
Build context string from retrieved chunks
     │
     ▼
Gemini 1.5 Flash (chat chain)
  System: "Answer ONLY from the provided context. If not found, say so."
     │
     ▼
Return { answer, sources: [{ knowledgeId, relevanceScore }] }
```

### Multi-Tenant Isolation

Every ChromaDB document is stored with a `user_id` metadata field. Every retrieval query is filtered with:

```python
where={"user_id": user_id}
```

This ensures that User A's knowledge is **never returned** in User B's search or chat results.

---

## 7. Data Stores

### MongoDB (Application Data)

- Local: `mongodb://127.0.0.1:27017/klyptic`
- Collections: `users`, `knowledgeitems`
- Source of truth for all structured data.
- Does **not** store raw vectors or chunk text.

### ChromaDB (Vector Index)

- Persisted locally at `ai-engine/.chroma/`
- Stores: vector embeddings + chunk text + metadata (user_id, knowledge_id, source)
- Collection name: `klyptic_knowledge`
- Used for: semantic similarity search and RAG context retrieval

---

## 8. API Reference

### Auth Endpoints (Express)

| Method | Route | Auth | Body | Response |
|--------|-------|------|------|----------|
| `POST` | `/api/auth/signup` | No | `{ email, password, displayName }` | `{ user, token }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | `{ user, token }` |
| `GET` | `/api/auth/me` | JWT | — | `{ user }` |

### Knowledge Endpoints (Express)

| Method | Route | Body | Response |
|--------|-------|------|----------|
| `POST` | `/api/knowledge/capture` | `{ captureKind, content, title?, sourceUrl? }` | `{ knowledgeItem }` |
| `GET` | `/api/knowledge` | — | Array of knowledge items |
| `GET` | `/api/knowledge/:id` | — | Single knowledge item |
| `DELETE` | `/api/knowledge/:id` | — | `{ success }` |

### Chat Endpoints (Express)

| Method | Route | Body | Response |
|--------|-------|------|----------|
| `POST` | `/api/chat` | `{ message, history? }` | `{ answer, referencedItems, mode }` |
| `GET` | `/api/chat/suggestions` | — | Array of suggested questions |

### Search Endpoints (Express)

| Method | Route | Query | Response |
|--------|-------|-------|----------|
| `GET` | `/api/search` | `?q=<query>&limit=20` | `{ results }` |

### Dashboard & Insights (Express)

| Method | Route | Response |
|--------|-------|----------|
| `GET` | `/api/dashboard` | Stats: capture count, topics, streaks, etc. |
| `GET` | `/api/insights` | `{ cards: [...], weeklySummary }` |
| `GET` | `/api/topics` | List of auto-grouped topics |

---

## 9. Data Flows

### Capture Flow

```
User fills Quick Capture Modal
        │
        ▼
POST /api/knowledge/capture  (Express — JWT required)
        │
        ├─► Save raw item to MongoDB (immediate, status=pending)
        │
        └─► POST /api/v1/ingest (FastAPI — async, non-blocking)
                │
                ├─► Load + chunk document
                ├─► Embed chunks → ChromaDB
                └─► Gemini enrichment → title, summary, topic, takeaways
                        │
                        ▼
                Express updates MongoDB document with AI metadata
```

### Search Flow

```
User types in Search bar
        │
        ▼
GET /api/search?q=<term>  (Express)
        │
        ├─► MongoDB text search (keyword match)
        │
        └─► POST /api/v1/search (FastAPI)
                │
                ├─► Embed query
                ├─► ChromaDB similarity search (filtered by userId)
                └─► Return top-K chunk references
                        │
                        ▼
        Express merges and deduplicates results → Frontend
```

### Chat Flow

```
User types a question in Ask Klyptic
        │
        ▼
POST /api/chat  (Express)
        │
        └─► POST /api/v1/chat (FastAPI)
                │
                ├─► Embed question
                ├─► ChromaDB search (userId filter, top-5 chunks)
                ├─► Build context from chunks
                └─► Gemini: "Answer ONLY from context"
                        │
                        ▼
                Return { answer, sources }
                        │
                        ▼
        Express looks up source KnowledgeItems in MongoDB
        → Frontend renders answer with citations
```

### Insights Flow

```
GET /api/insights  (Express, scheduled or on-demand)
        │
        ├─► Dashboard aggregation: capture counts, topics
        │
        └─► POST /api/v1/insights (FastAPI)
                │
                └─► Gemini: generate 3 insight cards + weekly summary
                        │
                        ▼
                Return { cards, weeklySummary } → Frontend dashboard
```

---

## 10. Security Model

| Concern | Implementation |
|---------|---------------|
| **Authentication** | JWT (HS256), 7-day expiry, stored client-side |
| **Authorisation** | `requireAuth` middleware on all protected routes |
| **Multi-tenant isolation** | `userId` in every MongoDB doc + ChromaDB metadata filter |
| **Input validation** | Zod schemas on every POST body (Express) |
| **HTTP hardening** | Helmet.js (CSP, HSTS, X-Frame, etc.) |
| **Rate limiting** | 500 req / 15 min per IP on `/api/*` |
| **CORS** | Explicit whitelist in `CORS_ORIGIN` env var |
| **Secrets** | All secrets in `.env` files, never committed |
| **Password storage** | bcrypt with salt rounds ≥ 12 |
| **AI engine access** | FastAPI is internal-only; no direct client access |

---

## 11. Environment Setup & Running Locally

### Prerequisites

- Node.js ≥ 20
- Python 3.11
- MongoDB running locally (`mongod`)
- Google AI Studio API Key (free at aistudio.google.com)
- HuggingFace account token (optional, suppresses warnings)

### 1. Clone & Install Dependencies

```bash
# Frontend
cd Frontend && npm install

# Backend
cd Backend && npm install

# AI Engine
cd ai-engine
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**`Backend/.env`**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/klyptic
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8081,http://localhost:3000
AI_ENGINE_URL=http://localhost:8000
AI_ENGINE_TIMEOUT_MS=60000
UPLOAD_MAX_BYTES=26214400
```

**`ai-engine/.env`**
```env
PORT=8000
HOST=0.0.0.0
CHROMA_PERSIST_DIRECTORY=./.chroma
GEMINI_API_KEY=your-gemini-api-key-here
HF_TOKEN=your-huggingface-token-here
```

### 3. Start All Services

Open 3 separate terminals:

```bash
# Terminal 1 — AI Engine (must start first)
cd ai-engine
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Express Backend
cd Backend
npm start

# Terminal 3 — React Frontend
cd Frontend
npm run dev
```

### 4. Access the App

Open **http://localhost:8081** in your browser.

---

## 12. Key Design Decisions

### Why FastAPI instead of keeping AI in Express?

Separation of concerns. Python has the richest ecosystem for AI/ML (LangChain, sentence-transformers, PyPDF). Keeping AI in a separate service also means it can be scaled or replaced independently.

### Why local HuggingFace embeddings instead of OpenAI?

Zero cost. `all-MiniLM-L6-v2` runs entirely on CPU, has no rate limits, and produces 384-dimensional embeddings that are excellent for semantic search at the scale of a personal knowledge base.

### Why ChromaDB instead of Pinecone/Weaviate?

For a local, file-persisted, zero-cost vector store that requires no external account or network, ChromaDB is the optimal choice. When scaling to production, it can be swapped for a hosted solution with minimal code changes.

### Why Gemini 1.5 Flash?

It is the only Gemini model on the free tier that supports `generateContent`. It has a generous 1M token context window, is fast, and costs nothing for development.

### Why is the chat strictly context-only?

To prevent hallucinations. The system prompt instructs the LLM to only answer from the retrieved context chunks. If the answer isn't there, the model politely says so. This aligns with Klyptic's core promise: "your knowledge base, not a chatbot."

### Why is AI enrichment non-blocking in Express?

Resilience. If the AI engine is down or slow, users can still capture knowledge — the item is saved to MongoDB immediately. Enrichment (titles, summaries, etc.) is applied asynchronously using `tryRequest()` which returns `null` on failure instead of throwing.

---

## 13. Known Issues & Limitations

| Issue | Status | Notes |
|-------|--------|-------|
| `gemini-1.5-flash` model name must not be changed | ⚠️ Active | Google's free-tier model names change. Always verify at aistudio.google.com before updating. |
| HF Hub unauthenticated warning | Minor | Set `HF_TOKEN` in `ai-engine/.env` to suppress. Does not affect functionality. |
| ChromaDB is local only | Limitation | `.chroma/` folder must exist on the same machine as the AI engine. No cloud sync. |
| File upload AI processing | Partial | PDFs are processed via `PyPDFLoader`. Image OCR and YouTube transcript extraction are planned but not implemented. |
| No background job queue | Limitation | AI enrichment is called synchronously within the request cycle. For large files, this can cause slow `POST /api/knowledge/capture` responses. |
| Single-collection ChromaDB | Note | All users' vectors are in one ChromaDB collection, isolated by `userId` metadata filter. For very large scale, per-user collections would be more efficient. |
