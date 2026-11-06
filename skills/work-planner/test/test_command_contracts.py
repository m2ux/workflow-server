"""Documented commands preserve optional values, context and requested writes."""
import html
import json
import re
import shlex
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, git, hotfix, initiative_body, issue, item, links, pr, repository, run, url

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker


def arguments(document, heading, values, omit=()):
    """Shell arguments of the installed invocation after concrete substitution."""
    path = ROOT / 'artifacts' / document
    lines, _, headings = checker.scan(path)
    start = next(index for index, title in checker.specifications(headings)
                 if title == heading)
    end = checker.heading_end(headings, start, 3, len(lines))
    first, last = next((first, last) for first, last in checker.scan_blocks(lines).invocations
                       if start < first <= last < end)
    payload = '\n'.join(lines[first:last + 1]).removeprefix('<big><pre>').removesuffix('</pre></big>')
    visible = html.unescape(checker.ARGUMENT_LINK.sub(lambda match: match[1], payload))
    supplied = {'workspace': str(ROOT.parents[1]), **values}
    concrete = re.sub(r'<([^>]+)>', lambda match: str(supplied[match[1]]), visible)
    tokens = shlex.split(re.sub(r'\\\n[ \t]*', '', concrete))
    script = tokens.index('python3') + 1
    selected = []
    index = script + 1
    while index < len(tokens):
        if tokens[index] in omit:
            index += 2
        else:
            selected.append(tokens[index])
            index += 1
    return Path(tokens[script]).name, selected


