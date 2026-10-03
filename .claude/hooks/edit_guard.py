"""PostToolUse adapter for the corpus edit guard.

Claude settings register this command, and Cursor imports those settings.
The skill script decides the verdict. A failure is written to stderr for
Claude and as additional_context for Cursor, then the process exits 2.
"""

import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
GUARD = ROOT / "skills/workflow-canon/scripts/edit_guard.py"


def file_path(payload: dict) -> str | None:
    args = payload.get("tool_input") or {}
    if not isinstance(args, dict):
        args = {}
    raw = args.get("file_path") or args.get("path") or payload.get("file_path")
    return raw if isinstance(raw, str) and raw else None


def guard_input(payload: dict) -> dict:
    body = {"cwd": payload.get("cwd") or ""}
    path = file_path(payload)
    if path:
        body["tool_input"] = {"file_path": path}
    return body


def outcome(code: int, err: str) -> tuple[int, str]:
    if code == 0:
        return 0, ""
    return 2, json.dumps({"additional_context": err})


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    script = GUARD
    if argv[:1] == ["--script"] and len(argv) == 2:
        script = Path(argv[1])
    payload = json.load(sys.stdin)
    if file_path(payload) is None or not script.is_file():
        if file_path(payload) and not script.is_file():
            err = f"Corpus guards cannot measure this edit: edit guard script is not at {script}\n"
            sys.stderr.write(err)
            sys.stdout.write(outcome(2, err)[1])
            return 2
        return 0
    proc = subprocess.run([sys.executable, str(script)], input=json.dumps(guard_input(payload)),
                          text=True, capture_output=True)
    code, encoded = outcome(proc.returncode, proc.stderr)
    if proc.stderr:
        sys.stderr.write(proc.stderr)
    if encoded:
        sys.stdout.write(encoded)
    return code


if __name__ == "__main__":
    sys.exit(main())
