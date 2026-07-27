#!/usr/bin/env python3
"""
PreToolUse hook for WebFetch: auto-approve fetches whose URL starts with
any prefix listed in the companion config file.

Claude Code's built-in WebFetch permission rules only support hostname-level
matching (`WebFetch(domain:host)`), so URL paths cannot be expressed in the
allow list. This hook closes that gap.

Config: webfetch-allow.json next to this hook (else ~/.claude/hooks/webfetch-allow.json)
    {
      "allowPrefixes": [
        "https://github.com/",
        "https://docs.example.com/api/"
      ]
    }

Behavior:
- If the WebFetch URL starts with any configured prefix, emit
  {permissionDecision: "allow"} and exit.
- Otherwise stay silent — normal permission flow takes over (prompt or
  domain-level allow rule, whichever applies).
- If the config file is missing, malformed, or unreadable, stay silent.

Debug: set WEBFETCH_HOOK_DEBUG=1 to print analysis to stderr.
Dry-run: python3 webfetch-allow.py --test https://github.com/org/repo
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

def _config_path() -> Path:
    """Prefer config next to this hook; fall back to ~/.claude/hooks/."""
    local = Path(__file__).resolve().parent / "webfetch-allow.json"
    if local.is_file():
        return local
    return Path.home() / ".claude" / "hooks" / "webfetch-allow.json"


CONFIG_PATH = _config_path()


def debug(*args: object) -> None:
    if os.environ.get("WEBFETCH_HOOK_DEBUG"):
        print("[webfetch-hook]", *args, file=sys.stderr)


def load_prefixes() -> list[str]:
    try:
        data = json.loads(CONFIG_PATH.read_text())
    except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
        debug(f"config unavailable: {e}")
        return []
    raw = data.get("allowPrefixes")
    if not isinstance(raw, list):
        debug("config missing allowPrefixes list")
        return []
    return [str(p) for p in raw if isinstance(p, str) and p]


def matches(url: str, prefixes: list[str]) -> str | None:
    for p in prefixes:
        if url.startswith(p):
            return p
    return None


def emit_allow(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "allow",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def run_hook() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)
    if payload.get("tool_name") != "WebFetch":
        sys.exit(0)
    url = payload.get("tool_input", {}).get("url")
    if not isinstance(url, str) or not url:
        sys.exit(0)
    prefixes = load_prefixes()
    debug(f"url: {url!r}")
    debug(f"prefixes: {prefixes!r}")
    hit = matches(url, prefixes)
    if hit:
        emit_allow(f"matched prefix {hit!r}")
    debug("no match — silent pass-through")
    sys.exit(0)


def run_test(args: list[str]) -> None:
    if not args:
        print("usage: webfetch-allow.py --test <url>", file=sys.stderr)
        sys.exit(2)
    url = args[0]
    prefixes = load_prefixes()
    print(f"prefixes: {prefixes!r}")
    hit = matches(url, prefixes)
    if hit:
        print(f"decision: ALLOW — matched {hit!r}")
        sys.exit(0)
    print("decision: pass-through — no prefix matched")
    sys.exit(1)


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
    except Exception as e:
        debug(f"error: {e}")
        sys.exit(0)
