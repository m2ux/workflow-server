"""Done on a Work Breakdown row, ticked when the row is complete.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, initiative_body, issue, links, pr, run, url

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
from format import Review  # noqa: E402


def links_file(root: Path, held: list[dict]) -> str:
    """The issue links its pull requests hold, as --links reads them."""
    path = root / 'links.json'
    path.write_text(json.dumps(held))
    return str(path)


def synced(record: dict, pulls: list[dict], *args: str, held: list[dict] = ()) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
        body.write_text(json.dumps(record))
        pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
        done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                   '--links', links_file(root, list(held)),
                   '--project', project(root, 'docker', 'main', 'workflows'), *args)
        if done.returncode != 0:
            raise AssertionError(done.stderr.strip() or done.stdout)
        return fixed.read_text()


class Done(unittest.TestCase):
    def test_an_open_pull_request_replaces_the_planning_record_link(self):
        plan = 'https://github.com/o/r/blob/engineering/artifacts/planning/x/w01.md'
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({plan})', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('w01.md', fixed)

    def test_a_merged_pull_request_leaves_done_empty_while_a_criterion_is_unticked(self):
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
    def run_sync(self, epic: dict, pulls: list[dict], *args: str, tasks: list[dict] = (),
                 held: list[dict] = ()):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            task_paths = []
            for n, task in enumerate(tasks):
                path = root / f'task-{n}.json'
                path.write_text(json.dumps(task))
                task_paths.append(str(path))
            extra = ['--tasks', *task_paths] if task_paths else []
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                       '--links', links_file(root, list(held)),
                       '--project', project(root, 'docker', 'main', 'workflows'), *extra, *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_a_task_issue_with_no_row_is_unplaced(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        task = issue(3, '[I01:E00:W02] Other: Work')
        done, _fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unplaced: W02 #3', done.stdout)

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
        self.assertNotIn('in flight: #950', done.stdout)
        self.assertNotIn('unmatched: #950', done.stdout)
        self.assertIn('in flight: #951', done.stdout)

    def test_a_row_linking_its_task_issue_links_the_pull_request(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn(url('issues', 3), fixed)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_pull_request_whose_development_field_links_the_task_issue_is_not_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                    tasks=[task], held=[links(950, 3)])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn('uncited:', done.stdout)

    def test_a_pull_request_linking_another_issue_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                tasks=[task], held=[links(950, 4)])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_link_to_the_same_number_in_another_repository_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                tasks=[task], held=[links(950, 3, issue_repo='o/s')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_pull_request_that_names_the_task_issue_in_its_body_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', body=f"Closes {url('issues', 3)}")]
        done, _ = self.run_sync(epic, pulls, '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_merged_pull_request_with_an_unticked_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#950): AC1 unticked', done.stdout)
        self.assertNotIn('done:', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

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

    def test_done_ticks_once_the_row_no_longer_names_the_unmet_criterion(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| AC1 |', '| |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('done: W01', done.stdout)
        self.assertNotIn('unmet:', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | | | | ✓ |", fixed)

    def test_a_tick_clears_while_a_cited_criterion_is_unticked(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| | |', '| | ✓ |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('cleared: W01', done.stdout)
        self.assertIn('unmet: W01 (#950): AC1 unticked', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_tick_clears_when_the_pull_request_is_open(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| | |', '| | ✓ |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('cleared: W01', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_the_links_query_names_every_fetched_pull_request(self):
        with tempfile.TemporaryDirectory() as tmp:
            pulls_path = Path(tmp, 'prs.json')
            pulls_path.write_text('\n'.join(json.dumps(p) for p in
                                            [pr(950, '[I01:E00] Work'), pr(951, '[I01:E00] More')]))
            done = run('sync.py', '--links-query', '--prs', str(pulls_path))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('{nodes(ids:["PR_node950", "PR_node951"])', done.stdout)
        self.assertIn('closingIssuesReferences(first:10)', done.stdout)

    def test_the_links_query_needs_the_pull_requests(self):
        done = run('sync.py', '--links-query')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--links-query needs --prs', done.stderr)

    def test_pull_requests_without_their_issue_links_are_refused(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path = root / 'issue.json', root / 'prs.json'
            body.write_text(json.dumps(epic))
            pulls_path.write_text(json.dumps(pr(950, '[I01:E00] Work')))
            done = run('sync.py', str(body), '--prs', str(pulls_path))
            self.assertNotEqual(done.returncode, 0)
            self.assertIn('needs --links', done.stderr)

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


def project(root: Path, *names: str) -> str:
    """A checkout stating the long-lived branches in config/branches."""
    stated = root / 'config' / 'branches'
    stated.parent.mkdir(parents=True, exist_ok=True)
    stated.write_text(''.join(f'{name}\n' for name in names))
    return str(root)


def worktree(root: Path, main: Path, name: str = 'unit') -> str:
    """A linked worktree of main, as git lays one out."""
    gitdir = main / '.git' / 'worktrees' / name
    gitdir.mkdir(parents=True)
    (gitdir / 'commondir').write_text('../..\n')
    root.mkdir(parents=True, exist_ok=True)
    (root / '.git').write_text(f'gitdir: {gitdir}\n')
    return str(root)


class InitiativeClose(unittest.TestCase):
    def run_sync(self, epics: list[dict], ticked: bool = True, missing: bool = False) -> str:
        body = initiative_body(*[(f"[E{n:02d}]({url('issues', e['number'])})", '')
                                 for n, e in enumerate(epics)])
        if ticked:
            body = body.replace('- [ ] **AC1.**', '- [x] **AC1.**')
        initiative = issue(1, '[I01] First: Initiative', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path = root / 'issue.json'
            issue_path.write_text(json.dumps(initiative))
            paths = []
            for epic in epics:
                path = root / f"epic-{epic['number']}.json"
                path.write_text(json.dumps(epic))
                paths.append(str(path))
            done = run('sync.py', str(issue_path), '--epics', *(paths[:-1] if missing else paths))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_completed_epics_and_ticked_criteria_close_without_branch_inputs(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed'),
                             issue(3, '[I01:E01] Second: Epic', 'closed')])
        self.assertIn('closable: yes', out)
        self.assertNotIn('unmerged:', out)

    def test_an_open_epic_blocks_even_with_ticked_initiative_criteria(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed'),
                             issue(3, '[I01:E01] Second: Epic')])
        self.assertIn('closable: no (undelivered E01)', out)

    def test_a_cancelled_epic_does_not_deliver_the_initiative(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        epic['state_reason'] = 'not_planned'
        self.assertIn('closable: no (undelivered E00)', self.run_sync([epic]))

    def test_a_missing_epic_blocks_closure(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed')], missing=True)
        self.assertIn('closable: no (undelivered E00)', out)
        self.assertIn('its id links no issue given by --epics', out)

    def test_completed_epics_still_require_verified_initiative_criteria(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed')], ticked=False)
        self.assertIn('closable: no (unticked AC1)', out)
        self.assertIn('ready to verify: AC1 (E00)', out)


def ticked(body: str) -> str:
    return body.replace('- [ ] **AC1.**', '- [x] **AC1.**')


class EpicClose(unittest.TestCase):
    def run_sync(self, body: str, pulls: list[dict], held: list[dict] = (), state: str = 'open') -> str:
        epic = issue(2, '[I01:E00] First: Epic', state, body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, list(held)),
                       '--project', project(root, 'docker', 'main', 'workflows'))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_ticked_criteria_stay_open_until_the_epic_base_merges(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main', out)
        self.assertNotIn('draft:', out)
        self.assertIn('closable: no (unmerged i01/e00/main)', out)
        self.assertNotIn('in flight:', out)

    def test_an_open_epic_pull_request_is_named(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main (#980 open)', out)
        self.assertNotIn('in flight:', out)
        self.assertNotIn('unmatched:', out)

    def test_a_review_pull_request_that_links_no_issue_is_uncited(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('uncited: #980 does not link E00 #2', out)

    def test_a_review_pull_request_linking_the_epic_issue_is_not_uncited(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls, held=[links(980, 2)])
        self.assertNotIn('uncited:', out)

    def test_a_merged_epic_base_is_closable(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged:', out)
        self.assertNotIn('unmatched:', out)
        self.assertIn('closable: yes', out)

    def test_a_merge_into_another_epic_does_not_complete_delivery(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='i01/e01/main', head='i01/e00/main')]
        self.assertIn('closable: no (unmerged i01/e00/main)', self.run_sync(body, pulls))

    def test_an_epic_head_alone_establishes_an_unmerged_base(self):
        body = ticked(epic_body(("[W01](https://github.com/o/r/commit/abc)", 'Work', '')))
        pulls = [pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        self.assertIn('closable: no (unmerged i01/e00/main (#980 open))', self.run_sync(body, pulls))

    def test_one_unmerged_epic_base_blocks_when_another_has_merged(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/workflows', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('closable: no (unmerged i01/e00/workflows)', out)
        self.assertNotIn('i01/e00/main', out)

    def test_automatic_issue_closure_does_not_hide_an_unmerged_base(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z', base='i01/e00/workflows'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls, state='closed')
        self.assertIn('#2 epic (closed)', out)
        self.assertIn('closable: no (unmerged i01/e00/workflows)', out)

    def test_an_unticked_criterion_does_not_report_an_unmerged_epic_base(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged', out)
        self.assertIn('closable: no (unticked AC1)', out)

    def test_the_first_merged_task_opens_the_epic_base_as_a_draft(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertIn('draft: i01/e00/main', out)
        self.assertNotIn('unmerged', out)
        self.assertIn('closable: no (undelivered W02)', out)

    def test_an_open_draft_is_not_opened_again(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', ''))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('draft:', out)

    def test_a_draft_epic_pull_request_is_named_when_the_epic_is_complete(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main (#980 draft)', out)
        self.assertNotIn('draft:', out)

    def test_an_undelivered_task_does_not_report_an_unmerged_epic_base(self):
        body = ticked(epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged', out)
        self.assertIn('in flight:', out)
        self.assertIn('closable: no (undelivered W01)', out)

    def test_a_delivered_epic_with_no_base_is_closable(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out = self.run_sync(body, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertNotIn('unmerged:', out)
        self.assertIn('closable: yes', out)

    def test_an_epic_base_in_another_repository_is_named_with_it(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950, 'o/other')})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work', repo='o/other')]
        out = self.run_sync(body, pulls)
        self.assertIn('closable: no (unmerged o/other:i01/e00/main)', out)


class LongLivedNames(unittest.TestCase):
    def names(self, root: Path):
        return run('sync.py', '--names', '--project', str(root))

    def test_the_statement_names_the_branches(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project(root, 'main', 'workflows', 'main')
            done = self.names(root)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.split(), ['main', 'workflows'])

    def test_a_directory_beside_the_statement_names_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project(root, 'main')
            (root / '.project' / 'docker').mkdir(parents=True)
            (root / 'config' / 'components').mkdir()
            done = self.names(root)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.split(), ['main'])

    def test_a_linked_worktree_reads_its_main_working_tree(self):
        with tempfile.TemporaryDirectory() as tmp:
            main, linked = Path(tmp) / 'checkout', Path(tmp) / 'worktrees' / 'unit'
            main.mkdir()
            project(main, 'docker', 'main')
            worktree(linked, main)
            done = self.names(linked)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.split(), ['docker', 'main'])

    def test_a_missing_statement_is_unevaluable(self):
        with tempfile.TemporaryDirectory() as tmp:
            done = self.names(Path(tmp))
            self.assertEqual(done.returncode, 1)
            self.assertIn('unevaluable:', done.stderr)
            self.assertIn('config/branches', done.stderr)

    def test_an_empty_statement_is_unevaluable(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project(root)
            done = self.names(root)
            self.assertEqual(done.returncode, 1)
            self.assertIn('unevaluable:', done.stderr)
            self.assertIn('names no branch', done.stderr)


def epic_rows(*rows: tuple[str, str, str]) -> str:
    """An epic body. Each row is the task id, its Coverage, and its Joins."""
    lines = ['## Work Breakdown', '',
             '| Task | Description | Coverage | Depends on | Joins | Done |',
             '| --- | --- | --- | --- | --- | --- |']
    named: list[str] = []
    for task, coverage, joins in rows:
        lines.append(f'| {task} | Work | {coverage} | | {joins} | |')
        for token in (part.strip() for part in coverage.split(',')):
            if len(token) > 2 and token.startswith('AC') and token[2:].isdigit() and token not in named:
                named.append(token)
    criteria = [f'- [ ] **{name}.** Holds.' for name in named]
    return '\n'.join(lines + ['', '## Acceptance Criteria', ''] + criteria + [''])


def test_plan(*rows: tuple[str, str], prose: str = '') -> str:
    """A pull request body whose Test Plan table holds rows of (test, coverage)."""
    lines = ['## Test Plan', '', '| Test | Description | Coverage | Pass |', '| --- | --- | --- | --- |']
    lines += [f'| {test} | The check holds. | {coverage} | |' for test, coverage in rows]
    if prose:
        lines += ['', prose]
    return '\n'.join(lines) + '\n'


class TestPlanAgreement(unittest.TestCase):
    def run_sync(self, epic: dict, pulls: list[dict], *args: str):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                       '--links', links_file(root, []),
                       '--project', project(root, 'docker', 'main', 'workflows'), *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_a_plan_that_names_an_uncovered_criterion_is_reported(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    body=test_plan(('T1', 'AC1'), ('T2', 'AC3')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC3 named, which the row does not cover', done.stdout)

    def test_a_covered_criterion_no_plan_row_names_is_reported(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1, AC2', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=test_plan(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC2 covered and named by no test', done.stdout)
        self.assertNotIn('no test observes it', done.stdout)

    def test_a_pull_request_with_no_test_plan_names_nothing(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        done, _fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC1 covered and named by no test', done.stdout)

    def test_an_empty_test_cell_is_unobserved(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=test_plan(('', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC1 covered and no test observes it', done.stdout)
        self.assertNotIn('named by no test', done.stdout)

    def test_an_exact_plan_reports_nothing(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_joined_rows_agree_when_the_plan_names_their_coverage(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', 'W02'),
            (f"[W02]({url('pull', 950)})", 'AC2', 'W01')))
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1'), ('T2', 'AC2')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_a_joined_plan_that_misses_one_row_names_that_row(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', 'W02'),
            (f"[W02]({url('pull', 950)})", 'AC2', 'W01')))
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W02: AC2 covered and named by no test', done.stdout)
        self.assertNotIn('disagreement: #950 W01', done.stdout)

    def test_a_disagreement_leaves_linking_and_ticks_unchanged(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(('W01', 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    body=test_plan(('T1', 'AC1'), ('T2', 'AC3')))]
        done, fixed = self.run_sync(epic, pulls, '--link', 'W01=950', '--tick', 'AC1')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC3 named, which the row does not cover', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_a_statement_that_assigns_a_criterion_to_the_wrong_row_is_reported(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here; it belongs to W03.'
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=test_plan(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)
        self.assertNotIn('named, which', done.stdout)
        self.assertNotIn('named by no test', done.stdout)

    def test_left_to_and_owned_by_assign_the_same_way(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        for prose in ('AC2 is left to W03.', 'AC2 is owned by W03.'):
            pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1'), prose=prose))]
            done, _fixed = self.run_sync(epic, pulls)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)

    def test_a_sentence_assigns_each_criterion_it_names(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC1 and AC2 belong to W03.'
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W03: AC1 assigned to W03, which the table gives to W01', done.stdout)
        self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)

    def test_a_statement_that_assigns_a_criterion_to_its_row_is_silent(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here; it belongs to W02.'
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_an_assignment_in_the_next_sentence_is_not_read(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here. It belongs to W03.'
        pulls = [pr(950, '[I01:E00] Work', body=test_plan(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)


def review_body(*numbers: int) -> str:
    """A review pull request body whose References cite the given pull requests."""
    lines = ['## Overview', '', 'The base carries the epic.', '', '## References', '']
    lines += [f"- **R{i}.** [Work]({url('pull', n)}) — a task delivery." for i, n in enumerate(numbers, 1)]
    return '\n'.join(lines + [''])


class ReviewReferences(unittest.TestCase):
    def run_sync(self, pulls: list[dict], body: str | None = None) -> str:
        epic = issue(2, '[I01:E00] First: Epic',
                     body=body or epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, []),
                       '--project', project(root, 'docker', 'main', 'workflows'))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_a_review_body_that_cites_every_merge_is_silent(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950))]
        self.assertNotIn('references:', self.run_sync(pulls))

    def test_a_merge_the_review_body_omits_names_both_sets(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-02T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950))]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites #950; merged #950, #951', out)

    def test_a_review_body_with_no_references_names_the_merges(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites none; merged #950', out)

    def test_a_cited_pull_request_that_did_not_merge_into_the_base_is_named(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950, 44))]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites #44, #950; merged #950', out)

    def test_a_bare_number_cites_a_pull_request(self):
        body = '\n'.join(['## References', '', '- **R1.** #950 — a task delivery.', ''])
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main', body=body)]
        self.assertNotIn('references:', self.run_sync(pulls))

    def test_a_citation_outside_references_is_not_read(self):
        body = '\n'.join(['## Overview', '', 'Opened on #950.', '', '## References', ''])
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main', body=body)]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites none; merged #950', out)

    def test_each_base_is_measured_against_its_own_merges(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/workflows', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main', body=review_body(950)),
                 pr(981, '[I01:E00] First', base='workflows', head='i01/e00/workflows',
                    body=review_body(950))]
        out = self.run_sync(pulls, body=body)
        self.assertIn('references: i01/e00/workflows (#981) cites #950; merged #951', out)
        self.assertNotIn('(#980)', out)

    def test_a_merged_review_pull_request_is_not_measured(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        self.assertNotIn('references:', self.run_sync(pulls, body=body))
