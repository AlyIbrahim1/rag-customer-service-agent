"""
LangGraph state machine:
    understand -> retrieve -> generate        -> respond   (product questions)
    understand -> generate_direct              -> respond  (greetings, small talk,
                                                            "summarize our chat", etc.)

understand:         classifies the message as needing a KB search or not, and (if
                    needed) rewrites it into a standalone question using history.
retrieve:           embeds the question and pulls the closest chunks from Chroma.
generate:           asks the LLM to answer using ONLY the retrieved chunks.
generate_direct:    asks the LLM to answer from conversation history / general
                    knowledge, skipping the vector search entirely.
respond:            formats the final answer with source citations.
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
N_RESULTS = 5
DISTANCE_THRESHOLD = 1.3

client = chromadb.PersistentClient(path=CHROMA_DIR)
embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
collection = client.get_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)

llm = OpenAI(
    api_key=os.getenv("GOOGLE_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
CHAT_MODEL = os.getenv("CHAT_MODEL")

SYSTEM_PROMPT = (
    "You are the e& Egypt Assistant, a friendly and professional customer support "
    "agent for Etisalat Egypt (e&). Answer product questions using ONLY the "
    "provided context — never make anything up. If the user instead asks about "
    "something from earlier in this conversation (e.g. to recall or summarize a "
    "previous answer), use the conversation history for that instead of the "
    "context. If neither has the answer, say so clearly and suggest the user "
    "rephrase or ask about a covered topic. Keep answers concise and in a "
    "helpful, professional support tone."
)

class State(TypedDict):
    question: str
    history: list[dict]        # prior turns: [{"role": "user"|"assistant", "content": str}]
    cleaned_question: str
    needs_retrieval: bool
    retrieved: list[dict]       # [{"text": str, "source": str, "page": int, "distance": float}]
    low_confidence: bool
    answer: str
    sources: list[str]

def understand(state: State) -> State:
    question = state["question"].strip()
    history = state.get("history", [])
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history) or "(none)"

    # One LLM call does two jobs: 
    # (1) decide if this needs a KB search at all
    # (greetings/small talk/"summarize our chat" don't), 
    # and (2) if it does, rewrite follow-ups like "what are it's benefits?" into a standalone
    # question so `retrieve` searches for the right product.
    route_prompt = (
        "You are the router for the e& Egypt support chatbot. Decide whether the "
        "LATEST user message needs a search of the product knowledge base "
        "(ROUTE=retrieve), or can be answered directly from the conversation "
        "history / general knowledge (ROUTE=direct) — e.g. greetings, thanks, "
        "small talk, or asking to recall/summarize earlier answers.\n\n"
        f"Conversation history:\n{history_text}\n\nLatest message: {question}\n\n"
        "Respond with EXACTLY two lines:\n"
        "ROUTE: retrieve or direct\n"
        "QUESTION: if ROUTE is retrieve, rewrite the message as a standalone "
        "question resolving any pronouns/references using history, otherwise "
        "repeat the message unchanged"
    )
    response = llm.chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": route_prompt}],
    )

    route = "retrieve"
    cleaned_question = question
    for line in response.choices[0].message.content.strip().splitlines():
        if line.upper().startswith("ROUTE:"):
            route = line.split(":", 1)[1].strip().lower()
        elif line.upper().startswith("QUESTION:"):
            cleaned_question = line.split(":", 1)[1].strip()

    state["needs_retrieval"] = route != "direct"
    state["cleaned_question"] = cleaned_question or question
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
    prompt = f"Context:\n{context}\n\nQuestion: {state['cleaned_question']}"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(state.get("history", []))
    messages.append({"role": "user", "content": prompt})

    response = llm.chat.completions.create(model=CHAT_MODEL, messages=messages)
    state["answer"] = response.choices[0].message.content
    return state

def generate_direct(state: State) -> State:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(state.get("history", []))
    messages.append({"role": "user", "content": state["cleaned_question"]})

    response = llm.chat.completions.create(model=CHAT_MODEL, messages=messages)
    state["answer"] = response.choices[0].message.content
    state["retrieved"] = []
    state["low_confidence"] = False
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
workflow.add_node("generate_direct", generate_direct)
workflow.add_node("respond", respond)

workflow.set_entry_point("understand")
workflow.add_conditional_edges(
    "understand",
    lambda state: "retrieve" if state["needs_retrieval"] else "generate_direct",
    {"retrieve": "retrieve", "generate_direct": "generate_direct"},
)
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", "respond")
workflow.add_edge("generate_direct", "respond")
workflow.add_edge("respond", END)

graph = workflow.compile()


def answer_question(question: str, history: list[dict] | None = None) -> dict:
    final_state = graph.invoke({"question": question, "history": history or []})
    return {"answer": final_state["answer"], "sources": final_state["sources"]}


if __name__ == "__main__":
    result = answer_question("What is DataLine?")
    print(result["answer"])
    print("Sources:", result["sources"])