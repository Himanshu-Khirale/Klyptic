# Klyptic — Architecture Diagram

> Version: 1.0 | July 2026

---

## 1. System Overview

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          KLYPTIC — SYSTEM ARCHITECTURE                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌──────────────────────────────────┐                                       ║
║   │        BROWSER / CLIENT          │                                       ║
║   │    React 19 + TanStack Router    │  http://localhost:8081                ║
║   │    Vite · Tailwind CSS           │                                       ║
║   └──────────────┬───────────────────┘                                       ║
║                  │  REST JSON                                                ║
║                  │  Authorization: Bearer <JWT>                              ║
║                  ▼                                                           ║
║   ┌──────────────────────────────────┐                                       ║
║   │      EXPRESS BACKEND             │  http://localhost:5000                ║
║   │  Node.js 20 + Express 5          │                                       ║
║   │  ─────────────────────           │                                       ║
║   │  Auth / JWT / bcrypt             │                                       ║
║   │  CRUD / Validation (Zod)         │                                       ║
║   │  File Uploads (Multer)           │◄────────────► MongoDB                 ║
║   │  Rate Limiting / Helmet          │              (Port 27017)             ║
║   │  CORS Whitelist                  │                                       ║
║   └──────────────┬───────────────────┘                                       ║
║                  │  Internal HTTP                                            ║
║                  │  X-User-Id: <userId>                                     ║
║                  ▼                                                           ║
║   ┌──────────────────────────────────┐                                       ║
║   │      FASTAPI AI ENGINE           │  http://localhost:8000                ║
║   │  Python 3.11 + FastAPI           │                                       ║
║   │  ─────────────────────           │                                       ║
║   │  LangChain LCEL Chains           │                                       ║
║   │  HuggingFace Embeddings          │◄────────────► ChromaDB               ║
║   │  (all-MiniLM-L6-v2, CPU)         │              (.chroma/ local)        ║
║   │  Gemini 1.5 Flash (LLM)          │◄────────────► Google Gemini API      ║
║   │  RAG Retrieval Pipeline          │                                       ║
║   │  Dashboard Intelligence          │                                       ║
║   └──────────────────────────────────┘                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Frontend Architecture

```
Frontend/src/
│
├── routes/                          FILE-BASED ROUTING (TanStack Router)
│   ├── __root.tsx                   Root layout (global providers, head tags)
│   ├── index.tsx                    Landing / Marketing page (public)
│   ├── login.tsx                    Login form
│   ├── signup.tsx                   Registration form
│   └── _workspace.tsx               Protected layout (sidebar + topbar)
│       ├── _workspace.dashboard.tsx  Stats + AI insight cards
│       ├── _workspace.inbox.tsx      Chronological knowledge feed
│       ├── _workspace.search.tsx     Semantic + keyword search
│       ├── _workspace.chat.tsx       Ask Klyptic (RAG chat)
│       ├── _workspace.insights.tsx   AI insight cards full view
│       ├── _workspace.topics.tsx     Topic-grouped knowledge view
│       ├── _workspace.knowledge.$id  Single capture detail
│       └── _workspace.settings.tsx   User profile & preferences
│
├── components/
│   ├── quick-capture-modal.tsx      Global save modal (text / URL / file)
│   └── ui/                          Shared design system components
│
├── hooks/                           Custom React hooks (API calls, auth state)
├── lib/                             API client, utilities
├── styles.css                       Global CSS + Tailwind base
├── router.tsx                       TanStack Router configuration
└── server.ts / start.ts             SSR server entry (if applicable)

   USER JOURNEY
   ─────────────
   Landing Page
       │ Sign Up / Login
       ▼
   Dashboard  ←──────────────────────────────────┐
       │                                          │
       ├── Quick Capture Modal ──► Inbox          │
       │         (text/URL/PDF)                   │
       ├── Search ──► Results list                │
       ├── Ask Klyptic ──► RAG answer + citations │
       ├── Insights ──► AI learning cards         │
       └── Topics ──► Grouped knowledge ──────────┘
```

---

## 3. Backend (Express) Architecture

