#!/usr/bin/env python3
"""Classify dynamic shell syntax against workspace composition rules."""
from __future__ import annotations

from contracts import Decision

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
    "Rewrite WITHOUT dynamic-shell constructs (see project AGENTS.md / agent rules "
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


def deny(violations: list[str]) -> Decision:
    reason = (
        "Blocked before the permission prompt: this command uses "
        + "; ".join(violations)
        + ". These violate workspace shell composition policy. "
        + GUIDANCE
    )
    return Decision('deny', reason)




def run_test(args: list[str]) -> None:
    cmd = args[0] if args else sys.stdin.read()
    violations = find_violations(cmd)
    if violations:
        print("DENY — " + "; ".join(violations))
        sys.exit(1)
    print("PASS — no dynamic-shell constructs")
    sys.exit(0)




if __name__ == "__main__":
    run_test(sys.argv[2:] if sys.argv[1:2] == ["--test"] else sys.argv[1:])
