"""Shared, read-only search for the indexed e& Egypt knowledge base."""

from functools import lru_cache
from math import isfinite

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from .config import (
    CHROMA_DIR,
    COLLECTION_NAME,
    DISTANCE_THRESHOLD,
    EMBEDDING_MODEL,
    MAX_QUESTION_LENGTH,
    N_RESULTS,
)


MISSING_INDEX_MESSAGE = (
    "The knowledge base has not been indexed. Run `python -m backend.ingest` first."
)
SEARCH_ERROR_MESSAGE = (
    "The knowledge base could not be searched. Run `python -m backend.ingest` to rebuild it, "
    "then try again."
)


class KnowledgeBaseUnavailableError(RuntimeError):
    """Raised when the local Chroma collection is missing or unavailable."""


@lru_cache(maxsize=1)
def _get_collection():
    """Open Chroma only when the first search is requested."""

    if not CHROMA_DIR.exists():
        raise KnowledgeBaseUnavailableError(MISSING_INDEX_MESSAGE)

    try:
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        # Indexing downloads the model; customer searches use the cached copy.
        embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL, local_files_only=True
        )
        return client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=embedding_fn,
        )
    except Exception as error:
        raise KnowledgeBaseUnavailableError(MISSING_INDEX_MESSAGE) from error


def _no_match() -> dict:
    return {"outcome": "no_match", "results": []}


def _validate_question(question: str) -> str:
    if not isinstance(question, str) or not question.strip():
        raise ValueError("question must be non-empty text.")

    question = question.strip()
    if len(question) > MAX_QUESTION_LENGTH:
        raise ValueError(
            f"question must be {MAX_QUESTION_LENGTH} characters or fewer."
        )
    return question


def _first_query_value(values) -> list:
    """Get the first query's values from Chroma's nested result lists."""

    if not values:
        return []
    return values[0] or []


def _title(source: str) -> str:
    # Metadata currently stores filenames. Strip any accidental path before a
    # title reaches an agent or customer.
    filename = source.replace("\\", "/").rsplit("/", 1)[-1]
    return filename[:-4] if filename.lower().endswith(".pdf") else filename


def search_knowledge_base(question: str) -> dict:
    """Return grounded chunks and citations for one product question."""

    question = _validate_question(question)
    collection = _get_collection()

    try:
        query = collection.query(query_texts=[question], n_results=N_RESULTS)
    except Exception as error:
        raise KnowledgeBaseUnavailableError(SEARCH_ERROR_MESSAGE) from error

    documents = _first_query_value(query.get("documents"))
    metadatas = _first_query_value(query.get("metadatas"))
    distances = _first_query_value(query.get("distances"))

    results = []
    for text, metadata, distance in zip(documents, metadatas, distances):
        try:
            distance = float(distance)
        except (TypeError, ValueError):
            continue
        if not isfinite(distance) or distance > DISTANCE_THRESHOLD:
            continue
        if not isinstance(text, str) or not text.strip() or not isinstance(metadata, dict):
            continue

        source = metadata.get("source")
        page = metadata.get("page")
        if not isinstance(source, str) or not source.strip():
            continue
        try:
            page = int(page)
        except (TypeError, ValueError):
            continue
        if page <= 0:
            continue

        title = _title(source)
        if not title:
            continue
        results.append({"text": text, "source": {"title": title, "page": page}})

    return {"outcome": "grounded", "results": results} if results else _no_match()
