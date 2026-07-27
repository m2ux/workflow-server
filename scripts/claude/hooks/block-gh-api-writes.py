#!/usr/bin/env python3
"""
PreToolUse hook for Bash: ASK before `gh api` calls that mutate.

Pairs with a broad `Bash(gh api:*)` allow rule. That allow rule (via
compound-bash-allow.py or Claude Code's own matcher) lets every `gh api`
invocation through without a prompt — including writes. This hook claws the
writes back: it parses each `gh api` segment and forces a permission PROMPT
(permissionDecision "ask") when the call would issue anything other than a
read (GET/HEAD). Reads still fall through to the allow rule and auto-approve.

Why a hook and not a deny *rule*: `gh api` writes cannot be captured by a
prefix-glob deny pattern, because
  * the method flag (-X / --method) can sit anywhere in the args, in several
    spellings (-X POST, -XPOST, --method POST, --method=POST); and
  * gh auto-switches to POST the moment a field flag is present
    (-f / -F / --field / --raw-field / --input) with NO -X anywhere.
Only real parsing catches the field-driven auto-POST case.

Read detection (segment is ALLOWED to fall through) iff:
  * explicit method is GET or HEAD, OR
  * no method flag AND no field/input flag (plain `gh api <endpoint>`).
Everything else is treated as a write and prompts.

Fails open on parse errors, mirroring the other Bash hooks.

Dry-run: python3 block-gh-api-writes.py --test 'gh api repos/o/r -f x=1'
"""
from __future__ import annotations

import json
import shlex
import sys

CONTROL = frozenset({"&&", "||", "|", ";", "&", "\n"})
READ_METHODS = frozenset({"GET", "HEAD"})
FIELD_FLAGS = frozenset({"-f", "-F", "--field", "--raw-field", "--input"})
FIELD_PREFIXES = ("--field=", "--raw-field=", "--input=")


def _graphql_is_write(args: list[str]) -> bool:
    """For `gh api graphql`, a request is a READ unless the GraphQL document is
    a mutation. gh sends every graphql call over POST, so the generic
    field-flag heuristic below misfires (a `-f query='...'` read looks like a
    write). Decide on the operation type instead: locate the inline `query=`
    field value and treat it as a write only when it opens with `mutation`.

    A graphql call with no inline query (e.g. `--input file.graphql`) can't be
    proven a read from the command line, so it's treated as a write and prompts.
    """
    for t in args:
        idx = t.find("query=")
        if idx != -1:
            doc = t[idx + len("query="):]
            return doc.lstrip().lower().startswith("mutation")
    return True


def _segment_is_write(args: list[str]) -> bool:
    """Given the tokens AFTER `gh api`, decide whether this is a mutation."""
    if args and args[0] == "graphql":
        return _graphql_is_write(args[1:])
    method: str | None = None
    has_field = False
    i = 0
    n = len(args)
    while i < n:
        t = args[i]
        if t in ("-X", "--method"):
            if i + 1 < n:
                method = args[i + 1]
                i += 2
                continue
        elif t.startswith("-X") and len(t) > 2:
            method = t[2:]
        elif t.startswith("--method="):
            method = t.split("=", 1)[1]
        elif t in FIELD_FLAGS or t.startswith(FIELD_PREFIXES):
            has_field = True
        elif (t.startswith("-f") or t.startswith("-F")) and len(t) > 2:
            has_field = True  # combined short form, e.g. -fkey=val
        i += 1
    m = method.upper() if method else None
    if m in READ_METHODS:
        return False
    if m is not None:
        return True  # explicit non-GET/HEAD method
    return has_field  # no method: write iff fields present (gh auto-POSTs)


def gh_api_write_segments(cmd: str) -> list[str] | None:
    """Return the raw `gh api ...` windows that are writes; None on parse error."""
    try:
        toks = shlex.split(cmd, posix=True)
    except ValueError:
        return None
    writes: list[str] = []
    i = 0
    n = len(toks)
    while i < n:
        if toks[i] == "gh" and i + 1 < n and toks[i + 1] == "api":
            j = i + 2
            args: list[str] = []
            while j < n and toks[j] not in CONTROL:
                args.append(toks[j])
                j += 1
            if _segment_is_write(args):
                writes.append("gh api " + " ".join(args))
            i = j
            continue
        i += 1
    return writes


def ask(writes: list[str]) -> None:
    reason = (
        "This `gh api` call issues a write (non-GET/HEAD method, or field flags "
        "that make gh auto-POST): "
        + "; ".join(writes)
        + ". A broad `Bash(gh api:*)` allow only auto-approves READS, so writes "
        "prompt for confirmation. Approve to proceed. If this is actually a "
        "read, add `--method GET` to skip the prompt."
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def run_hook() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)
    if payload.get("tool_name") != "Bash":
        sys.exit(0)
    cmd = payload.get("tool_input", {}).get("command")
    if not isinstance(cmd, str) or not cmd.strip():
        sys.exit(0)
    if "gh" not in cmd or "api" not in cmd:
        sys.exit(0)
    writes = gh_api_write_segments(cmd)
    if writes:
        ask(writes)
    sys.exit(0)


def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    writes = gh_api_write_segments(cmd)
    if writes is None:
        print("PASS (fail-open) — unparseable")
        sys.exit(0)
    if writes:
        print("ASK — " + "; ".join(writes))
        sys.exit(1)
    print("PASS — read-only or no gh api")
    sys.exit(0)


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "--test":
        run_test(sys.argv[2:])
        return
    run_hook()


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:
        sys.exit(0)  # fail open: never block on internal error
