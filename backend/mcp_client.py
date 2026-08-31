"""Internal MCP client used by the application agent for product retrieval."""

import asyncio
import json
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .config import PROJECT_ROOT


class McpKnowledgeBaseError(RuntimeError):
    """Raised when the local MCP knowledge tool cannot provide a result."""


def _tool_data(result) -> dict:
    """Read FastMCP's JSON response across supported SDK result shapes."""

    if isinstance(getattr(result, "structuredContent", None), dict):
        return result.structuredContent

    text = "\n".join(
        content.text for content in result.content if hasattr(content, "text")
    )
    return json.loads(text)


async def _search(question: str) -> dict:
    parameters = StdioServerParameters(
        command=sys.executable,
        args=["-m", "backend.mcp_server"],
        cwd=str(PROJECT_ROOT),
    )
    # ponytail: starts a local MCP process per retrieval; reuse a session if startup becomes a bottleneck.
    async with stdio_client(parameters) as (reader, writer):
        async with ClientSession(reader, writer) as session:
            await session.initialize()
            result = _tool_data(
                await session.call_tool(
                    "search_etisalat_knowledge_base", {"question": question}
                )
            )

    if result.get("outcome") == "error":
        raise McpKnowledgeBaseError(result.get("message", "Knowledge search is unavailable."))
    return result


def search_knowledge_base_via_mcp(question: str) -> dict:
    """Call the read-only MCP tool from the synchronous LangGraph workflow."""

    try:
        return asyncio.run(_search(question))
    except McpKnowledgeBaseError:
        raise
    except Exception as error:
        raise McpKnowledgeBaseError("Knowledge search is unavailable.") from error
