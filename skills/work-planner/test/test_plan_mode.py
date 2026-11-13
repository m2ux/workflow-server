"""Plan Mode keeps a plan in one home: its planning record on the engineering branch, and drafts from an Approved
proposal.

Every draft body and work item the mode writes lands in the record's folder,
and the record reaches readers by a commit and push of the engineering branch.
"""
import html
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker
STEP = re.compile(r'^### \d+\. (.+)$', re.MULTILINE)
PUBLISH_RECORD = 'Publish Planning Record'
IN_RECORD = "in the record's folder"
WRITERS = (
    'initiative-issue-body.md#draft-initiative-issue-body',
    'epic-issue-body.md#populate-epic-issue-body',
    'work-item.md#populate-work-item',
)


def section(text, heading):
    """One heading's prose and executing invocations, excluding literal specimens."""
    marker, title = heading.split(' ', 1)
    lines, fenced, headings = checker.parse(text)
    found = [(start, level) for start, level, name in headings
             if level == len(marker) and checker.anchor_of(name) == checker.anchor_of(title)]
    if len(found) != 1:
        raise ValueError(f'expected one heading {heading!r}: {found}')
    start, level = found[0]
    end = checker.heading_end(headings, start, level, len(lines))
    commands = checker.scan_blocks(lines).html_lines
    result = '\n'.join(html.unescape(checker.ARGUMENT_LINK.sub(lambda match: match[1], line))
                     if index in commands else line
                     for index, line in enumerate(lines[start + 1:end], start + 1)
                     if not fenced[index])
    return '\n'.join(checker.logical_command_lines(result))


def steps():
    """Plan Mode's numbered heading steps by their case-insensitive action title."""
    procedure = section((ROOT / 'modes' / 'plan-mode.md').read_text(), '## Procedure')
    marks = list(STEP.finditer(procedure))
    return {mark[1].casefold(): procedure[mark.start():(marks[i + 1].start() if i + 1 < len(marks) else len(procedure))]
            for i, mark in enumerate(marks)}


class SectionReads(unittest.TestCase):
    def test_literal_headings_and_commands_do_not_supply_execution_evidence(self):
        text = """# Document

````markdown
### Publish Planning Record

git push specimen
````

### Publish Planning Record

#### 1. Publish Planning Files

<big><pre>
git -C '[**&lt;checkout&gt;**](#checkout)' push
</pre></big>

```bash
git push example
```

### Other Operation

git push unrelated
"""
        body = section(text, '### Publish Planning Record')
        self.assertIn("git -C '<checkout>' push", body)
        self.assertIn('#### 1. Publish Planning Files', body)
        self.assertNotIn('specimen', body)
        self.assertNotIn('example', body)
        self.assertNotIn('unrelated', body)

    def test_a_literal_heading_cannot_supply_a_missing_operation(self):
        with self.assertRaises(ValueError):
            section('# Document\n\n```markdown\n### Missing Operation\n```\n',
                    '### Missing Operation')


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
        self.assertIn('Register each draft body and provided work-item file in the planning record.',
                      steps()['populate the epics'])

    def test_the_record_layout_holds_the_drafts(self):
        layout = section((ROOT / 'artifacts' / 'planning-record.md').read_text(), '### Layout')
        self.assertIn("A plan's draft issue bodies and its work items are files of its record.", layout)


