"""Edit-guard adapter: path translation and the failure Cursor and Claude both read."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from edit_guard import GUARD, ROOT, file_path, guard_input, outcome


class EditGuardAdapterTests(unittest.TestCase):
    def test_paths_from_either_harness(self):
        self.assertEqual(file_path({"tool_input": {"file_path": "a.md"}}), "a.md")
        self.assertEqual(file_path({"tool_input": {"path": "b.md"}, "cwd": "/w"}), "b.md")
        self.assertEqual(guard_input({"tool_input": {"path": "b.md"}, "cwd": "/w"}),
                         {"cwd": "/w", "tool_input": {"file_path": "b.md"}})
        self.assertIsNone(file_path({"tool_name": "Shell", "tool_input": {"command": "true"}}))

    def test_failure_is_context_and_exit_2(self):
        code, encoded = outcome(2, "introduced\n")
        self.assertEqual(code, 2)
        self.assertEqual(json.loads(encoded)["additional_context"], "introduced\n")
        self.assertEqual(outcome(0, ""), (0, ""))

    def test_registered_script_and_a_stub_failure(self):
        self.assertEqual(GUARD, ROOT / "skills/workflow-canon/scripts/edit_guard.py")
        with tempfile.TemporaryDirectory() as directory:
            stub = Path(directory) / "stub.py"
            stub.write_text("import sys\nsys.stderr.write('introduced\\n')\nraise SystemExit(2)\n")
            proc = subprocess.run([sys.executable, str(ROOT / ".claude/hooks/edit_guard.py"), "--script", str(stub)],
                                  input=json.dumps({"tool_input": {"path": "corpus/x/workflow.yaml"}, "cwd": "/w"}),
                                  text=True, capture_output=True, check=False)
        self.assertEqual(proc.returncode, 2)
        self.assertEqual(proc.stderr, "introduced\n")
        self.assertEqual(json.loads(proc.stdout)["additional_context"], "introduced\n")


if __name__ == "__main__":
    unittest.main()
