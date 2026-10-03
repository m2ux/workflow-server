"""orphans.py keeps a proposal out of the hoist candidates and out of the initiative list.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import issue, run


class Proposals(unittest.TestCase):
    def test_a_proposal_is_not_an_orphan_or_an_initiative(self):
        issues = [
            issue(1, 'Key Validation: Reject Bad Keys', labels=('type:proposal',), body='Overview.'),
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
