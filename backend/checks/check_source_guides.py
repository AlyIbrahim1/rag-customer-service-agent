"""Minimal check for the customer-facing product-guide route."""

from ..api import source_pdf


def main() -> None:
    assert source_pdf("DataLine").name == "DataLine.pdf"
    assert source_pdf("dataline.pdf").name == "DataLine.pdf"
    assert source_pdf("../.env") is None
    print("source guide check: OK")


if __name__ == "__main__":
    main()
