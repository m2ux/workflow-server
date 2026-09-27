#!/usr/bin/env python3
"""Match URL prefixes from config/webfetch-allow.json."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

def _config_path() -> Path:
    """config/webfetch-allow.json beside the directory that holds this script."""
    return Path(__file__).resolve().parent.parent / "config" / "webfetch-allow.json"


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






def run_test(args: list[str]) -> None:
    if not args:
        print("usage: webfetch_allow.py --test <url>", file=sys.stderr)
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




if __name__ == "__main__":
    run_test(sys.argv[2:] if sys.argv[1:2] == ["--test"] else sys.argv[1:])
