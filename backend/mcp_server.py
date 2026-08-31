"""Stdio MCP server for read-only e& Egypt knowledge-base searches."""

from mcp.server.fastmcp import FastMCP

from .retrieval import KnowledgeBaseUnavailableError, search_knowledge_base


mcp = FastMCP("e& Egypt Knowledge Base")


@mcp.tool()
def search_etisalat_knowledge_base(question: str) -> dict:
    """Search product guides; use returned chunks as evidence and cite title/page."""

    try:
        return search_knowledge_base(question)
    except (KnowledgeBaseUnavailableError, ValueError) as error:
        return {"outcome": "error", "message": str(error), "results": []}


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