```
Backend/
│
├── server.js             Entry point: connects DB, starts HTTP server
├── app.js                Express factory: middleware stack, routes
│
└── src/
    │
    ├── config/
    │   └── env.js        Zod-validated env schema (fails fast on missing vars)
    │
    ├── middleware/
    │   ├── auth.js       requireAuth — verifies JWT, injects req.user
    │   ├── validate.js   Zod body validation middleware
    │   └── errorHandler  Global 404 + error handler
    │
    ├── models/
    │   ├── User.js        { _id, email, passwordHash, displayName, avatarUrl }
    │   └── KnowledgeItem  { _id, userId, title, summary, topic, takeaways,
    │                         captureKind, content, sourceUrl, aiEnriched, ... }
    │
    ├── routes/            Thin router definitions (just map URL → controller)
    │   ├── auth.routes.js
    │   ├── knowledge.routes.js
    │   ├── chat.routes.js
    │   ├── search.routes.js
    │   ├── dashboard.routes.js
    │   ├── insights.routes.js
    │   └── topics.routes.js
    │
    ├── controllers/       Request/response handlers (no business logic)
    │
    └── services/          ALL business logic lives here
        │
        ├── ai.service.js
        │    AiEngineClient
        │    ├── request()      ← strict, throws on failure
        │    ├── tryRequest()   ← best-effort, returns null on failure
        │    ├── ingest()       → POST /api/v1/ingest
        │    ├── search()       → POST /api/v1/search
        │    ├── chat()         → POST /api/v1/chat
        │    ├── tryChat()      → POST /api/v1/chat (safe)
        │    ├── insights()     → POST /api/v1/insights
        │    └── health()       → GET  /health
        │
        ├── auth.service.js       Signup, login, JWT sign/verify
        ├── knowledge.service.js  Save to MongoDB → async ingest → AI enrich
        ├── chat.service.js       tryChat → if answer → resolve refs → return
        │                         else → library preview fallback
        ├── search.service.js     MongoDB text search + AI vector search merge
        ├── dashboard.service.js  MongoDB aggregations for stats
        ├── insights.service.js   Pass stats to AI engine → return cards
        └── topics.service.js     Group knowledge items by AI-assigned topic

   REQUEST MIDDLEWARE STACK
   ─────────────────────────
   Request
     │
     ▼
   Helmet (security headers)
     │
     ▼
   CORS (origin whitelist)
     │
     ▼
   express.json() (body parsing)
     │
     ▼
   morgan (dev request logging)
     │
     ▼
   Rate Limit (500 req/15min on /api)
     │
     ▼
   Route Handler
     │
     ▼ (protected routes only)
   requireAuth (JWT verification)
     │
     ▼
   validate() (Zod schema check)
     │
     ▼
   Controller → Service → Response
```

---

## 4. AI Engine (FastAPI) Architecture

