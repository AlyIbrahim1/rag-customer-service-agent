# AGENTS.md

Agentic RAG chatbot over Etisalat Egypt's product/service knowledge base. Built as part of the Etisalat Egypt Internship Program 2026 — see `project-instructions.md` for the full project brief.

## Working context

- The work in this project is meant to be a learning experience so always explain the code and the steps as if you are working with a total beginner.
- Never implement the code directly yourself, unless specifically instructed.
- Use the simplest implementation possible that is suitable for a beginner.
- Always follow the requirements stated in @project-instructions .

## Stack

- Python 3.10+, `.venv` for isolation
- LangGraph — state-machine agent workflow
- ChromaDB — local vector store
- OpenAI-compatible API — embeddings + generation (OpenRouter)
- Streamlit — chat UI

## Layout

- `ingest.py` — loads documents from `knowledge-base/`, chunks, embeds, and writes them into ChromaDB
- `graph.py` — LangGraph state machine (nodes: understand → retrieve → generate → respond)
- `app.py` — Streamlit entrypoint, wires the UI to `graph.py`
- `knowledge-base/` — source PDFs (plans, internet services, prepaid systems, etc.)
- `.env` — API keys / config (gitignored, never commit)

`app.py`, `graph.py`, and `ingest.py` are currently empty stubs — this is a greenfield scaffold.

## Architecture

Query → understand (intent/keywords) → retrieve (Chroma similarity search) → generate (LLM grounded on retrieved context) → respond (answer + source citations). Each step is a LangGraph node; keep routing/edge logic explicit so the flow stays inspectable.

## Conventions

- Keep responses grounded in retrieved context; always surface source citations.
- Handle the no-results / low-confidence-retrieval case explicitly rather than letting the LLM hallucinate an answer.
- Don't commit `.env` or `.venv` (already gitignored).
- No test framework set up yet — if you add non-trivial logic (retrieval scoring, routing), leave a minimal runnable check alongside it.
