"""The planning record stays on its checkout.

Plan mode commits it there and does not open a pull request for it.
"""
import unittest
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]


def section(text: str, heading: str, marks: tuple[str, ...]) -> str:
    start = text.index(heading)
    end = len(text)
    for mark in marks:
        found = text.find(mark, start + len(heading))
        if found != -1:
            end = min(end, found)
    return text[start:end]


class PlanningRecord(unittest.TestCase):
    def test_plan_mode_does_not_open_a_pull_request_for_the_record(self):
        text = (SKILL / 'references' / 'plan-mode.md').read_text()
        lowered = text.lower()
        self.assertNotIn('discussion pull request', lowered)
        self.assertNotIn('discussion pr', lowered)
        self.assertIn('add-planning-record', text)

    def test_the_record_is_committed_on_its_checkout(self):
        text = (SKILL / 'references' / 'commands.md').read_text()
        spec = section(text, '### Add Planning Record', ('\n### ', '\n## '))
        self.assertIn('committed and pushed on that checkout', spec)
        self.assertIn('no further worktree and no branch', spec)
        self.assertIn('not a reason to cut one', spec)