```
ai-engine/
│
├── .env                         GEMINI_API_KEY, CHROMA_PERSIST_DIRECTORY, HF_TOKEN
├── requirements.txt             fastapi, uvicorn, langchain*, chromadb,
│                                sentence-transformers, pypdf, langchain-google-genai
└── app/
    │
    ├── main.py                  FastAPI app factory
    │                            load_dotenv() → FastAPI() → CORS → router
    │
    ├── api/
    │   └── routes.py            Endpoint definitions
    │       ├── GET  /health
    │       ├── POST /api/v1/ingest
    │       ├── POST /api/v1/search
    │       ├── POST /api/v1/chat
    │       ├── POST /api/v1/insights
    │       └── POST /api/v1/knowledge/delete
    │
    ├── chains/                  LangChain LCEL Chains (LLM logic)
    │   ├── enrichment_chain.py  Pydantic structured output
    │   │   Input:  { text }
    │   │   Output: EnrichmentOutput { title, summary, topic, takeaways[] }
    │   │   Model:  gemini-1.5-flash
    │   │
    │   ├── chat_chain.py        RAG answer chain
    │   │   Input:  { context, question }
    │   │   Output: str (plain text answer)
    │   │   Prompt: CONTEXT-ONLY strict system prompt
    │   │   Model:  gemini-1.5-flash
    │   │
    │   └── insights_chain.py   Dashboard intelligence chain
    │       Input:  { stats_text }
    │       Output: InsightsOutput { cards[], weeklySummary }
    │       Model:  gemini-1.5-flash
    │
    ├── embeddings/
    │   └── huggingface.py      Singleton EmbeddingsManager
    │                           Model: all-MiniLM-L6-v2 (CPU, local, free)
    │                           Dims:  384
    │
    ├── loaders/
    │   └── document_loader.py  load_document(payload)
    │       ├── captureKind=text  → raw string → Document
    │       ├── captureKind=file  → PyPDFLoader (PDF)
    │       └── captureKind=url   → WebBaseLoader + BeautifulSoup
    │
    ├── retrieval/
    │   └── retriever.py        retrieve_knowledge_chunks(query, user_id, top_k=5)
    │                           1. Embed query via HuggingFaceEmbeddings
    │                           2. chroma.similarity_search_with_score()
    │                              WHERE metadata.user_id = user_id
    │                           3. Return [{ content, metadata, distance }]
    │
    ├── services/               Orchestration layer
    │   ├── ingestion_service.py
    │   │   1. Load document
    │   │   2. Split into chunks (size=1000, overlap=200)
    │   │   3. Add to ChromaDB with metadata
    │   │   4. Call enrichment_chain → EnrichmentOutput
    │   │   5. Return enriched metadata
    │   │
    │   ├── search_service.py
    │   │   1. Embed query
    │   │   2. ChromaDB similarity search (userId filter)
    │   │   3. Return results with relevance scores
    │   │
    │   ├── chat_service.py
    │   │   1. Embed question
    │   │   2. ChromaDB top-5 chunks (userId filter)
    │   │   3. Build context string
    │   │   4. Call chat_chain.ainvoke({ context, question })
    │   │   5. Return { answer, sources }
    │   │
    │   └── insights_service.py
    │       1. Format stats (weekCount, prevWeekCount, topics)
    │       2. Call insights_chain
    │       3. Return { cards, weeklySummary }
    │       4. Graceful fallback if LLM unavailable
    │
    └── vectorstore/
        └── client.py           Thread-safe ChromaDB singleton
                                PersistentClient(path=CHROMA_PERSIST_DIRECTORY)
                                Collection: "klyptic_knowledge"
```

---

## 5. Data Store Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     MONGODB                              │
│              (Application Source of Truth)               │
│                                                          │
│  Collection: users                                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ _id | email | passwordHash | displayName | avatarUrl│  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Collection: knowledgeitems                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ _id       | ObjectId (primary key)                  │  │
│  │ userId    | ObjectId → users._id                    │  │
│  │ title     | AI-generated or user-provided           │  │
│  │ summary   | AI-generated 2-3 sentence summary       │  │
│  │ topic     | AI-assigned broad category              │  │
│  │ takeaways | AI-extracted key points [ ]             │  │
│  │ captureKind | 'text' | 'url' | 'file'              │  │
│  │ content   | Original text content                   │  │
│  │ sourceUrl | Original URL (if applicable)            │  │
│  │ aiEnriched| Boolean — was AI enrichment applied?    │  │
│  │ capturedAt| Timestamp                               │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    CHROMADB                              │
│               (Vector Similarity Index)                  │
│                                                          │
│  Collection: klyptic_knowledge                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ id          | UUID (chunk-level)                    │  │
│  │ embedding   | float[384] (all-MiniLM-L6-v2)        │  │
│  │ document    | Chunk text (1000 chars)               │  │
│  │ metadata    | {                                     │  │
│  │             |   user_id: String,  ← ISOLATION KEY  │  │
│  │             |   knowledge_id: String → MongoDB _id  │  │
│  │             |   source: String (url/filename/text)  │  │
│  │             |   chunk_index: int                    │  │
│  │             | }                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Persisted at: ai-engine/.chroma/                        │
└─────────────────────────────────────────────────────────┘

   RELATIONSHIP BETWEEN THE TWO STORES
   ─────────────────────────────────────
   MongoDB KnowledgeItem._id
         │
         └──► ChromaDB chunk.metadata.knowledge_id
              (many chunks can reference one MongoDB doc)

   When a user clicks a chat citation,
   Express fetches the MongoDB doc by knowledge_id
   from the ChromaDB result metadata.
