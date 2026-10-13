"""Verdict equivalence between the baseline hook pipeline and the harness adapters.

The baseline revision registers six Claude PreToolUse hooks whose verdicts the
harness merges, deny over ask over allow, and leaves a direct single command to
the Claude allow list. The adapter reaches one verdict from the shared evaluator
and the permission file. Both sides receive the same requests and must agree on
the effective outcome: the merged hook verdict, or the allow-list match when
every hook abstains.

Command fixtures are classified as data. No corpus entry is executed.
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
sys.path.insert(0, str(ROOT / "hooks"))

from compound_bash_allow import split_compound  # noqa: E402

BASELINE = "41717141ec6cd9cc297044e084a58ef6acf11ff7"
BASELINE_PATHS = ("hooks", "config", "scripts", ".claude")
PRECEDENCE = ("deny", "ask", "allow")

spec = importlib.util.spec_from_file_location("harness_renderer", ROOT / "scripts/render-harnesses.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


def expand(text: str, workspace: Path, home: Path) -> str:
    return text.replace("__WORKSPACE__", str(workspace)).replace("__HOME__", str(home))


def merge(verdicts: list[str]) -> str:
    """The outcome the harness reaches from several hook verdicts."""
    for action in PRECEDENCE:
        if action in verdicts:
            return action
    return "abstain"


def grant_body(rule: str, prefix: str) -> str | None:
    """The pattern inside a permission rule, with ':*' written as ' *'."""
    if not (rule.startswith(prefix + "(") and rule.endswith(")")):
        return None
    body = rule[len(prefix) + 1:-1]
    return body[:-2] + " *" if body.endswith(":*") else body


def allow_list_grants(allow: list[str], prefix: str) -> list[str]:
    return [body for body in (grant_body(rule, prefix) for rule in allow) if body is not None]


def web_domains(allow: list[str]) -> list[str]:
    return [body[len("domain:"):] for body in allow_list_grants(allow, "WebFetch")
            if body.startswith("domain:")]


def matches_grant(value: str, grant: str) -> bool:
    if value == grant:
        return True
    return grant.endswith(" *") and (value == grant[:-2] or value.startswith(grant[:-1]))


def allow_list_outcome(tool: str, value: str, allow: list[str]) -> str:
    """The harness allow list, which decides only when every hook abstains.

    A compound command is out of its reach — that gap is why the command hooks
    exist — so only a single segment consults the Bash grants.
    """
    if tool == "WebFetch":
        host = value.split("//", 1)[-1].split("/", 1)[0].split("@")[-1].split(":")[0]
        return "allow" if host in web_domains(allow) else "abstain"
    segments = split_compound(value)
    if not segments or len(segments) > 1:
        return "abstain"
    return "allow" if any(matches_grant(value.strip(), grant)
                          for grant in allow_list_grants(allow, "Bash")) else "abstain"


class Side:
    """One harness configuration, addressed through its registered hook commands."""

    def __init__(self, workspace: Path, home: Path, settings: dict, projects_base: Path):
        self.workspace = workspace
        self.groups = settings["hooks"]["PreToolUse"]
        self.allow = settings["permissions"]["allow"]
        self.env = dict(os.environ, HOME=str(home), CLAUDE_PROJECT_DIR=str(workspace),
                        SBX_PROJECTS_BASE=str(projects_base))
        self.env.pop("SBX_EXTRA_ROOTS", None)

    def text(self, value):
        """Address each side at its own workspace, so path-bearing fixtures stay comparable."""
        if isinstance(value, str):
            return expand(value, self.workspace, Path(self.env["HOME"]))
        return value

    def commands(self, tool: str) -> list[list[str]]:
        return [shlex.split(entry["command"])
                for group in self.groups if re.search(group["matcher"], tool)
                for entry in group["hooks"]]

    def verdict(self, tool: str, args: dict) -> str:
        payload = {"hook_event_name": "PreToolUse", "session_id": "equivalence",
                   "cwd": str(self.workspace), "tool_name": tool,
                   "tool_input": {key: self.text(value) for key, value in args.items()}}
        verdicts = []
        for command in self.commands(tool):
            done = subprocess.run(command, input=json.dumps(payload), text=True,
                                  capture_output=True, cwd="/tmp", env=self.env, timeout=10)
            if done.returncode != 0 or not done.stdout.strip():
                continue
            verdicts.append(json.loads(done.stdout)["hookSpecificOutput"]["permissionDecision"])
        return merge(verdicts)

    def outcome(self, tool: str, args: dict) -> str:
        verdict = self.verdict(tool, args)
        if verdict != "abstain":
            return verdict
        key = "url" if tool == "WebFetch" else "command"
        return allow_list_outcome(tool, self.text(args[key]), self.allow)


SHELL_CORPUS = [
    # Direct allow-list singles, which the baseline left to the harness matcher.
    "git status",
    "git diff --stat",
    "gh pr list",
    "ls -la",
    "npm ci",
    "git tag",
    "git tag release",
    # Shapes the harness matcher cannot see through.
    "git -C /tmp status",
    "COMPOUND_BASH_HOOK_DEBUG=1 git status",
    # Compound commands.
    "git status && git diff --stat",
    "git status; git log --oneline | head -5",
    "cd /tmp && ls -la",
    "git status && unknown-tool",
    "git status && sudo true",
    "git add -A && git commit -F - <<'EOF'\nsubject\nEOF",
    # Dynamic shell syntax.
    "echo $HOME",
    "echo '${HOME}'",
    "echo $(pwd)",
    "ls one \\\ntwo",
    "find . -name example",
    "find . -delete",
    "find . -exec echo {} ;",
    "diff <(ls) <(ls -a)",
    # Inline interpreters and script locations.
    "python3 -c 'print(1)'",
    "node --eval '1'",
    "perl -e '1'",
    "deno eval '1'",
    "python3 - <<'EOF'\nprint(1)\nEOF",
    "cat program.py | python3",
    "python3 __WORKSPACE__/hooks/project_scripts.py",
    "__WORKSPACE__/scripts/sbx python3 -c 'print(1)'",
    "__WORKSPACE__/scripts/sbx rm -rf /tmp/equivalence-fixture",
    # Filesystem mutation inside and outside the sandbox roots.
    "rm -rf /tmp/equivalence-fixture",
    "mv /tmp/equivalence-fixture /tmp/equivalence-moved",
    "chmod +x /tmp/equivalence-fixture",
    "rm -rf /etc/equivalence-fixture",
    "rm -rf __WORKSPACE__/equivalence-fixture",
    "git status && rm -rf /tmp/equivalence-fixture",
    "dd if=/dev/zero of=/tmp/equivalence-fixture",
    # GitHub API classification.
    "gh api repos/o/r",
    "gh api repos/o/r/issues -f title=example",
    "gh api repos/o/r -X DELETE",
    "gh api repos/o/r/actions/secrets -X PUT",
    "gh api repos/o/r/pulls/1/merge -X PUT",
    "gh api graphql -F query=@query.graphql",
    "git status && gh api repos/o/r -X DELETE",
    "gh api repos/o/r -X DELETE && echo $HOME",
    # Read-only curl.
    "curl -s https://github.com/o/r",
    "curl -I https://github.com/o/r",
    "curl -s https://github.com/o/r | head -c 400",
    "curl -X POST https://github.com/o/r",
    "curl https://unknown.example/",
    "curl -o /tmp/equivalence-fixture https://github.com/o/r",
    "curl -s https://github.com/o/r && rm -rf /tmp/equivalence-fixture",
]

WEB_CORPUS = [
    "https://github.com/o/r",
    "https://raw.githubusercontent.com/o/r/main/README.md",
    "https://github.com.evil.example/",
    "https://unknown.example/page",
]


class EquivalenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix="hook-equivalence-")
        cls.addClassCleanup(cls.temporary.cleanup)
        area = Path(cls.temporary.name)
        cls.home = area / "home"
        cls.home.mkdir()
        baseline = area / "projects" / ROOT.name
        baseline.mkdir(parents=True)
        archive = subprocess.run(["git", "archive", BASELINE, *BASELINE_PATHS],
                                 cwd=ROOT, capture_output=True, check=True)
        subprocess.run(["tar", "-x", "-C", str(baseline)], input=archive.stdout, check=True)
        subprocess.run(["git", "init", "-q", str(baseline)], check=True)

        cls.template = (baseline / ".claude/settings.template.json").read_text()
        settings = json.loads(expand(cls.template, baseline, cls.home))
        (baseline / ".claude/settings.json").write_text(json.dumps(settings))
        cls.before = Side(baseline, cls.home, settings, baseline.parent)

        rendered = json.loads(renderer.render(ROOT, cls.home, {"mcpServers": {}})[".claude/settings.json"])
        cls.rendered_settings = rendered
        cls.after = Side(ROOT, cls.home, rendered, ROOT.parent)

    def test_shell_requests_reach_the_same_outcome(self):
        for command in SHELL_CORPUS:
            with self.subTest(command=command):
                args = {"command": command}
                self.assertEqual(self.before.outcome("Bash", args), self.after.outcome("Bash", args))

    def test_web_requests_reach_the_same_outcome(self):
        for url in WEB_CORPUS:
            with self.subTest(url=url):
                args = {"url": url}
                self.assertEqual(self.before.outcome("WebFetch", args),
                                 self.after.outcome("WebFetch", args))

    def test_permission_grants_match_the_baseline_allow_list(self):
        """Direct singles are granted by the permission file, so it must carry every grant."""
        baseline = json.loads(expand(self.template, ROOT, self.home))["permissions"]
        after = self.rendered_settings["permissions"]["allow"]
        before = baseline["allow"]
        normalise = {"Bash", "WebFetch(domain", "Read", "Write", "Edit", "MultiEdit",
                     "NotebookEdit", "Skill"}
        def canonical(rules):
            return sorted(next((f"{prefix}({grant_body(rule, prefix)})" for prefix in normalise
                                if grant_body(rule, prefix) is not None), rule) for rule in rules)
        self.assertEqual(canonical(before), canonical(after))
        self.assertEqual(baseline["additionalDirectories"],
                         self.rendered_settings["permissions"]["additionalDirectories"])

    def test_command_patterns_carry_no_retired_spelling(self):
        """matches_rule honours a trailing ' *' only, so a ':*' pattern would grant nothing."""
        policy = json.loads((ROOT / "config/permissions.json").read_text())
        self.assertFalse([pattern for pattern in policy["shell"] if pattern.endswith(":*")])

    def test_unreadable_requests_deny_where_the_baseline_stayed_silent(self):
        """An accepted delta: the baseline failed open on a request it could not read."""
        for args in ({}, {"command": 42}):
            with self.subTest(args=args):
                self.assertEqual(self.before.verdict("Bash", args), "abstain")
                self.assertEqual(self.after.verdict("Bash", args), "deny")


if __name__ == "__main__":
    unittest.main()
