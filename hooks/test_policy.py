"""Behavioral coverage for common policy and harness wire contracts."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import tomllib
import unittest

from adapters import claude_permissions, decode, encode
from contracts import Decision, Request
from permissions import ROOT, load_policy
from policy import evaluate

spec = importlib.util.spec_from_file_location("renderer", ROOT / "scripts/render-harnesses.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


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
        self.assertEqual(self.shell("python3 hooks/dispatch.py claude").action, "allow")
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

    def test_shared_patterns_have_no_claude_tool_wrappers(self):
        policy = load_policy()
        self.assertTrue(all(not p.startswith("Bash(") and ":*" not in p for p in policy["shell"]))
        self.assertIn(str(ROOT / "scripts/sbx") + " *", policy["shell"])


class AdapterTests(unittest.TestCase):
    def test_shell_payloads_have_equivalent_requests(self):
        expected = Request("shell", "git status", "/tmp/repo")
        payload = {"tool_name": "Bash", "tool_input": {"command": "git status"}, "cwd": "/tmp/repo"}
        self.assertEqual(decode("claude", payload), expected)
        self.assertEqual(decode("codex", payload), expected)
        self.assertEqual(decode("claude", dict(payload, tool_name="Shell")), expected)

    def test_claude_preserves_all_decisions(self):
        for action in ("deny", "ask", "allow"):
            output = encode("claude", "PreToolUse", Decision(action, "reason"))
            self.assertEqual(output["hookSpecificOutput"]["permissionDecision"], action)
        self.assertIsNone(encode("claude", "PreToolUse", Decision("abstain")))

    def test_command_workdir_overrides_session_cwd(self):
        payload = {"tool_name": "Bash", "tool_input": {"command": "pwd", "workdir": "component"}, "cwd": "/tmp/repo"}
        self.assertEqual(decode("codex", payload).cwd, "/tmp/repo/component")

    def test_codex_native_approval_delegation(self):
        output = encode("codex", "PreToolUse", Decision("ask", "sensitive operation"))
        self.assertNotIn("permissionDecision", output["hookSpecificOutput"])
        for action in ("ask", "abstain"):
            self.assertIsNone(encode("codex", "PermissionRequest", Decision(action)))
        self.assertIsNone(encode("codex", "PreToolUse", Decision("allow")))
        allowed = encode("codex", "PermissionRequest", Decision("allow"))
        self.assertEqual(allowed["hookSpecificOutput"]["decision"], {"behavior": "allow"})
        denied = encode("codex", "PermissionRequest", Decision("deny", "blocked"))
        self.assertEqual(denied["hookSpecificOutput"]["decision"], {"behavior": "deny", "message": "blocked"})

    def test_claude_user_extensions_stay_at_the_adapter_boundary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".claude").mkdir()
            (root / ".claude/settings.json").write_text(json.dumps({"permissions": {"allow": ["Bash(custom-tool:*)"]}}))
            policy = claude_permissions(home=root, project=root)
            self.assertIn("custom-tool *", policy["shell"])
            self.assertNotIn("custom-tool *", load_policy()["shell"])

    def test_cursor_imported_hook(self):
        result = self.dispatch("claude", json.dumps({"tool_name": "Shell", "hook_event_name": "preToolUse",
                              "cwd": str(ROOT), "tool_input": {"command": "echo $HOME"}}))
        self.assertEqual(result["hookSpecificOutput"]["permissionDecision"], "deny")
        self.assertEqual(result["hookSpecificOutput"]["hookEventName"], "PreToolUse")

    def dispatch(self, harness, payload):
        result = subprocess.run([sys.executable, str(ROOT / "hooks/dispatch.py"), harness],
                                input=payload, text=True, capture_output=True, cwd="/tmp", check=True)
        return json.loads(result.stdout) if result.stdout.strip() else None

    def test_registered_entrypoint_decides_from_another_cwd(self):
        payload = json.dumps({"tool_name": "Bash", "cwd": str(ROOT),
                              "tool_input": {"command": "git status"}, "hook_event_name": "PermissionRequest"})
        result = self.dispatch("codex", payload)
        self.assertEqual(result["hookSpecificOutput"]["decision"]["behavior"], "allow")

    def test_malformed_input_does_not_grant_permission(self):
        for harness in ("claude", "codex"):
            for payload in ("invalid", "[]", '{"tool_name":"Bash","tool_input":{}}'):
                with self.subTest(harness=harness, payload=payload):
                    result = self.dispatch(harness, payload)
                    action = result.get("permission") or result["hookSpecificOutput"]["permissionDecision"]
                    self.assertEqual(action, "deny")


class RendererTests(unittest.TestCase):
    def test_generated_configs(self):
        rendered = renderer.render(ROOT, Path("/home/test"), {"mcpServers": {
            "example-server": {"command": "node", "args": ["a path/entry.js"], "env": {"TEST": "value"}},
        }})
        claude = json.loads(rendered[".claude/settings.json"])
        policy = load_policy(ROOT, Path("/home/test"))
        patterns = [p[5:-1] for p in claude["permissions"]["allow"] if p.startswith("Bash(")]
        self.assertEqual(patterns, policy["shell"])
        codex = tomllib.loads(rendered[".codex/config.toml"])
        self.assertIn("call the `discover` tool", codex["developer_instructions"])
        self.assertEqual(codex["mcp_servers"]["example-server"]["args"], ["a path/entry.js"])
        self.assertEqual(codex["sandbox_workspace_write"]["writable_roots"], policy["directories"])
        hooks = json.loads(rendered[".codex/hooks.json"])["hooks"]
        self.assertEqual(set(hooks), {"PreToolUse", "PermissionRequest"})
        self.assertIn("dispatch.py", hooks["PermissionRequest"][0]["hooks"][0]["command"])
        self.assertNotIn(".cursor/hooks.json", rendered)

    def test_renderer_check_detects_drift(self):
        with tempfile.TemporaryDirectory(prefix="harness-render-") as directory:
            root = Path(directory)
            for name in ("config", "rules", ".claude"):
                (root / name).mkdir()
            for relative in ("config/permissions.json", ".claude/settings.template.json", "rules/workflow-server.md"):
                (root / relative).write_text((ROOT / relative).read_text())
            (root / ".mcp.json").write_text('{"mcpServers":{}}')
            command = [sys.executable, str(ROOT / "scripts/render-harnesses.py"), "--workspace", str(root)]
            subprocess.run(command, check=True, capture_output=True)
            subprocess.run(command + ["--check"], check=True, capture_output=True)
            config = root / ".codex/config.toml"
            config.write_text(config.read_text() + '\n[mcp_servers.local]\ncommand = "local-server"\n')
            subprocess.run(command, check=True, capture_output=True)
            self.assertEqual(tomllib.loads(config.read_text())["mcp_servers"]["local"]["command"], "local-server")
            (root / ".codex/hooks.json").write_text("{}")
            result = subprocess.run(command + ["--check"], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn(".codex/hooks.json", result.stderr)


if __name__ == "__main__":
    unittest.main()
