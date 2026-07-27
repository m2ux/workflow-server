#!/usr/bin/env python3
"""
PreToolUse hook for Bash: DENY + CORRECT.

Denies any Bash command containing a dynamic-shell construct that triggers
Claude Code's non-bypassable safety prompt (the prompt that fires regardless
of the permission allowlist), and feeds the agent a corrective message so it
re-issues the command in allowlist-clean form. The user never sees a prompt;
the agent silently rewrites.

This enforces Bash composition rules (no dynamic shell). It is the
deterministic counterpart to compound-bash-allow.py: that hook AUTO-ALLOWS
clean compound commands and stays silent on dynamic-shell constructs (letting
them fall through to the prompt); this hook catches that same fall-through set
and denies it instead.

Flagged constructs (matched on the RAW command text — NOT quote-aware, which
mirrors the harness: even backticks inside an echo string are flagged):
    $(...)          command substitution
    `...`           command substitution (backticks)
    ${...}          parameter expansion (braces)
    $NAME           variable expansion (letter/underscore-led)
    <(...) >(...)   process substitution
    \\<newline>      backslash line-continuation
    find ... -exec / -execdir / -delete

NOT flagged (explicitly allowed by the rules): heredocs (<<, <<<), positional
and special params ($1, $?, $#, $0) since the harness does not flag those and
they appear in legitimate awk/allowlisted commands.

Exit 0 silently when nothing matches, so normal permission flow (and the
companion compound-bash-allow hook) is unaffected.

Dry-run: python3 block-dynamic-shell.py --test 'cmd'
"""
from __future__ import annotations

import json
import re
import sys

# (regex, human label). Order = report order.
PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\$\("), "command substitution $(...)"),
    (re.compile(r"`"), "command substitution (backticks `...`)"),
    (re.compile(r"\$\{"), "parameter expansion ${...}"),
    (re.compile(r"\$[A-Za-z_]"), "variable expansion $NAME"),
    (re.compile(r"<\("), "process substitution <(...)"),
    (re.compile(r">\("), "process substitution >(...)"),
    (re.compile(r"\\\n"), "backslash line-continuation"),
    (re.compile(r"\bfind\b.*\s-(exec|execdir|delete)\b"), "find -exec/-execdir/-delete"),
]

GUIDANCE = (
    "Rewrite WITHOUT dynamic-shell constructs (see project CLAUDE.md / agent rules "
    "\"Bash composition rules\"): "
    "(1) chain steps with && on a single line; "
    "(2) hard-code literal values instead of $NAME / ${NAME}; "
    "(3) for a value produced by another command, split into TWO tool calls "
    "— the first prints the value, the second uses the literal; "
    "(4) replace $(...) and backticks the same way; "
    "(5) do NOT put literal backticks in echo/label strings — use plain words; "
    "(6) for commit messages use `git commit -F - <<'EOF' ... EOF` (a heredoc, "
    "which is allowed) or write the message to a file and `git commit -F <file>` "
    "— do NOT use `git commit -m \"$(cat ...)\"`; "
    "(7) replace `find ... -exec`/`-delete` with `find ... -print`, then act on "
    "the listed paths in a second call. Heredocs (<<) themselves are fine."
)


def find_violations(cmd: str) -> list[str]:
    return [label for pat, label in PATTERNS if pat.search(cmd)]


def deny(violations: list[str]) -> None:
    reason = (
        "Blocked before the permission prompt: this command uses "
        + "; ".join(violations)
        + ". These trigger a non-bypassable confirmation dialog that no "
        "allowlist rule can suppress. " + GUIDANCE
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
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
    violations = find_violations(cmd)
    if violations:
        deny(violations)
    sys.exit(0)


def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    violations = find_violations(cmd)
    if violations:
        print("DENY — " + "; ".join(violations))
        sys.exit(1)
    print("PASS — no dynamic-shell constructs")
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
        # Fail open: never block on an internal error.
        sys.exit(0)
