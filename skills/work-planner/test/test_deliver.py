"""The work deliver.py finds available on a theme board, and the rows it reserves and releases.
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import declared, git, hotfix, initiative_body, issue, item, links, pr, run, url, work_item
from test_agent_review import reviewed_pr

RECORDS = 'https://github.com/o/r/tree/engineering/artifacts/planning'
TODAY = '2026-10-06'
PLAN = ('## Test Plan\n\n'
        '| Test | Description | Coverage | Pass |\n| --- | --- | --- | --- |\n'
        '| T1 | The check holds. | AC1 | ✓ |\n')


def epic_body(*rows: tuple[str, str, str, str]) -> str:
    """An epic body whose rows are (task id, description, depends on, joins)."""
    lines = ['## Work Breakdown', '', '| Task | Description | Coverage | Depends on | Joins | Lane | Done |',
             '| --- | --- | --- | --- | --- | --- | --- |']
    lines += [f'| {task} | {description} | AC1 | {depends} | {joins} | | |'
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
           held: tuple[dict, ...] = (), code: int = 0) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        items_path, prs_path = root / 'items.json', root / 'prs.json'
        links_path = root / 'links.json'
        items_path.write_text(json.dumps(items))
        prs_path.write_text('\n'.join(json.dumps(p) for p in prs or []))
        links_path.write_text(json.dumps(list(held)))
        done = run('deliver.py', '--items', str(items_path), '--prs', str(prs_path),
                   '--links', str(links_path), '--date', TODAY, *args)
        assert done.returncode == code, done.stdout + done.stderr
        return done.stdout


def planned(root: Path, *components: tuple[str, str]) -> tuple[list[str], dict[str, str]]:
    """The --engineering arguments of a checkout holding each (task, component) work item, and
    each task's row id linking its file."""
    checkout = root / 'engineering'
    folder = checkout / 'artifacts' / 'planning' / 'record'
    folder.mkdir(parents=True)
    ids = {}
    for task, component in components:
        (folder / f'{task.lower()}.md').write_text(work_item(component))
        ids[task] = f'[{task}](https://github.com/o/r/blob/engineering/artifacts/planning/record/{task.lower()}.md)'
    return ['--engineering', str(checkout)], ids


THREE_BASES = ('--bases', 'i07/e00/main,i07/e00/workflows,i07/e00/workspace')