```

---

## 6. Multi-Tenant Security Model

```
   USER A                           USER B
     │                                │
     │ JWT: userId=AAA                │ JWT: userId=BBB
     ▼                                ▼
   Express                          Express
     │                                │
     │ X-User-Id: AAA                 │ X-User-Id: BBB
     ▼                                ▼
   FastAPI /api/v1/chat            FastAPI /api/v1/chat
     │                                │
     │ ChromaDB query:                │ ChromaDB query:
     │ WHERE user_id = "AAA"          │ WHERE user_id = "BBB"
     ▼                                ▼
   Only USER A's vectors          Only USER B's vectors
   are returned                   are returned

   ✅ No cross-user data leakage possible at the vector level
   ✅ MongoDB queries always include { userId } in filter
   ✅ JWT is verified on every Express request before
      the userId is forwarded to FastAPI
```

---

## 7. Key Data Flows (Sequence)

### A. Knowledge Capture Flow

```
Browser ──POST /api/knowledge/capture──► Express
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                              MongoDB.save()    aiEngine.ingest()
                              (immediate)       (async, non-blocking)
                                    │                 │
                              201 Created         FastAPI:
                              → Frontend          1. Load & chunk
                                                  2. Embed → ChromaDB
                                                  3. Gemini enrichment
                                                  4. Return metadata
                                                         │
                                              Express updates MongoDB
                                              (title, summary, topic, etc.)
```

### B. Ask Klyptic (RAG Chat) Flow

```
Browser ──POST /api/chat { message }──► Express
                                             │
                                    aiEngine.tryChat()
                                             │
                                        FastAPI:
                                    1. Embed message
                                    2. ChromaDB top-5 chunks
                                       (WHERE user_id = userId)
                                    3. Build context
                                    4. Gemini 1.5 Flash:
                                       "Answer ONLY from context"
                                    5. Return { answer, sources }
                                             │
                                 if answer exists:
                                   Express fetches MongoDB docs
                                   by knowledgeId from sources
                                   → return { answer, referencedItems }
                                 else:
                                   return "library preview" fallback
                                             │
                                        Browser renders
                                        answer + citations
```

### C. Ingestion Chain Detail

```
payload { captureKind, content, knowledgeId }
         │
         ▼
document_loader.load_document()
  ├── 'text' → Document(page_content=content)
  ├── 'url'  → WebBaseLoader → strip HTML → Document
  └── 'file' → PyPDFLoader  → extract pages → [Document]
         │
         ▼
RecursiveCharacterTextSplitter
  chunk_size=1000, chunk_overlap=200
         │
         ▼
chromadb.add_documents(chunks, embeddings=HuggingFaceEmbeddings)
  metadata per chunk:
  { user_id, knowledge_id, source, chunk_index }
         │
         ▼
enrichment_chain.ainvoke({ text: full_text })
  → gemini-1.5-flash with_structured_output(EnrichmentOutput)
  → { title, summary, topic, takeaways }
         │
         ▼
Return enriched metadata to Express → MongoDB update
```

---

## 8. Technology Decision Matrix

| Decision | Option Chosen | Why |
|----------|--------------|-----|
| Frontend framework | React 19 | Already built; modern concurrent rendering |
| Routing | TanStack Router | Type-safe, file-based, SSR-capable |
| Backend runtime | Node.js + Express | Mature, widely adopted, fast enough |
| AI backend | FastAPI | Python AI/ML ecosystem, async, fast |
| Vector store | ChromaDB (local) | Zero cost, no external service needed |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` | Free, CPU, 384-dim, great quality for personal KB |
| LLM provider | Google Gemini 1.5 Flash | Free tier, 1M context window, fast |
| Primary DB | MongoDB | Flexible schema for evolving knowledge item structure |
| Auth | JWT (stateless) | No session store needed, scales horizontally |
| Validation | Zod (TS/JS) + Pydantic (Python) | Type-safe validation with clear error messages |
| LLM framework | LangChain (LCEL) | Modular chain composition, structured output support |

---

## 9. Deployment Architecture (Future / Production)

```
┌─────────────────────────────────────────────┐
│                  CDN / Vercel                 │
│  React Static Build (dist/)                  │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────┐
│            Load Balancer (nginx)             │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐     ┌──────────────────┐
│ Express API  │     │  FastAPI AI Eng. │
│ (Docker)     │     │  (Docker)        │
│ Port 5000    │     │  Port 8000       │
└──────┬───────┘     └────────┬─────────┘
       │                      │
  MongoDB Atlas          ChromaDB (EFS)
  (Managed Cloud)        or Weaviate Cloud
```
