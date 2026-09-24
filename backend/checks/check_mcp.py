"""Minimal MCP boundary check. Run after ``python -m backend.ingest``."""

import asyncio
import json
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def tool_data(result) -> dict:
    """Read FastMCP's JSON tool response across supported SDK result shapes."""

    if isinstance(getattr(result, "structuredContent", None), dict):
        return result.structuredContent

    text = "\n".join(
        content.text for content in result.content if hasattr(content, "text")
    )
    return json.loads(text)


async def main() -> None:
    parameters = StdioServerParameters(
        command=sys.executable,
        args=["-m", "backend.mcp_server"],
        cwd=str(PROJECT_ROOT),
    )
    async with stdio_client(parameters) as (reader, writer):
        async with ClientSession(reader, writer) as session:
            await session.initialize()
            tools = await session.list_tools()
            assert [tool.name for tool in tools.tools] == [
                "search_etisalat_knowledge_base"
            ], tools.tools
            schema = tools.tools[0].inputSchema
            assert schema["required"] == ["question"], schema
            assert schema["properties"]["question"]["type"] == "string", schema

            grounded = tool_data(
                await session.call_tool(
                    "search_etisalat_knowledge_base", {"question": "What is DataLine?"}
                )
            )
            assert grounded["outcome"] == "grounded", grounded
            assert grounded["results"], grounded
            assert all(
                item["text"].strip()
                and item["source"]["title"].strip()
                and item["source"]["page"] > 0
                for item in grounded["results"]
            ), grounded

            no_match = tool_data(
                await session.call_tool(
                    "search_etisalat_knowledge_base",
                    {"question": "What is the capital of Mars?"},
                )
            )
            assert no_match == {"outcome": "no_match", "results": []}, no_match

            blank = tool_data(
                await session.call_tool(
                    "search_etisalat_knowledge_base", {"question": "   "}
                )
            )
            assert blank == {
                "outcome": "error",
                "message": "question must be non-empty text.",
                "results": [],
            }, blank

    print("MCP rollout check: OK")


if __name__ == "__main__":
    asyncio.run(asyncio.wait_for(main(), timeout=60))
