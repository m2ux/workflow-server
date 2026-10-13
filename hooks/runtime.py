"""Run shared policy with caller-supplied event translation and permissions."""

import json
import sys

from contracts import Decision
from permissions import load_policy
from policy import evaluate


def run(decode, encode, *, events: dict[str, str], permissions=load_policy) -> None:
    event = "PreToolUse"
    try:
        payload = json.load(sys.stdin)
        event = events[payload.get("hook_event_name", event)]
        request = decode(payload)
        if not isinstance(request.value, str) or not isinstance(request.cwd, str):
            raise ValueError("Expected text command and working directory")
        decision = evaluate(request, permissions())
    except Exception as exc:
        decision = Decision("deny", f"Workspace policy could not evaluate this request: {exc}")
    output = encode(event, decision)
    if output is not None:
        print(json.dumps(output))