def edit(body_issue: dict, *args: str, records: dict[str, dict[str, str]] | None = None,
         status: str | None = 'Ready') -> tuple[str, str, int]:
    """Run an edit; records gives each planning folder's files, written to an engineering checkout
    passed as --engineering. A reservation reads the board items, where the epic stands at status,
    or is absent when status is None."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        path, fixed = root / 'issue.json', root / 'fixed.md'
        path.write_text(json.dumps(body_issue))
        extra = []
        if '--reserve' in args:
            items_path = root / 'items.json'
            items_path.write_text(json.dumps(staged((dict(body_issue), status)) if status else []))
            extra = ['--items', str(items_path)]
        if records is not None:
            checkout = root / 'engineering'
            for folder, files in records.items():
                (checkout / 'artifacts' / 'planning' / folder).mkdir(parents=True)
                for name, text in files.items():
                    (checkout / 'artifacts' / 'planning' / folder / name).write_text(text)
            extra += ['--engineering', str(checkout)]
        done = run('deliver.py', '--epic', str(path), '--fix', str(fixed), '--date', TODAY, *args, *extra)
        return done.stdout + done.stderr, fixed.read_text() if fixed.exists() else '', done.returncode


def record(*tasks: str) -> dict[str, str]:
    """A planning folder's files: each task's work item, and a README linking each by its lower-case name."""
    files = {f'{task.lower()}.md': '**Component:** workspace:a.py\n' for task in tasks}
    files['README.md'] = '\n'.join(f'| [{task} work item]({task.lower()}.md) | Plan |' for task in tasks)
    return files


class Survey(unittest.TestCase):
    def test_free_row_of_a_started_epic_is_a_unit(self):
        output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')))
        self.assertIn('unit I07:E00:W01: unlaned, coverage AC1, '
                      f'record {TODAY}-943-i07-e00-w01-queue-plan, '
                      'branch i07/e00/w01-queue-plan, worktree .worktrees/i07/e00/w01-queue-plan', output)
        self.assertIn('available: 1, held: 0, blocked: 0', output)

    def test_a_unit_names_its_epic_base(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output = survey(staged((epic(943, ('W01', 'Queue plan', '', '')), 'In Progress')),
                            None, *declared(root, 'main'), '--bases', 'i07/e00/main,i07/e00/workspace')
        self.assertIn('branch i07/e00/w01-queue-plan, base i07/e00/main, '
                      'worktree .worktrees/i07/e00/w01-queue-plan', output)
        self.assertNotIn('workspace', output)

    def test_a_unit_takes_a_branch_and_worktree_per_epic_base(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            engineering, ids = planned(root, ('W01', 'main:src/plan.ts'), ('W02', 'workflows:corpus/plan.md'))
            body = epic(943, (ids['W01'], 'Queue plan', '', 'W02'), (ids['W02'], 'Queue corpus', '', 'W01'))
            output = survey(staged((body, 'In Progress')), None, *declared(root, 'main', 'workflows'),
                            *engineering, '--bases', 'i07/e00/workflows,i07/e00/main')
        self.assertIn(f'record {TODAY}-943-i07-e00-w01-queue-plan, '
                      'branch i07/e00/w01-queue-plan-main, base i07/e00/main, '
                      'worktree .worktrees/i07/e00/w01-queue-plan-main; '
                      'branch i07/e00/w01-queue-plan-workflows, base i07/e00/workflows, '
                      'worktree .worktrees/i07/e00/w01-queue-plan-workflows\n', output)

    def test_a_unit_takes_only_the_epic_bases_its_rows_change(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            engineering, ids = planned(root, ('W01', 'workspace:skills/plan.py'))
            output = survey(staged((epic(943, (ids['W01'], 'Queue plan', '', '')), 'In Progress')),
                            None, *declared(root, 'main', 'workflows', 'workspace'), *engineering, *THREE_BASES)
        self.assertIn(f'record {TODAY}-943-i07-e00-w01-queue-plan, '
                      'branch i07/e00/w01-queue-plan, base i07/e00/workspace, '
                      'worktree .worktrees/i07/e00/w01-queue-plan\n', output)
        self.assertNotIn('i07/e00/main', output)
        self.assertNotIn('i07/e00/workflows', output)
        self.assertIn('available: 1', output)

    def test_a_unit_of_several_bases_declaring_none_is_undeclared(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            engineering, ids = planned(root, ('W02', 'skills/plan.py'), ('W03', 'docker:Dockerfile'))
            body = epic(943, (ids['W02'], 'Queue more', '', ''), (ids['W03'], 'Queue image', '', ''))
            output = survey(staged((body, 'In Progress')), None,
                            *declared(root, 'main', 'workflows', 'workspace'), *engineering, *THREE_BASES, code=1)
        self.assertIn('undeclared I07:E00:W02: component skills/plan.py names no long-lived branch', output)
        self.assertIn('undeclared I07:E00:W03: component docker:Dockerfile names docker, which has no epic base',
                      output)
        self.assertNotIn('  unit ', output)
        self.assertIn('available: 0, held: 0, blocked: 0, unresolvable: 0, undeclared: 2', output)

    def test_an_unplanned_row_of_several_bases_takes_every_epic_base(self):
        rows_given = {'plain': ('W01', 'Queue plan', '', ''),
                      'task issue': ('[W01](https://github.com/o/r/issues/950)', 'Queue plan', '', '')}
        for case, row in rows_given.items():
            with self.subTest(case), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                engineering, _ = planned(root)
                output = survey(staged((epic(943, row), 'In Progress')), None,
                                *declared(root, 'main', 'workflows', 'workspace'), *engineering, *THREE_BASES)
                self.assertNotIn('undeclared I07', output)
                for name in ('main', 'workflows', 'workspace'):
                    self.assertIn(f'branch i07/e00/w01-queue-plan-{name}, base i07/e00/{name}, '
                                  f'worktree .worktrees/i07/e00/w01-queue-plan-{name}', output)
                self.assertIn('available: 1, held: 0, blocked: 0, unresolvable: 0, undeclared: 0', output)

    def test_an_unplanned_row_joined_to_a_declared_row_takes_every_epic_base(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            engineering, ids = planned(root, ('W02', 'workspace:skills/plan.py'))
            body = epic(943, ('W01', 'Queue plan', '', 'W02'), (ids['W02'], 'Queue more', '', 'W01'))
            output = survey(staged((body, 'In Progress')), None,
                            *declared(root, 'main', 'workflows', 'workspace'), *engineering, *THREE_BASES)
        self.assertIn('unit I07:E00:W01+W02', output)
        for name in ('main', 'workflows', 'workspace'):
            self.assertIn(f'base i07/e00/{name}', output)

    def test_a_work_item_is_read_only_from_the_engineering_checkout(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            _, ids = planned(root, ('W01', 'workspace:skills/plan.py'))
            output = survey(staged((epic(943, (ids['W01'], 'Queue plan', '', '')), 'In Progress')),
                            None, *THREE_BASES, code=1)
        self.assertIn('undeclared I07:E00:W01: artifacts/planning/record/w01.md needs --engineering to be read',
                      output)

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

    def test_the_producer_epics_closure_alone_starts_no_row(self):
        prerequisite = issue(943, '[I07:E00] Queue Plan: Work', 'closed',
                             body=epic_body((f"[W01]({url('pull', 9)})", 'Produce', '', '')))
        dependent = epic(944, ('W01', 'Consume', f"[E00:W01]({url('issues', 943)})", ''), which='07:E01')
        pulls = [pr(9, '[I07:E00] Produce', merged='2026-01-01T00:00:00Z', base='i07/e00/main')]
        output = survey(staged((prerequisite, 'Done'), (dependent, 'Ready')), pulls)
        self.assertIn('blocked I07:E01:W01', output)
        self.assertIn('output #944 W01: E00:W01 #9 unverified', output)

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
        self.assertIn('unit I07:E00:W01+W02: unlaned, coverage AC1, '
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

    def test_reserve_refuses_a_unit_whose_epic_is_not_ready_or_in_progress(self):
        for status in ('Backlog', 'In Review', 'Done', None):
            with self.subTest(status=status):
                report, body, code = edit(epic(943, ('W01', 'Queue plan', '', '')),
                                          '--reserve', 'W01', '--records', RECORDS, status=status)
                self.assertEqual(code, 1, report)
                self.assertIn('#943 [I07:E00] is ' + (status or 'not on the board'), report)
                self.assertEqual(body, '')

    def test_reserve_holds_a_unit_whose_epic_is_ready_or_in_progress(self):
        for status in ('Ready', 'In Progress'):
            with self.subTest(status=status):
                report, body, code = edit(epic(943, ('W01', 'Queue plan', '', '')),
                                          '--reserve', 'W01', '--records', RECORDS, status=status)
                self.assertEqual(code, 0, report)
                self.assertIn('reserved: W01 →', report)

    def test_reserve_needs_the_board_items(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'issue.json')
            path.write_text(json.dumps(epic(943, ('W01', 'Queue plan', '', ''))))
            done = run('deliver.py', '--epic', str(path), '--reserve', 'W01', '--records', RECORDS,
                       '--fix', str(Path(tmp, 'fixed.md')))
        self.assertEqual(done.returncode, 1)
        self.assertIn('--reserve needs --items', done.stderr)

    def test_a_reserved_row_is_held_with_one_link(self):
        record = f'{RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/'
        output = survey(staged((epic(943, (f'[W01]({record})', 'Queue plan', '', '')), 'In Progress')))
        self.assertIn('hold I07:E00:W01', output)
        self.assertIn('available: 0, held: 1', output)

    def test_release_points_to_the_work_item(self):
        folder = f'{TODAY}-943-i07-e00-w01-queue-plan'
        held = f'{RECORDS}/{folder}/'
        report, body, code = edit(epic(943, (f'[W01]({held})', 'Queue plan', '', '')), '--release', 'W01',
                                  records={folder: record('W01')})
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({held}w01.md) |', body)
        self.assertNotIn(f']({held})', body)

    def test_release_refuses_a_free_row(self):
        report, _, code = edit(epic(943, ('W01', 'Queue plan', '', '')), '--release', 'W01', records={})
        self.assertEqual(code, 1)
        self.assertIn('links no planning folder', report)

    def test_release_needs_the_records_checkout(self):
        held = f'{RECORDS}/{TODAY}-943-i07-e00-w01-queue-plan/'
        report, _, code = edit(epic(943, (f'[W01]({held})', 'Queue plan', '', '')), '--release', 'W01')
        self.assertEqual(code, 1)
        self.assertIn('--release needs --engineering', report)

    def test_release_refuses_a_work_item_the_record_does_not_hold(self):
        folder = f'{TODAY}-943-i07-e00-w01-queue-plan'
        files = {'work-item.md': 'plan', 'README.md': '| [Work item](work-item.md) | Plan |'}
        report, body, code = edit(epic(943, (f'[W01]({RECORDS}/{folder}/)', 'Queue plan', '', '')),
                                  '--release', 'W01', records={folder: files})
        self.assertEqual(code, 1)
        self.assertIn(f'the record artifacts/planning/{folder} holds no w01.md', report)
        self.assertEqual(body, '')

    def test_release_refuses_a_record_whose_readme_names_another_file(self):
        folder = f'{TODAY}-943-i07-e00-w01-queue-plan'
        files = {'w01.md': 'plan', 'README.md': '| [Work item](work-item.md) | Plan |'}
        report, _, code = edit(epic(943, (f'[W01]({RECORDS}/{folder}/)', 'Queue plan', '', '')),
                               '--release', 'W01', records={folder: files})
        self.assertEqual(code, 1)
        self.assertIn(f'the README of artifacts/planning/{folder} does not link w01.md', report)


class JoinedReservation(unittest.TestCase):
    FOLDER = f'{TODAY}-943-i07-e00-w01-queue-plan'

    def pair(self, first: str = 'W01', second: str = 'W02') -> dict:
        return epic(943, (first, 'Queue plan', '', 'W02'), (second, 'Dispatch', '', 'W01'),
                    ('W03', 'Survey', '', ''))

    def test_joined_rows_are_held_with_the_folder_the_survey_names(self):
        output = survey(staged((self.pair(), 'In Progress')))
        self.assertIn(f'unit I07:E00:W01+W02: unlaned, coverage AC1, record {self.FOLDER},', output)
        report, body, code = edit(self.pair(), '--reserve', 'W01,W02', '--records', RECORDS)
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({RECORDS}/{self.FOLDER}/) |', body)
        self.assertIn(f'| [W02]({RECORDS}/{self.FOLDER}/) |', body)
        self.assertNotIn('w02-dispatch', body)

    def test_each_unit_of_one_call_takes_its_own_folder(self):
        report, body, code = edit(self.pair(), '--reserve', 'W02,W01,W03', '--records', RECORDS)
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W02]({RECORDS}/{self.FOLDER}/) |', body)
        self.assertIn(f'| [W03]({RECORDS}/{TODAY}-943-i07-e00-w03-survey/) |', body)

    def test_reserving_one_row_of_a_joined_pair_is_refused(self):
        report, body, code = edit(self.pair(), '--reserve', 'W02', '--records', RECORDS)
        self.assertEqual(code, 1)
        self.assertIn('W02: joined with W01, which the call leaves out', report)
        self.assertEqual(body, '')

    def test_a_joined_row_whose_partner_is_held_is_refused(self):
        held = f'[W01]({RECORDS}/{TODAY}-943-i07-e00-w01-elsewhere/)'
        report, _, code = edit(self.pair(first=held), '--reserve', 'W01,W02', '--records', RECORDS)
        self.assertEqual(code, 1)
        self.assertIn('W01: already held by', report)

    def test_release_links_each_work_item_inside_the_shared_record(self):
        held = f'{RECORDS}/{self.FOLDER}/'
        report, body, code = edit(self.pair(f'[W01]({held})', f'[W02]({held})'), '--release', 'W01,W02',
                                  records={self.FOLDER: record('W01', 'W02')})
        self.assertEqual(code, 0, report)
        self.assertIn(f'| [W01]({held}w01.md) |', body)
        self.assertIn(f'| [W02]({held}w02.md) |', body)

    def test_releasing_one_row_of_a_joined_pair_is_refused(self):
        held = f'{RECORDS}/{self.FOLDER}/'
        report, _, code = edit(self.pair(f'[W01]({held})', f'[W02]({held})'), '--release', 'W02',
                               records={self.FOLDER: record('W01', 'W02')})
        self.assertEqual(code, 1)
        self.assertIn('W02: joined with W01, which the call leaves out', report)


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
        self.assertIn('a task does not stand In Review', done.stderr)

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


class ProducerOutputs(unittest.TestCase):
    """A row naming another epic's row starts once that row is delivered and each output it
    delivered is available at the consumer's base commit, whatever the producer's other rows and
    its closure.

    The checkout holds the producer's merge commit on its own base, origin/i07/e00/main, and the
    consumer's base, origin/i07/e01/main, starts without it."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.names = declared(root, 'main', 'workspace')
        self.checkout = Path(self.names[1])
        self.start = git(self.checkout, 'rev-parse', 'HEAD')
        (self.checkout / 'produced.txt').write_text('output\n')
        git(self.checkout, 'add', 'produced.txt')
        git(self.checkout, 'commit', '-m', 'produce')
        self.produced = git(self.checkout, 'rev-parse', 'HEAD')
        self.point('i07/e00/main', self.produced)
        self.point('i07/e01/main', self.start)

    def tearDown(self):
        self.tmp.cleanup()

    def point(self, branch: str, commit: str) -> None:
        git(self.checkout, 'update-ref', f'refs/remotes/origin/{branch}', commit)

    def drop(self, branch: str) -> None:
        git(self.checkout, 'update-ref', '-d', f'refs/remotes/origin/{branch}')

    def survey(self, merge: str | None = 'produced', *args: str, base: str = 'i07/e00/main',
               link: str | None = None) -> str:
        producer = epic(943, (f"[W01]({link or url('pull', 9)})", 'Produce', '', ''),
                        ('W02', 'Unrelated', '', ''))
        consumer = epic(944, ('W01', 'Independent work', '', ''),
                        ('W02', 'Consume', f"[E00:W01]({url('issues', 943)})", ''), which='07:E01')
        delivery = pr(9, '[I07:E00] Produce', merged='2026-01-01T00:00:00Z', base=base)
        if merge:
            delivery['merge_commit_sha'] = self.produced if merge == 'produced' else merge
        return survey(staged((producer, 'In Progress'), (consumer, 'Ready')), [delivery],
                      *(args or self.names))

    def test_an_output_merged_only_into_the_producer_base_is_rejected(self):
        output = self.survey()
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn(f'output #944 W02: E00:W01 #9 {self.produced[:12]} absent at '
                      f'origin/i07/e01/main {self.start[:12]}', output)
        self.assertIn('available: 2, held: 0, blocked: 1', output)

    def test_an_available_output_starts_the_row_while_unrelated_producer_rows_stay_open(self):
        self.point('i07/e01/main', self.produced)
        output = self.survey()
        self.assertIn('unit I07:E01:W02', output)
        self.assertIn(f'output #944 W02: E00:W01 #9 {self.produced[:12]} available at '
                      f'origin/i07/e01/main {self.produced[:12]}', output)
        self.assertIn('unit I07:E00:W02', output)

    def test_a_consumer_base_change_that_drops_the_output_blocks_the_row_again(self):
        self.point('i07/e01/main', self.produced)
        self.assertIn('unit I07:E01:W02', self.survey())
        self.point('i07/e01/main', self.start)
        self.assertIn('blocked I07:E01:W02', self.survey())

    def test_a_consumer_without_a_base_reads_the_long_lived_branch_it_is_cut_from(self):
        self.drop('i07/e01/main')
        self.point('main', self.produced)
        output = self.survey()
        self.assertIn('unit I07:E01:W02', output)
        self.assertIn('available at origin/main', output)

    def test_a_merge_into_a_task_branch_names_no_long_lived_branch(self):
        for base in ('i07/e00/w01-produce', 'i07/e01/w02-consume'):
            with self.subTest(base=base):
                self.point(base, self.produced)
                output = self.survey(base=base)
                self.assertIn('blocked I07:E01:W02', output)
                self.assertIn(f'output #944 W02: E00:W01 #9 {self.produced[:12]} unverified: it merged into '
                              f'{base}, which is neither an epic base nor a long-lived branch', output)

    def test_a_linked_commit_is_read_against_each_consumer_base(self):
        link = url('commit', self.produced)
        output = self.survey(link=link)
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn(f'{self.produced[:12]} absent at origin/i07/e01/main {self.start[:12]}', output)
        self.point('i07/e01/workspace', self.produced)
        output = self.survey(link=link)
        self.assertIn('unit I07:E01:W02', output)
        self.assertIn(f'{self.produced[:12]} available at origin/i07/e01/workspace {self.produced[:12]}', output)

    def test_missing_evidence_is_rejected(self):
        output = self.survey(None)
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn('output #944 W02: E00:W01 #9 unverified: it records no merge commit', output)

    def test_stale_evidence_is_rejected(self):
        output = self.survey('0123456789abcdef0123456789abcdef01234567')
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn('unverified: 0123456789ab is not in the checkout', output)

    def test_no_checkout_leaves_the_output_unverified(self):
        output = self.survey('produced', '--date', TODAY)
        self.assertIn('blocked I07:E01:W02', output)
        self.assertIn('unverified: no checkout to read it in', output)

    def test_an_undelivered_producer_row_blocks_without_reading_outputs(self):
        producer = epic(943, ('W01', 'Produce', '', ''))
        consumer = epic(944, ('W01', 'Consume', f"[E00:W01]({url('issues', 943)})", ''), which='07:E01')
        output = survey(staged((producer, 'In Progress'), (consumer, 'Ready')), [], *self.names)
        self.assertIn('blocked I07:E01:W01', output)
        self.assertNotIn('output ', output)


