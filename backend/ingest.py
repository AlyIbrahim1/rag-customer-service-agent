"""Build the local Chroma index from the PDFs in ``knowledge-base/``."""

from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from .config import (
    CHROMA_DIR,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    KNOWLEDGE_BASE_DIR,
)


CHUNK_SIZE = 1_000
CHUNK_OVERLAP = 200


def load_pdfs(folder: Path = KNOWLEDGE_BASE_DIR) -> list[dict]:
    """Read each PDF page and keep its filename/page for later citations."""

    pages = []
    for pdf_path in sorted(folder.glob("*.pdf")):
        reader = PdfReader(pdf_path)
        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append(
                    {"text": text, "source": pdf_path.name, "page": page_number}
                )
    return pages


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """Flatten PDF line wraps, then split into overlapping sentence-aware chunks."""

    flattened = " ".join(text.split())
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=[". ", "? ", "! ", "; ", " ", ""],
    )
    return splitter.split_text(flattened)


def build_knowledge_base():
    """Rebuild the named Chroma collection from the current source PDFs."""

    pages = load_pdfs()
    print(f"Loaded {len(pages)} pages from {KNOWLEDGE_BASE_DIR}/")

    documents, metadatas, ids = [], [], []
    for page in pages:
        for index, chunk in enumerate(chunk_text(page["text"])):
            documents.append(chunk)
            metadatas.append({"source": page["source"], "page": page["page"]})
            ids.append(f"{page['source']}-p{page['page']}-c{index}")

    print(f"Split into {len(documents)} chunks.")

    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)

    # Rebuilding is intentionally destructive for this generated collection;
    # otherwise rerunning ingestion would duplicate every chunk.
    if COLLECTION_NAME in [collection.name for collection in client.list_collections()]:
        client.delete_collection(COLLECTION_NAME)

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
    )
    if documents:
        collection.add(documents=documents, metadatas=metadatas, ids=ids)

    print(
        f"Stored {collection.count()} chunks in '{CHROMA_DIR}/' "
        f"(collection: {COLLECTION_NAME})"
    )
    return collection


def main() -> None:
    build_knowledge_base()


if __name__ == "__main__":
    main()
