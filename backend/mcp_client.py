"""Internal MCP client used by the application agent for product retrieval."""

import asyncio
import atexit
import json
import sys
from concurrent.futures import Future
from datetime import timedelta
from threading import Event, Lock, Thread

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .config import PROJECT_ROOT


class McpKnowledgeBaseError(RuntimeError):
    """Raised when the local MCP knowledge tool cannot provide a result."""


def _tool_data(result) -> dict:
    """Read FastMCP's JSON response across supported SDK result shapes."""

    if result.isError:
        raise McpKnowledgeBaseError("Knowledge search is unavailable.")
    if isinstance(result.structuredContent, dict):
        data = result.structuredContent
    else:
        text = "\n".join(
            content.text for content in result.content if hasattr(content, "text")
        )
        data = json.loads(text)

    if not isinstance(data, dict) or data.get("outcome") not in {"grounded", "no_match", "error"}:
        raise McpKnowledgeBaseError("Knowledge search returned an invalid result.")
    if data["outcome"] == "error":
        raise McpKnowledgeBaseError(data.get("message", "Knowledge search is unavailable."))
    results = data.get("results")
    if not isinstance(results, list):
        raise McpKnowledgeBaseError("Knowledge search returned an invalid result.")
    if data["outcome"] == "grounded":
        if not results or any(
            not isinstance(item, dict)
            or not isinstance(item.get("text"), str)
            or not item["text"].strip()
            or not isinstance(item.get("source"), dict)
            or not isinstance(item["source"].get("title"), str)
            or not item["source"]["title"].strip()
            or type(item["source"].get("page")) is not int
            or item["source"]["page"] <= 0
            for item in results
        ):
            raise McpKnowledgeBaseError("Knowledge search returned an invalid result.")
    elif results:
        raise McpKnowledgeBaseError("Knowledge search returned an invalid result.")
    return data


class _McpWorker:
    """Keep the stdio session on one event loop for repeated synchronous calls."""

    def __init__(self) -> None:
        self.ready = Event()
        self.lock = Lock()
        self.pending: set[Future] = set()
        self.loop = None
        self.requests = None
        self.thread = Thread(target=self._run, daemon=True)

    def start(self) -> None:
        self.thread.start()
        self.ready.wait()

    def search(self, question: str) -> dict:
        future = Future()
        with self.lock:
            if self.loop is None:
                raise McpKnowledgeBaseError("Knowledge search is unavailable.")
            self.pending.add(future)
            try:
                self.loop.call_soon_threadsafe(
                    self.requests.put_nowait, (question, future)
                )
            except RuntimeError as error:
                self.pending.remove(future)
                raise McpKnowledgeBaseError("Knowledge search is unavailable.") from error
        try:
            return future.result()
        finally:
            with self.lock:
                self.pending.discard(future)

    async def _serve(self) -> None:
        self.requests = asyncio.Queue()
        with self.lock:
            self.loop = asyncio.get_running_loop()
            self.ready.set()

        parameters = StdioServerParameters(
            command=sys.executable,
            args=["-m", "backend.mcp_server"],
            cwd=str(PROJECT_ROOT),
        )
        async with stdio_client(parameters) as (reader, writer):
            async with ClientSession(reader, writer) as session:
                await asyncio.wait_for(session.initialize(), timeout=30)
                while True:
                    request = await self.requests.get()
                    if request is None:
                        return
                    question, future = request
                    try:
                        result = await session.call_tool(
                            "search_etisalat_knowledge_base",
                            {"question": question},
                            read_timeout_seconds=timedelta(seconds=90),
                        )
                        future.set_result(_tool_data(result))
                    except McpKnowledgeBaseError as error:
                        future.set_exception(error)
                    except Exception:
                        future.set_exception(
                            McpKnowledgeBaseError("Knowledge search is unavailable.")
                        )
                        raise

    def _run(self) -> None:
        global _worker
        try:
            asyncio.run(self._serve())
        except Exception:
            pass
        finally:
            with self.lock:
                self.loop = None
                for future in self.pending:
                    if not future.done():
                        future.set_exception(
                            McpKnowledgeBaseError("Knowledge search is unavailable.")
                        )
                self.ready.set()
            with _worker_lock:
                if _worker is self:
                    _worker = None

    def close(self) -> None:
        with self.lock:
            if self.loop is not None:
                self.loop.call_soon_threadsafe(self.requests.put_nowait, None)
        self.thread.join(timeout=5)


_worker_lock = Lock()
_worker: _McpWorker | None = None


def search_knowledge_base_via_mcp(question: str) -> dict:
    """Call the read-only MCP tool from the synchronous LangGraph workflow."""

    global _worker
    with _worker_lock:
        if _worker is None:
            _worker = _McpWorker()
            _worker.start()
        worker = _worker
    return worker.search(question)


def _shutdown() -> None:
    if _worker is not None:
        _worker.close()


atexit.register(_shutdown)
