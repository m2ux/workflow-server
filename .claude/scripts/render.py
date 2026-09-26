"""Render Claude settings from shared workspace policy."""

import json
from pathlib import Path
import shlex
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str((HERE / "shared").resolve()))
sys.path.insert(0, str((HERE.parent / "hooks/shared").resolve()))

from permissions import expand, load_policy
from rendering import as_json, hook_group


def claude_config(workspace: Path, home: Path, policy: dict) -> dict:
    config = expand(json.loads((workspace / ".claude/settings.template.json").read_text()), workspace, home)
    allow = [f"Bash({pattern})" for pattern in policy["shell"]]
    names = {"read": "Read", "write": "Write", "edit": "Edit", "multiedit": "MultiEdit", "notebookedit": "NotebookEdit"}
    for tool, patterns in policy["files"].items():
        allow.extend(f"{names[tool]}({pattern})" for pattern in patterns)
    allow.extend(f"WebFetch(domain:{host})" for host in policy["webDomains"])
    allow.extend(f"mcp__{name}__*" for name in policy["mcpServers"])
    allow.extend(f"Skill({name})" for name in policy["skills"])
    allow.extend(policy["tools"])
    config["permissions"] = {"allow": allow, "additionalDirectories": policy["directories"]}
    command = f"python3 {shlex.quote(str(workspace / '.claude/hooks/adapter.py'))}"
    config["hooks"] = {"PreToolUse": [hook_group(command, "Bash|Shell|WebFetch")]}
    return config



def render(workspace: Path, home: Path, mcp: dict | None = None) -> dict[str, str]:
    return {".claude/settings.json": as_json(claude_config(workspace, home, load_policy(workspace, home)))}
