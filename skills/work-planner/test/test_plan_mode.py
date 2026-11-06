"""Plan Mode keeps a plan in one home: its planning record on the engineering branch.

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


if __name__ == '__main__':
    unittest.main()
