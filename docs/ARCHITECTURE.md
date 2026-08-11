# KLYPTIC - ARCHITECTURE.md

> Project Architecture & Development Guide
> Version: 1.0

---

# Project Overview

## Project Name

Klyptic

## Tagline

An Intelligent Clipboard for Everything You Learn

## Project Description

Klyptic is an AI-powered Personal Knowledge Workspace that allows users to capture information from multiple sources without worrying about organization.

Users can save:

- Text
- PDFs
- Images
- Screenshots
- Articles
- Documentation
- YouTube videos
- GitHub repositories
- Code snippets
- Web URLs

The application automatically organizes, enriches and retrieves information using AI.

The primary goal is NOT to build another chatbot.

The goal is to build a modern productivity application where AI works in the background.

---

# IMPORTANT

The frontend has already been completed.

DO NOT redesign the frontend.

DO NOT change the UI unless backend integration requires minimal modifications.

Your responsibility is to build the backend that integrates with the existing frontend.

---

# Project Goal

This project is primarily a portfolio project showcasing modern AI Engineering.

The architecture should demonstrate knowledge of:

- React
- Express.js
- FastAPI
- MongoDB
- LangChain
- Retrieval Augmented Generation (RAG)
- ChromaDB
- Embeddings
- Docker

The codebase should be modular, scalable and production-oriented.

---

# High-Level Architecture

                React + Tailwind
                       │
                       ▼
             Node.js + Express
      (Application & Business Logic)
                       │
             Internal HTTP Requests
                       ▼
          FastAPI (Klyptic AI Engine)
                       │
      ┌────────────────┼────────────────┐
      │                │                │
 LangChain        Embeddings        ChromaDB
      │
      ▼
LLM (Gemini / OpenAI / Mistral)

---

# Architecture Philosophy

This project follows Separation of Concerns.

Each service owns one responsibility.

Never mix responsibilities.

---

# Frontend Responsibilities

Frontend is responsible only for:

- User Interface
- Navigation
- Authentication Screens
- Dashboard
- Knowledge Inbox
- Search UI
- Chat UI
- Upload UI
- API Calls

The frontend NEVER communicates directly with FastAPI.

All requests must go through Express.

---

# Express Responsibilities

Express is the main application backend.

Express owns:

- Authentication
- JWT
- User Management
- Authorization
- CRUD APIs
- File Uploads
- MongoDB Operations
- Dashboard APIs
- Validation
- Error Handling
- Security
- Communication with FastAPI

Express SHOULD NOT perform:

- Embeddings
- OCR
- Retrieval
- Chunking
- Prompt Engineering
- LangChain logic
- LLM calls

Those belong exclusively to FastAPI.

---

# FastAPI Responsibilities

FastAPI is the dedicated AI Engine.

Everything related to AI belongs here.

FastAPI owns:

- LangChain
- OCR
- Document Parsing
- PDF Processing
- Image Processing
- Transcript Extraction
- Chunking
- Embeddings
- ChromaDB
- Retrieval
- Prompt Engineering
- Summarization
- Metadata Extraction
- Topic Detection
- Duplicate Detection
- AI Chat
- Knowledge Connections

FastAPI SHOULD NOT contain:

- Authentication
- JWT
- User CRUD
- Dashboard APIs
- Business Logic

---

# Communication Flow

Frontend

↓

Express

↓

FastAPI

↓

Express

↓

Frontend

The frontend should NEVER call FastAPI directly.

---

# MongoDB

MongoDB stores structured application data.

Examples:

- Users
- Knowledge Items
- Original Content
- Upload Information
- Metadata
- URLs
- Dashboard Data
- AI Generated Summaries
- User Preferences

MongoDB is the source of truth.

---

# ChromaDB

ChromaDB stores only vector-related information.

Examples:

- Embeddings
- Chunks
- Chunk Metadata
- MongoDB Document References

Never duplicate application data inside ChromaDB.

---

# Authentication

Authentication uses JWT.

Every knowledge item belongs to exactly one user.

Every MongoDB document must contain:

userId

Every ChromaDB vector metadata must also contain:

userId

Every retrieval operation MUST filter using userId.

Knowledge belonging to different users must never be mixed.

---

# Folder Structure

Repository

klyptic/

frontend/          (Already Built)

backend/           (Express)

ai-engine/         (FastAPI)

docs/

docker/

README.md

---

# Backend Structure

backend/

src/

config/

controllers/

middleware/

models/

routes/

services/

utils/

validators/

uploads/

app.js

server.js

---

# AI Engine Structure

ai-engine/

app/

api/

chains/

embeddings/

loaders/

prompts/

retrieval/

vectorstore/

services/

utils/

main.py

requirements.txt

---

# Development Order

Build the backend in the following order.

DO NOT skip steps.

Phase 1

- Express Setup
- MongoDB Connection
- Environment Configuration
- Folder Structure

Phase 2

- JWT Authentication
- Signup
- Login
- Protected Routes

Phase 3

- Knowledge CRUD
- Upload APIs
- File Storage

Phase 4

- FastAPI Setup
- LangChain Setup
- ChromaDB Setup

Phase 5

- AI Ingestion Pipeline

Phase 6

- Semantic Search

Phase 7

- RAG Chat

Phase 8

- Dashboard Intelligence

---

# Upload Flow

User Uploads File

↓

React

↓

Express

↓

Store File

↓

Save Initial Metadata

↓

Call FastAPI

↓

FastAPI Processes File

↓

Extract Text

↓

Chunk

↓

Embedding

↓

Store Embeddings

↓

Generate Metadata

↓

Return Result

↓

Express Updates MongoDB

↓

Frontend Refreshes

---

# Retrieval Flow

User asks question

↓

React

↓

Express

↓

Validate JWT

↓

FastAPI

↓

Embed Query

↓

Similarity Search

↓

Filter by userId

↓

Retrieve Chunks

↓

LLM

↓

Generate Response

↓

Express

↓

Frontend

---

# Development Principles

Always generate production-quality code.

Keep controllers lightweight.

Move business logic into services.

Keep routes minimal.

Validate every request.

Use async/await consistently.

Handle errors gracefully.

Follow REST conventions.

Use environment variables.

Write modular code.

Never hardcode secrets.

---

# AI Engineering Principles

The AI Engine should be modular.

Separate LangChain workflows into independent modules.

Example:

- ingestion_chain
- retrieval_chain
- summary_chain
- topic_chain
- metadata_chain

Avoid writing one large AI service.

Each AI capability should be independently maintainable.

---

# Important Rules

DO NOT redesign the frontend.

DO NOT merge Express and FastAPI.

DO NOT place LangChain code inside Express.

DO NOT place authentication inside FastAPI.

DO NOT bypass Express and call FastAPI directly from the frontend.

Maintain a clean separation between:

Application Layer

and

AI Layer.

---

# Coding Style

Generate clean, readable and maintainable code.

Avoid unnecessary complexity.

Prefer explicit code over clever code.

Write reusable modules.

Document important decisions.

Follow scalable architecture.

---

# Your Role

You are acting as a Senior Backend Engineer working on an existing project.

The frontend already exists.

Your job is to implement the backend incrementally while respecting the architecture defined in this document.

Before implementing any feature:

1. Explain the implementation plan.
2. List the files to be created or modified.
3. Wait for confirmation if major architectural changes are required.
4. Then implement the feature using clean production-quality code.