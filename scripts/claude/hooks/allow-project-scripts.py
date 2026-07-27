#!/usr/bin/env python3
"""PreToolUse (Bash) hook: auto-allow execution of scripts that live inside the
current project/worktree, scoped by filesystem LOCATION rather than by a broad
interpreter allow-rule (e.g. `python3 *` / `npx tsx *`).

Decision model:
  * Only ever emits an "allow" decision. It never denies and never asks — a
    non-match exits silently (code 0, no output), leaving the command to the
    normal permission flow and any other hooks (block-dynamic-shell, etc.).
  * Handles only BARE single commands: any shell metacharacter
    (chaining/redirection/expansion) makes it bail so compound-bash-allow.py
    can reason about the pieces instead.
  * The actual "is this a project-local script?" judgement lives in
    lib/project_scripts.py and is shared with compound-bash-allow.py, so the
    location-based authorization exists in exactly one place.

This means `python3 <project-file>.py` or `npx tsx <project-file>.ts` are
allowed because the TARGET is project-local, while `python3 -c '...'`,
`python3 /tmp/x.py`, or a script outside the project are not.
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "lib"))
from project_scripts import resolve_project_local_script  # noqa: E402

# Shell features that mean "do not auto-approve here" — hand back to normal flow
# (compound-bash-allow.py handles the compound/redirected forms per-segment).
METACHARS = ["&&", "||", ";", "|", "`", "$(", "${", ">", "<", "\n", "&"]


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return

    if data.get("tool_name") != "Bash":
        return

    command = (data.get("tool_input") or {}).get("command", "") or ""
    if not command.strip():
        return

    if any(m in command for m in METACHARS):
        return

    cwd = data.get("cwd") or os.getcwd()
    resolved = resolve_project_local_script(command, cwd)
    if resolved is None:
        return

    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "allow",
            "permissionDecisionReason": (
                f"Script {resolved} is inside the enclosing project root"
            ),
        }
    }))


if __name__ == "__main__":
    main()
