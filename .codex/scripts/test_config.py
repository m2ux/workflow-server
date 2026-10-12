"""Codex configuration and hook registration contracts."""

import json
from pathlib import Path
import shlex
import subprocess
import tempfile
import tomllib
import unittest

from render import MARKETPLACE_NAME, PLUGIN, codex_config, plugin_version, render
from permissions import ROOT, load_policy


class ConfigTests(unittest.TestCase):
    def test_unicode_and_quoted_paths_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'workspace "🧪"'
            (root / 'rules').mkdir(parents=True)
            (root / 'rules/example.md').write_text('---\nalwaysApply: true\n---\nRule 🧪')
            config = tomllib.loads(codex_config(root, Path.home(), {'directories': [str(root)]},
                                               {'mcpServers': {'test': {'command': 'tool 🧪', 'args': ['a "quote"']}}}))
            self.assertEqual(config['developer_instructions'], 'Rule 🧪')
            self.assertEqual(config['mcp_servers']['test']['command'], 'tool 🧪')
            self.assertEqual(config['sandbox_workspace_write']['writable_roots'], [str(root)])

    def test_generated_configuration_and_registered_adapter(self):
        rendered = render(ROOT, Path.home(), {"mcpServers": {
            "example-server": {"command": "node", "args": ["a path/entry.js"], "env": {"TEST": "value"}},
        }})
        config = tomllib.loads(rendered[".codex/config.toml"])
        self.assertIn("call the `discover` tool", config["developer_instructions"])
        self.assertEqual(config["mcp_servers"]["example-server"]["args"], ["a path/entry.js"])
        self.assertEqual(config["sandbox_workspace_write"]["writable_roots"], load_policy()["directories"])
        hooks = json.loads(rendered[".codex/plugin/hooks/hooks.json"])["hooks"]
        self.assertEqual(set(hooks), {"PreToolUse", "PermissionRequest"})
        command = shlex.split(hooks["PermissionRequest"][0]["hooks"][0]["command"])
        self.assertEqual(Path(command[1]), ROOT / ".codex/hooks/adapter.py")
        result = subprocess.run(command, input=json.dumps({"tool_name": "Bash", "cwd": str(ROOT),
                                "tool_input": {"command": "git status"}, "hook_event_name": "PermissionRequest"}),
                                text=True, capture_output=True, cwd="/tmp", check=True)
        self.assertEqual(json.loads(result.stdout)["hookSpecificOutput"]["decision"]["behavior"], "allow")

    def test_plugin_is_discoverable_through_a_local_marketplace(self):
        """Codex reads hooks from an installed plugin, so the workspace is a marketplace of one."""
        rendered = render(ROOT, Path.home(), {"mcpServers": {}})
        marketplace = json.loads(rendered[".agents/plugins/marketplace.json"])
        entry = marketplace["plugins"][0]
        manifest = json.loads(rendered[".codex/plugin/.codex-plugin/plugin.json"])
        self.assertEqual(marketplace["name"], MARKETPLACE_NAME)
        self.assertEqual(entry["name"], manifest["name"])
        self.assertEqual(entry["source"], {"source": "local", "path": f"./{PLUGIN}"})
        self.assertIn(f"{PLUGIN}/hooks/hooks.json", rendered)
        self.assertIn(f"{PLUGIN}/.codex-plugin/plugin.json", rendered)

    def test_plugin_version_tracks_the_registration(self):
        """The plugin cache keys on version, so a changed registration must reinstall."""
        first = json.loads(render(ROOT, Path.home(), {"mcpServers": {}})[
            ".codex/plugin/.codex-plugin/plugin.json"])["version"]
        changed = plugin_version({"hooks": {"PreToolUse": [{"matcher": "^Other$"}]}})
        self.assertNotEqual(first, changed)
        again = json.loads(render(ROOT, Path.home(), {"mcpServers": {}})[
            ".codex/plugin/.codex-plugin/plugin.json"])["version"]
        self.assertEqual(first, again)

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
