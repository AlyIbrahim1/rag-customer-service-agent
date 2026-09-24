# Architecture

Technical reference for the current repository. Read this only when a task needs codebase structure, runtime flow, setup, integration, or API details.

## Current state

- The Python RAG backend and React customer interface are implemented.
- The backend implementation is contained in the `backend/` Python package.
- The frontend follows the AMOTP hierarchy under `frontend/src/components/`,
  `frontend/src/templates/`, and `frontend/src/pages/`.
- The API returns `answer`, `outcome`, and structured `{title, page}` citations.
- The frontend is a dark e& Egypt homepage replica (English/Arabic RTL switch)
  with a bottom-right chat bubble and a plan PDF viewer, ported from the static
  design in `eand-dark-assistant/`.
- Streamlit is not active and there is no `app.py`.

Prefer `python -m backend.ingest`,
`uvicorn backend.api:app`, and `python -m backend.mcp_server` for new setup.

## Stack

### Backend

- Python 3.10+
- LangGraph state machine
- ChromaDB persistent vector index
- `sentence-transformers/all-MiniLM-L6-v2` local embeddings
- OpenAI Python client using Google's OpenAI-compatible Gemini endpoint
- Starlette and Uvicorn HTTP API
- `pypdf` and LangChain text splitters

### Frontend

- React 19 and Vite 7
- Vanilla CSS
- Native `fetch` and React state; pdf.js 3.11 loaded as a global script for the PDF viewer
- No router, UI kit, or state-management library

## Important files

- `backend/config.py` — repository paths, model names, thresholds, and environment loading.
- `backend/ingest.py` — extracts PDF pages, creates overlapping chunks, and rebuilds Chroma.
- `backend/retrieval.py` — validates questions, searches Chroma, applies the confidence threshold, and normalizes citations.
- `backend/graph.py` — LangGraph workflow and `answer_question()` entrypoint;
  routes product retrieval through the MCP client and returns structured citations.
- `backend/mcp_client.py` — application-side stdio MCP client for product retrieval.
- `backend/api.py` — `POST /api/chat` and `GET /api/health`.
- `backend/mcp_server.py` — read-only stdio MCP server.
- `backend/checks/` — minimal runnable retrieval and MCP boundary checks.
```text
backend/
├── config.py       shared paths, environment, and constants
├── ingest.py       PDF -> Chroma index builder
├── retrieval.py    validated Chroma search service
├── graph.py        legacy LangGraph answer workflow
├── mcp_client.py   application-side MCP retrieval client
├── api.py          Starlette HTTP application
├── mcp_server.py   stdio MCP server
└── checks/         runnable backend checks
```
- `knowledge-base/` — DataLine, Emerald, Hekaya Internet, Hekaya Mixat, and Prepaid Systems PDFs.
- `assets/` — Vite's public directory: e& logos plus the design's images, icons,
  fonts, plan PDFs (`pdfs/en|ar/`), and `vendor/pdfjs/`.
- `frontend/src/App.jsx` — thin entry that renders `HomePage`.
- `frontend/src/pages/HomePage.jsx` — language (`#en`/`#ar`, `<html dir>`),
  PDF viewer state, and "Ask the assistant" hand-off to the chat.
- `frontend/src/templates/HomeTemplate.jsx` — homepage skeleton.
- `frontend/src/components/` — AMOTP atoms, molecules, and organisms;
  `organisms/ChatWidget.jsx` owns chat state and `/api/chat` requests,
  `organisms/PdfViewer.jsx` renders plan PDFs.
- `frontend/src/content.js` — all English and Arabic copy.
- `frontend/src/styles.css` — the design's CSS (dark only, RTL via logical properties).
- `frontend/vite.config.js` — Vite React plugin and `/api` proxy to `127.0.0.1:8000`.
- `eand-dark-assistant/` — static reference design the React frontend reproduces.
- `.impeccable.md` — frontend audience and accessibility context (predates the current design).
- `mcp-migration-plan.md` — planning only; not implemented behavior.
- `README` — concise local setup guide; the filename has no extension.

## Knowledge-base build

```text
knowledge-base/*.pdf
  -> backend.ingest
  -> page extraction
  -> 1,000-character chunks with 200-character overlap
  -> all-MiniLM-L6-v2 embeddings
  -> chroma_db/etisalat_kb
```

`python -m backend.ingest` deletes and recreates the named collection to avoid duplicate chunks.

## Request flow

```text
React
  -> POST /api/chat
  -> backend.api validates input and cleans history
  -> backend.graph: understand
       -> retrieve -> MCP client -> MCP server -> retrieval -> generate -> respond
                                                   product question
       -> generate_direct -> respond         greeting/history request
  -> JSON response
  -> React state (chat is not persisted)
```

- `understand` routes the request and resolves conversational references into a standalone retrieval question.
- `retrieve` calls `search_etisalat_knowledge_base` through the local MCP server;
  that tool asks for five Chroma results and applies the `1.3` distance threshold.
- `generate` answers only from retrieved context. Low-confidence retrieval produces an explicit no-information answer.
- `generate_direct` handles greetings, thanks, small talk, and conversation-history requests without retrieval.
- `respond` sets `grounded`, `no_match`, or `direct` and returns deduplicated
  `{title: "DataLine", page: 3}` citation objects.

Keep LangGraph nodes and edges explicit.

## Current API contract

Request:

```json
{
  "question": "What is DataLine?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "How can I help?"}
  ]
}
```

Successful response:

```json
{
  "answer": "...",
  "outcome": "grounded",
  "sources": [{"title": "DataLine", "page": 3}]
}
```

`outcome` is `grounded`, `no_match`, or `direct`. `no_match` and `direct`
responses return an empty `sources` list. Technical failures use a generic
503 error message and do not expose internals.

## Configuration

`.env` currently provides:

- `GOOGLE_API_KEY`
- `CHAT_MODEL`

`backend/graph.py` fixes the generation base URL to Google's OpenAI-compatible endpoint. Embeddings run locally. Do not rename these to OpenRouter settings without an explicit provider-migration request.

## Local development

1. Create and activate `.venv`.
2. Install backend dependencies: `pip install -r requirements.txt`.
3. Index or rebuild changed PDFs: `python -m backend.ingest`.
4. Start the API: `uvicorn backend.api:app --reload`.
5. In `frontend/`, run `npm install` and `npm run dev`.
6. Open `http://localhost:5173`; Vite proxies API calls to port `8000`.

The local embedding model may download on first use.

## Persistence

- Chroma data is stored in ignored `chroma_db/`.
- The chat bubble keeps one in-memory conversation; a refresh or the reset
  button starts over.
- The Arabic UI sends Arabic questions to the same English knowledge base, so
  Arabic retrieval quality is not yet tuned.

## Remaining release questions

- What official e& support URL should appear in fallback guidance?
- What privacy/safety wording has e& approved for public release?
- May customers open cited PDFs, or should citations remain informational?
- Which official e& digital typeface may be licensed and hosted?

See `project-instructions.md` for the original scope and acceptance criteria.
