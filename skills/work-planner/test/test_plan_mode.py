"""Plan Mode keeps a plan in one home: its planning record on the engineering branch.

Every draft body and work item the mode writes lands in the record's folder,
and the record reaches readers by a commit and push of the engineering branch.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEP = re.compile(r'^\d+\. \*\*(.+?)\*\*', re.MULTILINE)
PUBLISH_RECORD = 'Publish Planning Record'
IN_RECORD = "in the record's folder"
WRITERS = (
    'initiative-issue-body.md#draft-initiative-issue-body',
    'epic-issue-body.md#populate-epic-issue-body',
    'work-item.md#populate-work-item',
)


def section(text, heading):
    """The lines under one heading, up to the next heading of equal or higher level."""
    level = heading.split(' ', 1)[0]
    body = text.split(f'\n{heading}\n', 1)[1]
    end = re.search(rf'^#{{1,{len(level)}}} ', body, re.MULTILINE)
    return body[:end.start()] if end else body


def steps():
    """Plan Mode's procedure steps by their action label."""
    procedure = section((ROOT / 'modes' / 'plan-mode.md').read_text(), '## Procedure')
    marks = list(STEP.finditer(procedure))
    return {mark[1].rstrip('.'): procedure[mark.start():(marks[i + 1].start() if i + 1 < len(marks) else len(procedure))]
            for i, mark in enumerate(marks)}


class DraftsInTheRecord(unittest.TestCase):
    def test_each_draft_and_work_item_is_written_in_the_record(self):
        lines = [line for text in steps().values() for line in text.splitlines()]
        for writer in WRITERS:
            calls = [line for line in lines if writer in line]
            with self.subTest(writer=writer):
                self.assertTrue(calls)
                for line in calls:
                    self.assertIn(IN_RECORD, line)

    def test_the_record_registers_each_draft(self):
        self.assertIn('Register each draft body and returned work-item file in the planning record.',
                      steps()['Populate the epics'])

    def test_the_record_layout_holds_the_drafts(self):
        layout = section((ROOT / 'artifacts' / 'planning-record.md').read_text(), '### Layout')
        self.assertIn("A plan's draft issue bodies and its work items are files of its record.", layout)


class PublishedOnEngineering(unittest.TestCase):
    def test_each_step_writing_the_record_publishes_it(self):
        found = steps()
        for label in ('Prepare the planning record', 'Publish', 'Keep the goal current'):
            with self.subTest(step=label):
                self.assertIn(PUBLISH_RECORD, found[label])

    def test_the_mode_opens_no_pull_request_for_its_plan(self):
        found = steps()
        for label, text in found.items():
            if label == 'Prepare epic delivery':
                continue
            with self.subTest(step=label):
                self.assertNotIn('pull-request.md#publish-pull-request', text)
                self.assertNotRegex(text, r'(?m)^\s+- (Commit|Push)\.$')

    def test_publishing_commits_and_pushes_the_engineering_branch(self):
        text = (ROOT / 'artifacts' / 'planning-record.md').read_text()
        publish = section(text, '### *Publish* Planning Record')
        self.assertIn('[Commit Planning Record](#commit-planning-record)', publish)
        self.assertIn("cd '<engineering-worktree>' && git add -A && "
                      "(git diff --cached --quiet || git commit -F '<message-file>') && "
                      "git fetch origin engineering && git rebase origin/engineering && git push",
                      section(text, '### Commit Planning Record'))


if __name__ == '__main__':
    unittest.main()
