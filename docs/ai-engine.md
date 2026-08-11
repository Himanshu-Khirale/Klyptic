# AI Engine Documentation

## Overview
The Klyptic AI Engine is a Python-based FastAPI microservice responsible for the "heavy lifting" of machine learning, NLP, and vector search. It is strictly a processing engine; it does not handle user sessions, passwords, or the primary database. It receives commands from the Express backend.

## Technology Stack
- **Framework:** FastAPI / Uvicorn
- **Orchestration:** LangChain (`langchain-core`, `langchain-text-splitters`)
- **Vector Database:** ChromaDB (persistent local storage)
- **Embeddings:** HuggingFace (`sentence-transformers` running locally on CPU)
- **LLM:** Google Gemini 1.5 Flash (`langchain-google-genai`)
- **Extraction Tools:** 
  - `youtube-transcript-api`
  - `pillow` (Image processing)
  - `PyPDFLoader`
  - `WebBaseLoader`

## Architecture & Pipeline

### 1. Modular Loader Factory
The AI Engine completely abstracts data extraction through `loader_factory.py`. When a payload arrives, it inspects the `captureKind` and routes it to the specific loader:
- **`pdf_loader.py`:** Uses `PyPDFLoader` to extract text from PDFs.
- **`image_loader.py`:** Performs advanced Multimodal OCR. It encodes the image to Base64 and sends it to Gemini 1.5 Flash Vision to extract precise text, identify code languages, and describe diagrams/UIs (replacing traditional Tesseract).
- **`youtube_loader.py`:** Uses `youtube-transcript-api` to pull transcripts directly from YouTube IDs, falling back to LangChain's `YoutubeLoader`.
- **`url_loader.py`:** Scrapes web pages.
- **`text_loader.py`:** Passes through raw text, code, or notes.
*Every loader strictly returns plain text as a string.*

### 2. Chunking
Once plain text is extracted, it is passed to a `RecursiveCharacterTextSplitter`.
- **Method:** Recursively splits by paragraphs, sentences, and words to keep semantically related text together.
- **Chunk Size / Overlap:** Optimized for retrieval (typically ~1000 characters with 200 overlap, depending on configuration).

### 3. Embeddings & Vector Storage (ChromaDB)
- **Embeddings Model:** The engine uses a local HuggingFace embedding model to generate mathematical vectors representing the text chunks. This is free, local, and fast.
- **Storage:** Vectors are upserted into ChromaDB's `knowledge_vectors` collection.
- **Multi-Tenancy (CRITICAL):** Every single chunk in ChromaDB is tagged with a `user_id` metadata field. When the Express backend queries the engine, it passes the `X-User-Id` header. The AI engine *always* filters ChromaDB queries by `user_id`, guaranteeing mathematical data isolation between users. Additional metadata includes `knowledge_id`, `source_type`, and `chunk_index`.

### 4. LLM Enrichment
After vectorization, the text (truncated to ~10,000 chars to save tokens/time) is sent to **Gemini 1.5 Flash**. 
- Using LangChain's `with_structured_output`, the LLM is forced to return a strict JSON schema containing:
  - `title`
  - `summary`
  - `topic` (categorization)
  - `takeaways` (bullet points)
This structured data is passed back to Express to be saved in MongoDB.

### 5. Services Provided
- **`/api/v1/ingest`**: The pipeline described above (Extract -> Chunk -> Embed -> Enrich).
- **`/api/v1/search`**: Performs Cosine Similarity search on ChromaDB, returning the most relevant chunks for a user's query.
- **`/api/v1/chat`**: The RAG (Retrieval-Augmented Generation) endpoint. It searches ChromaDB for context, injects it into a prompt, and streams a response from Gemini.
- **`/api/v1/knowledge/delete`**: Hard-deletes all vector chunks matching a specific `knowledge_id` and `user_id` from ChromaDB.

## Observability
The engine uses structured logging for all stages. During ingestion, logs emit explicit events: `INGEST_START`, `LOADER_SELECTED`, `TEXT_EXTRACTED`, `CHUNKING_COMPLETED`, `EMBEDDINGS_CREATED`, `CHROMADB_UPDATED`, `METADATA_GENERATED`, and `INGEST_COMPLETED` (or `INGEST_FAILED`), along with processing durations in milliseconds.
