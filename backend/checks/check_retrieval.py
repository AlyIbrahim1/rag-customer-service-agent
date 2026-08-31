"""Minimal retrieval check. Run after ``python -m backend.ingest``."""

from ..retrieval import search_knowledge_base


def main() -> None:
    result = search_knowledge_base("What is DataLine?")
    assert result["outcome"] == "grounded", result
    assert result["results"], result

    for item in result["results"]:
        assert item["text"].strip(), item
        assert item["source"]["title"].strip(), item
        assert item["source"]["page"] > 0, item

    print("retrieval check: OK")


if __name__ == "__main__":
    main()
