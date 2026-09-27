"""Protocol and failure handling at the shared hook boundary."""

import io
import json
import unittest
from unittest.mock import patch

from contracts import Request
from protocol import decode_request, pre_tool_response
from runtime import run


class RuntimeTests(unittest.TestCase):
    def dispatch(self, payload, permissions=lambda: {"shell": [], "webDomains": [], "mcpServers": []}):
        with patch('sys.stdin', io.StringIO(payload)), patch('sys.stdout', new_callable=io.StringIO) as output:
            run(lambda value: decode_request(value, shell_names=('Bash',)), pre_tool_response,
                events={'PreToolUse': 'PreToolUse'}, permissions=permissions)
        return json.loads(output.getvalue()) if output.getvalue() else None

    def test_invalid_payloads_deny(self):
        cases = ['{', 'null', '[]', '42']
        cases += [json.dumps({'tool_name': 'Bash', 'tool_input': args})
                  for args in ({}, [], {'command': None}, {'command': 7}, {'command': 'pwd', 'workdir': 7})]
        for value in cases:
            with self.subTest(value=value):
                self.assertEqual(self.dispatch(value)['hookSpecificOutput']['permissionDecision'], 'deny')

    def test_unknown_tool_abstains(self):
        self.assertIsNone(self.dispatch(json.dumps({'tool_name': 'apply_patch', 'tool_input': {'command': 'patch data'}})))

    def test_unknown_event_denies(self):
        result = self.dispatch(json.dumps({'hook_event_name': 'unexpected', 'tool_name': 'Bash', 'tool_input': {'command': 'pwd'}}))
        self.assertEqual(result['hookSpecificOutput']['permissionDecision'], 'deny')

    def test_permission_load_failure_denies(self):
        def unavailable():
            raise OSError('policy unavailable')
        result = self.dispatch(json.dumps({'tool_name': 'Bash', 'tool_input': {'command': 'git status'}}), unavailable)
        self.assertEqual(result['hookSpecificOutput']['permissionDecision'], 'deny')
        self.assertIn('policy unavailable', result['hookSpecificOutput']['permissionDecisionReason'])

    def test_session_and_command_working_directories(self):
        for args, expected in [({'command': 'pwd'}, '/project'),
                               ({'command': 'pwd', 'workdir': 'child'}, '/project/child'),
                               ({'command': 'pwd', 'cwd': '/other'}, '/other')]:
            with self.subTest(args=args):
                self.assertEqual(decode_request({'tool_name': 'Bash', 'cwd': '/project', 'tool_input': args},
                                               shell_names=('Bash',)), Request('shell', 'pwd', expected))


if __name__ == '__main__':
    unittest.main()
