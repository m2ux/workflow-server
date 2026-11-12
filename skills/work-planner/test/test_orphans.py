"""orphans.py keeps a proposal out of the hoist candidates and out of the initiative list, a
declared throwaway out of both candidate groups, and an issue of each registered kind of work out of
both, reaching the kind through the script registry.
"""
import contextlib
import io
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

from fixtures import SCRIPTS, issue, run

sys.path.insert(0, str(SCRIPTS))
import kinds  # noqa: E402
import orphans  # noqa: E402


class Proposals(unittest.TestCase):
    def test_a_proposal_is_not_an_orphan_or_an_initiative(self):
        issues = [
            issue(1, '[P00] Key Validation: Reject Bad Keys', labels=('type:proposal',), body='Overview.'),
            issue(2, 'Loose note'),
            issue(3, '[I07] Canon Walk: Definitions Checked', labels=('type:initiative', 'theme:canon')),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'issues.json')
            path.write_text(json.dumps(issues))
            done = run('orphans.py', str(path))
        self.assertEqual(done.returncode, 0, done.stderr)
        text = done.stdout
        self.assertIn('--- orphans (1)', text)
        self.assertIn('#2 Loose note', text)
        self.assertNotIn('#1 ', text)
        self.assertIn('#3 [I07] Canon Walk: Definitions Checked', text)
        self.assertNotIn('Key Validation', text.split('--- open initiatives and epics', 1)[1])


class Throwaways(unittest.TestCase):
    def test_a_throwaway_is_neither_an_orphan_nor_a_cited_standalone_issue(self):
        issues = [
            issue(1, '[I07] Canon Walk: Definitions Checked', labels=('type:initiative',),
                  body='Writes to #3 and reads #4.'),
            issue(2, 'Loose note'),
            issue(3, 'Write target', labels=('throwaway:two',)),
            issue(4, 'Cited note'),
            issue(5, 'Spare target', labels=('throwaway:one',)),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'issues.json')
            path.write_text(json.dumps(issues))
            done = run('orphans.py', str(path))
        self.assertEqual(done.returncode, 0, done.stderr)
        orphans, rest = done.stdout.split('--- cited standalone issues', 1)
        cited_group = rest.split('--- open initiatives and epics', 1)[0]
        self.assertIn('--- orphans (1)', orphans)
        self.assertIn('#2 Loose note', orphans)
        self.assertIn(' (1)', cited_group.splitlines()[0])
        self.assertIn('#4 Cited note', cited_group)
        self.assertNotIn('Write target', done.stdout)
        self.assertNotIn('Spare target', done.stdout)


class HotFixes(unittest.TestCase):
    def test_an_open_hot_fix_is_neither_a_candidate_nor_a_destination(self):
        issues = [
            issue(1, '[F00] Key Validation: Reject Bad Keys', labels=('type:hot-fix', 'theme:canon'), body='Fix.'),
            issue(2, 'Loose note'),
            issue(3, '[I07] Canon Walk: Definitions Checked', labels=('type:initiative', 'theme:canon'),
                  body='Reads #1.'),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'issues.json')
            path.write_text(json.dumps(issues))
            done = run('orphans.py', str(path))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('--- orphans (1)', done.stdout)
        self.assertIn('--- cited standalone issues (0)', done.stdout)
        self.assertNotIn('Key Validation', done.stdout)


class Registry(unittest.TestCase):
    def test_an_issue_of_any_registered_kind_is_neither_a_candidate_nor_a_destination(self):
        stand_in = types.ModuleType('stand_in')
        stand_in.tag = lambda item: 'Z01' if (item.get('title') or '').startswith('[Z01]') else None
        issues = [
            issue(1, '[Z01] Stand In: Kind Of Its Own', labels=('theme:canon',)),
            issue(2, 'Loose note'),
            issue(3, '[I07] Canon Walk: Definitions Checked', labels=('type:initiative', 'theme:canon'),
                  body='Reads #1.'),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'issues.json')
            path.write_text(json.dumps(issues))
            printed = io.StringIO()
            with mock.patch.dict(sys.modules, {'stand_in': stand_in}), \
                    mock.patch.dict(kinds.KINDS, {'stand-in': 'stand_in'}), \
                    mock.patch.object(sys, 'argv', ['orphans.py', str(path)]), \
                    contextlib.redirect_stdout(printed):
                self.assertEqual(orphans.main(), 0)
        text = printed.getvalue()
        self.assertIn('--- orphans (1)', text)
        self.assertIn('#2 Loose note', text)
        self.assertIn('--- cited standalone issues (0)', text)
        self.assertNotIn('Stand In', text)
