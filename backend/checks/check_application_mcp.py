"""Minimal check that the application agent retrieves through MCP."""

from ..mcp_client import search_knowledge_base_via_mcp


def main() -> None:
    result = search_knowledge_base_via_mcp("What is DataLine?")
    assert result["outcome"] == "grounded", result
    assert result["results"], result
    print("application MCP check: OK")


if __name__ == "__main__":
    main()
