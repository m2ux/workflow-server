"""Done on a Work Breakdown row, ticked when the row is complete.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, initiative_body, issue, pr, run, url

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
from format import Review  # noqa: E402


def updated(record: dict, pulls: list[dict], *args: str) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        body, pulls_path, fixed = Path(tmp, 'issue.json'), Path(tmp, 'prs.json'), Path(tmp, 'fixed.md')
        body.write_text(json.dumps(record))
        pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
        done = run('update.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed), *args)
        if done.returncode != 0:
            raise AssertionError(done.stderr.strip() or done.stdout)
        return fixed.read_text()


class Done(unittest.TestCase):
    def test_a_merged_pull_request_leaves_done_empty(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = updated(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')], '--link', 'W01=950')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work → AC1 | | | |", fixed)
        self.assertNotIn('| ✓ |', fixed)

    def test_done_ticks_when_every_cited_criterion_is_ticked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = updated(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')],
                        '--link', 'W01=950', '--tick', 'AC1')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work → AC1 | | | ✓ |", fixed)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_a_further_pull_request_is_linked_while_a_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z'),
                 pr(951, '[I01:E00] Rest', merged='2026-09-02T00:00:00Z')]
        fixed = updated(epic, pulls, '--link', 'W01=951')
        self.assertIn(f"[W01]({url('pull', 950)}), [W01]({url('pull', 951)})", fixed)
        self.assertNotIn('| ✓ |', fixed)

    def test_an_epic_row_ticks_when_its_issue_is_closed_as_completed(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('update.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work → AC1 | | ✓ |", fixed.read_text())

    def test_an_open_epic_stays_empty(self):
        epic = issue(2, '[I01:E00] First: Epic')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('update.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            text = fixed.read_text()
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work → AC1 |  | |", text)
            self.assertNotIn('| ✓ |', text)


class DoneColumn(unittest.TestCase):
    def test_a_missing_done_column_is_added_empty(self):
        table = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                 '## Work Breakdown\n\n| Task | Description | Depends on | Join |\n| --- | --- | --- | --- |\n'
                 '| W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                 '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        review = Review(issue(2, '[I01:E00] First: Epic', body=table))
        fixed = review.run()
        self.assertIn('Work Breakdown columns added: Done', review.fixed)
        self.assertIn('| Task | Description | Depends on | Join | Done |', fixed)
        self.assertIn('| W01 | Work → AC1 | | | |', fixed)

    def test_a_leading_done_column_moves_to_the_end(self):
        epic = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Done | Task | Description | Depends on | Join |\n'
                '| --- | --- | --- | --- | --- |\n'
                '| [x] | W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        initiative = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                      '## Work Breakdown\n\n| Done | Epic | Description | Depends on |\n'
                      '| --- | --- | --- | --- |\n'
                      '| [x] | [E00](https://github.com/o/r/issues/3) | Work → AC1 | |\n\n'
                      '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n## Non-goals\n\n- Out.\n\n'
                      '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        epic_fixed = Review(issue(2, '[I01:E00] First: Epic', body=epic)).run()
        initiative_fixed = Review(issue(1, '[I01] First: Initiative', body=initiative)).run()
        self.assertIn('| W01 | Work → AC1 | | | ✓ |', epic_fixed)
        self.assertIn('| [E00](https://github.com/o/r/issues/3) | Work → AC1 | | ✓ |', initiative_fixed)
