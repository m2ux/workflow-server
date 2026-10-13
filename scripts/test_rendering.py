"""Shared rule selection, placeholder expansion, and JSON serialization."""

from pathlib import Path
import json
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'hooks'))
from permissions import expand
from rendering import as_json, rule_text


class RenderingTests(unittest.TestCase):
    def test_nested_placeholder_expansion(self):
        value = {'items': ['__WORKSPACE__/hooks', {'home': '__HOME__/projects'}], 'flag': True}
        self.assertEqual(expand(value, Path('/workspace path'), Path('/home path')),
                         {'items': ['/workspace path/hooks', {'home': '/home path/projects'}], 'flag': True})
        self.assertEqual(json.loads(as_json(value)), value)

    def test_always_rules_order_and_expansion(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            rules = root / 'rules'
            rules.mkdir()
            for name, content in {
                'z.md': '---\nalwaysApply: true\n---\nLast __WORKSPACE__',
                'a.md': '---\nalwaysApply: true\n---\nFirst __HOME__',
                'workflow-server.md': '---\nalwaysApply: true\n---\nBootstrap',
                'optional.md': '---\nalwaysApply: false\n---\nOptional',
                'plain.md': 'Unscoped instructions',
            }.items():
                (rules / name).write_text(content)
            self.assertEqual(rule_text(root, Path('/home/test')), f'Bootstrap\n\nFirst /home/test\n\nLast {root}')


if __name__ == '__main__':
    unittest.main()
