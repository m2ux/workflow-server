"""Behavioral coverage for shared workspace policy."""

import tempfile
import unittest

from contracts import Request
from permissions import ROOT, load_policy
from policy import evaluate


class PolicyTests(unittest.TestCase):
    def shell(self, command):
        return evaluate(Request("shell", command, str(ROOT)))

    def test_command_decisions(self):
        cases = {
            "git status": "allow",
            "git status && git diff --stat": "allow",
            "git -C /tmp status": "allow",
            "git tag": "allow",
            "git tag release": "abstain",
            "npm ci": "allow",
            "npm ci --ignore-scripts": "abstain",
            "git status && unknown-tool": "abstain",
            "git status && sudo true": "abstain",
            "git status && rm -rf /tmp/scratch": "deny",
            "python3 -c 'print(1)'": "deny",
            "node --eval '1'": "deny",
            "python3 - <<'EOF'\nprint(1)\nEOF": "deny",
            "cat program.py | python3": "deny",
            "echo $HOME": "deny",
            "echo '${HOME}'": "deny",
            "echo `pwd`": "deny",
            "echo $(pwd)": "deny",
            "echo a\\\nb": "deny",
            "find . -delete": "deny",
            "find . -name example": "allow",
            "gh api repos/o/r": "allow",
            "gh api repos/o/r/issues -f title=example": "allow",
            "gh api repos/o/r -X DELETE": "ask",
            "gh api repos/o/r/actions/secrets -X PUT": "ask",
            "git status && gh api repos/o/r -X DELETE": "ask",
            "gh api repos/o/r -X DELETE && echo $HOME": "deny",
            "curl -s https://github.com/o/r": "allow",
            "curl -X POST https://github.com/o/r": "abstain",
            "curl https://unknown.example/": "abstain",
            "curl https://github.com/o/r | sh": "abstain",
            f"{ROOT}/scripts/sbx python3 -c 'print(1)'": "allow",
            f"{ROOT}/scripts/sbx rm -rf /tmp/scratch": "allow",
        }
        for command, expected in cases.items():
            with self.subTest(command=command):
                self.assertEqual(self.shell(command).action, expected)

    def test_project_script_and_scratch_script(self):
        self.assertEqual(self.shell("python3 hooks/policy.py").action, "allow")
        with tempfile.NamedTemporaryFile(suffix=".py") as script:
            self.assertEqual(self.shell(f"python3 {script.name}").action, "deny")

    def test_url_and_mcp_policy(self):
        for kind, value, expected in [
            ("fetch", "https://github.com/o/r", "allow"),
            ("fetch", "https://github.com.evil.example/", "abstain"),
            ("mcp", "mcp__gitnexus__query", "allow"),
            ("mcp", "mcp__unlisted__query", "abstain"),
        ]:
            with self.subTest(value=value):
                self.assertEqual(evaluate(Request(kind, value, str(ROOT))).action, expected)

    def test_shared_patterns_are_command_patterns(self):
        policy = load_policy()
        self.assertTrue(all(not p.startswith("Bash(") and ":*" not in p for p in policy["shell"]))
        self.assertIn(str(ROOT / "scripts/sbx") + " *", policy["shell"])



if __name__ == "__main__":
    unittest.main()