class DocumentedCommandBehavior(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory(prefix='command values ')))

    def snapshot(self, name, value):
        path = self.root / name
        path.write_text(json.dumps(value))
        return str(path)

    def execute(self, document, heading, values, omit=()):
        script, argv = arguments(document, heading, values, omit)
        return run(script, *argv)

    def test_dispatch_can_hold_progress_with_an_empty_review_selection(self):
        self.dispatch('943', '', expected=0)

    def test_dispatch_can_check_review_with_an_empty_progress_selection(self):
        self.dispatch('', '943', expected=1)

    def dispatch(self, progress, review, expected):
        record = issue(943, '[I07:E00] Queue Plan: Work', body=epic_body(('W01', 'Work', '')))
        record['body'] = record['body'].replace('- [ ]', '- [x]')
        record['id'] = 1943
        record['assignees'] = [{'login': 'me'}]
        row = {**item(record, 'Ready'), 'id': 101}
        fields = [{'id': 7, 'name': 'Status', 'options': [
            {'name': name, 'id': number} for number, name in enumerate(
                ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'), 1)]}]
        done = self.execute('board-delivery.md', 'Compute Dispatch Status', {
            'board-items-file': self.snapshot('items.json', [row]),
            'board-identity': 'users/o/projectsV2/9',
            'board-fields-file': self.snapshot('fields.json', fields),
            'output-directory': str(self.root / 'calls'),
            'assignee-login': 'me', 'held-issue-numbers': progress,
            'complete-epic-numbers': review,
            'pull-request-records-file': self.snapshot('prs.json', []),
            'review-records-file': self.snapshot('reviews.json', []),
        })
        self.assertEqual(done.returncode, expected, done.stderr)
        self.assertNotIn('expected one argument', done.stderr)
        if progress:
            self.assertIn('In Progress', done.stdout)
        else:
            self.assertNotIn('gh api', done.stdout)

    def test_survey_writes_the_requested_dispatch_export(self):
        output = self.root / 'dispatch export.json'
        done = self.execute('delivery-plan.md', 'Compute Available Work', {
            'board-items-file': self.snapshot('items.json', []),
            'pull-request-records-file': self.snapshot('prs.json', []),
            'issue-link-snapshot-file': self.snapshot('links.json', []),
            'checkout': str(self.root / 'checkout'), 'revision': 'HEAD',
            'epic-base-names': '', 'engineering-worktree': str(self.root),
            'lane-index': '1', 'dispatch-export-file': str(output),
        }, omit=('--prs', '--links', '--project', '--revision', '--bases', '--engineering', '--lane'))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertEqual(json.loads(output.read_text()), [])

    def test_task_delivery_records_its_pull_request_without_verified_criteria(self):
        record = issue(3, '[I01:E00:W01] First: Work',
                       body='## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n')
        self.sync_without_ticks('task-body.md', 'Sync Task Issue', record,
                                pr(950, '[I01:E00] Work'), 'task-json-file')

    def test_hotfix_delivery_records_its_pull_request_without_verified_criteria(self):
        self.sync_without_ticks('hotfix.md', 'Sync Hot-fix Issue', hotfix(4, target='workspace'),
                                pr(950, '[F04] Reject Bad Keys', base='workspace'), 'hot-fix-json-file')

    def sync_without_ticks(self, document, heading, record, pull, issue_placeholder):
        output = self.root / 'updated body.md'
        done = self.execute(document, heading, {
            issue_placeholder: self.snapshot('issue.json', record),
            'pull-request-records-file': self.snapshot('prs.json', pull),
            'issue-link-snapshot-file': self.snapshot('links.json', [links(950, record['number'])]),
            'pull-request-number': '950', 'criterion-ids': '', 'output-body-file': str(output),
        })
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertTrue(output.is_file(), done.stdout)
        self.assertIn('linked:', done.stdout)
        self.assertIn('- [ ] **AC1.**', output.read_text())
        self.assertNotIn('- [x]', output.read_text())

    def test_initiative_delivery_writes_completed_rows_to_the_requested_body(self):
        output = self.root / 'updated initiative.md'
        record = issue(1, '[I01] First: Initiative',
                       body=initiative_body((f'[E00]({url("issues", 2)})', '')))
        done = self.execute('initiative-issue-body.md', 'Sync Initiative', {
            'initiative-json-file': self.snapshot('initiative.json', record),
            'epic-json-file': self.snapshot('epic.json', issue(2, '[I01:E00] First: Epic', 'closed')),
            'output-body-file': str(output),
        })
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertTrue(output.is_file(), 'the requested body is absent')
        self.assertIn(f'| [E00]({url("issues", 2)}) | Work | AC1 | | ✓ |', output.read_text())

    def format_values(self, record):
        output = self.root / 'formatted body.md'
        values = {
            'issue-json-file': self.snapshot('body.json', record),
            'initiative-json-file': self.snapshot('parent.json', issue(1, '[I01] First: Initiative',
                body=initiative_body((f'[E00]({url("issues", 2)})', ''),
                                     (f'[E01]({url("issues", 3)})', '')))),
            'epic-json-file': self.snapshot('child.json', issue(2, '[I01:E00] Actual Name: Clear Result')),
            'pull-request-records-file': self.snapshot('prs.json', pr(950, '[I01:E00] Work', base='i01/e00/main')),
            'pull-request-changed-paths': '950=' + str(self.root / 'changed paths.txt'),
            'checkout': str(self.root / 'checkout'), 'revision': 'HEAD',
            'output-body-file': str(output),
        }
        return values, output

    def test_initiative_format_uses_linked_epic_titles(self):
        record = issue(1, '[I01] First: Initiative',
                       body=initiative_body((f'[E00]({url("issues", 2)})', '')))
        values, output = self.format_values(record)
        self.execute('issue-body.md', 'Check Body Format', values,
                     omit=('--initiative', '--prs', '--files', '--project', '--revision'))
        self.assertIn('| Actual Name |', output.read_text())

    def test_epic_format_resolves_cross_epic_rows_from_its_parent(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', 'E01:W01')))
        values, output = self.format_values(record)
        self.execute('issue-body.md', 'Check Body Format', values,
                     omit=('--epic', '--prs', '--files', '--project', '--revision'))
        self.assertIn(f'[E01:W01]({url("issues", 3)})', output.read_text())

    def test_epic_format_observes_project_required_criteria_and_changed_paths(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        values, _ = self.format_values(record)
        checkout = Path(values['checkout'])
        repository(checkout, 'main')
        declaration = checkout / 'config/required-criteria.json'
        declaration.write_text(json.dumps([{
            'branch': 'main', 'paths': ['src'],
            'criterion': 'Every definition carries verified audit evidence.',
            'phrase': 'verified audit evidence', 'row': 'Verify audit evidence',
        }]))
        git(checkout, 'add', 'config/required-criteria.json')
        git(checkout, 'commit', '-m', 'Declare required criteria')
        (self.root / 'changed paths.txt').write_text('src/example.py\n')
        done = self.execute('issue-body.md', 'Check Body Format', values, omit=('--epic',))
        self.assertEqual(done.returncode, 1, done.stderr)
        self.assertIn('source: config/required-criteria.json', done.stdout)
        self.assertIn('verified audit evidence', done.stdout)


if __name__ == '__main__':
    unittest.main()