class HotFixUnits(unittest.TestCase):
    def test_a_ready_hot_fix_is_one_unit_cut_from_its_target(self):
        out = survey(staged((hotfix(4, target='workspace'), 'Ready'), (epic(9, ('W01', 'Go', '', '')), 'Backlog')))
        self.assertIn('  unit F04 #4: unlaned, coverage AC1, AC2, record 2026-10-06-4-f04-key-validation, '
                      'branch f04-key-validation, base workspace, worktree .worktrees/f04-key-validation', out)
        self.assertNotIn('unresolved', out)
        self.assertIn('available: 1', out)

    def test_a_ready_hot_fix_naming_no_target_is_undeclared(self):
        out = survey(staged((hotfix(4, target=None), 'Ready')), code=1)
        self.assertIn('  undeclared F04 #4: its Overview names no target in one Target: line', out)
        self.assertNotIn('  unit F04', out)
        self.assertIn('undeclared: 1', out)

    def test_a_ready_hot_fix_whose_target_is_no_declared_long_lived_branch_is_undeclared(self):
        with tempfile.TemporaryDirectory() as tmp:
            names = declared(Path(tmp), 'main', 'workspace')
            git(Path(names[1]), 'remote', 'add', 'origin', 'git@github.com:o/r.git')
            out = survey(staged((hotfix(4, target='feature/x'), 'Ready'), (hotfix(5, target='workspace'), 'Ready')),
                         None, *names, code=1)
        self.assertIn('  undeclared F04 #4: its target feature/x is no long-lived branch config/branches declares',
                      out)
        self.assertNotIn('  unit F04', out)
        self.assertIn('  unit F05 #5:', out)
        self.assertIn('base workspace', out)
        self.assertIn('undeclared: 1', out)

    def test_a_passed_pull_request_into_an_undeclared_target_is_no_merge_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            names = declared(Path(tmp), 'main', 'workspace')
            git(Path(names[1]), 'remote', 'add', 'origin', 'git@github.com:o/r.git')
            pulls = [pr(951, '[F04] Reject Bad Keys', body=PLAN, base='feature/x'),
                     pr(952, '[F05] Reject Bad Keys', body=PLAN, base='workspace')]
            out = survey(staged((hotfix(4, target='feature/x'), 'In Progress'),
                                (hotfix(5, target='workspace'), 'In Progress')),
                         pulls, *names, held=(links(951, 4), links(952, 5)), code=1)
        self.assertNotIn('merge #951', out)
        self.assertIn('  undeclared F04 #4: its target feature/x is no long-lived branch config/branches declares', out)
        self.assertIn('  merge #952 F05: base workspace', out)

    def test_a_hot_fix_of_another_repository_is_unresolved_without_failing_the_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            names = declared(Path(tmp), 'main', 'workspace')
            git(Path(names[1]), 'remote', 'add', 'origin', 'https://github.com/o/r.git')
            out = survey(staged((hotfix(4, target='feature/x', repo='o/s'), 'Ready')), None, *names)
        self.assertIn('  unresolved: F04 #4: its target feature/x is unchecked: config/branches is read in o/r', out)
        self.assertNotIn('  unit F04', out)
        self.assertIn('undeclared: 0', out)

    def test_a_hot_fix_in_progress_is_held_by_its_dispatch(self):
        out = survey(staged((hotfix(4), 'In Progress')), None)
        self.assertIn('  hold F04 #4: In Progress', out)
        self.assertNotIn('  unit ', out)

    def test_a_hot_fix_in_backlog_or_closed_is_not_offered(self):
        closed = hotfix(5)
        closed['state'] = 'closed'
        out = survey(staged((hotfix(4), 'Backlog'), (closed, 'Ready')), None)
        self.assertNotIn('F04', out)
        self.assertNotIn('F05', out)

    def test_an_open_pull_request_that_links_without_delivering_still_makes_it_running(self):
        out = survey(staged((hotfix(4), 'Ready')), [pr(951, 'Unrelated Work', base='workspace')], held=(links(951, 4),))
        self.assertNotIn('unit F04', out)

    def test_a_backlog_or_held_hot_fix_raises_nothing_unresolved(self):
        out = survey(staged((hotfix(4), 'Backlog'), (hotfix(5), 'In Progress')))
        self.assertNotIn('unresolved', out)
        self.assertIn('  hold F05 #5: In Progress', out)

    def test_a_passed_hot_fix_pull_request_into_its_target_is_a_merge_candidate(self):
        pulls = [pr(951, '[F04] Reject Bad Keys', body=PLAN, base='workspace'),
                 pr(952, '[F04] Reject Bad Keys', body=PLAN, base='main'),
                 pr(953, '[F09] Reject Bad Keys', body=PLAN, base='workspace'),
                 pr(954, '[F04] Reject Bad Keys', base='workspace'),
                 pr(955, '[F04] Reject Bad Keys', body=PLAN, base='workspace')]
        out = survey(staged((hotfix(4, target='workspace'), 'In Progress')), pulls,
                     held=tuple(links(n, 4) for n in (951, 952, 953, 954)))
        self.assertIn('  merge #951 F04: base workspace', out)
        for number in (952, 953, 954, 955):
            self.assertNotIn(f'merge #{number}', out)

    def test_a_draft_hot_fix_pull_request_is_never_a_merge_candidate(self):
        pulls = [pr(951, '[F04] Reject Bad Keys', body=PLAN, base='workspace', draft=True)]
        out = survey(staged((hotfix(4, target='workspace'), 'In Progress')), pulls, held=(links(951, 4),))
        self.assertNotIn('merge #951', out)
        self.assertIn('merge: 0', out)

    def test_a_ready_hot_fix_with_an_open_draft_is_running_and_not_offered(self):
        pulls = [pr(951, '[F04] Reject Bad Keys', base='workspace', draft=True)]
        out = survey(staged((hotfix(4, target='workspace'), 'Ready')), pulls, held=(links(951, 4),))
        self.assertNotIn('F04', out.split('  available:')[0])

    def test_a_hot_fix_an_open_pull_request_links_is_running(self):
        out = survey(staged((hotfix(4), 'Ready'), (hotfix(5), 'In Progress')),
                     [pr(951, '[F04] Reject Bad Keys', base='main'), pr(952, '[F05] Reject Bad Keys', base='main')], held=(links(951, 4), links(952, 5)))
        self.assertNotIn('unit F04', out)
        self.assertNotIn('hold F05', out)
        self.assertNotIn('unrecorded', out.split('available:')[0])

    def test_a_merged_pull_request_that_does_not_deliver_the_hot_fix_leaves_it_recorded(self):
        merged = '2026-11-01T00:00:00Z'
        out = survey(staged((hotfix(4), 'Ready')),
                     [pr(951, '[I07:E00] Other Work', merged, base='i07/e00/main'),
                      pr(952, '[F04] Reject Bad Keys', merged, base='workspace'),
                      pr(953, '[F09] Reject Bad Keys', merged, base='main')], held=(links(951, 4), links(952, 4), links(953, 4)))
        self.assertNotIn('  unrecorded', out)
        self.assertIn('unit F04 #4', out)

    def test_an_open_hot_fix_a_merged_pull_request_links_is_unrecorded(self):
        out = survey(staged((hotfix(4), 'In Progress')),
                     [pr(951, '[F04] Reject Bad Keys', '2026-11-01T00:00:00Z', base='main')], held=(links(951, 4),))
        self.assertIn('  unrecorded F04 #4: #951 merged', out)
        self.assertNotIn('hold F04', out)
        self.assertIn('unrecorded: 1', out)

    def test_a_pull_request_closed_unmerged_leaves_the_hot_fix_free(self):
        out = survey(staged((hotfix(4), 'Ready')), [pr(951, '[F04] Reject Bad Keys', base='main', state='closed')], held=(links(951, 4),))
        self.assertIn('unit F04 #4', out)


