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


def synced(record: dict, pulls: list[dict], *args: str) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        body, pulls_path, fixed = Path(tmp, 'issue.json'), Path(tmp, 'prs.json'), Path(tmp, 'fixed.md')
        body.write_text(json.dumps(record))
        pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
        done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed), *args)
        if done.returncode != 0:
            raise AssertionError(done.stderr.strip() or done.stdout)
        return fixed.read_text()


class Done(unittest.TestCase):
    def test_a_merged_pull_request_leaves_done_empty(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')], '--link', 'W01=950')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('| ✓ |', fixed)

    def test_done_ticks_when_every_cited_criterion_is_ticked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')],
                        '--link', 'W01=950', '--tick', 'AC1')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_a_further_pull_request_is_linked_while_a_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z'),
                 pr(951, '[I01:E00] Rest', merged='2026-09-02T00:00:00Z')]
        fixed = synced(epic, pulls, '--link', 'W01=951')
        self.assertIn(f"[W01]({url('pull', 950)}), [W01]({url('pull', 951)})", fixed)
        self.assertNotIn('| ✓ |', fixed)

    def test_an_epic_row_ticks_when_its_issue_is_closed_as_completed(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('sync.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work | AC1 | | ✓ |", fixed.read_text())

    def test_an_open_epic_stays_empty(self):
        epic = issue(2, '[I01:E00] First: Epic')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('sync.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            text = fixed.read_text()
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work | AC1 |  | |", text)
            self.assertNotIn('| ✓ |', text)


class TaskLinks(unittest.TestCase):
    def run_sync(self, epic: dict, pulls: list[dict], *args: str, tasks: list[dict] = ()):
        with tempfile.TemporaryDirectory() as tmp:
            body, pulls_path, fixed = Path(tmp, 'issue.json'), Path(tmp, 'prs.json'), Path(tmp, 'fixed.md')
            body.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            task_paths = []
            for n, task in enumerate(tasks):
                path = Path(tmp, f'task-{n}.json')
                path.write_text(json.dumps(task))
                task_paths.append(str(path))
            extra = ['--tasks', *task_paths] if task_paths else []
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed), *extra, *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_an_open_pull_request_is_linked_and_does_not_deliver(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('| ✓ |', fixed)
        self.assertNotIn('ready to verify', done.stdout)
        self.assertNotIn('in flight:', done.stdout)
        self.assertIn('closable: no (undelivered W01', done.stdout)

    def test_an_open_pull_request_is_not_ready_to_tick(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950', '--tick', 'AC1')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('not ready to verify', done.stderr)

    def test_a_further_open_pull_request_is_in_flight_until_linked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work'), pr(951, '[I01:E00] More')]
        done, _ = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('#950', done.stdout)
        self.assertIn('in flight: #951', done.stdout)

    def test_a_row_linking_its_task_issue_links_the_pull_request(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn(url('issues', 3), fixed)
        self.assertIn(f'uncited: #950 does not cite W01 #3', done.stdout)

    def test_a_pull_request_that_cites_the_task_issue_is_not_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', body=f"See {url('issues', 3)}")]
        done, fixed = self.run_sync(epic, pulls, '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn('uncited:', done.stdout)

    def test_a_merged_pull_request_with_an_unticked_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#950): AC1 unticked', done.stdout)

    def test_an_open_pull_request_leaves_coverage_unreported(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('unmet:', done.stdout)

    def test_a_delivered_task_reports_only_its_unticked_criteria(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace(
            '| AC1 |', '| AC1, AC2 |').replace('- [ ] **AC1.** Holds.',
                                               '- [x] **AC1.** Holds.\n- [ ] **AC2.** Holds.')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#950): AC2 unticked', done.stdout)
        self.assertNotIn('AC1 unticked', done.stdout)

    def test_a_merged_pull_request_from_another_epic_delivers_the_row(self):
        body = epic_body((f"[W01]({url('pull', 439)})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(439, '[I00:E09] Other', merged='2026-08-07T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('conflict: W01 links #439, whose title does not name this epic', done.stdout)
        self.assertNotIn('ticked early', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 439)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('closable: yes', done.stdout)

    def test_a_foreign_merged_pull_request_with_an_unticked_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 439)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(439, '[I00:E09] Other', merged='2026-08-07T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#439): AC1 unticked', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_linked_pull_request_absent_from_the_set_does_not_deliver(self):
        body = epic_body((f"[W01]({url('pull', 439)})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('note: W01 links #439, which is not among the pull requests given', done.stdout)
        self.assertIn('ticked early: AC1 (W01 undelivered)', done.stdout)
        self.assertNotIn('conflict:', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_linked_commit_delivers_the_row_when_its_criteria_are_ticked(self):
        commit = 'https://github.com/o/r/commit/b41c0bf3e2201452ba9b9fffe6c681b157a5e946'
        body = epic_body((f"[W01]({commit})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"| [W01]({commit}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('closable: yes', done.stdout)

    def test_a_tick_clears_when_the_row_is_not_complete(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| | |', '| | ✓ |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('cleared: W01', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_closed_task_issue_stays_delivered_until_its_pull_request_is_linked(self):
        task = issue(3, '[I01:E00:W01] Task: Done', 'closed')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Work', '')))
        done, _ = self.run_sync(epic, [], tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('ready to verify: AC1 (W01)', done.stdout)
        self.assertIn('note: W01 links task issue #3; link its pull request', done.stdout)


class DoneColumn(unittest.TestCase):
    def test_a_missing_done_column_is_added_empty(self):
        table = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                 '## Work Breakdown\n\n| Task | Description | Depends on | Joins |\n| --- | --- | --- | --- |\n'
                 '| W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                 '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        review = Review(issue(2, '[I01:E00] First: Epic', body=table))
        fixed = review.run()
        self.assertIn('Work Breakdown columns added: Coverage, Done', review.fixed)
        self.assertIn('Coverage filled from the Description', review.fixed)
        self.assertIn('| Task | Description | Coverage | Depends on | Joins | Done |', fixed)
        self.assertIn('| W01 | Work | AC1 | | | |', fixed)

    def test_a_leading_done_column_moves_to_the_end(self):
        epic = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Done | Task | Description | Depends on | Joins |\n'
                '| --- | --- | --- | --- | --- |\n'
                '| [x] | W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        initiative = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                      '## Work Breakdown\n\n| Done | Epic | Description | Depends on |\n'
                      '| --- | --- | --- | --- |\n'
                      '| [x] | [E00](https://github.com/o/r/issues/3) | Work → AC1 | |\n\n'
                      '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n## Non-Goals\n\n- Out.\n\n'
                      '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        epic_fixed = Review(issue(2, '[I01:E00] First: Epic', body=epic)).run()
        initiative_fixed = Review(issue(1, '[I01] First: Initiative', body=initiative)).run()
        self.assertIn('| W01 | Work | AC1 | | | ✓ |', epic_fixed)
        self.assertIn('| [E00](https://github.com/o/r/issues/3) | Work | AC1 | | ✓ |', initiative_fixed)

    def test_a_note_after_the_criteria_stays_on_the_description(self):
        table = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                 '## Work Breakdown\n\n| Task | Description | Depends on | Joins | Done |\n'
                 '| --- | --- | --- | --- | --- |\n'
                 '| W01 | Reads count → AC1 ([#1053](https://github.com/o/r/pull/1053)) | | | ✓ |\n\n'
                 '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                 '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        fixed = Review(issue(2, '[I01:E00] First: Epic', body=table)).run()
        self.assertIn('| W01 | Reads count ([#1053](https://github.com/o/r/pull/1053)) | AC1 | | | ✓ |', fixed)


class InitiativeClose(unittest.TestCase):
    def run_sync(self, pulls: list[dict] | None, ticked: bool = True) -> str:
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        body = initiative_body((f"[E00]({url('issues', 2)})", ''))
        if ticked:
            body = body.replace('- [ ] **AC1.**', '- [x] **AC1.**')
        initiative = issue(1, '[I01] First: Initiative', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, issue_path = Path(tmp, 'epic.json'), Path(tmp, 'issue.json')
            epic_path.write_text(json.dumps(epic))
            issue_path.write_text(json.dumps(initiative))
            args = [str(issue_path), '--epics', str(epic_path)]
            if pulls is not None:
                pulls_path = Path(tmp, 'prs.json')
                pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
                args.extend(['--prs', str(pulls_path)])
            done = run('sync.py', *args)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_ticked_criteria_stay_open_until_the_integration_branch_merges(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/main', head='topic')])
        self.assertIn('unmerged: i01/main', out)
        self.assertIn('closable: no (unmerged i01/main)', out)

    def test_an_open_integration_pull_request_is_named(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/main', head='topic'),
                 pr(980, '[I01] First', base='main', head='i01/main')]
        out = self.run_sync(pulls)
        self.assertIn('unmerged: i01/main (#980 open)', out)
        self.assertIn('closable: no (unmerged i01/main (#980 open))', out)

    def test_a_merged_integration_branch_is_closable(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/main', head='topic'),
                 pr(980, '[I01] First', merged='2026-09-02T00:00:00Z', base='main', head='i01/main')]
        out = self.run_sync(pulls)
        self.assertNotIn('unmerged:', out)
        self.assertIn('closable: yes', out)

    def test_one_unmerged_branch_blocks_when_another_has_merged(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/main', head='topic'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z', base='i01/workflows', head='topic-w'),
                 pr(980, '[I01] First', merged='2026-09-02T00:00:00Z', base='main', head='i01/main')]
        out = self.run_sync(pulls)
        self.assertIn('closable: no (unmerged i01/workflows)', out)
        self.assertNotIn('i01/main', out)

    def test_ticked_criteria_without_pull_requests_are_not_closable(self):
        out = self.run_sync(None)
        self.assertNotIn('unmerged:', out)
        self.assertIn('closable: no (integration branches not given)', out)

    def test_an_unticked_criterion_does_not_report_an_unmerged_branch(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/main')], ticked=False)
        self.assertNotIn('unmerged', out)
        self.assertIn('closable: no (unticked AC1)', out)

    def test_a_pull_request_on_a_long_lived_branch_adds_no_integration_branch(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='main', head='topic')])
        self.assertNotIn('unmerged:', out)
        self.assertIn('closable: yes', out)

    def test_an_integration_branch_in_another_repository_is_named_with_it(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                                base='i01/main', head='topic', repo='o/other')])
        self.assertIn('closable: no (unmerged o/other:i01/main)', out)
