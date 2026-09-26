"""Shared configuration rendering helpers."""

import json
from pathlib import Path
import re

from permissions import expand


def as_json(value) -> str:
    return json.dumps(value, indent=2) + "\n"


def hook_group(command: str, matcher: str) -> dict:
    return {"matcher": matcher, "hooks": [{"type": "command", "command": command, "timeout": 5}]}



def rule_text(workspace: Path, home: Path) -> str:
    bodies = []
    paths = sorted((workspace / "rules").glob("*.md"), key=lambda p: (p.name != "workflow-server.md", p.name))
    for path in paths:
        text = path.read_text()
        match = re.match(r"\A---\n(.*?)\n---\n(.*)", text, re.S)
        if match and re.search(r"(?m)^alwaysApply:\s*true\s*$", match[1]):
            bodies.append(expand(match[2].strip(), workspace, home))
    return "\n\n".join(bodies)
