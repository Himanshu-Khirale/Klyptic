# Backend Documentation

## Overview
The Klyptic Backend is a Node.js Express server that acts as the central traffic controller, API gateway, and primary database manager. It sits between the React frontend and the Python AI Engine, handling user business logic, database persistence, and asynchronous job queuing.

## Technology Stack
- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Background Queue:** `p-queue` (in-memory concurrency queue)
- **File Uploads:** Multer (handling multipart/form-data)
- **Environment:** dotenv for configuration

## Architecture & Structure
The backend is structured using a standard Controller-Service pattern to separate HTTP logic from business logic.

- **Controllers:** Handle incoming HTTP requests, extract parameters/body, and pass them to services.
- **Services:** Contain the core business logic (e.g., `knowledge.service.js`).
- **Models:** Mongoose schemas defining the MongoDB collections (e.g., `KnowledgeItem`).
- **Utils/Middleware:** Helpers for error handling, file uploading (`upload.js`), and the AI queue (`aiQueue.js`).

## Key Workflows & Responsibilities

### 1. Fast API Responses & Asynchronous Processing
A core architectural principle of the backend is that it **never blocks the user**.
- When a user uploads a file or saves a link, the `knowledge.service.js` immediately creates a MongoDB document with `status: "pending"`.
- It returns an HTTP `200 OK` to the frontend instantly.
- It then uses `enqueueAiJob()` to push the enrichment task into the background.

### 2. The AI Queue (`aiQueue.js`)
To prevent overwhelming the FastAPI AI Engine, the backend uses `p-queue`:
- **Concurrency Limit:** Set to `2`, meaning only 2 AI extraction/enrichment jobs run simultaneously.
- **Exponential Retry:** If the AI Engine fails (e.g., timeout or temporary crash), the queue automatically retries up to 3 times, waiting 1s, 2s, and 4s between attempts.
- **Permanent Failure Handling:** If all retries are exhausted, an `onPermanentFailure` callback is triggered, updating the MongoDB document's status to `"failed"` and saving the `aiError`.

### 3. Proxying to the AI Engine
The backend proxies specific intelligent requests (like semantic search, RAG chat, and insight generation) directly to the FastAPI AI Engine using Axios/Fetch in `ai.service.js`. It passes an `X-User-Id` header to ensure the AI engine respects multi-tenancy.

### 4. File Management
Uses Multer to temporarily store uploaded files (PDFs, Images) on disk. These files are passed to the AI Engine for OCR/extraction and can be cleaned up afterward.

## Environment Variables
- `PORT`: Express server port
- `MONGODB_URI`: Connection string for MongoDB
- `AI_ENGINE_URL`: The local or internal URL of the FastAPI server (e.g., `http://localhost:8000`)
