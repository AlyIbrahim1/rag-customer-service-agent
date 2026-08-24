"""
LangGraph state machine: understand -> retrieve -> generate -> respond.

understand: light cleanup of the raw question (nothing fancy — the vector
            search in `retrieve` does the real semantic understanding).
retrieve:   embeds the question and pulls the closest chunks from Chroma.
generate:   asks the LLM to answer using ONLY the retrieved chunks.
respond:    formats the final answer with source citations.
"""

import os
from typing import TypedDict

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from openai import OpenAI

load_dotenv()

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "etisalat_kb"
N_RESULTS = 4
DISTANCE_THRESHOLD = 1.3

client = chromadb.PersistentClient(path=CHROMA_DIR)
embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
collection = client.get_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)

llm = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL")
)
CHAT_MODEL = os.getenv("CHAT_MODEL")

class State(TypedDict):
    question: str
    cleaned_question: str
    retrieved: list[dict]       # [{"text": str, "source": str, "page": int, "distance": float}]
    low_confidence: bool
    answer: str
    sources: list[str]

def understand(state: State) -> State:
    state["cleaned_question"] = state["question"].strip()
    return state

def retrieve(state: State) -> State:
    results = collection.query(query_texts=[state["cleaned_question"]], n_results=N_RESULTS)

    retrieved = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]
    for text, meta, distance in zip(documents, metadatas, distances):
        retrieved.append({
            "text": text,
            "source": meta["source"],
            "page": meta["page"],
            "distance": distance,
        })
    
    state["retrieved"] = retrieved
    state["low_confidence"] = (not retrieved) or (retrieved[0]["distance"] > DISTANCE_THRESHOLD)
    return state


def generate(state: State) -> State:
    if state["low_confidence"]:
        state["answer"] = (
            "I don't have information about that in the Etisalat knowledge base. "
            "Try rephrasing, or ask about DataLine, Emerald, Hekaya Internet, "
            "Hekaya Mixat, or prepaid systems."
        )
        return state

    context = "\n\n".join(
        f"[{r['source']} p.{r['page']}]\n{r['text']}" for r in state["retrieved"]
    )
    prompt = (
        "Answer the question using ONLY the context below. "
        "If the context doesn't contain the answer, say so — do not make anything up.\n\n"
        f"Context:\n{context}\n\nQuestion: {state['cleaned_question']}"
    )

    response = llm.chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    state["answer"] = response.choices[0].message.content
    return state

def respond(state: State) -> State:
    if state["low_confidence"]:
        state["sources"] = []
    else:
        seen = []
        for r in state["retrieved"]:
            label = f"{r['source']} (p.{r['page']})"
            if label not in seen:
                seen.append(label)
        
        state["sources"] = seen
    return state


workflow = StateGraph(State)
workflow.add_node("understand", understand)
workflow.add_node("retrieve", retrieve)
workflow.add_node("generate", generate)
workflow.add_node("respond", respond)

workflow.set_entry_point("understand")
workflow.add_edge("understand", "retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", "respond")
workflow.add_edge("respond", END)

graph = workflow.compile()


def answer_question(question: str) -> dict:
    final_state = graph.invoke({"question": question})
    return {"answer": final_state["answer"], "sources": final_state["sources"]}


if __name__ == "__main__":
    result = answer_question("What is DataLine?")
    print(result["answer"])
    print("Sources:", result["sources"])