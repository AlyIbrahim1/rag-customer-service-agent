"""Minimal validation check for the Ragas evaluation-set loader."""

import tempfile
from pathlib import Path

from ..evaluation.ragas_eval import load_cases


def main() -> None:
    with tempfile.TemporaryDirectory() as directory:
        dataset = Path(directory) / "cases.jsonl"
        dataset.write_text('{"question":"What is DataLine?","reference":"Approved answer."}\n')
        assert load_cases(dataset) == [
            {"question": "What is DataLine?", "reference": "Approved answer."}
        ]
    print("evaluation check: OK")


if __name__ == "__main__":
    main()
