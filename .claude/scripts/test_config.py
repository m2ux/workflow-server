"""Claude settings and hook registration contract."""

import json
from pathlib import Path
import shlex
import subprocess
import unittest

from render import render
from permissions import ROOT, load_policy


class ConfigTests(unittest.TestCase):
    def test_every_permission_category_and_placeholders(self):
        home = Path('/home/test user')
        policy = load_policy(ROOT, home)
        config = json.loads(render(ROOT, home)['.claude/settings.json'])
        expected = [f'Bash({value})' for value in policy['shell']]
        names = {'read': 'Read', 'write': 'Write', 'edit': 'Edit', 'multiedit': 'MultiEdit', 'notebookedit': 'NotebookEdit'}
        for key, name in names.items():
            expected.extend(f'{name}({value})' for value in policy['files'][key])
        expected.extend(f'WebFetch(domain:{value})' for value in policy['webDomains'])
        expected.extend(f'mcp__{value}__*' for value in policy['mcpServers'])
        expected.extend(f'Skill({value})' for value in policy['skills'])
        expected.extend(policy['tools'])
        self.assertCountEqual(config['permissions']['allow'], expected)
        self.assertEqual(len(expected), 169)
        self.assertEqual(config['permissions']['additionalDirectories'], [str(home / 'projects'), '/tmp'])
        self.assertNotIn('__HOME__', json.dumps(config))
        self.assertNotIn('__WORKSPACE__', json.dumps(config))

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
