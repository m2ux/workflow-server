"""Claude settings and hook registration contract."""

import json
from pathlib import Path
import shlex
import subprocess
import unittest

from render import render
from permissions import ROOT, load_policy


class ConfigTests(unittest.TestCase):
    def test_grants_and_registered_adapter(self):
        config = json.loads(render(ROOT, Path.home())[".claude/settings.json"])
        patterns = [p[5:-1] for p in config["permissions"]["allow"] if p.startswith("Bash(")]
        self.assertEqual(patterns, load_policy()["shell"])
        command = shlex.split(config["hooks"]["PreToolUse"][0]["hooks"][0]["command"])
        self.assertEqual(Path(command[1]), ROOT / ".claude/hooks/adapter.py")
        result = subprocess.run(command, input=json.dumps({"tool_name": "Bash", "cwd": str(ROOT),
                                "tool_input": {"command": "git status"}}),
                                text=True, capture_output=True, cwd="/tmp", check=True)
        self.assertEqual(json.loads(result.stdout)["hookSpecificOutput"]["permissionDecision"], "allow")


if __name__ == "__main__":
    unittest.main()
