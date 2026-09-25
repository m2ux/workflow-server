"""Put the last word of each class-box note first.

Mermaid draws a line inside a class box by moving its first word to the end,
after a colon. A note written in reading order, such as "does the work", is
drawn as "the work: does". Writing the last word first, "work does the", is
drawn as "does the: work".

Run this once, after the notes are written in reading order. A second run
rotates them again.
"""
import sys
from pathlib import Path


def rotate(text: str) -> str:
    words = text.split()
    if len(words) < 2:
        return text
    return words[-1] + " " + " ".join(words[:-1])


def rewrite(src: str) -> str:
    lines = src.splitlines(keepends=True)
    out = []
    inside = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("class ") and stripped.endswith("{"):
            inside = True
            out.append(line)
            continue
        if inside and stripped == "}":
            inside = False
            out.append(line)
            continue
        if inside and stripped:
            newline = "\n" if line.endswith("\n") else ""
            indent = line[: len(line) - len(line.lstrip(" "))]
            out.append(indent + rotate(stripped) + newline)
            continue
        out.append(line)
    return "".join(out)


def main(paths: list[str]) -> None:
    for raw in paths:
        path = Path(raw)
        original = path.read_text()
        updated = rewrite(original)
        if updated != original:
            path.write_text(updated)
            print(path)


if __name__ == "__main__":
    main(sys.argv[1:])
