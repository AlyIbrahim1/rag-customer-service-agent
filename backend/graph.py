"""LangGraph workflow for the legacy HTTP chat client."""

from typing import TypedDict

from langgraph.graph import END, StateGraph
from openai import OpenAI

from .config import CHAT_MODEL, GENERATION_BASE_URL, GOOGLE_API_KEY
from .mcp_client import search_knowledge_base_via_mcp


llm = OpenAI(api_key=GOOGLE_API_KEY, base_url=GENERATION_BASE_URL, max_retries=4, timeout=20.0)

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
    history: list[dict]
    cleaned_question: str
    needs_retrieval: bool
    retrieved: list[dict]
    low_confidence: bool
    answer: str
    outcome: str
    sources: list[dict]  # [{"title": str, "page": int}]


def understand(state: State) -> State:
    """Route the message and rewrite follow-ups into standalone questions."""

    question = state["question"].strip()
    history = state.get("history", [])
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history) or "(none)"
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
    """Ask the MCP knowledge tool for normalized retrieval results."""

    result = search_knowledge_base_via_mcp(state["cleaned_question"])
    state["retrieved"] = [
        {
            "text": item["text"],
            "source": item["source"]["title"],
            "page": item["source"]["page"],
        }
        for item in result["results"]
    ]
    state["low_confidence"] = result["outcome"] != "grounded"
    return state


def generate(state: State) -> State:
    """Generate only from retrieved context, or give the safe no-match reply."""

    if state["low_confidence"]:
        state["answer"] = (
            "I don't have reliable information about that in the available e& product guides. "
            "Try rephrasing, or ask about DataLine, Emerald, Hekaya Internet, "
            "Hekaya Mixat, or prepaid systems."
        )
        return state

    context = "\n\n".join(
        f"[{item['source']} p.{item['page']}]\n{item['text']}"
        for item in state["retrieved"]
    )
    prompt = f"Context:\n{context}\n\nQuestion: {state['cleaned_question']}"
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(state.get("history", []))
    messages.append({"role": "user", "content": prompt})

    response = llm.chat.completions.create(model=CHAT_MODEL, messages=messages)
    state["answer"] = response.choices[0].message.content
    return state


def generate_direct(state: State) -> State:
    """Answer greetings/history requests without pretending they used the KB."""

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(state.get("history", []))
    messages.append({"role": "user", "content": state["cleaned_question"]})
    response = llm.chat.completions.create(model=CHAT_MODEL, messages=messages)
    state["answer"] = response.choices[0].message.content
    state["retrieved"] = []
    state["low_confidence"] = False
    return state


def respond(state: State) -> State:
    """Set the response outcome and safe, structured sources."""

    if state["low_confidence"]:
        state["outcome"] = "no_match"
        state["sources"] = []
    elif not state["needs_retrieval"]:
        state["outcome"] = "direct"
        state["sources"] = []
    else:
        state["outcome"] = "grounded"
        seen = []
        for item in state["retrieved"]:
            source = {"title": item["source"], "page": item["page"]}
            if source not in seen:
                seen.append(source)
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


def answer_question(
    question: str, history: list[dict] | None = None, include_trace: bool = False
) -> dict:
    """Run the chat workflow, optionally including evaluation-only retrieval data."""

    final_state = graph.invoke({"question": question, "history": history or []})
    result = {
        "answer": final_state["answer"],
        "outcome": final_state["outcome"],
        "sources": final_state["sources"],
    }
    if include_trace:
        result["retrieval_question"] = final_state["cleaned_question"]
        result["retrieved_contexts"] = [
            item["text"] for item in final_state.get("retrieved", [])
        ]
    return result


def main() -> None:
    result = answer_question("What is DataLine?")
    print(result["answer"])
    print("Sources:", result["sources"])


if __name__ == "__main__":
    main()
