"""Continuous dispatch from real delivery surveys and observed worker events."""
import ast
import json
import re
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

from fixtures import SCRIPTS, hotfix, run, url
from test_board_queue import epic as ranked_epic, initiative, queue_run
from test_deliver import epic, staged

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import kinds  # noqa: E402
from dispatch import batch, check_start
from lane import assign_lanes

BOARD = 'users/o/projectsV2/7'
AUTH = {'board': BOARD, 'scope': ['o/r#I07'], 'lane': None}
RECORDS = 'https://github.com/o/r/tree/engineering/artifacts/planning'


def offered(identity: str) -> dict:
    return {'id': identity, 'record': 'record-' + identity.replace('/', '-').replace('#', '-'),
            'report': 'unit ' + identity}


def worker(identity: str, state: str = 'running', session: str = 'worker-1') -> dict:
    return {'unit': identity, 'state': state, 'session': session}


def evidence(unit: dict) -> dict:
    return {'unit': unit['id'], 'published_record': unit['record'],
            'reserved_record': unit['record'], 'reservation_verified': True}


def exported(items: list[dict], *args: str, code: int = 0) -> tuple[list[dict], str]:
    """The actual survey's admitted units and its diagnostic report."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / 'items.json').write_text(json.dumps(items))
        (root / 'prs.json').write_text('')
        (root / 'links.json').write_text('[]')
        result = run('deliver.py', '--items', str(root / 'items.json'),
                     '--prs', str(root / 'prs.json'), '--links', str(root / 'links.json'),
                     '--dispatch-plan', str(root / 'available.json'), '--date', '2026-11-05', *args)
        assert result.returncode == code, result.stdout + result.stderr
        return json.loads((root / 'available.json').read_text()), result.stdout


def chain(completed: set[str], held: set[str]) -> list[dict]:
    rows = []
    for task, depends in [('W01', ''), ('W02', 'W01'), ('W03', 'W02'), ('W04', '')]:
        ident = (f'[{task}](https://github.com/o/r/commit/{int(task[1:]):040d})'
                 if task in completed else
                 f'[{task}]({RECORDS}/held-{task.lower()})' if task in held else task)
        rows.append((ident, f'Work {task}', depends, ''))
    content = epic(943, *rows)
    lines = []
    for line in content['body'].splitlines():
        if line.startswith('| ') and '/commit/' in line:
            line = line[:-2] + '✓ |'
        lines.append(line)
    content['body'] = '\n'.join(lines)
    return staged((content, 'In Progress'))


class Refill(unittest.TestCase):
    def test_one_authorization_refills_after_successive_completions(self):
        completed, held, sessions, starts = set(), set(), [], []
        authorization = json.loads(json.dumps(AUTH))

        def refill(capacity):
            plan, _ = exported(chain(completed, held))
            selected = batch(authorization, plan, sessions, capacity, BOARD)
            for unit in selected['units']:
                check_start(selected, unit['id'], evidence(unit), sessions, capacity)
                starts.append(unit['id'])
                held.add(unit['id'].rsplit(':', 1)[1])
                sessions.append(worker(unit['id'], session=f'worker-{len(starts)}'))
                capacity -= 1
            return selected

        first = refill(2)
        self.assertEqual([u['id'] for u in first['units']],
                         ['o/r#I07:E00:W01', 'o/r#I07:E00:W04'])
        self.assertEqual(refill(0)['action'], 'wait')
        for index, task in [(0, 'W01'), (2, 'W02'), (3, 'W03'), (1, 'W04')]:
            sessions[index]['state'] = 'completed'
            held.remove(task)
            completed.add(task)
            selected = refill(1)
        self.assertEqual(selected['action'], 'stop')
        self.assertEqual(starts, ['o/r#I07:E00:W01', 'o/r#I07:E00:W04',
                                 'o/r#I07:E00:W02', 'o/r#I07:E00:W03'])
        self.assertEqual(len(starts), len(set(starts)))
        self.assertEqual(authorization, AUTH)

    def test_real_lane_filtered_export_drives_dispatch_and_keeps_hotfixes(self):
        content = epic(943, ('W01', 'Indexed', '', ''), ('W02', 'Other lane', '', ''),
                       ('W03', 'Unlaned', '', ''))
        content['body'] = assign_lanes(content['body'], {'W01': '02', 'W02': '2', 'W03': None})
        items = staged((content, 'Ready'), (hotfix(2), 'Ready'))
        for requested, tasks in [(None, ['W03']), ('02', ['W01', 'W03'])]:
            with self.subTest(requested=requested):
                args = () if requested is None else ('--lane', requested)
                plan, report = exported(items, *args)
                expected = [f'o/r#I07:E00:{task}' for task in tasks] + ['o/r#F02']
                self.assertEqual([unit['id'] for unit in plan], expected)
                self.assertEqual([unit['report'] for unit in plan],
                                 [line.strip() for line in report.splitlines() if line.startswith('  unit ')])
                authorization = {**AUTH, 'scope': ['*'], 'lane': requested}
                selected = batch(authorization, plan, [], 3, BOARD, requested)
                self.assertEqual(selected['units'], plan)
                self.assertIn('unlaned, coverage', plan[-1]['report'])
                if requested is not None:
                    self.assertIn('lane 02, coverage', plan[0]['report'])

    def test_invalid_lane_units_leave_independent_export_and_refill_available(self):
        content = epic(943)
        content['body'] = ('## Work Breakdown\n\n'
            '| Task | Description | Coverage | Depends on | Joins | Lane | Done |\n'
            '| --- | --- | --- | --- | --- | --- | --- |\n'
            '| W01 | One | AC1 | | W02 | 02 | |\n'
            '| W02 | Two | AC1 | | W01 | | |\n'
            '| W03 | Healthy | AC1 | | | 02 | |\n'
            '| W04 | Malformed | AC1 | | | `02` | |\n'
            '| W05 | Unlaned | AC1 | | | | |\n'
            '\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n')
        plan, report = exported(staged((content, 'Ready')), '--lane', '02', code=1)
        self.assertEqual([unit['id'] for unit in plan], ['o/r#I07:E00:W03', 'o/r#I07:E00:W05'])
        self.assertIn('invalid I07:E00:W01+W02', report)
        self.assertIn('invalid I07:E00:W04', report)
        self.assertIn('invalid: 2', report)
        selected = batch({**AUTH, 'lane': '02'}, plan, [], 1, BOARD, '02')
        self.assertEqual([unit['id'] for unit in selected['units']], ['o/r#I07:E00:W03'])
        self.assertEqual(selected['pending'], 1)

    def test_capacity_event_refills_without_a_worker_completion(self):
        plan = [offered('o/r#I07:E00:W01'), offered('o/r#I07:E00:W02')]
        waiting = batch(AUTH, plan, [], 0, BOARD)
        self.assertEqual(waiting, {'action': 'wait', 'units': [], 'pending': 2})
        selected = batch(AUTH, plan, [], 1, BOARD)
        self.assertEqual([u['id'] for u in selected['units']], ['o/r#I07:E00:W01'])
        self.assertEqual(selected['pending'], 1)

    def test_capacity_lost_during_preparation_resumes_the_same_held_unit(self):
        unit = offered('o/r#I07:E00:W01')
        selected = batch(AUTH, [unit], [], 1, BOARD)
        with self.assertRaisesRegex(ValueError, 'free harness slot'):
            check_start(selected, unit['id'], evidence(unit), [], 0)
        # The live survey now sees the reservation, so it offers no free unit.
        waiting = batch(AUTH, [], [], 0, BOARD, preparations=[unit])
        self.assertEqual(waiting['action'], 'wait')
        self.assertEqual(batch(AUTH, [unit], [], 1, BOARD, preparations=[unit])['units'], [])
        resumed = check_start(selected, unit['id'], evidence(unit), [], 1)
        self.assertEqual(resumed, unit)
        self.assertEqual(batch(AUTH, [], [worker(unit['id'])], 0, BOARD)['action'], 'wait')
        self.assertEqual(batch(AUTH, [], [worker(unit['id'], 'completed')], 1, BOARD)['action'], 'stop')

    def test_an_out_of_scope_preparation_does_not_keep_a_run_active(self):
        result = batch(AUTH, [], [], 0, BOARD,
                       preparations=[offered('o/r#I08:E00:W01')])
        self.assertEqual(result['action'], 'stop')

    def test_real_survey_excludes_holds_dependencies_and_backlog(self):
        held = f'[W01]({RECORDS}/existing)'
        plan, report = exported(staged(
            (epic(943, (held, 'Held', '', ''), ('W02', 'Blocked', 'W01', ''),
                  ('W03', 'Independent', '', '')), 'In Progress'),
            (epic(944, ('W01', 'Later', '', ''), which='07:E01'), 'Backlog'),
            (epic(945, ('W01', 'Outside', '', ''), which='08:E00'), 'Ready')))
        self.assertIn('hold I07:E00:W01', report)
        self.assertIn('blocked I07:E00:W02', report)
        selected = batch(AUTH, plan, [], 3, BOARD)
        self.assertEqual([u['id'] for u in selected['units']], ['o/r#I07:E00:W03'])
        self.assertEqual([u['report'] for u in plan],
                         [line.strip() for line in report.splitlines() if line.startswith('  unit ')])

    def test_joined_rows_are_one_slot_and_require_full_scope(self):
        plan, _ = exported(staged((epic(943, ('W01', 'One', '', 'W02'),
                                                ('W02', 'Two', '', 'W01')), 'Ready')))
        self.assertEqual(len(batch(AUTH, plan, [], 1, BOARD)['units']), 1)
        partial = {**AUTH, 'scope': ['o/r#I07:E00:W01']}
        self.assertEqual(batch(partial, plan, [], 1, BOARD)['units'], [])
        explicit = {**AUTH, 'scope': ['o/r#I07:E00:W01+W02']}
        self.assertEqual(len(batch(explicit, plan, [], 1, BOARD)['units']), 1)

    def test_lane_admitted_export_is_bound_to_authorized_survey_context(self):
        authorization = {**AUTH, 'lane': '2'}
        admitted = [offered('o/r#I07:E00:W01'), offered('o/r#I07:E00:W03')]
        selected = batch(authorization, admitted, [], 3, BOARD, '2')
        self.assertEqual(selected['units'], admitted)
        for board, lane in [(BOARD, '3'), (BOARD, None), ('users/o/projectsV2/8', '2')]:
            with self.subTest(board=board, lane=lane), self.assertRaisesRegex(ValueError, 'survey'):
                batch(authorization, admitted, [], 3, board, lane)

    def test_scope_is_repository_qualified_and_has_component_boundaries(self):
        plan = [offered('o/other#I07:E00:W01'), offered('o/r#I08:E00:W01'),
                offered('o/r#I07:E00:W01')]
        self.assertEqual(batch(AUTH, plan, [], 3, BOARD)['units'], [plan[2]])
        board_scope = {**AUTH, 'scope': ['*']}
        self.assertEqual(batch(board_scope, plan, [], 3, BOARD)['units'], plan)

    def test_actual_sessions_prevent_duplicates_even_from_a_stale_offer(self):
        plan = [offered('o/r#I07:E00:W01+W02'), offered('o/r#I07:E00:W03')]
        for state in ['preparing', 'running', 'review', 'blocked']:
            with self.subTest(state=state):
                selected = batch(AUTH, plan, [worker('o/r#I07:E00:W02', state)], 2, BOARD)
                self.assertEqual(selected['units'], [plan[1]])
        selected = batch(AUTH, plan + [plan[0]], [], 3, BOARD)
        self.assertEqual(selected['units'], plan)

    def test_independent_work_continues_beside_blockers_and_required_review(self):
        plan, report = exported(chain(set(), {'W01'}))
        sessions = [worker('o/r#I07:E00:W01', 'review'),
                    worker('o/r#I07:E01:W01', 'blocked', 'worker-2')]
        selected = batch(AUTH, plan, sessions, 1, BOARD)
        self.assertEqual([u['id'] for u in selected['units']], ['o/r#I07:E00:W04'])
        self.assertIn('blocked I07:E00:W02', report)
        self.assertEqual(batch(AUTH, [], sessions, 1, BOARD)['action'], 'stop')
        sessions.append(worker('o/r#I07:E00:W04', session='worker-3'))
        self.assertEqual(batch(AUTH, [], sessions, 0, BOARD)['action'], 'wait')

    def test_hotfix_export_uses_repository_qualified_identity(self):
        plan, _ = exported(staged((hotfix(2), 'Ready')))
        self.assertEqual([u['id'] for u in plan], ['o/r#F02'])
        self.assertEqual(batch({**AUTH, 'scope': ['o/r#F02']}, plan, [], 1, BOARD)['units'], plan)

    def test_failed_survey_removes_a_prior_dispatch_export(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'items.json').write_text('invalid JSON')
            output = root / 'available.json'
            output.write_text(json.dumps([offered('o/r#I07:E00:W01')]))
            result = run('deliver.py', '--items', str(root / 'items.json'),
                         '--dispatch-plan', str(output))
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(output.exists())

    def test_parent_selectors_cannot_be_dispatched_as_units(self):
        for identity in ['o/r#I07', 'o/r#I07:E00']:
            with self.subTest(identity=identity), self.assertRaisesRegex(ValueError, 'dispatch unit'):
                batch(AUTH, [offered(identity)], [], 1, BOARD)


class Kinds(unittest.TestCase):
    def test_a_registered_kinds_item_dispatches_through_the_registry(self):
        stand_in = types.ModuleType('stand_in')
        stand_in.tag = lambda item: 'Z01' if (item.get('title') or '').startswith('[Z01]') else None
        plan = [offered('o/r#Z01')]
        scope = {**AUTH, 'scope': ['o/r#Z01']}
        with self.assertRaisesRegex(ValueError, 'invalid dispatch identity'):
            batch(scope, plan, [], 1, BOARD)
        with mock.patch.dict(sys.modules, {'stand_in': stand_in}), \
                mock.patch.dict(kinds.KINDS, {'stand-in': 'stand_in'}):
            self.assertEqual(batch(scope, plan, [], 1, BOARD)['units'], plan)
            busy = [worker('o/r#Z01')]
            self.assertEqual(batch(scope, plan, busy, 1, BOARD)['units'], [])
            with self.assertRaisesRegex(ValueError, 'duplicate'):
                check_start({'units': plan}, 'o/r#Z01', evidence(plan[0]), busy, 1)

    def test_an_unregistered_tag_is_no_dispatch_identity(self):
        for identity in ['o/r#F02x', 'o/r#Z01', 'o/r#[F02]', 'o/r#W01']:
            with self.subTest(identity=identity), self.assertRaisesRegex(ValueError, 'invalid dispatch identity'):
                batch(AUTH, [offered(identity)], [], 1, BOARD)

    def test_dispatch_names_no_kind_and_imports_only_the_registry_lookup(self):
        source = (SCRIPTS / 'dispatch.py').read_text()
        names = {kind for kind in kinds.KINDS} | set(kinds.KINDS.values())
        for name in names | {'hot-fix', 'hotfix', 'hot fix'}:
            with self.subTest(name=name):
                self.assertNotIn(name, source.lower())
        self.assertIsNone(re.search(r'F\\d\\d|\\bF\d\d\b', source))
        imported = {(node.module, alias.name) for node in ast.walk(ast.parse(source))
                    if isinstance(node, ast.ImportFrom) for alias in node.names}
        self.assertEqual({entry for entry in imported if entry[0] == 'kinds'}, {('kinds', 'kind_of')})
        modules = set(kinds.KINDS.values())
        self.assertFalse({module for module, _ in imported} & modules)
        self.assertFalse({alias.name for node in ast.walk(ast.parse(source)) if isinstance(node, ast.Import)
                          for alias in node.names} & modules)


class DispatchPriority(unittest.TestCase):
    def test_a_current_queue_selects_the_higher_priority_epic_for_one_slot(self):
        parent = initiative(7, 'Dispatch: Work', (f'[E00]({url("issues", 943)})', ''),
                            (f'[E01]({url("issues", 944)})', ''))
        low = ranked_epic(943, '07:E00', (f'[W00]({RECORDS}/held)', 'Held', ''),
                          ('W01', 'Low free work', ''), priority='priority: 1')
        high = ranked_epic(944, '07:E01', ('W01', 'High free work', ''), priority='priority: 10')
        items = staged((parent, 'In Progress'), (low, 'In Progress'), (high, 'Ready'))
        queue = queue_run(items)
        self.assertEqual(queue.returncode, 0, queue.stderr)
        self.assertIn('to do: 0 (the queue is current)', queue.stdout)
        plan, report = exported(items)
        selected = batch(AUTH, plan, [], 1, BOARD)
        self.assertEqual([unit['id'] for unit in selected['units']], ['o/r#I07:E01:W01'])
        self.assertEqual([unit['report'] for unit in plan],
                         [line.strip() for line in report.splitlines() if line.startswith('  unit ')])

    def test_initiative_priority_precedes_each_initiatives_epic_priority(self):
        low = initiative(7, 'Low: Work', (f'[E00]({url("issues", 943)})', ''), priority='priority: 1')
        high = initiative(8, 'High: Work', (f'[E00]({url("issues", 944)})', ''), priority='priority: 10')
        items = staged((low, 'In Progress'), (high, 'In Progress'),
                       (ranked_epic(943, '07:E00', ('W01', 'Low parent', ''),
                                    priority='priority: 100'), 'In Progress'),
                       (ranked_epic(944, '08:E00', ('W01', 'High parent', ''),
                                    priority='priority: 1'), 'Ready'))
        plan, _ = exported(items)
        selected = batch({**AUTH, 'scope': ['*']}, plan, [], 1, BOARD)
        self.assertEqual(selected['units'][0]['id'], 'o/r#I08:E00:W01')

    def test_epic_priorities_are_compared_only_within_their_parent(self):
        first = initiative(7, 'First: Work', (f'[E00]({url("issues", 943)})', ''))
        second = initiative(8, 'Second: Work', (f'[E00]({url("issues", 944)})', ''))
        items = staged((second, 'In Progress'), (first, 'In Progress'),
                       (ranked_epic(944, '08:E00', ('W01', 'Second', ''),
                                    priority='priority: 100'), 'Ready'),
                       (ranked_epic(943, '07:E00', ('W01', 'First', ''),
                                    priority='priority: 1'), 'Ready'))
        plan, _ = exported(items)
        self.assertEqual([unit['id'] for unit in plan], ['o/r#I07:E00:W01', 'o/r#I08:E00:W01'])

    def test_parent_priority_follows_cross_repository_issue_links(self):
        high = initiative(7, 'High: Work', (f'[E00]({url("issues", 943, "z/s")})', ''),
                          priority='priority: 10')
        low = initiative(8, 'Low: Work', (f'[E00]({url("issues", 944)})', ''), priority='priority: 1')
        items = staged((high, 'In Progress'), (low, 'In Progress'),
                       (ranked_epic(943, '07:E00', ('W01', 'Cross repository', ''), repo='z/s'), 'Ready'),
                       (ranked_epic(944, '08:E00', ('W01', 'Local', ''), priority='priority: 100'), 'Ready'))
        plan, _ = exported(items)
        selected = batch({**AUTH, 'scope': ['*']}, plan, [], 1, BOARD)
        self.assertEqual(selected['units'][0]['id'], 'z/s#I07:E00:W01')

    def test_the_largest_priority_label_orders_unparented_sibling_epics(self):
        low = ranked_epic(943, '07:E00', ('W01', 'Low', ''), priority='priority: 3')
        high = ranked_epic(944, '07:E01', ('W01', 'High', ''), priority='priority: 1')
        high['labels'].append({'name': 'priority: 10'})
        plan, _ = exported(staged((low, 'In Progress'), (high, 'Ready')))
        self.assertEqual(plan[0]['id'], 'o/r#I07:E01:W01')

    def test_priority_preserves_lane_admission_and_joined_units(self):
        low = epic(943, ('W01', 'Low', '', ''), which='07:E00')
        high = epic(944, ('W01', 'High', '', 'W02'), ('W02', 'Joined', '', 'W01'), which='07:E01')
        outside = epic(945, ('W01', 'Other lane', '', ''), which='07:E02')
        for issue, priority, assignments in [(low, 1, {'W01': '2'}),
                                              (high, 10, {'W01': '2', 'W02': '2'}),
                                              (outside, 100, {'W01': '3'})]:
            issue['labels'] = [{'name': f'priority: {priority}'}]
            issue['body'] = assign_lanes(issue['body'], assignments)
        plan, _ = exported(staged((low, 'In Progress'), (high, 'Ready'), (outside, 'Ready')), '--lane', '2')
        selected = batch({**AUTH, 'lane': '2'}, plan, [], 1, BOARD, '2')
        self.assertEqual([unit['id'] for unit in selected['units']], ['o/r#I07:E01:W01+W02'])
        self.assertNotIn('o/r#I07:E02:W01', [unit['id'] for unit in plan])


class DispatchBlockers(unittest.TestCase):
    def test_a_prehold_capability_failure_stops_successive_refills(self):
        plan, _ = exported(chain(set(), set()))
        selected = batch(AUTH, plan, [], 1, BOARD)
        self.assertEqual(selected['action'], 'dispatch')
        blockers = [{'scope': 'run', 'reason': 'Sub-agent dispatch is unavailable'}]
        for _ in range(3):
            refreshed, _ = exported(chain(set(), set()))
            self.assertEqual(batch(AUTH, refreshed, [], 1, BOARD, blockers=blockers),
                             {'action': 'stop', 'units': [], 'pending': 0})
        unit = selected['units'][0]
        with self.assertRaisesRegex(ValueError, 'dispatch blocker'):
            check_start(selected, unit['id'], evidence(unit), [], 1, blockers)

    def test_a_prehold_unit_failure_allows_independent_work(self):
        plan, _ = exported(chain(set(), set()))
        blockers = [{'scope': 'unit', 'id': 'o/r#I07:E00:W01',
                     'reason': 'Required criterion has no delivering row'}]
        for _ in range(3):
            selected = batch(AUTH, plan, [], 1, BOARD, blockers=blockers)
            self.assertEqual([unit['id'] for unit in selected['units']], ['o/r#I07:E00:W04'])
        self.assertEqual(batch(AUTH, [plan[0]], [], 1, BOARD, blockers=blockers)['action'], 'stop')
        self.assertEqual(batch(AUTH, plan, [], 1, BOARD)['units'][0]['id'], 'o/r#I07:E00:W01')

    def test_a_unit_blocker_covers_joined_rows_and_preparations(self):
        unit = offered('o/r#I07:E00:W01+W02')
        selected = batch(AUTH, [unit], [], 1, BOARD)
        blockers = [{'scope': 'unit', 'id': 'o/r#I07:E00:W02', 'reason': 'Worktree changed'}]
        result = batch(AUTH, [unit], [], 1, BOARD, preparations=[unit], blockers=blockers)
        self.assertEqual(result['action'], 'stop')
        with self.assertRaisesRegex(ValueError, 'dispatch blocker'):
            check_start(selected, unit['id'], evidence(unit), [], 1, blockers)

    def test_a_unit_blocker_does_not_stop_a_running_sibling(self):
        blockers = [{'scope': 'unit', 'id': 'o/r#I07:E00:W01', 'reason': 'Missing context'}]
        result = batch(AUTH, [offered('o/r#I07:E00:W01')],
                       [worker('o/r#I07:E00:W04')], 0, BOARD, blockers=blockers)
        self.assertEqual(result['action'], 'wait')

    def test_blockers_have_explicit_scope_and_reason(self):
        for blocker in [{'scope': 'unknown', 'reason': 'Failure'},
                        {'scope': 'run', 'reason': ''},
                        {'scope': 'unit', 'id': 'o/r#I07', 'reason': 'Failure'}]:
            with self.subTest(blocker=blocker), self.assertRaises(ValueError):
                batch(AUTH, [], [], 1, BOARD, blockers=[blocker])

    def test_cli_applies_recorded_blockers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            unit = offered('o/r#I07:E00:W01')
            for name, value in [('auth', AUTH), ('plan', [unit]), ('sessions', []),
                                ('blockers', [{'scope': 'run', 'reason': 'Merge capability absent'}])]:
                (root / f'{name}.json').write_text(json.dumps(value))
            result = run('dispatch.py', 'batch', '--authorization', str(root / 'auth.json'),
                         '--plan', str(root / 'plan.json'), '--sessions', str(root / 'sessions.json'),
                         '--blockers', str(root / 'blockers.json'), '--capacity', '1', '--board', BOARD)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)['action'], 'stop')


class Start(unittest.TestCase):
    def test_ordered_evidence_precedes_execution(self):
        unit = offered('o/r#I07:E00:W01')
        selected = batch(AUTH, [unit], [], 1, BOARD)
        observed = {'unit': unit['id']}
        events = []
        for key, value, event, failure in [
            ('published_record', unit['record'], 'publish', 'reservation must hold'),
            ('reserved_record', unit['record'], 'reserve', 'readback is unverified'),
            ('reservation_verified', True, 'verify', None),
        ]:
            if not events:
                with self.assertRaisesRegex(ValueError, 'publication is unverified'):
                    check_start(selected, unit['id'], observed, [], 1)
            observed[key] = value
            events.append(event)
            if failure:
                with self.assertRaisesRegex(ValueError, failure):
                    check_start(selected, unit['id'], observed, [], 1)
            else:
                check_start(selected, unit['id'], observed, [], 1)
                events.append('execute')
        self.assertEqual(events, ['publish', 'reserve', 'verify', 'execute'])

    def test_start_rechecks_capacity_and_session_identity(self):
        unit = offered('o/r#I07:E00:W01+W02')
        selected = batch(AUTH, [unit], [], 1, BOARD)
        with self.assertRaisesRegex(ValueError, 'free harness slot'):
            check_start(selected, unit['id'], evidence(unit), [], 0)
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            check_start(selected, unit['id'], evidence(unit), [worker('o/r#I07:E00:W02')], 1)
        for key, value in [('unit', 'o/r#I07:E00:W03'), ('published_record', 'other'),
                           ('reserved_record', 'other'), ('reservation_verified', 'true')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                check_start(selected, unit['id'], {**evidence(unit), key: value}, [], 1)
        with self.assertRaisesRegex(ValueError, 'selected batch'):
            check_start(selected, 'o/r#I07:E00:W03', evidence(unit), [], 1)

    def test_cli_returns_batch_and_checks_start_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            unit = offered('o/r#I07:E00:W01')
            for name, value in [('auth', AUTH), ('plan', [unit]), ('sessions', []),
                                ('evidence', evidence(unit))]:
                (root / f'{name}.json').write_text(json.dumps(value))
            common = ['--sessions', str(root / 'sessions.json'), '--capacity', '1']
            result = run('dispatch.py', 'batch', '--authorization', str(root / 'auth.json'),
                         '--plan', str(root / 'plan.json'), '--board', BOARD, *common)
            self.assertEqual(result.returncode, 0, result.stderr)
            (root / 'batch.json').write_text(result.stdout)
            args = ['start', '--batch', str(root / 'batch.json'), '--unit', unit['id'],
                    '--evidence', str(root / 'evidence.json'), *common]
            result = run('dispatch.py', *args)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), unit)
            (root / 'evidence.json').write_text('{}')
            result = run('dispatch.py', *args)
            self.assertEqual(result.returncode, 1)
            self.assertIn('evidence must name', result.stderr)
            (root / 'plan.json').write_text('[]')
            (root / 'preparations.json').write_text(json.dumps([unit]))
            result = run('dispatch.py', 'batch', '--authorization', str(root / 'auth.json'),
                         '--plan', str(root / 'plan.json'), '--board', BOARD,
                         '--preparations', str(root / 'preparations.json'), *common)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)['action'], 'wait')

    def test_malformed_observations_fail_before_selection(self):
        for capacity, scope, sessions in [(-1, AUTH['scope'], []), (1, [], []),
                                         (1, ['I07'], []),
                                         (1, AUTH['scope'], [worker('o/r#I07', 'unknown')]),
                                         (1, AUTH['scope'], [worker('o/r#I07'), worker('o/r#I07')])]:
            with self.subTest(capacity=capacity, scope=scope, sessions=sessions):
                with self.assertRaises(ValueError):
                    batch({**AUTH, 'scope': scope}, [], sessions, capacity, BOARD)
