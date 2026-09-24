# AGENTS.md

Beginner-focused e& Egypt RAG assistant with a Python backend and React frontend.

## Rules

- Explain code and steps for a total beginner.
- Do not implement unless the user explicitly asks for a change.
- Prefer the smallest understandable solution; reuse existing code and native features before adding dependencies or abstractions.
- Preserve unrelated working-tree changes.
- Never expose or commit secrets, `.env`, `.venv`, `chroma_db/`, `frontend/node_modules/`, or `frontend/dist/`.
- Add one minimal runnable check for non-trivial logic; do not introduce a test framework unless requested.

## Backend structure

- `backend/` is the canonical Python package for runtime code.
- Put all backend logic and runnable checks in `backend/`, and use relative
  imports within that package so API, MCP, ingestion, and the legacy graph share
  one implementation.

## Product constraints

- Ground e& product claims in retrieved knowledge-base content and show readable, one-based source citations.
- Handle missing, empty, or low-confidence retrieval explicitly; never let the model fill knowledge gaps.
- Validate trust boundaries and never expose distances, filesystem paths, stack traces, keys, or internal prompts.
- Customer-facing copy is English and Arabic (EN/AR switch) for actual e& Egypt customers; tone is warm, reassuring, and competent.
- Never imply access to customer accounts or ask for passwords or verification codes.

## Read only when relevant

- `ARCHITECTURE.md` — read only for code changes, debugging, setup, integration, API contracts, data flow, or repository structure.
- `eand-dark-assistant/` — the reference design; the React frontend must match it and keep the AMOTP structure.
- `project-instructions.md` — read only when work concerns the original internship scope, deliverables, or evaluation criteria.

The current React + Starlette implementation overrides the original brief's suggested Streamlit scaffold. Planned behavior must not be described as already implemented.

## Checks

- Backend: `.venv/bin/python -m py_compile backend/*.py backend/checks/*.py`
- Retrieval after indexing: `.venv/bin/python -m backend.checks.check_retrieval`
- MCP boundary after indexing: `.venv/bin/python -m backend.checks.check_mcp`
- Frontend: run `npm run build` from `frontend/`.