class LaneAdmission(unittest.TestCase):
    @staticmethod
    def laned(content, **lanes):
        lines = content['body'].splitlines()
        for position, line in enumerate(lines):
            if not line.startswith('|'):
                continue
            values = [value.strip() for value in line.strip('|').split('|')]
            task_id = values[0].split(']')[0].lstrip('[')
            if task_id in lanes:
                values[-2] = lanes[task_id]
                lines[position] = '| ' + ' | '.join(values) + ' |'
        content['body'] = '\n'.join(lines)
        return content

    @staticmethod
    def offered(output):
        return [line.strip() for line in output.splitlines()
                if line.startswith('  unit ')]

    def test_requested_lane_admits_itself_and_unlaned_rows_in_existing_order(self):
        content = self.laned(epic(943, ('W01', 'First', '', ''), ('W02', 'Second', '', ''),
                                  ('W03', 'Third', '', '')), W01='2', W02='1')
        entries = staged((content, 'Ready'))
        cases = [((), ['W03: unlaned']),
                 (('--lane', '1'), ['W02: lane 1', 'W03: unlaned']),
                 (('--lane', '2'), ['W01: lane 2', 'W03: unlaned'])]
        for args, expected in cases:
            with self.subTest(args=args):
                output = survey(entries, None, *args)
                found = [line.split('I07:E00:')[1].split(', coverage')[0]
                         for line in self.offered(output)]
                self.assertEqual(found, expected)
                self.assertIn(f'available: {len(expected)}', output)

    def test_lane_is_board_wide_and_preserves_opaque_spelling(self):
        first = self.laned(epic(943, ('W01', 'First', '', ''), which='07:E00'), W01='02')
        second = self.laned(epic(944, ('W01', 'Second', '', ''), which='07:E01'), W01='02')
        entries = staged((first, 'Ready'), (second, 'In Progress'))
        self.assertEqual(len(self.offered(survey(entries, None, '--lane', '02'))), 2)
        self.assertEqual(self.offered(survey(entries, None, '--lane', '2')), [])

    def test_table_lane_applies_to_linked_and_unplanned_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            engineering, ids = planned(root, ('W01', 'workspace:skills/plan.py'))
            content = self.laned(epic(943, (ids['W01'], 'Planned', '', ''),
                                      ('W02', 'Unplanned', '', '')), W01='1', W02='2')
            entries = staged((content, 'Ready'))
            first = survey(entries, None, *engineering, '--lane', '1')
            second = survey(entries, None, *engineering, '--lane', '2')
        self.assertIn('unit I07:E00:W01: lane 1,', first)
        self.assertNotIn('unit I07:E00:W02:', first)
        self.assertIn('unit I07:E00:W02: lane 2,', second)
        self.assertNotIn('unit I07:E00:W01:', second)

    def test_joined_units_admit_equal_lanes_and_all_empty_cells(self):
        for lane, requested in [('2', ('--lane', '2')), ('', ())]:
            with self.subTest(lane=lane):
                content = self.laned(epic(943, ('W01', 'One', '', 'W02'),
                                          ('W02', 'Two', '', 'W01')), W01=lane, W02=lane)
                output = survey(staged((content, 'Ready')), None, *requested)
                self.assertIn('unit I07:E00:W01+W02:', output)
                self.assertIn('available: 1', output)

    def test_split_joined_lanes_fail_even_outside_the_requested_lane(self):
        for second in ['2', '']:
            with self.subTest(second=second):
                content = self.laned(epic(943, ('W01', 'One', '', 'W02'),
                                          ('W02', 'Two', '', 'W01')), W01='1', W02=second)
                output = survey(staged((content, 'Ready')), None, '--lane', '3', code=1)
                self.assertIn('invalid I07:E00:W01+W02: joined unit has different Lane cells', output)
                self.assertIn('W01 = 1', output)
                self.assertIn(f'W02 = {second or "empty"}', output)
                self.assertIn('move a lane or unjoin', output)
                self.assertEqual(self.offered(output), [])
                self.assertIn('invalid: 1', output)

    def test_raw_malformed_lanes_fail_without_becoming_unlaned(self):
        for bad in ['[2](https://example.test)', '`2`', 'lane 2', '-2', '2.5']:
            with self.subTest(bad=bad):
                content = self.laned(epic(943, ('W01', 'One', '', ''),
                                          ('W02', 'Two', '', '')), W01=bad)
                output = survey(staged((content, 'Ready')), None, '--lane', '3', code=1)
                self.assertIn('invalid I07:E00:W01: Lane must be a bare decimal index', output)
                self.assertNotIn('unit I07:E00:W01:', output)
                self.assertIn('unit I07:E00:W02: unlaned,', output)
                self.assertIn('invalid: 1', output)

    def test_two_malformed_joined_rows_count_as_one_invalid_unit(self):
        content = self.laned(epic(943, ('W01', 'One', '', 'W02'),
                                  ('W02', 'Two', '', 'W01')), W01='`1`', W02='`2`')
        output = survey(staged((content, 'Ready')), code=1)
        self.assertIn('invalid I07:E00:W01:', output)
        self.assertIn('invalid I07:E00:W02:', output)
        self.assertIn('invalid: 1', output)

    def test_holds_blockers_and_merge_candidates_remain_visible_across_lanes(self):
        content = self.laned(epic(943, (f'[W01]({RECORDS}/held/)', 'Held', '', ''),
                                  ('W02', 'Blocked', 'W01', ''),
                                  ('W03', 'Missing', 'W99', '')), W01='2', W02='2', W03='2')
        pull = pr(951, '[I07:E00] Passing Work', body=PLAN, base='i07/e00/main')
        output = survey(staged((content, 'Ready')), [pull], '--lane', '1', code=1)
        self.assertIn('hold I07:E00:W01:', output)
        self.assertIn('blocked I07:E00:W02: depends on W01', output)
        self.assertIn('unresolvable I07:E00:W03: W99 cannot resolve', output)
        self.assertIn('merge #951', output)
        self.assertEqual(self.offered(output), [])

    def test_unlaned_hot_fixes_are_admitted_with_or_without_a_lane(self):
        for args in [(), ('--lane', '1')]:
            with self.subTest(args=args):
                output = survey(staged((hotfix(4, target='workspace'), 'Ready')), None, *args)
                self.assertIn('unit F04 #4: unlaned, coverage AC1, AC2,', output)

    def test_cli_refuses_non_index_lane_arguments(self):
        for lane in ['', '-1', '1.5', 'lane 1', '`1`', '١']:
            with self.subTest(lane=lane):
                done = run('deliver.py', '--lane', lane)
                self.assertEqual(done.returncode, 2, done.stdout + done.stderr)
                self.assertIn('--lane must be a bare decimal index', done.stderr)


