"""Run shared policy through the selected harness adapter."""

import argparse
import json
import sys

from adapters import claude_permissions, decode, encode
from contracts import Decision
from policy import evaluate


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("harness", choices=("claude", "codex"))
    args = parser.parse_args()
    event = "PreToolUse"
    try:
        payload = json.load(sys.stdin)
        event = payload.get("hook_event_name", event)
        if args.harness == "claude" and event == "preToolUse":
            event = "PreToolUse"
        if event not in ("PreToolUse", "PermissionRequest"):
            raise ValueError(f"Unsupported event: {event}")
        request = decode(args.harness, payload)
        if not isinstance(request.value, str) or not isinstance(request.cwd, str):
            raise ValueError("Expected text command and working directory")
        permissions = claude_permissions() if args.harness == "claude" else None
        decision = evaluate(request, permissions)
    except Exception as exc:
        decision = Decision("deny", f"Workspace policy could not evaluate this request: {exc}")
    output = encode(args.harness, event, decision)
    if output is not None:
        print(json.dumps(output))


if __name__ == "__main__":
    main()
