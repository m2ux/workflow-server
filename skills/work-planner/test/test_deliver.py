"""The work deliver.py finds available on a theme board, and the rows it reserves and releases.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import initiative_body, issue, item, links, pr, run, url
from test_agent_review import reviewed_pr

RECORDS = 'https://github.com/o/r/tree/engineering/artifacts/planning'
TODAY = '2026-10-06'
PLAN = ('## Test Plan\n\n'
        '| Test | Description | Coverage | Pass |\n| --- | --- | --- | --- |\n'
        '| T1 | The check holds. | AC1 | ✓ |\n')


def epic_body(*rows: tuple[str, str, str, str]) -> str:
    """An epic body whose rows are (task id, description, depends on, joins)."""
    lines = ['## Work Breakdown', '', '| Task | Description | Coverage | Depends on | Joins | Done |',
             '| --- | --- | --- | --- | --- | --- |']
    lines += [f'| {task} | {description} | AC1 | {depends} | {joins} | |'
              for task, description, depends, joins in rows]
    return '\n'.join(lines + ['', '## Acceptance Criteria', '', '- [ ] **AC1.** Holds.', ''])


def epic(number: int, *rows: tuple[str, str, str, str], which: str = '07:E00') -> dict:
    return issue(number, f'[I{which}] Queue Plan: Work', body=epic_body(*rows))


def task(number: int, *criteria: bool, which: str = '07:E00:W01') -> dict:
    """A task issue whose acceptance criteria are ticked as given, AC1 ticked by default."""
    marks = criteria or (True,)
    lines = [f"- [{'x' if held else ' '}] **AC{n}.** Holds." for n, held in enumerate(marks, 1)]
    return issue(number, f'[I{which}] Queue Plan: Work',
                 body='\n'.join(['## Acceptance Criteria', '', *lines, '']))


def staged(*entries: tuple[dict, str]) -> list[dict]:
    items = []
    for n, (content, status) in enumerate(entries):
        content['id'] = 1000 + content['number']
        row = item(content, status)
        row['id'] = 100 + n
        items.append(row)
    return items


def survey(items: list[dict], prs: list[dict] | None = None, *args: str,
           held: tuple[dict, ...] = ()) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        items_path, prs_path = root / 'items.json', root / 'prs.json'
        links_path = root / 'links.json'
        items_path.write_text(json.dumps(items))
        prs_path.write_text('\n'.join(json.dumps(p) for p in prs or []))
        links_path.write_text(json.dumps(list(held)))
        done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                   '--links', str(links_path), '--date', TODAY, *args)
        assert done.returncode == 0, done.stderr
        return done.stdout


def states(root: Path, *names: str) -> None:
    """A checkout stating the long-lived branches in config/branches."""
    stated = root / 'config' / 'branches'
    stated.parent.mkdir(parents=True, exist_ok=True)
    stated.write_text(''.join(f'{name}\n' for name in names))


def edit(body_issue: dict, *args: str) -> tuple[str, str, int]:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        path, fixed = root / 'issue.json', root / 'fixed.md'
        path.write_text(json.dumps(body_issue))
        done = run('deliver.py', '--epic', str(path), '--fix', str(fixed), '--date', TODAY, *args)
        return done.stdout + done.stderr, fixed.read_text() if fixed.exists() else '', done.returncode


class Survey(unittest.TestCase):
    def test_free_row_of_a_started_epic_is_a_unit(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')))
        self.assertIn('unit I07:E00:W01: coverage AC1, '
                      f'record {TODAY}-943-i07-e00-w01-queue-plan, '
                      'branch i07/e00/w01-queue-plan, worktree .worktrees/i07/e00/w01-queue-plan', output)
        self.assertIn('available: 1, held: 0, blocked: 0', output)

    def test_a_unit_names_its_epic_base(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            states(root, 'main')
            output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                            None, '--project', str(root), '--bases', 'i07/e00/main,i07/e00/workspace')
        self.assertIn('base i07/e00/main', output)
        self.assertNotIn('workspace', output)

    def test_a_unit_names_each_of_its_epic_bases(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            states(root, 'main', 'workflows')
            output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                            None, '--project', str(root), '--bases', 'i07/e00/workflows,i07/e00/main')
        self.assertIn('bases i07/e00/main i07/e00/workflows', output)

    def test_epic_in_backlog_offers_nothing(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'Backlog')))
        self.assertNotIn('unit', output)
        self.assertIn('available: 0', output)

    def test_sibling_epics_offer_their_units_in_one_survey(self):
        first = epic(943, ('W01', 'Shape', '', 'W02'), ('W02', 'Fit', '', 'W01'))
        second = epic(944, ('W01', 'Draft', '', ''), ('W02', 'Extend', 'W01', ''), which='07:E01')
        output = survey(staged((first, 'Ready'), (second, 'Ready')))
        self.assertIn('unit I07:E00:W01+W02', output)
        self.assertIn('unit I07:E01:W01', output)
        self.assertIn('available: 2, held: 0, blocked: 1', output)

    def test_only_the_row_naming_another_epic_waits_for_it(self):
        prerequisite = epic(943, (f"[W01]({url('pull', 9)})", 'Produce', '', ''))
        dependent = epic(944, ('W01', 'Independent work', '', ''),
                         ('W02', 'Consume', f"[E00:W01]({url('issues', 943)})", ''), which='07:E01')
        pulls = [pr(9, '[I07:E00] Produce', merged='2026-01-01T00:00:00Z', base='i07/e00/main')]
        output = survey(staged((prerequisite, 'In Review'), (dependent, 'Ready')), pulls)
        self.assertIn('unit I07:E01:W01', output)
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn('available: 1, held: 0, blocked: 1', output)
        prerequisite['state'], prerequisite['state_reason'] = 'closed', 'completed'
        output = survey(staged((prerequisite, 'Done'), (dependent, 'Ready')), pulls)
        self.assertIn('available: 2, held: 0, blocked: 0', output)

    def test_initiative_prerequisite_blocks_dispatch_despite_ready_status(self):
        from fixtures import initiative_body
        parent = issue(1, '[I07] Delivery: Work', body=initiative_body(
            (f"[E00]({url('issues', 943)})", ''),
            (f"[E01]({url('issues', 944)})", f"[E00]({url('issues', 943)})")))
        prerequisite = epic(943, ('W01', 'Produce', '', ''))
        dependent = epic(944, ('W01', 'Consume', '', ''), which='07:E01')
        output = survey(staged((parent, 'In Progress'), (prerequisite, 'In Review'), (dependent, 'Ready')))
        self.assertNotIn('  unit ', output)
        self.assertIn('prerequisite epic not completed', output)

    def test_row_linking_a_planning_folder_is_held(self):
        held = f'[W01]({RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/)'
        output = survey(staged((epic(943, (held, 'Queue plan', '', '')), 'In Progress')))
        self.assertIn(f'hold I07:E00:W01: {RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/', output)
        self.assertIn('available: 0, held: 1', output)

    def test_row_linking_a_work_item_file_is_free(self):
        planned = f'[W01]({RECORDS}/2026-09-01-936-queue/w01.md)'
        output = survey(staged((epic(943, (planned, 'Queue plan', '', '')), 'In Progress')))
        self.assertIn('unit I07:E00:W01', output)

    def test_row_linking_a_pull_request_is_neither(self):
        linked = f"[W01]({url('pull', 950)})"
        output = survey(staged((epic(943, (linked, 'Queue plan', '', '')), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan')])
        self.assertIn('available: 0, held: 0, blocked: 0', output)

    def test_undelivered_dependency_blocks_the_row(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', ''),
                                     ('W02', 'Dispatch', 'W01', '')), 'In Progress')))
        self.assertIn('unit I07:E00:W01', output)
        self.assertIn('blocked I07:E00:W02: depends on W01', output)
        self.assertIn('available: 1, held: 0, blocked: 1', output)

    def test_an_entry_that_cannot_resolve_is_told_from_a_blocked_row(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            items_path, prs_path = root / 'items.json', root / 'prs.json'
            items_path.write_text(json.dumps(staged(
                (epic(943, ('W01', 'Queue plan', '', ''),
                      ('W02', 'Dispatch', 'E05 (W04)', '')), 'In Progress'))))
            prs_path.write_text('')
            links_path = root / 'links.json'
            links_path.write_text('[]')
            done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                       '--links', str(links_path), '--date', TODAY)
        self.assertIn('unit I07:E00:W01', done.stdout)
        self.assertIn('unresolvable I07:E00:W02: E05 (W04) cannot resolve', done.stdout)
        self.assertIn('available: 1, held: 0, blocked: 0, unresolvable: 1', done.stdout)
        self.assertEqual(done.returncode, 1)

    def test_an_unresolvable_epic_prerequisite_names_itself(self):
        initiative = issue(900, '[I07] Theme: Work', body=initiative_body(
            (f"[E00]({url('issues', 943)})", 'E09 (W04)')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            items_path, prs_path = root / 'items.json', root / 'prs.json'
            items_path.write_text(json.dumps(staged(
                (initiative, 'In Progress'),
                (epic(943, ('W01', 'Queue plan', '', '')), 'In Progress'))))
            prs_path.write_text('')
            links_path = root / 'links.json'
            links_path.write_text('[]')
            done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                       '--links', str(links_path), '--date', TODAY)
        self.assertIn("unresolvable I07:E00:W01: its epic's prerequisite cannot resolve", done.stdout)
        self.assertEqual(done.returncode, 1)

    def test_a_held_sibling_does_not_hide_an_unresolvable_row(self):
        folder = f'{RECORDS}/2026-10-06-943-i07-e00-w01-queue-plan/'
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            items_path, prs_path = root / 'items.json', root / 'prs.json'
            items_path.write_text(json.dumps(staged(
                (epic(943, (f'[W01]({folder})', 'Queue plan', '', 'W02'),
                      ('W02', 'Dispatch', 'E05 (W04)', 'W01')), 'In Progress'))))
            prs_path.write_text('')
            links_path = root / 'links.json'
            links_path.write_text('[]')
            done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                       '--links', str(links_path), '--date', TODAY)
        self.assertIn('unresolvable I07:E00:W02: E05 (W04) cannot resolve', done.stdout)
        self.assertNotIn('hold I07:E00:W01', done.stdout)
        self.assertEqual(done.returncode, 1)

    def test_joined_tasks_are_one_unit(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', 'W02'),
                                     ('W02', 'Dispatch', '', 'W01')), 'In Progress')))
        self.assertIn('unit I07:E00:W01+W02: coverage AC1, '
                      f'record {TODAY}-943-i07-e00-w01-queue-plan', output)
        self.assertIn('available: 1,', output)

    def test_a_finished_pull_request_is_merged(self):
        linked = f"[W01]({url('pull', 950)})"
        record = epic(943, (linked, 'Queue plan', '', ''))
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
        output = survey(staged((record, 'In Progress'), (task(637), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main',
                            head='i07/e00/w01-queue-plan')],
                        held=(links(950, 637),))
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)

    def test_an_unticked_task_criterion_allows_a_passed_plan_to_merge(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress'),
                               (task(637, True, False), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')],
                        held=(links(950, 637),))
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)
        self.assertNotIn('blocked merge', output)

    def test_a_passed_plan_without_a_task_issue_can_merge(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')])
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)
        self.assertNotIn('blocked merge', output)

    def test_a_task_issue_without_criteria_allows_a_passed_plan_to_merge(self):
        bare = issue(637, '[I07:E00:W01] Queue Plan: Work', body='## Overview\n\nWork.\n')
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress'),
                               (bare, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')],
                        held=(links(950, 637),))
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)
        self.assertNotIn('blocked merge', output)

    def test_an_open_pass_cell_is_not_merged(self):
        record = epic(943, ('W01', 'Queue plan', '', ''))
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN.replace('✓', ''),
                            base='i07/e00/main')])
        self.assertNotIn('merge #', output)
        self.assertIn('merge: 0', output)

    def test_a_linked_pass_result_allows_the_merge(self):
        evidence = f'{RECORDS}/2026-10-06-943-checks/results.md#t1'
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress'),
                               (task(637), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN.replace('✓', f'[✓]({evidence})'),
                            base='i07/e00/main')],
                        held=(links(950, 637),))
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)

    def test_an_incomplete_linked_result_withholds_the_merge(self):
        evidence = f'{RECORDS}/2026-10-06-943-checks/results.md#t2'
        for result in ('Partial', 'Fail', 'Not run', '✓ Partial'):
            with self.subTest(result=result):
                body = PLAN + f'| T2 | Another check. | AC1 | [{result}]({evidence}) |\n'
                output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                                [pr(950, '[I07:E00] Queue plan', body=body, base='i07/e00/main')])
                self.assertNotIn('merge #', output)
                self.assertIn('merge: 0', output)

    def test_an_unticked_epic_criterion_does_not_withhold_the_merge(self):
        linked = f"[W01]({url('pull', 950)})"
        record = epic(943, (linked, 'Queue plan', '', ''))
        record['body'] = record['body'].replace('| AC1 |', '| AC1, AC2 |', 1)
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.** Holds.\n- [ ] **AC2.** Holds.')
        output = survey(staged((record, 'In Progress'), (task(637), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')],
                        held=(links(950, 637),))
        self.assertIn('  merge #950 I07:E00: base i07/e00/main', output)

    def test_a_merged_pull_request_is_not_merged_again(self):
        record = epic(943, ('W01', 'Queue plan', '', ''))
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', merged='2026-09-01T00:00:00Z', body=PLAN,
                            base='i07/e00/main')])
        self.assertNotIn('merge #', output)

    def test_a_pull_request_on_another_base_is_not_merged(self):
        record = epic(943, ('W01', 'Queue plan', '', ''))
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='main')])
        self.assertNotIn('merge #', output)

    def test_a_held_task_holds_the_unit_it_joins(self):
        held = f'[W02]({RECORDS}/{TODAY}-943-i07-e00-w02-dispatch/)'
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', 'W02'),
                                     (held, 'Dispatch', '', 'W01')), 'In Progress')))
        self.assertIn('hold I07:E00:W02', output)
        self.assertNotIn('unit', output)


class Reserve(unittest.TestCase):
    def test_reserve_sets_the_record_link(self):
        report, body, code = edit(epic(943, ('W01', 'Queue plan', '', '')),
                                  '--reserve', 'W01', '--records', RECORDS)
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/) |', body)
        self.assertIn('reserved: W01 →', report)

    def test_reserve_replaces_the_work_item_link(self):
        planned = f'[W01]({RECORDS}/2026-09-01-936-queue/w01.md)'
        report, body, code = edit(epic(943, (planned, 'Queue plan', '', '')), '--reserve', 'W01')
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/) |', body)

    def test_reserve_refuses_a_row_already_held(self):
        held = f'[W01]({RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/)'
        report, _, code = edit(epic(943, (held, 'Queue plan', '', '')), '--reserve', 'W01')
        self.assertEqual(code, 1)
        self.assertIn('already held', report)

    def test_reserve_refuses_a_row_linking_a_pull_request(self):
        linked = f"[W01]({url('pull', 950)})"
        report, _, code = edit(epic(943, (linked, 'Queue plan', '', '')),
                               '--reserve', 'W01', '--records', RECORDS)
        self.assertEqual(code, 1)
        self.assertIn('links a pull request', report)

    def test_a_reserved_row_is_held_with_one_link(self):
        record = f'{RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/'
        output = survey(staged((epic(943, (f'[W01]({record})', 'Queue plan', '', '')), 'In Progress')))
        self.assertIn('hold I07:E00:W01', output)
        self.assertIn('available: 0, held: 1', output)

    def test_release_points_to_the_work_item(self):
        record = f'{RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/'
        report, body, code = edit(epic(943, (f'[W01]({record})', 'Queue plan', '', '')), '--release', 'W01')
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({record}w01.md) |', body)
        self.assertNotIn(f']({record})', body)

    def test_release_refuses_a_free_row(self):
        report, _, code = edit(epic(943, ('W01', 'Queue plan', '', '')), '--release', 'W01')
        self.assertEqual(code, 1)
        self.assertIn('links no planning folder', report)


if __name__ == '__main__':
    unittest.main()


class DispatchStatus(unittest.TestCase):
    """The Status a dispatch settles, within the DISPATCH jurisdiction."""

    def fields(self, *names: str) -> list[dict]:
        return [{'id': 7, 'name': 'Status',
                 'options': [{'name': name, 'id': n} for n, name in enumerate(names, start=1)]}]

    def place(self, entries: list[dict], *args: str,
              statuses: tuple[str, ...] = ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'),
              review=True):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            items_path, fields_path = root / 'items.json', root / 'fields.json'
            items_path.write_text(json.dumps(entries))
            fields_path.write_text(json.dumps(self.fields(*statuses)))
            pull, record = reviewed_pr()
            prs_path, records_path = root / 'prs.json', root / 'reviews.json'
            prs_path.write_text(json.dumps(pull))
            records_path.write_text(json.dumps([record] if review else []))
            return run('deliver.py', '--items', str(items_path), '--board', 'users/o/projectsV2/9',
                       '--fields', str(fields_path), '--out', str(root / 'out'),
                       '--assignee', 'me', '--prs', str(prs_path),
                       '--agent-reviews', str(records_path), *args)

    def board(self, *entries: tuple[dict, str]) -> list[dict]:
        rows = []
        for n, (content, status) in enumerate(entries):
            content['id'] = 1000 + content['number']
            content['assignees'] = [{'login': 'me'}]
            rows.append({**item(content, status), 'id': 100 + n})
        return rows

    def test_a_held_row_and_its_epic_go_to_in_progress(self):
        done = self.place(self.board((task(637), 'Ready'), (epic(943), 'Ready')),
                          '--progress', '637,943')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('set #637 [I07:E00:W01] Queue Plan: Work: Ready → In Progress', done.stdout)
        self.assertIn('set #943 [I07:E00] Queue Plan: Work: Ready → In Progress', done.stdout)

    def test_missing_review_prevents_dispatch_handoff(self):
        done = self.place(self.board((epic(943), 'In Progress')), '--review', '943', review=False)
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('missing agent review', done.stderr)
        self.assertNotIn('gh api', done.stdout)

    def test_a_complete_epic_goes_to_in_review(self):
        done = self.place(self.board((epic(943), 'In Progress')), '--review', '943')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('set #943 [I07:E00] Queue Plan: Work: In Progress → In Review', done.stdout)

    def test_a_board_without_in_review_falls_back_to_in_progress(self):
        done = self.place(self.board((epic(943), 'Ready')), '--review', '943',
                          statuses=('Backlog', 'Ready', 'In Progress', 'Done'))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('Ready → In Progress', done.stdout)

    def test_a_task_is_not_set_in_review(self):
        done = self.place(self.board((task(637), 'In Progress')), '--review', '637')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('a dispatch does not set a task In Review', done.stderr)

    def test_an_issue_off_the_board_is_refused(self):
        done = self.place(self.board((epic(943), 'Ready')), '--progress', '944')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('not on the board: #944', done.stderr)

    def test_the_board_arguments_go_together(self):
        with tempfile.TemporaryDirectory() as tmp:
            items_path = Path(tmp, 'items.json')
            items_path.write_text(json.dumps(self.board((epic(943), 'Ready'))))
            done = run('deliver.py', '--items', str(items_path), '--progress', '943')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--board is required with --progress or --review', done.stderr)
