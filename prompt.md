# AI Agent Prompt: Analyze and Deploy My RAG Chatbot

## Objective

You are a senior AI Engineer, DevOps Engineer, and Python Backend Architect. Your goal is **not to immediately start coding**, but to first understand my existing chatbot, identify why deployment is failing, and then create a robust migration and deployment plan before making any changes.

---

## Current Situation

I have already built a Retrieval-Augmented Generation (RAG) chatbot.

Current architecture:

* Frontend: React (deployed on Vercel)
* Backend: Python API (deployed on Render)
* Chatbot: Python-based
* Embedding model: (Inspect the project and determine this)
* Vector Database: Currently stored locally
* LLM: Ollama running locally
* Retrieval: RAG pipeline

The frontend and backend are deployed successfully.

The chatbot feature does **not** work after deployment because it currently depends on local resources (Ollama and a local vector database).

The chatbot works perfectly on my local machine.

---

# Phase 1 — Project Analysis

Do NOT modify anything yet.

Instead:

1. Analyze the complete project structure.
2. Identify every file related to:

   * chatbot
   * embeddings
   * vector database
   * document ingestion
   * retrieval
   * prompt generation
   * API endpoints
   * frontend API calls
3. Explain how the current RAG pipeline works.
4. Identify every dependency on localhost or local files.
5. Explain why deployment currently fails.
6. Identify which parts are production-ready and which are not.

Produce a report containing:

* Current Architecture
* RAG Flow
* Existing Components
* Problems
* Deployment Blockers
* Suggested Improvements

Do not change code during this phase.

---

# Phase 2 — Design a Production Architecture

After understanding the project, design a production-ready architecture.

Consider:

* scalability
* low cost
* free tiers where possible
* easy maintenance
* security
* fast inference
* reliability

Compare multiple approaches, for example:

Option A:

* Groq API
* Supabase pgvector

Option B:

* Gemini API
* Pinecone

Option C:

* Ollama on GPU server

Option D:

* Other suitable alternatives

For each option provide:

* Pros
* Cons
* Estimated cost
* Complexity
* Performance
* Ease of deployment

Finally recommend the best architecture for my project.

Do not start implementation until the architecture is finalized.

---

# Phase 3 — Migration Plan

Create a step-by-step migration roadmap.

Include:

1. Required code changes
2. Environment variables
3. Database migration
4. Embedding migration
5. LLM migration
6. Backend updates
7. Frontend updates
8. Deployment changes
9. Testing strategy
10. Rollback strategy

Explain each step before implementing it.

---

# Phase 4 — Implementation

Implement the migration gradually.

Requirements:

* Make small changes.
* Explain every change before applying it.
* Keep commits modular.
* Never rewrite the whole project unless necessary.
* Preserve existing functionality.
* Avoid breaking the current application.

---

# Phase 5 — Production Checklist

Verify:

✅ Chatbot works locally

✅ Chatbot works on deployed backend

✅ Vector database is accessible remotely

✅ Embeddings load correctly

✅ API endpoints function properly

✅ Frontend communicates with backend

✅ Retrieval returns relevant documents

✅ Sources are displayed correctly

✅ Errors are handled gracefully

✅ Logging is implemented

✅ Environment variables are secured

---

# Phase 6 — Optimization

After deployment succeeds, suggest improvements such as:

* streaming responses
* caching retrieved documents
* hybrid search
* semantic + keyword retrieval
* reranking
* conversation memory
* observability
* monitoring
* Docker support
* CI/CD
* automated embedding updates
* document versioning
* rate limiting
* authentication
* analytics
* latency optimization

---

# Expected Deliverables

I expect the following:

1. Analysis Report
2. Architecture Diagram
3. Deployment Strategy
4. Migration Plan
5. Code Changes
6. Testing Guide
7. Deployment Guide
8. Future Improvement Suggestions

---

## Important Rules

* Never assume anything without first inspecting the codebase.
* Ask for clarification if critical information is missing.
* Explain your reasoning before making changes.
* Prefer production-ready, maintainable solutions over quick fixes.
* Optimize for reliability, scalability, and cost-effectiveness.
* Keep the existing project structure intact wherever possible.
