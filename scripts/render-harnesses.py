#!/usr/bin/env python3
"""Render machine-local configuration using each harness's configuration adapter."""

import argparse
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent


def render(workspace: Path, home: Path, mcp: dict | None = None) -> dict[str, str]:
    outputs = {}
    for path in sorted(ROOT.glob(".*/config/render.py")):
        spec = importlib.util.spec_from_file_location(path.parent.parent.name + "_renderer", path)
        adapter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(adapter)
        outputs.update(adapter.render(workspace, home, mcp))
    return outputs


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, default=ROOT)
    parser.add_argument("--home", type=Path, default=Path.home())
    parser.add_argument("--mcp-stdin", action="store_true", help="Read resolved MCP config from stdin")
    parser.add_argument("--check", action="store_true", help="Report outdated generated files without writing")
    args = parser.parse_args()
    workspace = args.workspace.resolve()
    mcp = json.load(sys.stdin) if args.mcp_stdin else None
    stale = []
    for relative, content in render(workspace, args.home, mcp).items():
        path = workspace / relative
        if args.check:
            if not path.exists() or path.read_text() != content:
                stale.append(relative)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
            print(f"Rendered {path}")
    if stale:
        parser.exit(1, "Outdated harness config: " + ", ".join(stale) + "\n")


if __name__ == "__main__":
    main()
