"""Codex tool-event and native approval behavior."""

import json
from pathlib import Path
import subprocess
import sys
import unittest

from adapter import decode, encode
from contracts import Decision, Request
from permissions import ROOT


class AdapterTests(unittest.TestCase):
    def test_shell_request_and_workdir(self):
        payload = {"tool_name": "Bash", "tool_input": {"command": "pwd", "workdir": "component"}, "cwd": "/tmp/repo"}
        self.assertEqual(decode(payload), Request("shell", "pwd", "/tmp/repo/component"))
        self.assertEqual(decode(dict(payload, tool_name="Shell")).kind, "unknown")

    def test_native_approval_delegation(self):
        output = encode("PreToolUse", Decision("ask", "sensitive operation"))
        self.assertNotIn("permissionDecision", output["hookSpecificOutput"])
        for action in ("ask", "abstain"):
            self.assertIsNone(encode("PermissionRequest", Decision(action)))
        self.assertIsNone(encode("PreToolUse", Decision("allow")))
        self.assertEqual(encode("PermissionRequest", Decision("allow"))["hookSpecificOutput"]["decision"], {"behavior": "allow"})
        denied = encode("PermissionRequest", Decision("deny", "blocked"))
        self.assertEqual(denied["hookSpecificOutput"]["decision"], {"behavior": "deny", "message": "blocked"})

    def dispatch(self, payload):
        result = subprocess.run([sys.executable, str(Path(__file__).with_name("adapter.py"))],
                                input=payload, text=True, capture_output=True, cwd="/tmp", check=True)
        return json.loads(result.stdout) if result.stdout.strip() else None

    def test_approval_from_another_cwd(self):
        result = self.dispatch(json.dumps({"tool_name": "Bash", "cwd": str(ROOT),
                              "tool_input": {"command": "git status"}, "hook_event_name": "PermissionRequest"}))
        self.assertEqual(result["hookSpecificOutput"]["decision"]["behavior"], "allow")

    def test_invalid_input_denies(self):
        for payload in ("invalid", "[]", '{"tool_name":"Bash","tool_input":{}}'):
            with self.subTest(payload=payload):
                self.assertEqual(self.dispatch(payload)["hookSpecificOutput"]["permissionDecision"], "deny")


if __name__ == "__main__":
    unittest.main()
