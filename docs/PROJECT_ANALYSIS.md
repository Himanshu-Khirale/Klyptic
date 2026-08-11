# Klyptic - Project Analysis & Current State

## 1. Project Overview

**Klyptic** is an AI-powered Personal Knowledge Workspace designed as an "Intelligent Clipboard for Everything You Learn." It allows users to capture various forms of information (text, PDFs, images, URLs, code snippets, etc.) without worrying about manual organization. The AI works in the background to automatically organize, enrich, and retrieve this information. 

The primary goal is to build a modern productivity application with a scalable, production-oriented, modular architecture demonstrating advanced AI engineering concepts (RAG, Embeddings, LLMs).

## 2. Architecture & Tech Stack

The architecture strictly follows the **Separation of Concerns** principle.

### High-Level Architecture
1. **Frontend (UI Layer)**: Built with React, Tailwind CSS, Vite, TanStack Router, and Radix UI.
2. **Backend (Application Layer)**: Node.js + Express + MongoDB. Handles application logic, auth, CRUD, file uploads, and acts as the bridge between the Frontend and the AI Engine.
3. **AI Engine (Intelligence Layer)**: FastAPI + LangChain + ChromaDB. Handles all AI-related tasks such as text extraction, chunking, embeddings, semantic search, and interactions with LLMs (e.g., Gemini, OpenAI).

### Communication Flow
`Frontend` ↔ `Express` ↔ `FastAPI`
*(The frontend NEVER communicates directly with the FastAPI engine).*

---

## 3. Work Completed Till Now

Based on a detailed analysis of the codebase, here is the current progress mapping to the defined development phases:

### ✅ Frontend (Completed)
- The entire frontend user interface is fully built.
- It includes complex components using Radix UI, TanStack Router for routing, React Hook Form for state/validation, and Recharts for dashboard analytics.

### ✅ Backend Application Layer - Express (Completed)
- **Phase 1: Express Setup** - The Express app is fully configured with robust middleware (CORS, Helmet for security, Morgan for logging, Express-Rate-Limit).
- **Phase 2: Authentication** - Implemented JWT-based authentication. The `User` model, Auth controllers, and protected routes are set up.
- **Phase 3: Knowledge CRUD & Uploads** - Fully implemented. 
  - The `KnowledgeItem` MongoDB model is defined.
  - Controllers and Services (`knowledge.service.js`) exist to handle capturing, creating, updating, uploading (via Multer), and deleting knowledge items.
  - Additional domains like Chat, Search, Insights, Dashboard, and Topics are fully scaffolded with their respective routes, controllers, and services.
- **AI Service Integration** - `ai.service.js` is fully implemented as an HTTP client that communicates with the FastAPI engine. It uses resilient "best-effort" patterns (`tryRequest`) so that if the AI engine is unreachable, knowledge items are still successfully saved to MongoDB in a "pending/ready" state without breaking the application.

### ❌ AI Engine Layer - FastAPI (Pending)
- **Phase 4 to Phase 8 (Not Yet Implemented)** - There is currently no `ai-engine` folder in the project root. 
- The Python FastAPI backend, LangChain pipelines, ChromaDB vector store, OCR, embeddings, semantic search, and RAG chat functionalities are yet to be built.

---

## 4. Actual Working & Workflows

### 4.1 Knowledge Upload / Capture Workflow
1. **User Action**: The user captures a link, text, or uploads a file (PDF/Image) via the React Frontend.
2. **Express Processing**: The request goes to the Express backend.
   - If it's a file, it is saved locally to the `uploads/` directory.
   - Initial metadata (title, preview, estimated read time) is derived.
   - A document is created in MongoDB with a status of `pending`.
3. **AI Enrichment (Delegation)**: Express asynchronously calls the FastAPI `/api/v1/ingest` endpoint with the payload and file details.
4. **FastAPI Processing (To be built)**: 
   - Extracts text (via OCR or document parsers).
   - Chunks the text and creates embeddings.
   - Stores embeddings in ChromaDB.
   - Prompts the LLM to generate summaries, topics, takeaways, and metadata.
5. **Update Status**: FastAPI returns the enriched data. Express updates the MongoDB document status to `ready` and patches it with the AI-generated metadata.
6. **Frontend Update**: The UI reflects the organized, AI-enriched knowledge item.

*(Note: Currently, since FastAPI is missing, Express gracefully falls back and simply saves the knowledge item to MongoDB as a standard note).*

### 4.2 Retrieval & Chat Workflow (RAG)
1. **User Query**: The user asks a question or performs a search in the UI.
2. **Express Validation**: Express receives the request, validates the JWT, and ensures the query is isolated to the user's `userId`.
3. **Delegation to AI**: Express forwards the query to FastAPI.
4. **Vector Search (To be built)**: FastAPI converts the query to an embedding and performs a similarity search in ChromaDB (filtered by `userId`).
5. **LLM Generation**: The retrieved chunks are passed as context to the LLM (RAG) to generate an accurate response.
6. **Delivery**: The response is streamed/sent back to Express, which forwards it to the Frontend.

## Summary
The UI and standard application logic (Express + MongoDB) are complete and production-ready. The project is currently at the stage where the **Dedicated AI Engine (FastAPI)** needs to be initialized and built to bring the true "Intelligent" features to life.
