"""Codex tool-hook and native-approval adapter."""

from pathlib import Path
import sys

sys.path.insert(0, str((Path(__file__).resolve().parent / "shared").resolve()))

from contracts import Decision
from protocol import decode_request, pre_tool_response
from runtime import run


def decode(payload):
    return decode_request(payload, shell_names=("Bash",))


def encode(event: str, decision: Decision):
    action, reason = decision.action, decision.reason
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
    return pre_tool_response(event, decision)


if __name__ == "__main__":
    run(decode, encode, events={"PreToolUse": "PreToolUse", "PermissionRequest": "PermissionRequest"})
