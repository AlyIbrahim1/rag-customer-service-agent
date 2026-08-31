"""Evaluate approved product-question cases with Ragas.

Each JSONL line must have a customer ``question`` and a knowledge-base-verified
``reference`` answer. The runner deliberately evaluates only grounded turns.
"""

import argparse
import json
import sys
import types
from pathlib import Path

def load_cases(path: Path) -> list[dict[str, str]]:
    """Load and validate the small, human-approved JSONL evaluation set."""

    cases = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            case = json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f"Line {number} is not valid JSON.") from error
        if not isinstance(case, dict) or not all(
            isinstance(case.get(field), str) and case[field].strip()
            for field in ("question", "reference")
        ):
            raise ValueError(
                f"Line {number} needs non-empty string fields: question and reference."
            )
        cases.append({field: case[field].strip() for field in ("question", "reference")})
    if not cases:
        raise ValueError("The evaluation dataset has no cases.")
    return cases


def _score_value(result) -> float:
    """Read the numeric value from Ragas' MetricResult."""

    value = result.value
    if not isinstance(value, (int, float)):
        raise ValueError(f"Ragas returned a non-numeric score: {value!r}")
    return float(value)


def _prepare_ragas_import() -> None:
    """Bridge Ragas 0.4.3's removed LangChain Vertex AI import path."""

    module_name = "langchain_community.chat_models.vertexai"
    try:
        import langchain_community.chat_models.vertexai  # noqa: F401
    except ModuleNotFoundError as error:
        if error.name != module_name:
            raise
        import langchain_community.llms as legacy_llms

        # Ragas uses these only in an ``isinstance`` tuple. This application
        # evaluates through the Gemini OpenAI-compatible API, not Vertex AI.
        class ChatVertexAI:
            pass

        class VertexAI:
            pass

        legacy_module = types.ModuleType(module_name)
        legacy_module.ChatVertexAI = ChatVertexAI
        sys.modules[module_name] = legacy_module
        legacy_llms.VertexAI = VertexAI


def evaluate(cases: list[dict[str, str]]) -> dict:
    """Run the three RAG metrics against the graph's actual retrieval trace."""

    from openai import AsyncOpenAI

    from ..config import CHAT_MODEL, GENERATION_BASE_URL, GOOGLE_API_KEY
    from ..graph import answer_question

    if not GOOGLE_API_KEY or not CHAT_MODEL:
        raise RuntimeError("Set GOOGLE_API_KEY and CHAT_MODEL in .env before evaluating.")

    try:
        _prepare_ragas_import()
        from ragas.llms import llm_factory
        from ragas.metrics.collections import ContextPrecision, ContextRecall, Faithfulness
    except ImportError as error:
        raise RuntimeError(
            "Install Ragas dependencies with pip install -r requirements-ragas.txt."
        ) from error

    # Ragas 0.4 collection metrics call ``agenerate`` internally, so their
    # evaluator must use OpenAI's async client even though this CLI is sync.
    client = AsyncOpenAI(api_key=GOOGLE_API_KEY, base_url=GENERATION_BASE_URL)
    evaluator = llm_factory(CHAT_MODEL, provider="openai", client=client)
    metrics = {
        "faithfulness": Faithfulness(llm=evaluator),
        "context_precision": ContextPrecision(llm=evaluator),
        "context_recall": ContextRecall(llm=evaluator),
    }
    rows = []
    for case in cases:
        trace = answer_question(case["question"], include_trace=True)
        contexts = trace["retrieved_contexts"]
        row = {"question": case["question"], "outcome": trace["outcome"]}
        if trace["outcome"] != "grounded" or not contexts:
            row["status"] = "not_scored_no_grounded_context"
        else:
            row["status"] = "scored"
            row.update(
                faithfulness=_score_value(
                    metrics["faithfulness"].score(
                        user_input=trace["retrieval_question"],
                        response=trace["answer"],
                        retrieved_contexts=contexts,
                    )
                ),
                context_precision=_score_value(
                    metrics["context_precision"].score(
                        user_input=trace["retrieval_question"],
                        reference=case["reference"],
                        retrieved_contexts=contexts,
                    )
                ),
                context_recall=_score_value(
                    metrics["context_recall"].score(
                        user_input=trace["retrieval_question"],
                        reference=case["reference"],
                        retrieved_contexts=contexts,
                    )
                ),
            )
        rows.append(row)

    scored = [row for row in rows if row["status"] == "scored"]
    summary = {"cases": len(rows), "scored_cases": len(scored)}
    for name in metrics:
        summary[name] = sum(row[name] for row in scored) / len(scored) if scored else None
    return {"summary": summary, "rows": rows}


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Ragas against the e& Egypt RAG graph.")
    parser.add_argument("dataset", type=Path, help="JSONL file with question and reference fields.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("backend/evaluation/results/ragas.json"),
        help="Where to save JSON results.",
    )
    args = parser.parse_args()
    report = evaluate(load_cases(args.dataset))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"Saved detailed results to {args.output}")


if __name__ == "__main__":
    main()
