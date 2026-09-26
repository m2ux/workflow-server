"""Claude and imported Cursor event behavior."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from adapter import decode, encode, load_permissions
from contracts import Decision, Request
from permissions import ROOT, load_policy


class AdapterTests(unittest.TestCase):
    def test_shell_names_and_decisions(self):
        for name in ("Bash", "Shell"):
            request = decode({"tool_name": name, "tool_input": {"command": "git status"}, "cwd": "/tmp/repo"})
            self.assertEqual(request, Request("shell", "git status", "/tmp/repo"))
        for action in ("deny", "ask", "allow"):
            self.assertEqual(encode("PreToolUse", Decision(action))["hookSpecificOutput"]["permissionDecision"], action)
        self.assertIsNone(encode("PreToolUse", Decision("abstain")))

    def test_user_extensions_stay_at_the_adapter_boundary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".claude").mkdir()
            (root / ".claude/settings.json").write_text(json.dumps({"permissions": {"allow": ["Bash(custom-tool:*)"]}}))
            self.assertIn("custom-tool *", load_permissions(home=root, project=root)["shell"])
            self.assertNotIn("custom-tool *", load_policy()["shell"])

    def dispatch(self, payload):
        result = subprocess.run([sys.executable, str(Path(__file__).with_name("adapter.py"))],
                                input=payload, text=True, capture_output=True, cwd="/tmp", check=True)
        return json.loads(result.stdout) if result.stdout.strip() else None

    def test_cursor_imported_event_from_another_cwd(self):
        result = self.dispatch(json.dumps({"tool_name": "Shell", "hook_event_name": "preToolUse",
                               "cwd": str(ROOT), "tool_input": {"command": "echo $HOME"}}))
        self.assertEqual(result["hookSpecificOutput"]["permissionDecision"], "deny")
        self.assertEqual(result["hookSpecificOutput"]["hookEventName"], "PreToolUse")

    def test_invalid_input_denies(self):
        for payload in ("invalid", "[]", '{"tool_name":"Bash","tool_input":{}}'):
            with self.subTest(payload=payload):
                self.assertEqual(self.dispatch(payload)["hookSpecificOutput"]["permissionDecision"], "deny")


if __name__ == "__main__":
    unittest.main()
