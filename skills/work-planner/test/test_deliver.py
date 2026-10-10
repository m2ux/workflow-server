"""The work deliver.py finds available on a theme board, and the rows it reserves and releases.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import issue, item, pr, run, url

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


def staged(*entries: tuple[dict, str]) -> list[dict]:
    items = []
    for n, (content, status) in enumerate(entries):
        content['id'] = 1000 + content['number']
        row = item(content, status)
        row['id'] = 100 + n
        items.append(row)
    return items


def survey(items: list[dict], prs: list[dict] | None = None, *args: str) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        items_path, prs_path = root / 'items.json', root / 'prs.json'
        items_path.write_text(json.dumps(items))
        prs_path.write_text('\n'.join(json.dumps(p) for p in prs or []))
        done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                   '--date', TODAY, *args)
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
                      'branch i07/e00/w01-queue-plan, worktree .worktrees/i07-e00-w01', output)
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

    def test_ready_epic_waits_for_its_task_prerequisites_to_reach_the_long_lived_branch(self):
        prerequisite = epic(943, (f"[W01]({url('pull', 9)})", 'Produce', '', ''))
        dependent = epic(944, ('W01', 'Independent work', '', ''),
                         ('W02', 'Consume', f"[E00:W01]({url('issues', 943)})", ''), which='07:E01')
        pulls = [pr(9, '[I07:E00] Produce', merged='2026-01-01T00:00:00Z', base='i07/e00/main')]
        output = survey(staged((prerequisite, 'In Review'), (dependent, 'Ready')), pulls)
        self.assertNotIn('  unit ', output)
        self.assertIn('available: 0, held: 0, blocked: 2', output)
        self.assertIn('prerequisite epic not completed', output)
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
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main',
                            head='i07/e00/w01-queue-plan')])
        self.assertIn('merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)

    def test_an_open_pass_cell_is_not_merged(self):
        record = epic(943, ('W01', 'Queue plan', '', ''))
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN.replace('✓', ''),
                            base='i07/e00/main')])
        self.assertNotIn('merge #', output)
        self.assertIn('merge: 0', output)

    def test_an_unticked_coverage_criterion_does_not_withhold_the_merge(self):
        linked = f"[W01]({url('pull', 950)})"
        record = epic(943, (linked, 'Queue plan', '', ''))
        record['body'] = record['body'].replace('| AC1 |', '| AC1, AC2 |', 1)
        record['body'] = record['body'].replace('- [ ] **AC1.**', '- [x] **AC1.** Holds.\n- [ ] **AC2.** Holds.')
        output = survey(staged((record, 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')])
        self.assertIn('merge #950 I07:E00: base i07/e00/main', output)

    def test_a_passed_plan_merges_while_no_criterion_is_ticked(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                        [pr(950, '[I07:E00] Queue plan', body=PLAN, base='i07/e00/main')])
        self.assertIn('merge #950 I07:E00: base i07/e00/main', output)
        self.assertIn('merge: 1', output)

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
