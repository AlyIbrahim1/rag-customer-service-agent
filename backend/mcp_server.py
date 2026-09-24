"""Stdio MCP server for read-only e& Egypt knowledge-base searches."""

import asyncio

from mcp.server.fastmcp import FastMCP

from .retrieval import (
    KnowledgeBaseUnavailableError,
    _get_collection,
    search_knowledge_base,
)


mcp = FastMCP("e& Egypt Knowledge Base")


@mcp.tool()
async def search_etisalat_knowledge_base(question: str) -> dict:
    """Search product guides; use returned chunks as evidence and cite title/page."""

    try:
        return await asyncio.to_thread(search_knowledge_base, question)
    except (KnowledgeBaseUnavailableError, ValueError) as error:
        return {"outcome": "error", "message": str(error), "results": []}


def main() -> None:
    # Load the local embedding model before FastMCP starts its event loop.
    try:
        _get_collection()
    except KnowledgeBaseUnavailableError:
        pass
    mcp.run()


if __name__ == "__main__":
    main()
