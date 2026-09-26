"""Claude hook adapter, also consumed by Cursor's Claude import."""

from pathlib import Path
import sys

sys.path.insert(0, str((Path(__file__).resolve().parent / "shared").resolve()))

import json
import os

from contracts import Decision
from permissions import ROOT, load_policy
from protocol import decode_request, pre_tool_response
from runtime import run


def load_permissions(home: Path | None = None, project: Path | None = None) -> dict:
    """Honor Claude's user and local command grants at the adapter boundary."""
    home = home or Path.home()
    project = project or Path(os.environ.get("CLAUDE_PROJECT_DIR", str(ROOT)))
    policy = load_policy()
    for path in (home / ".claude/settings.json", project / ".claude/settings.json",
                 project / ".claude/settings.local.json"):
        if not path.exists():
            continue
        data = json.loads(path.read_text())
        for rule in data.get("permissions", {}).get("allow", []):
            if rule.startswith("Bash(") and rule.endswith(")"):
                pattern = rule[5:-1]
                if pattern.endswith(":*"):
                    pattern = pattern[:-2] + " *"
                if pattern not in policy["shell"]:
                    policy["shell"].append(pattern)
    return policy



def decode(payload):
    return decode_request(payload, shell_names=("Bash", "Shell"))


def encode(event: str, decision: Decision):
    return pre_tool_response(event, decision)


if __name__ == "__main__":
    run(decode, encode, events={"PreToolUse": "PreToolUse", "preToolUse": "PreToolUse"},
        permissions=load_permissions)