class LaneCellPreservation(unittest.TestCase):
    def assert_lane_rows(self, body, expected):
        lines = [line for line in body.splitlines() if line.startswith('|')]
        header = [value.strip() for value in lines[0].strip('|').split('|')]
        self.assertEqual(header[-3:], ['Joins', 'Lane', 'Done'])
        actual = {}
        for line in lines[2:]:
            values = [value.strip() for value in line.strip('|').split('|')]
            ident = values[0].split(']')[0].lstrip('[')
            actual[ident] = (values[-2], values[-1])
        self.assertEqual(actual, expected)

    def test_reserve_and_release_keep_lanes_attached_to_each_row(self):
        source = epic(943, ('W01', 'Queue plan', '', ''), ('W02', 'Dispatch', '', ''))
        source['body'] = source['body'].replace(
            '| W01 | Queue plan | AC1 |  |  | | |',
            '| W01 | Queue plan | AC1 | | | 2 | |')
        self.assert_lane_rows(source['body'], {'W01': ('2', ''), 'W02': ('', '')})
        report, reserved, code = edit(source, '--reserve', 'W01,W02', '--records', RECORDS)
        self.assertEqual(code, 0, report)
        self.assert_lane_rows(reserved, {'W01': ('2', ''), 'W02': ('', '')})
        source['body'] = reserved
        folders = {f'{TODAY}-943-i07-e00-w01-queue-plan': record('W01'),
                   f'{TODAY}-943-i07-e00-w02-dispatch': record('W02')}
        report, released, code = edit(source, '--release', 'W01,W02', records=folders)
        self.assertEqual(code, 0, report)
        self.assert_lane_rows(released, {'W01': ('2', ''), 'W02': ('', '')})
        self.assertIn('/w01.md)', released)
        self.assertIn('/w02.md)', released)

    def test_a_joined_reservation_and_release_keep_both_lane_cells(self):
        source = epic(943, ('W01', 'Queue plan', '', 'W02'), ('W02', 'Dispatch', '', 'W01'))
        source['body'] = source['body'].replace('| W02 | | |', '| W02 | 2 | |').replace(
            '| W01 | | |', '| W01 | 2 | |')
        report, reserved, code = edit(source, '--reserve', 'W01,W02', '--records', RECORDS)
        self.assertEqual(code, 0, report)
        self.assert_lane_rows(reserved, {'W01': ('2', ''), 'W02': ('2', '')})
        source['body'] = reserved
        folder = f'{TODAY}-943-i07-e00-w01-queue-plan'
        report, released, code = edit(source, '--release', 'W01,W02',
                                      records={folder: record('W01', 'W02')})
        self.assertEqual(code, 0, report)
        self.assert_lane_rows(released, {'W01': ('2', ''), 'W02': ('2', '')})


if __name__ == '__main__':
    unittest.main()
