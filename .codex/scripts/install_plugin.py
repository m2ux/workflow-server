"""Register the workspace marketplace with Codex and install its policy plugin.

Codex discovers hooks through an installed plugin, so the rendered registration
reaches a session only once the marketplace is configured and the plugin is
added. The plugin cache keys on version, and the rendered version tracks the
registration's content, so a changed registration installs as a new version.

Each newly installed hook is untrusted until a person reviews it through /hooks.
"""

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from render import MARKETPLACE_NAME, PLUGIN_NAME


def codex(executable: str, *arguments: str) -> subprocess.CompletedProcess:
    return subprocess.run([executable, "plugin", *arguments], text=True, capture_output=True)


def install(workspace: Path, executable: str) -> int:
    manifest = workspace / ".codex/plugin/.codex-plugin/plugin.json"
    if not manifest.is_file():
        print(f"No rendered plugin at {manifest}; run scripts/render-harnesses.py first.",
              file=sys.stderr)
        return 1
    if shutil.which(executable) is None and not Path(executable).is_file():
        # Claude and Cursor deploy from the same run, so an absent Codex is a skip.
        print(f"Codex executable {executable!r} is not installed; plugin registration skipped.")
        return 0
    version = json.loads(manifest.read_text())["version"]
    added = codex(executable, "marketplace", "add", str(workspace))
    if added.returncode != 0 and "already" not in (added.stderr + added.stdout).lower():
        print(added.stderr.strip() or added.stdout.strip(), file=sys.stderr)
        return 1
    installed = codex(executable, "add", f"{PLUGIN_NAME}@{MARKETPLACE_NAME}")
    if installed.returncode != 0:
        print(installed.stderr.strip() or installed.stdout.strip(), file=sys.stderr)
        return 1
    print(f"Installed Codex plugin {PLUGIN_NAME} {version} from {MARKETPLACE_NAME}.")
    print("Review its hook registrations through /hooks before they run.")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, default=HERE.parents[1])
    parser.add_argument("--codex", default="codex")
    arguments = parser.parse_args()
    try:
        raise SystemExit(install(arguments.workspace.resolve(), arguments.codex))
    except OSError as error:
        parser.exit(1, f"Codex plugin install failed: {error}\n")


if __name__ == "__main__":
    main()
