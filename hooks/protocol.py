"""Reusable JSON tool-event protocol used by local harness hooks."""

import os

from contracts import Decision, Request


def decode_request(payload: dict, *, shell_names: tuple[str, ...]) -> Request:
    cwd = payload.get("cwd") or os.getcwd()
    name = payload.get("tool_name", "")
    args = payload.get("tool_input") or {}
    if name in shell_names:
        workdir = args.get("cwd") or args.get("workdir") or cwd
        if not os.path.isabs(workdir):
            workdir = os.path.join(cwd, workdir)
        return Request("shell", args["command"], workdir)
    if name == "WebFetch":
        return Request("fetch", args["url"], cwd)
    if name.startswith("mcp__"):
        return Request("mcp", name, cwd)
    return Request("unknown", "", cwd)



def pre_tool_response(event: str, decision: Decision) -> dict | None:
    if decision.action == "abstain":
        return None
    return {"hookSpecificOutput": {"hookEventName": event,
            "permissionDecision": decision.action, "permissionDecisionReason": decision.reason}}
