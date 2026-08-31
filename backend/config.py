"""Shared backend configuration and repository paths."""

import os
from pathlib import Path

from dotenv import load_dotenv


# Resolve paths from this file, not from the process working directory. MCP
# clients often start a server from a temporary directory.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_BASE_DIR = PROJECT_ROOT / "knowledge-base"
CHROMA_DIR = PROJECT_ROOT / "chroma_db"
COLLECTION_NAME = "etisalat_kb"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

N_RESULTS = 5
DISTANCE_THRESHOLD = 1.3
MAX_QUESTION_LENGTH = 2_000

load_dotenv(PROJECT_ROOT / ".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CHAT_MODEL = os.getenv("CHAT_MODEL")
GENERATION_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
