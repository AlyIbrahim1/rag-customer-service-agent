"""
Reads every PDF in knowledge-base/, splits the text into overlapping
chunks, embeds each chunk with a local sentence-transformer model, and
stores everything in a persistent ChromaDB collection on disk.

Run this once (and again any time the PDFs change):
    python ingest.py
"""

from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from langchain_text_splitters import RecursiveCharacterTextSplitter

from pypdf import PdfReader

KNOWLEDGE_BASE_DIR =Path("knowledge-base")
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "etisalat_kb"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

def load_pdfs(folder: Path) -> list[dict]:
    """
    Read every *.pdf in `folder` and return one entry per page:
    {"text": <page text>, "source": <filename>, "page": <page number>}.

    We keep the page number because it's what makes source citations
    useful later ("DataLine.pdf, page 3" instead of just "DataLine.pdf").
    """

    pages = []
    for pdf_path in sorted(folder.glob("*.pdf")):
        reader = PdfReader(pdf_path)
        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if text.strip(): # Skips pages with no extractable text
                pages.append({
                    "text": text,
                    "source": pdf_path.name,
                    "page":page_number,
                })
    return pages


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, 
overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split `text` into overlapping, sentence-aware chunks.
    """

    flattened = " ".join(text.split())
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=[". ", "? ", "! ", "; ", " ", ""],
    )
    return splitter.split_text(flattened)


def build_knowledge_base():
    pages = load_pdfs(KNOWLEDGE_BASE_DIR)
    print(f"Loaded {len(pages)} pages from {KNOWLEDGE_BASE_DIR}/")

    documents, metadatas, ids = [], [], []
    
    for page in pages:
        for i, chunk in enumerate(chunk_text(page["text"])):
            documents.append(chunk)
            metadatas.append({
                "source": page["source"],
                "page": page["page"]
            })
            ids.append(f"{page['source']}-p{page['page']}-c{i}")
    
    print(f"Split into {len(documents)} chunks.")

    client = chromadb.PersistentClient(path=CHROMA_DIR)
    embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

    # Delete any previous collection so re-running this script doesn't
    # duplicate every chunk on top of the last run's data.
    existing = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing:
        client.delete_collection(COLLECTION_NAME)

    collection = client.create_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)
    collection.add(documents=documents, metadatas=metadatas, ids=ids)

    print(f"Stored {collection.count()} chunks in '{CHROMA_DIR}/' (collection: {COLLECTION_NAME})")
    return collection

if __name__ == "__main__":
    build_knowledge_base()