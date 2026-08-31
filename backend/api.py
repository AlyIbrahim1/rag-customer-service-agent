"""Starlette HTTP API used by the React chat application."""

import json

from starlette.applications import Starlette
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Route

from .config import KNOWLEDGE_BASE_DIR


def clean_history(history):
    """Keep only the fields the LangGraph workflow needs from chat history."""

    if not isinstance(history, list):
        return []

    return [
        {"role": message["role"], "content": message["content"]}
        for message in history
        if isinstance(message, dict)
        and message.get("role") in {"user", "assistant"}
        and isinstance(message.get("content"), str)
    ]


async def chat(request: Request):
    """Answer one customer question using the existing RAG workflow."""

    try:
        payload = await request.json()
    except json.JSONDecodeError:
        return JSONResponse({"error": "Send a valid JSON request."}, status_code=400)

    question = payload.get("question") if isinstance(payload, dict) else None
    if not isinstance(question, str) or not question.strip():
        return JSONResponse({"error": "A question is required."}, status_code=400)

    # Keep the API importable before the index exists; retrieval is initialized
    # only when the graph handles a product question.
    from .graph import answer_question

    try:
        result = await run_in_threadpool(
            answer_question,
            question.strip(),
            clean_history(payload.get("history")),
        )
    except Exception:
        return JSONResponse(
            {"error": "I couldn't reach the knowledge base right now. Please try again shortly."},
            status_code=503,
        )

    return JSONResponse(
        {
            "answer": result["answer"],
            "outcome": result["outcome"],
            "sources": result["sources"],
        }
    )


async def health(_: Request):
    return JSONResponse({"status": "ok"})


def source_pdf(title: str):
    """Return a known product guide without accepting filesystem paths."""

    title = title.strip()
    if title.lower().endswith(".pdf"):
        title = title[:-4]
    guides = {pdf.stem.casefold(): pdf for pdf in KNOWLEDGE_BASE_DIR.glob("*.pdf")}
    return guides.get(title.casefold())


async def source_guide(request: Request):
    """Serve one approved product guide for a customer-facing citation."""

    pdf = source_pdf(request.path_params["title"])
    if pdf is None:
        return JSONResponse({"error": "Source guide not found."}, status_code=404)
    return FileResponse(pdf, media_type="application/pdf")


app = Starlette(
    routes=[
        Route("/api/chat", chat, methods=["POST"]),
        Route("/api/health", health),
        Route("/api/sources/{title}", source_guide),
    ],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
