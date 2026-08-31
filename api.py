"""HTTP API used by the React chat application.

Run locally with: uvicorn api:app --reload
"""

import json

from starlette.applications import Starlette
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route


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

    # Import lazily so the API can start even before the knowledge base is indexed.
    from graph import answer_question

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

    return JSONResponse({"answer": result["answer"], "sources": result["sources"]})


async def health(_: Request):
    return JSONResponse({"status": "ok"})


app = Starlette(
    routes=[Route("/api/chat", chat, methods=["POST"]), Route("/api/health", health)],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
