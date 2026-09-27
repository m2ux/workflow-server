"""Execute generated hook entry points with session-shaped requests.

Command fixtures are classified as data; no requested operation is executed.
"""

import importlib.util
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('harness_renderer', ROOT / 'scripts/render-harnesses.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


class HarnessIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix='harness session ')
        cls.addClassCleanup(cls.temporary.cleanup)
        cls.home = Path(cls.temporary.name)
        cls.rendered = renderer.render(ROOT, cls.home, {'mcpServers': {}})
        cls.registrations = {
            'claude': json.loads(cls.rendered['.claude/settings.json'])['hooks'],
            'codex': json.loads(cls.rendered['.codex/hooks.json'])['hooks'],
        }

    def dispatch(self, harness, event, name, args, *, cwd=ROOT):
        groups = self.registrations[harness][event]
        matched = [group for group in groups if re.search(group['matcher'], name)]
        self.assertEqual(len(matched), 1)
        command = shlex.split(matched[0]['hooks'][0]['command'])
        payload = {'session_id': 'validation', 'turn_id': 'validation-turn',
                   'tool_use_id': 'validation-call', 'transcript_path': None,
                   'permission_mode': 'default', 'hook_event_name': event,
                   'cwd': str(cwd), 'tool_name': name, 'tool_input': args}
        env = dict(os.environ, CLAUDE_PROJECT_DIR=str(self.home))
        # Keep user-specific grants out of these reproducible policy checks.
        env['HOME'] = str(self.home)
        env['SBX_PROJECTS_BASE'] = str(ROOT.parents[3])
        result = subprocess.run(command, input=json.dumps(payload), cwd='/tmp', env=env,
                                capture_output=True, text=True, timeout=5, check=True)
        self.assertFalse(result.stderr, result.stderr)
        return json.loads(result.stdout)['hookSpecificOutput'] if result.stdout.strip() else None

    def test_every_classifier_through_generated_adapters(self):
        cases = [
            ('git status', 'allow'),
            ('git status && git diff --stat', 'allow'),
            ('git status && unknown-tool', 'abstain'),
            ('git tag release', 'abstain'),
            ('echo $HOME', 'deny'),
            ('find . -exec echo {} ;', 'deny'),
            ('python3 -c "print(1)"', 'deny'),
            ('cat fixture.py | node', 'deny'),
            ('rm /tmp/harness-fixture', 'deny'),
            ('gh api repos/o/r -X DELETE', 'ask'),
            ('gh api repos/o/r/actions/secrets -X PUT', 'ask'),
            ('gh api repos/o/r -X DELETE && echo $HOME', 'deny'),
            ('curl -I https://github.com/o/r', 'allow'),
            ('curl -X POST https://github.com/o/r', 'abstain'),
            ('curl https://github.com.evil.example/', 'abstain'),
            ('python3 hooks/policy.py', 'allow'),
            (f'{ROOT}/scripts/sbx python3 -c "print(1)"', 'allow'),
        ]
        for command, action in cases:
            for harness, event in [('claude', 'PreToolUse'), ('codex', 'PreToolUse'), ('codex', 'PermissionRequest')]:
                with self.subTest(command=command, harness=harness, event=event):
                    output = self.dispatch(harness, event, 'Bash', {'command': command})
                    if harness == 'claude':
                        self.assertEqual(output['permissionDecision'] if output else 'abstain', action)
                    elif event == 'PermissionRequest':
                        self.assertEqual(output['decision']['behavior'] if output else None,
                                         action if action in ('allow', 'deny') else None)
                    elif action == 'deny':
                        self.assertEqual(output['permissionDecision'], 'deny')
                    elif action == 'ask':
                        self.assertIn('additionalContext', output)
                        self.assertNotIn('permissionDecision', output)
                    else:
                        self.assertIsNone(output)

    def test_session_workdir_overrides_session_cwd(self):
        output = self.dispatch('codex', 'PermissionRequest', 'Bash',
                               {'command': 'python3 hooks/policy.py', 'workdir': str(ROOT)}, cwd='/tmp')
        self.assertEqual(output['decision']['behavior'], 'allow')

    def test_cursor_shell_and_claude_web(self):
        output = self.dispatch('claude', 'PreToolUse', 'Shell', {'command': 'git status'})
        self.assertEqual(output['permissionDecision'], 'allow')
        for url, expected in [('https://github.com/o/r', 'allow'), ('https://github.com.evil.example/', None)]:
            with self.subTest(url=url):
                output = self.dispatch('claude', 'PreToolUse', 'WebFetch', {'url': url})
                self.assertEqual(output['permissionDecision'] if output else None, expected)

    def test_mcp_server_names_have_exact_boundaries(self):
        for name, expected in [('mcp__gitnexus__query', 'allow'), ('mcp__gitnexus_extra__query', None),
                               ('mcp__unknown__query', None)]:
            with self.subTest(name=name):
                output = self.dispatch('codex', 'PermissionRequest', name, {'query': 'validation'})
                self.assertEqual(output['decision']['behavior'] if output else None, expected)

    def test_permission_request_invalid_input_denies_in_approval_format(self):
        for args in ({}, {'command': 42}, {'command': 'git status', 'workdir': 42}):
            with self.subTest(args=args):
                output = self.dispatch('codex', 'PermissionRequest', 'Bash', args)
                self.assertEqual(output['hookEventName'], 'PermissionRequest')
                self.assertEqual(output['decision']['behavior'], 'deny')


if __name__ == '__main__':
    unittest.main()
