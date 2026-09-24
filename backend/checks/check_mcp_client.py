"""Check session reuse and retrieval filtering without loading the embedding model."""

import asyncio
from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import patch

from .. import mcp_client, mcp_server, retrieval


@asynccontextmanager
async def fake_stdio(_parameters):
    starts.append(1)
    yield None, None


class FakeSession:
    def __init__(self, _reader, _writer):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        pass

    async def initialize(self):
        pass

    async def call_tool(self, _name, _arguments, **_kwargs):
        calls.append(1)
        if fail_next:
            fail_next.pop()
            raise OSError("Server disconnected")
        return SimpleNamespace(
            isError=False,
            structuredContent={"outcome": "no_match", "results": []},
            content=[],
        )


class FakeCollection:
    def query(self, **_kwargs):
        return {
            "documents": [["Relevant", "Also relevant", "Unrelated"]],
            "metadatas": [[
                {"source": "DataLine.pdf", "page": 1},
                {"source": "DataLine.pdf", "page": 1},
                {"source": "Emerald.pdf", "page": 2},
            ]],
            "distances": [[0.1, 0.2, retrieval.DISTANCE_THRESHOLD + 0.1]],
        }


def main() -> None:
    global starts, calls, fail_next
    starts, calls, fail_next = [], [], []
    with patch.object(mcp_client, "stdio_client", fake_stdio), patch.object(
        mcp_client, "ClientSession", FakeSession
    ):
        expected = {"outcome": "no_match", "results": []}
        assert mcp_client.search_knowledge_base_via_mcp("one") == expected
        assert mcp_client.search_knowledge_base_via_mcp("two") == expected
        assert len(starts) == 1 and len(calls) == 2
        fail_next.append(True)
        worker = mcp_client._worker
        try:
            mcp_client.search_knowledge_base_via_mcp("three")
        except mcp_client.McpKnowledgeBaseError:
            pass
        else:
            raise AssertionError("A disconnected server must fail the request.")
        worker.thread.join(timeout=2)
        assert mcp_client.search_knowledge_base_via_mcp("four") == expected
        assert len(starts) == 2
        mcp_client._shutdown()

    malformed = SimpleNamespace(
        isError=False,
        structuredContent={"outcome": "grounded", "results": []},
        content=[],
    )
    try:
        mcp_client._tool_data(malformed)
    except mcp_client.McpKnowledgeBaseError:
        pass
    else:
        raise AssertionError("Empty evidence must not be grounded.")

    with patch.object(retrieval, "_get_collection", return_value=FakeCollection()):
        result = retrieval.search_knowledge_base("DataLine")
    assert result["results"] == [
        {"text": "Relevant", "source": {"title": "DataLine", "page": 1}},
        {"text": "Also relevant", "source": {"title": "DataLine", "page": 1}},
    ], result
    with patch.object(mcp_server, "search_knowledge_base", return_value=result):
        assert asyncio.run(mcp_server.search_etisalat_knowledge_base("DataLine")) == result
    with patch.object(mcp_server, "search_knowledge_base", side_effect=ValueError("bad question")):
        assert asyncio.run(mcp_server.search_etisalat_knowledge_base(" ")) == {
            "outcome": "error", "message": "bad question", "results": []
        }
    print("MCP client check: OK")


if __name__ == "__main__":
    main()