class PublishedOnEngineering(unittest.TestCase):
    def test_each_step_writing_the_record_publishes_it(self):
        found = steps()
        for label in ('prepare the planning record', 'publish', 'keep the goal current'):
            with self.subTest(step=label):
                self.assertIn(PUBLISH_RECORD, found[label])

    def test_the_mode_opens_no_pull_request_for_its_plan(self):
        found = steps()
        for label, text in found.items():
            if label == 'prepare epic delivery':
                continue
            with self.subTest(step=label):
                self.assertNotIn('pull-request.md#publish-pull-request', text)
                self.assertNotRegex(text, r'(?m)^- (Commit|Push)\.$')

    def test_publishing_commits_and_pushes_the_engineering_branch(self):
        text = (ROOT / 'artifacts' / 'planning-record.md').read_text()
        publish = section(text, '### Publish Planning Record')
        self.assertIn('#commit-planning-record', checker.LINK.findall(publish))
        self.assertIn("cd '<engineering-worktree>' && git add -A && "
                      "(git diff --cached --quiet || git commit -F '<message-file>') && "
                      "git fetch origin engineering && git rebase origin/engineering && git push",
                      section(text, '### Commit Planning Record'))


class ApprovedBeforeDrafting(unittest.TestCase):
    """The proposal Plan Mode raises through Propose Mode stands at Approved, with the user assigned, before any
    initiative is drafted; Proposal Status alone states what Approved means and whom it assigns."""

    def setUp(self):
        self.plan = (ROOT / 'modes' / 'plan-mode.md').read_text()
        self.propose = (ROOT / 'modes' / 'propose-mode.md').read_text()
        self.status = '(../artifacts/proposal.md#proposal-status)'

    def test_plan_requests_approved_from_propose_in_its_first_step(self):
        take = section(self.plan, '### 1. Take the Proposal')
        self.assertIn('- At [Approved]' + self.status + ", the proposal's issue body defines the problem scope.",
                      take)
        self.assertIn('- At any other [Proposal Status]' + self.status + ', or with no item on the board, the '
                      'proposal blocks initiative drafting; report the Status read or the missing item.', take)
        self.assertIn('- For a major project, Follow [Propose Mode](propose-mode.md "ƒ") with the user\'s goal and '
                      '[Requested Status](propose-mode.md#requested-status) Approved', take)
        self.assertIn('placed at Approved; an unresolved proposal blocks initiative drafting', take)
        self.assertIn('- For feature- or documentation-scale work, interview the user for the goal', take)
        steps = STEP.findall(self.plan)
        self.assertLess(steps.index('Take the Proposal'), steps.index('Draft Each Initiative Body'))

    def test_the_gate_reads_the_named_proposals_status_from_the_board(self):
        take = section(self.plan, '### 1. Take the Proposal')
        read = ('- Apply [Select Proposals Board](../artifacts/proposals-board.md#select-proposals-board "ƒ"), then '
                'Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for that board, and read the '
                'Status of the proposal\'s item.')
        self.assertIn('- When the user names a proposal:\n  ' + read, take)
        self.assertLess(take.index(read), take.index('- At [Approved]'))

    def test_a_requested_status_places_the_proposal_without_asking(self):
        confirm = section(self.propose, '### 6. Confirm Placement')
        self.assertIn('- When the caller supplies a [Requested Status](#requested-status), continue to '
                      '[Place](#7-place) without asking.', confirm)

    def test_place_sets_the_requested_status_and_its_assignee(self):
        place = section(self.propose, '### 7. Place')
        self.assertIn('with that id and the [Requested Status](#requested-status), or, when none is supplied',
                      place)
        self.assertIn('- When [Proposal Status]' + self.status + ' assigns the placed status to the user, Run '
                      '[Find User](../artifacts/board.md#find-user "ƒ")', place)
        self.assertIn('Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with that login as '
                      "the issue's [Assignee](../artifacts/issue.md#assignee).", place)

    def test_requested_status_is_a_proposal_status(self):
        field = section(self.propose, '### Requested Status')
        self.assertIn('[Proposal Status]' + self.status, field)

    def test_approved_assigns_the_user_in_proposal_status_alone(self):
        status = section((ROOT / 'artifacts' / 'proposal.md').read_text(), '### Proposal Status')
        self.assertIn('- **Approved.**\n  Qualified to become an initiative. The assignee is the user.', status)
        for text in (self.plan, self.propose):
            self.assertNotIn('The assignee is the user', text)


if __name__ == '__main__':
    unittest.main()
