"""Load portable workspace permissions and expand deployment paths."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SBX = str(ROOT / "scripts/sbx")


def expand(value, workspace: Path, home: Path):
    if isinstance(value, str):
        return value.replace("__WORKSPACE__", str(workspace)).replace("__HOME__", str(home))
    if isinstance(value, list):
        return [expand(item, workspace, home) for item in value]
    if isinstance(value, dict):
        return {key: expand(item, workspace, home) for key, item in value.items()}
    return value


def load_policy(workspace: Path = ROOT, home: Path | None = None) -> dict:
    policy = json.loads((workspace / "config/permissions.json").read_text())
    return expand(policy, workspace, home or Path.home())
