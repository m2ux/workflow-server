"""Record workspace trust during Codex deployment."""

import json
from pathlib import Path
import sys
import tomllib


def trust(workspace: Path, home: Path) -> None:
    config = home / ".codex/config.toml"
    config.parent.mkdir(parents=True, exist_ok=True)
    text = config.read_text() if config.exists() else ""
    projects = tomllib.loads(text).get("projects", {})
    existing = projects.get(str(workspace))
    if existing is not None:
        if existing.get("trust_level") != "trusted":
            raise ValueError(f"Codex project is untrusted: {workspace}; review project trust in Codex")
        print(f"Trusted Codex project in {config}")
        return
    header = f"[projects.{json.dumps(str(workspace), ensure_ascii=False)}]"
    block = f'{header}\ntrust_level = "trusted"\n'
    text = text.rstrip() + "\n\n" + block if text.strip() else block
    config.write_text(text.rstrip() + "\n")
    print(f"Trusted Codex project in {config}")


if __name__ == "__main__":
    trust(Path(sys.argv[1]).resolve(), Path.home())
