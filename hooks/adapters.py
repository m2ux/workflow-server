"""Translate supported harness event contracts without changing policy."""

import json
import os
from pathlib import Path

from contracts import Decision, Request
from permissions import ROOT, load_policy


def claude_permissions(home: Path | None = None, project: Path | None = None) -> dict:
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


def decode(harness: str, payload: dict) -> Request:
    cwd = payload.get("cwd") or os.getcwd()
    name = payload.get("tool_name", "")
    args = payload.get("tool_input") or {}
    if name == "Bash" or (harness == "claude" and name == "Shell"):
        workdir = args.get("cwd") or args.get("workdir") or cwd
        if not os.path.isabs(workdir):
            workdir = os.path.join(cwd, workdir)
        return Request("shell", args["command"], workdir)
    if name == "WebFetch":
        return Request("fetch", args["url"], cwd)
    if name.startswith("mcp__"):
        return Request("mcp", name, cwd)
    return Request("unknown", "", cwd)


def encode(harness: str, event: str, decision: Decision) -> dict | None:
    action, reason = decision.action, decision.reason
    if harness == "codex":
        if event == "PermissionRequest":
            if action in ("ask", "abstain"):
                return None
            result = {"behavior": action}
            if action == "deny":
                result["message"] = reason
            return {"hookSpecificOutput": {"hookEventName": event, "decision": result}}
        if action == "ask":
            return {"hookSpecificOutput": {"hookEventName": event,
                    "additionalContext": reason + " Codex native permissions determine approval."}}
        if action != "deny":
            return None
    if action == "abstain":
        return None
    return {"hookSpecificOutput": {"hookEventName": event,
            "permissionDecision": action, "permissionDecisionReason": reason}}
