"""Exercise deployment in an isolated local checkout without network access."""

import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import tomllib
import unittest

ROOT = Path(__file__).resolve().parent.parent


class DeploymentTests(unittest.TestCase):
    def test_machine_local_deployment_and_repeat(self):
        with tempfile.TemporaryDirectory(prefix='harness deployment ') as directory:
            base = Path(directory)
            checkout = base / 'workspace'
            home = base / 'home'
            home.mkdir()
            shutil.copytree(ROOT, checkout, symlinks=True,
                            ignore=shutil.ignore_patterns('.git', '.engineering', '.project', '.worktrees', '__pycache__'))
            env = dict(os.environ, HOME=str(home), GIT_CONFIG_NOSYSTEM='1',
                       GIT_AUTHOR_NAME='Harness Test', GIT_AUTHOR_EMAIL='test@example.invalid',
                       GIT_COMMITTER_NAME='Harness Test', GIT_COMMITTER_EMAIL='test@example.invalid',
                       WORKFLOW_SERVER_MCP_URL='http://127.0.0.1:32123/mcp',
                       CONCEPT_RAG_ENTRY=str(home / 'concept/index.js'),
                       CONCEPT_RAG_INDEX=str(home / 'concept/data'), GITNEXUS_BIN='/test/gitnexus')
            def command(args, cwd=checkout):
                return subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True, timeout=20, check=True)
            command(['git', 'init', '-b', 'workspace'])
            command(['git', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'Fixture'])
            for _ in range(2):
                command(['bash', str(ROOT / 'scripts/deploy-workspace.sh'), 'workspace'], base)
                command(['python3', 'scripts/render-harnesses.py', '--check'])
            config = tomllib.loads((checkout / '.codex/config.toml').read_text())
            self.assertEqual(config['mcp_servers']['workflow-server']['url'], 'http://127.0.0.1:32123/mcp')
            self.assertIn(str(home / 'concept/index.js'), config['mcp_servers']['concept-rag']['args'])
            trust = tomllib.loads((home / '.codex/config.toml').read_text())
            self.assertEqual(trust['projects'][str(checkout)]['trust_level'], 'trusted')
            claude = json.loads((checkout / '.claude/settings.json').read_text())
            self.assertIn(str(checkout / 'scripts/sbx'), '\n'.join(claude['permissions']['allow']))
            self.assertTrue((checkout / '.claude/hooks/shared').samefile(checkout / 'hooks'))
            self.assertTrue((checkout / '.codex/scripts/shared').samefile(checkout / 'scripts'))
            self.assertTrue((checkout / '.agents/skills').samefile(checkout / 'skills'))


if __name__ == '__main__':
    unittest.main()
