"""Codex configuration and hook registration contracts."""

import json
from pathlib import Path
import shlex
import subprocess
import tempfile
import tomllib
import unittest

from render import render
from permissions import ROOT, load_policy


class ConfigTests(unittest.TestCase):
    def test_generated_configuration_and_registered_adapter(self):
        rendered = render(ROOT, Path.home(), {"mcpServers": {
            "example-server": {"command": "node", "args": ["a path/entry.js"], "env": {"TEST": "value"}},
        }})
        config = tomllib.loads(rendered[".codex/config.toml"])
        self.assertIn("call the `discover` tool", config["developer_instructions"])
        self.assertEqual(config["mcp_servers"]["example-server"]["args"], ["a path/entry.js"])
        self.assertEqual(config["sandbox_workspace_write"]["writable_roots"], load_policy()["directories"])
        hooks = json.loads(rendered[".codex/hooks.json"])["hooks"]
        self.assertEqual(set(hooks), {"PreToolUse", "PermissionRequest"})
        command = shlex.split(hooks["PermissionRequest"][0]["hooks"][0]["command"])
        self.assertEqual(Path(command[1]), ROOT / ".codex/hooks/adapter.py")
        result = subprocess.run(command, input=json.dumps({"tool_name": "Bash", "cwd": str(ROOT),
                                "tool_input": {"command": "git status"}, "hook_event_name": "PermissionRequest"}),
                                text=True, capture_output=True, cwd="/tmp", check=True)
        self.assertEqual(json.loads(result.stdout)["hookSpecificOutput"]["decision"]["behavior"], "allow")

    def test_existing_mcp_configuration_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ("config", "rules", ".codex"):
                (root / name).mkdir()
            (root / "config/permissions.json").write_text((ROOT / "config/permissions.json").read_text())
            (root / ".codex/config.toml").write_text('[mcp_servers.local]\ncommand = "local-server"\n')
            config = tomllib.loads(render(root, Path.home())[".codex/config.toml"])
            self.assertEqual(config["mcp_servers"]["local"]["command"], "local-server")


if __name__ == "__main__":
    unittest.main()
