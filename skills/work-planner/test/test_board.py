"""The assignees board.py gives an issue for its Status, and an initiative's Status once its
criteria are ticked.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from test_agent_review import reviewed_pr
from fixtures import SCRIPTS, epic_body, initiative_body, issue, item, links, pr, run, url

sys.path.insert(0, str(SCRIPTS))
from board import Board, Resolution  # noqa: E402
from statuses import assignee_calls  # noqa: E402

KEY = ('o/r', 12)
PATH = 'repos/o/r/issues/12/assignees'


def held(*logins):
    return {'assignees': [{'login': who} for who in logins]}


class AssigneeCalls(unittest.TestCase):
    def test_ready_unassigned_assigns_the_user(self):
        self.assertEqual(assignee_calls(KEY, 'Ready', held(), 'me'),
                         [f"gh api --method POST {PATH} -f 'assignees[]=me'"])

    def test_every_status_from_ready_on_assigns_the_user(self):
        for status in ('Ready', 'In Progress', 'In Review', 'Done'):
            self.assertEqual(len(assignee_calls(KEY, status, held('other'), 'me')), 1, status)

    def test_the_user_already_assigned_needs_nothing(self):
        self.assertEqual(assignee_calls(KEY, 'In Progress', held('me'), 'me'), [])

    def test_backlog_removes_every_assignee(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', held('me', 'other'), 'me'),
                         [f"gh api --method DELETE {PATH} -f 'assignees[]=me'",
                          f"gh api --method DELETE {PATH} -f 'assignees[]=other'"])

    def test_backlog_unassigned_needs_nothing(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', held(), 'me'), [])

    def test_an_issue_without_an_assignees_field_reads_as_unassigned(self):
        self.assertEqual(assignee_calls(KEY, 'Backlog', {}, 'me'), [])


class RequiredLinks(unittest.TestCase):
    def test_pull_requests_without_their_issue_links_are_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            root, prs = Path(tmp, 'initiative.json'), Path(tmp, 'prs.json')
            root.write_text(json.dumps(issue(1, '[I01] First: Initiative', body=initiative_body())))
            prs.write_text('')
            done = run('board.py', str(root), '--prs', str(prs), '--board', 'users/o/projectsV2/9',
                       '--fields', str(prs), '--items', str(prs), '--out', str(Path(tmp, 'out')),
                       '--assignee', 'me')
        self.assertNotEqual(done.returncode, 0)
        self.assertEqual(done.stderr.strip(), '--links is required')


class RowPrerequisites(unittest.TestCase):
    def test_cross_repository_task_waits_for_its_output_to_reach_its_long_lived_branch(self):
        upstream = issue(2, '[I02:E00] Producer: Work', repo='o/other', body=epic_body(
            (f"[W01]({url('pull', 9, 'o/other')})", 'Produce', ''), ('W02', 'Unrelated', '')))
        key = ('o/r', 3)
        dependency = f"[I02:E00:W01]({url('issues', 2, 'o/other')})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        pulls = [pr(9, '[I02:E00] Produce', merged='2026-01-01T00:00:00Z', repo='o/other',
                    base='i02/e00/main', head='i02/e00/w01-produce')]
        board = Board({('o/other', 2): upstream, key: consumer}, [], 'o/r', pulls)
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.UNMET)
        self.assertIn('consumer: I02:E00:W01 o/other#9 absent: o/other i02/e00/main has not merged into main since',
                      board.outputs.lines)
        pulls.append(pr(12, '[I02:E00] Producer', merged='2026-01-02T00:00:00Z', repo='o/other',
                        base='main', head='i02/e00/main'))
        board = Board({('o/other', 2): upstream, key: consumer}, [], 'o/r', pulls)
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.MET)
        self.assertEqual(upstream['state'], 'open')
        self.assertIn('consumer: I02:E00:W01 o/other#9 available on o/other main by o/other#12',
                      board.outputs.lines)

    def test_a_cross_repository_output_merged_into_a_task_branch_is_unverified(self):
        upstream = issue(2, '[I02:E00] Producer: Work', repo='o/other',
                         body=epic_body((f"[W01]({url('pull', 9, 'o/other')})", 'Produce', '')))
        key = ('o/r', 3)
        dependency = f"[I02:E00:W01]({url('issues', 2, 'o/other')})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        pulls = [pr(9, '[I02:E00] Produce', merged='2026-01-01T00:00:00Z', repo='o/other',
                    base='i02/e00/w02-stack', head='i02/e00/w01-produce')]
        board = Board({('o/other', 2): upstream, key: consumer}, [], 'o/r', pulls)
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.UNMET)
        self.assertEqual(board.outputs.lines, ['consumer: I02:E00:W01 o/other#9 unverified: it merged into '
                                               'i02/e00/w02-stack, which is neither an epic base nor a '
                                               'long-lived branch'])

    def test_an_integration_merged_before_the_delivery_does_not_carry_it(self):
        upstream = issue(2, '[I02:E00] Producer: Work', repo='o/other',
                         body=epic_body((f"[W01]({url('pull', 9, 'o/other')})", 'Produce', '')))
        key = ('o/r', 3)
        dependency = f"[I02:E00:W01]({url('issues', 2, 'o/other')})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        pulls = [pr(9, '[I02:E00] Produce', merged='2026-01-03T00:00:00Z', repo='o/other', base='i02/e00/main'),
                 pr(12, '[I02:E00] Producer', merged='2026-01-02T00:00:00Z', repo='o/other',
                    base='main', head='i02/e00/main')]
        board = Board({('o/other', 2): upstream, key: consumer}, [], 'o/r', pulls)
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.UNMET)

    def test_a_same_repository_output_is_unverified_without_a_checkout(self):
        key = ('o/r', 3)
        producer = issue(2, '[I01:E00] Producer: Work', 'closed',
                         body=epic_body((f"[W01]({url('pull', 9)})", 'Produce', '')))
        dependency = f"[E00:W01]({url('issues', 2)})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        pulls = [pr(9, '[I01:E00] Produce', merged='2026-01-01T00:00:00Z', base='i01/e00/main')]
        board = Board({('o/r', 2): producer, key: consumer}, [], 'o/r', pulls)
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.UNMET)
        self.assertEqual(board.outputs.lines, ['consumer: E00:W01 #9 unverified: no checkout to read it in'])
        self.assertEqual(board.unresolved, [])

    def test_missing_prerequisite_is_reported_and_blocks(self):
        key = ('o/r', 3)
        dependency = f"[E00:W01]({url('issues', 2)})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        board = Board({key: consumer}, [], 'o/r')
        self.assertIs(board.met(dependency, key, {}, 'consumer'), Resolution.UNRESOLVABLE)
        self.assertEqual(board.unresolved, ['consumer: cannot resolve E00:W01: #2 is not given'])

    def test_local_task_dependency_uses_the_task_merge(self):
        key = ('o/r', 2)
        epic = issue(2, '[I01:E00] Local: Work', body=epic_body(
            (f"[W01]({url('pull', 9)})", 'Produce', ''), ('W02', 'Consume', 'W01')))
        board = Board({key: epic}, [], 'o/r', [pr(9, '[I01:E00] Produce', merged='2026-01-01T00:00:00Z')])
        self.assertIs(board.met('W01', key, {}, 'local'), Resolution.MET)


class UnresolvableDependencies(unittest.TestCase):
    """An entry the cell cannot resolve, told apart from one waiting on delivery."""

    def consumer(self, dependency: str) -> tuple[Board, tuple[str, int]]:
        key = ('o/r', 3)
        epic = issue(3, '[I01:E01] Consumer: Work', body=epic_body(
            (f"[W01]({url('pull', 9)})", 'Produce', ''), ('W02', 'Consume', dependency)))
        return Board({key: epic}, [], 'o/r', [pr(9, '[I01:E01] Produce', merged='2026-01-01T00:00:00Z')]), key

    def test_an_entry_naming_no_row_and_linking_no_issue_cannot_resolve(self):
        board, key = self.consumer('E05 (W04)')
        self.assertIs(board.met('E05 (W04)', key, {}, 'E01:W02'), Resolution.UNRESOLVABLE)
        self.assertEqual(board.unresolved,
                         ['E01:W02: cannot resolve E05 (W04): it names no row and links no issue'])

    def test_a_row_the_epic_does_not_carry_cannot_resolve(self):
        board, key = self.consumer('W07')
        self.assertIs(board.met('W07', key, {}, 'E01:W02'), Resolution.UNRESOLVABLE)
        self.assertEqual(board.unresolved, ['E01:W02: cannot resolve W07: #3 has no such row'])

    def test_a_prerequisite_that_has_not_landed_is_unmet(self):
        board, key = self.consumer('W02')
        self.assertIs(board.met('W02', key, {}, 'E01:W03'), Resolution.UNMET)
        self.assertEqual(board.unresolved, [])

    def test_a_delivered_prerequisite_is_met(self):
        board, key = self.consumer('W01')
        self.assertIs(board.met('W01', key, {}, 'E01:W02'), Resolution.MET)

    def test_every_entry_of_a_cell_is_read(self):
        board, key = self.consumer('W07, W08')
        self.assertIs(board.met('W07, W08', key, {}, 'E01:W02'), Resolution.UNRESOLVABLE)
        self.assertEqual(board.unresolved, ['E01:W02: cannot resolve W07: #3 has no such row',
                                            'E01:W02: cannot resolve W08: #3 has no such row'])

    def test_an_unresolvable_entry_outranks_an_unmet_one(self):
        board, key = self.consumer('W02, W07')
        self.assertIs(board.met('W02, W07', key, {}, 'E01:W03'), Resolution.UNRESOLVABLE)

    def test_an_unreadable_table_cannot_resolve_rather_than_ending_the_run(self):
        producer = issue(2, '[I01:E00] Producer: Work', body=epic_body(
            (f"[W01]({url('pull', 9)}), [W02]({url('pull', 9)})", 'Produce', '')))
        key = ('o/r', 3)
        dependency = f"[E00:W01]({url('issues', 2)})"
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Consume', dependency)))
        board = Board({('o/r', 2): producer, key: consumer}, [], 'o/r')
        self.assertIs(board.met(dependency, key, {}, 'E01:W01'), Resolution.UNRESOLVABLE)
        self.assertEqual(board.unresolved, ['E01:W01: cannot resolve W01: W01: every link on a task row '
                                            'names that row; resolve the others'])


class EpicPrerequisites(unittest.TestCase):
    def test_an_initiative_row_dependency_gates_the_whole_epic(self):
        key = ('o/r', 3)
        producer = issue(2, '[I01:E00] Producer: Work', body=epic_body(('W01', 'Produce', '')))
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(('W01', 'Work', '')))
        initiative = issue(1, '[I01] Theme: Work', body=initiative_body(
            (f"[E00]({url('issues', 2)})", ''), (f"[E01]({url('issues', 3)})", f"[E00]({url('issues', 2)})")))
        board = Board({('o/r', 1): initiative, ('o/r', 2): producer, key: consumer}, [], 'o/r')
        self.assertIs(board.epic_prerequisites_met(key, {}, 'consumer'), Resolution.UNMET)
        producer['state'], producer['state_reason'] = 'closed', 'completed'
        self.assertIs(board.epic_prerequisites_met(key, {}, 'consumer'), Resolution.MET)

    def test_a_task_row_dependency_leaves_the_epic_open(self):
        key = ('o/r', 3)
        consumer = issue(3, '[I01:E01] Consumer: Work', body=epic_body(
            ('W01', 'Consume', f"[E00:W01]({url('issues', 2)})")))
        initiative = issue(1, '[I01] Theme: Work', body=initiative_body((f"[E01]({url('issues', 3)})", '')))
        board = Board({('o/r', 1): initiative, key: consumer}, [], 'o/r')
        self.assertIs(board.epic_prerequisites_met(key, {}, 'consumer'), Resolution.MET)


class Startable(unittest.TestCase):
    """The delivery and planning prerequisites of an unstarted epic."""

    def board(self, questions: bool = False) -> tuple[Board, dict]:
        producer = issue(2, '[I01:E00] Producer: Work', body=epic_body(('W01', 'Produce', '')))
        body = epic_body(('W01', 'Work', '')) + ('\n## Open Questions\n\n- Which shape?\n' if questions else '')
        consumer = issue(3, '[I01:E01] Consumer: Work', body=body)
        initiative = issue(1, '[I01] Theme: Work', body=initiative_body(
            (f"[E00]({url('issues', 2)})", ''), (f"[E01]({url('issues', 3)})", f"[E00]({url('issues', 2)})")))
        return Board({('o/r', 1): initiative, ('o/r', 2): producer, ('o/r', 3): consumer}, [], 'o/r'), producer

    def startable(self, board: Board, depends: str) -> Resolution:
        return board.startable(('o/r', 1), ('o/r', 3), depends, {'E00': ('o/r', 2)}, 'E01')

    def test_an_epic_waits_on_its_prerequisite_epic(self):
        board, producer = self.board()
        self.assertIs(self.startable(board, 'E00'), Resolution.UNMET)
        producer['state'], producer['state_reason'] = 'closed', 'completed'
        self.assertIs(self.startable(board, 'E00'), Resolution.MET)

    def test_an_open_question_holds_an_epic_whose_delivery_is_met(self):
        board, producer = self.board(questions=True)
        producer['state'], producer['state_reason'] = 'closed', 'completed'
        self.assertIs(self.startable(board, 'E00'), Resolution.UNMET)

    def test_an_entry_that_cannot_resolve_is_the_answer(self):
        board, producer = self.board()
        producer['state'], producer['state_reason'] = 'closed', 'completed'
        self.assertIs(self.startable(board, 'E09 (W04)'), Resolution.UNRESOLVABLE)


def board_fields(*names: str) -> list[dict]:
    return [{'id': 7, 'name': 'Status', 'options': [{'name': name, 'id': n} for n, name in enumerate(names, start=1)]}]


class InitiativeStatus(unittest.TestCase):
    def planned(self, initiative: dict, epic: dict, *statuses: str, held: str = 'In Progress', reviews=()) -> str:
        initiative['id'], epic['id'] = 11, 12
        initiative['assignees'] = epic['assignees'] = [{'login': 'me'}]
        on_board = [item(initiative, held), item(epic, 'Done')]
        on_board[0]['id'], on_board[1]['id'] = 100, 101
        with tempfile.TemporaryDirectory() as tmp:
            root, epic_path = Path(tmp, 'initiative.json'), Path(tmp, 'epic.json')
            fields, items, pulls = Path(tmp, 'fields.json'), Path(tmp, 'items.json'), Path(tmp, 'prs.json')
            held_links = Path(tmp, 'links.json')
            reviews_path = Path(tmp, 'reviews.json')
            reviews_path.write_text(json.dumps(list(reviews)))
            root.write_text(json.dumps(initiative))
            epic_path.write_text(json.dumps(epic))
            fields.write_text(json.dumps(board_fields(*statuses)))
            items.write_text(json.dumps(on_board))
            pulls.write_text('')
            held_links.write_text('[]')
            done = run('board.py', str(root), '--epics', str(epic_path), '--prs', str(pulls),
                       '--links', str(held_links),
                       '--board', 'users/o/projectsV2/9', '--fields', str(fields), '--items', str(items),
                       '--out', str(Path(tmp, 'out')), '--assignee', 'me',
                       '--agent-reviews', str(reviews_path))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def ticked(self, state: str = 'open') -> tuple[dict, dict]:
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        body = initiative_body((f"[E00]({url('issues', 2)})", '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        return issue(1, '[I01] First: Initiative', state, body=body), epic

    def test_ticked_criteria_move_an_open_initiative_to_in_review(self):
        initiative, epic = self.ticked()
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done')
        self.assertIn('set #1 [I01] First: Initiative: In Progress → In Review', out)

    def test_an_unticked_criterion_leaves_the_initiative_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done')
        self.assertNotIn('→ In Review', out)
        self.assertIn('to do: 0', out)

    def test_a_closed_initiative_is_done(self):
        initiative, epic = self.ticked('closed')
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'In Review', 'Done', held='In Review')
        self.assertIn('set #1 [I01] First: Initiative: In Review → Done', out)

    def test_in_review_falls_back_when_the_board_lacks_it(self):
        initiative, epic = self.ticked()
        out = self.planned(initiative, epic, 'Backlog', 'Ready', 'In Progress', 'Done', held='Ready')
        self.assertIn('set #1 [I01] First: Initiative: Ready → In Progress', out)
        self.assertNotIn('In Review', out)

    def open_pair(self, initiative_status: str, epic_status: str, epic: dict | None = None,
                  pulls: str = '', held: tuple[dict, ...] = (), tasks: tuple[dict, ...] = (),
                  statuses: tuple[str, ...] = ('Backlog', 'Ready', 'In Progress', 'Done'),
                  code: int = 0, reviews=(), task_held: tuple[str, ...] = ()) -> str:
        epic = epic or issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        initiative = issue(1, '[I01] First: Initiative',
                           body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        initiative['id'], epic['id'] = 11, 12
        if initiative_status != 'Backlog':
            initiative['assignees'] = [{'login': 'me'}]
        if epic_status != 'Backlog':
            epic['assignees'] = [{'login': 'me'}]
        on_board = [item(initiative, initiative_status), item(epic, epic_status)]
        on_board[0]['id'], on_board[1]['id'] = 100, 101
        for n, task in enumerate(tasks):
            task['id'] = 20 + n
            task['assignees'] = [{'login': 'me'}]
            on_board.append({**item(task, task_held[n] if task_held else 'Backlog'), 'id': 200 + n})
        with tempfile.TemporaryDirectory() as tmp:
            root, epic_path = Path(tmp, 'initiative.json'), Path(tmp, 'epic.json')
            fields, items, prs = Path(tmp, 'fields.json'), Path(tmp, 'items.json'), Path(tmp, 'prs.json')
            held_links = Path(tmp, 'links.json')
            reviews_path = Path(tmp, 'reviews.json')
            reviews_path.write_text(json.dumps(list(reviews)))
            root.write_text(json.dumps(initiative))
            epic_path.write_text(json.dumps(epic))
            fields.write_text(json.dumps(board_fields(*statuses)))
            items.write_text(json.dumps(on_board))
            prs.write_text(pulls)
            held_links.write_text(json.dumps(list(held)))
            task_paths = []
            for n, task in enumerate(tasks):
                path = Path(tmp, f'task-{n}.json')
                path.write_text(json.dumps(task))
                task_paths.append(str(path))
            done = run('board.py', str(root), '--epics', str(epic_path), '--prs', str(prs),
                       '--links', str(held_links), *(['--tasks', *task_paths] if task_paths else []),
                       '--board', 'users/o/projectsV2/9', '--fields', str(fields), '--items', str(items),
                       '--out', str(Path(tmp, 'out')), '--assignee', 'me',
                       '--agent-reviews', str(reviews_path))
            self.assertEqual(done.returncode, code, done.stderr)
            return done.stdout

    def test_a_task_gated_on_an_unresolvable_entry_keeps_its_status(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', 'E05 (W04)')))
        task = issue(3, '[I01:E00:W01] Go: Work')
        out = self.open_pair('In Progress', 'Ready', epic, tasks=(task,), code=1)
        self.assertIn('cannot resolve E05 (W04)', out)
        self.assertNotIn('[I01:E00:W01] Go: Work:', out)

    def test_an_unstarted_epic_stays_in_backlog(self):
        out = self.open_pair('Backlog', 'Backlog')
        self.assertNotIn('→ Ready', out)
        self.assertIn('to do: 0', out)

    def test_a_ready_initiative_with_no_delivery_stays_ready(self):
        out = self.open_pair('Ready', 'Backlog')
        self.assertNotIn('→ Backlog', out)
        self.assertIn('to do: 0', out)

    def test_a_delivered_row_alone_leaves_the_epic_out_of_progress(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', '')))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        for held in ('In Progress', 'In Review'):
            out = self.open_pair('In Progress', held, epic, merged)
            self.assertIn(f'set #2 [I01:E00] First: Epic: {held} → Backlog', out)

    def test_an_open_pull_request_with_an_unticked_criterion_leaves_the_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        open_pr = json.dumps(pr(9, '[I01:E00] Go')) + '\n'
        out = self.open_pair('Backlog', 'Backlog', epic, open_pr,
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('set #2 [I01:E00] First: Epic: Backlog → In Progress', out)
        self.assertNotIn('→ In Review', out)

    def test_current_review_moves_epic_to_review_and_changed_target_retracts_it(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', ''))
                     .replace('- [ ] **AC1.**', '- [x] **AC1.**'))
        pull, record = reviewed_pr('01:E00')
        merged = pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')
        out = self.open_pair('In Progress', 'In Progress', epic,
                             json.dumps(merged) + '\n' + json.dumps(pull),
                             held=(links(10, 2),), reviews=(record,),
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('In Progress → In Review', out)
        pull['base']['sha'] = 'c' * 40
        out = self.open_pair('In Progress', 'In Review', epic,
                             json.dumps(merged) + '\n' + json.dumps(pull),
                             held=(links(10, 2),), reviews=(record,), code=1,
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('In Review → In Progress', out)
        self.assertIn('stale agent review', out)

    def test_ticked_criteria_without_agent_review_hold_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', ''))
                     .replace('- [ ] **AC1.**', '- [x] **AC1.**'))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        out = self.open_pair('In Progress', 'In Progress', epic, merged,
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'), code=1)
        self.assertNotIn('→ In Review', out)
        self.assertIn('missing open epic integration pull request', out)

    def test_a_task_is_ready_though_a_sibling_row_waits_on_another_epic(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('issues', 3)})", 'Go', ''),
            ('W02', 'Consume', f"[E01:W01]({url('issues', 4)})")))
        task = issue(3, '[I01:E00:W01] Go: Task')
        out = self.open_pair('Ready', 'Ready', epic, tasks=(task,),
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('[I01:E00:W01] Go: Task: Backlog → Ready', out)

    def task_pair(self, held: tuple[dict, ...], draft: bool = False, base: str | None = None,
                  head: str | None = None) -> str:
        """An epic whose W01 links a task issue, and an open pull request naming the epic."""
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Go', '')))
        task = issue(3, '[I01:E00:W01] Go: Task')
        open_pr = pr(9, '[I01:E00] Go', draft=draft, base=base, head=head)
        return self.open_pair('In Progress', 'In Progress', epic, json.dumps(open_pr) + '\n', held=held,
                              tasks=(task,), statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))

    def test_a_ready_pull_request_linking_the_task_issue_puts_it_in_progress(self):
        out = self.task_pair((links(9, 3),))
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → In Progress', out)
        self.assertNotIn('→ In Review', out)

    def test_a_draft_pull_request_linking_the_task_issue_puts_it_in_progress(self):
        out = self.task_pair((links(9, 3),), draft=True)
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → In Progress', out)
        self.assertNotIn('→ In Review', out)

    def test_an_integration_pull_request_linking_the_task_issue_leaves_it_waiting(self):
        for draft in (False, True):
            with self.subTest(draft=draft):
                out = self.task_pair((links(9, 3),), draft=draft, base='workspace', head='i01/e00/workspace')
                self.assertNotIn('[I01:E00:W01] Go: Task: Backlog →', out)
                self.assertIn('set #2 [I01:E00] First: Epic: In Progress → Backlog', out)

    def test_a_merged_pull_request_and_a_completed_task_issue_put_it_done(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Go', '')))
        task = issue(3, '[I01:E00:W01] Go: Task', 'closed')
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z', base='i01/e00/workspace')) + '\n'
        out = self.open_pair('In Progress', 'In Progress', epic, merged, held=(links(9, 3),), tasks=(task,),
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → Done', out)

    def test_a_pull_request_linking_nothing_leaves_the_task_issue_ready(self):
        out = self.task_pair(())
        self.assertNotIn('→ In Review', out)
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → Ready', out)

    def held_row(self, link: str) -> str:
        """An epic whose W01 id carries the given link, with the task issue its title names."""
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({link})', 'Go', '')))
        return self.open_pair('In Progress', 'In Progress', epic, tasks=(issue(3, '[I01:E00:W01] Go: Task'),),
                              statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))

    def test_a_row_a_session_holds_puts_its_task_issue_in_progress(self):
        record = 'https://github.com/o/r/tree/engineering/artifacts/planning/2026-10-06-2-i01-e00-w01-go/'
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Backlog → In Progress', self.held_row(record))

    def test_a_row_linking_its_work_item_leaves_the_task_issue_out_of_progress(self):
        item_file = 'https://github.com/o/r/blob/engineering/artifacts/planning/2026-10-06-2-i01-e00-w01-go/w01.md'
        self.assertNotIn('→ In Progress', self.held_row(item_file))

    def test_a_backlog_epic_takes_its_unstarted_task_issues_and_keeps_done(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('issues', 3)})", 'Go', ''), (f"[W02]({url('issues', 4)})", 'Done', '')))
        unstarted = issue(3, '[I01:E00:W01] Go: Task')
        done = issue(4, '[I01:E00:W02] Done: Task', 'closed')
        out = self.open_pair('Backlog', 'Backlog', epic, tasks=(unstarted, done), task_held=('Ready', 'Done'),
                             statuses=('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'))
        self.assertIn('set #3 [I01:E00:W01] Go: Task: Ready → Backlog', out)
        self.assertIn("--method DELETE repos/o/r/issues/3/assignees -f 'assignees[]=me'", out)
        self.assertNotIn('set #4', out)
        self.assertNotIn('DELETE repos/o/r/issues/4/assignees', out)

    def test_a_ready_epic_with_a_delivered_row_stays_ready(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body(('[W01](https://github.com/o/r/pull/9)', 'Go', '')))
        merged = json.dumps(pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')) + '\n'
        out = self.open_pair('Ready', 'Ready', epic, merged)
        self.assertNotIn('→ In Progress', out)
        self.assertIn('to do: 0', out)


RECORD = 'https://github.com/o/r/tree/engineering/artifacts/planning/2026-11-01-2-i01-e00-w01-go/'
STATUSES = ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done')


def placed(initiative: dict, epics: list[tuple[dict, str | None]], pulls: list[dict] = (),
           initiative_status: str | None = 'Backlog', reviews=(), held=(), code: int = 0) -> str:
    """board.py on one initiative and its epics, each with the Status it holds; None is off the board."""
    initiative['id'] = 11
    on_board = [] if initiative_status is None else [{**item(initiative, initiative_status), 'id': 100}]
    for n, (epic, status) in enumerate(epics):
        epic['id'] = 12 + n
        if status is not None:
            on_board.append({**item(epic, status), 'id': 101 + n})
    with tempfile.TemporaryDirectory() as tmp:
        files = {name: Path(tmp, f'{name}.json') for name in ('initiative', 'fields', 'items', 'prs',
                                                              'links', 'reviews')}
        files['initiative'].write_text(json.dumps(initiative))
        files['fields'].write_text(json.dumps(board_fields(*STATUSES)))
        files['items'].write_text(json.dumps(on_board))
        files['prs'].write_text(''.join(json.dumps(p) + '\n' for p in pulls))
        files['links'].write_text(json.dumps(list(held)))
        files['reviews'].write_text(json.dumps(list(reviews)))
        epic_paths = []
        for n, (epic, _status) in enumerate(epics):
            path = Path(tmp, f'epic-{n}.json')
            path.write_text(json.dumps(epic))
            epic_paths.append(str(path))
        done = run('board.py', str(files['initiative']), '--epics', *epic_paths,
                   '--prs', str(files['prs']), '--links', str(files['links']),
                   '--agent-reviews', str(files['reviews']), '--board', 'users/o/projectsV2/9',
                   '--fields', str(files['fields']), '--items', str(files['items']),
                   '--out', str(Path(tmp, 'out')), '--assignee', 'me')
    if done.returncode != code:
        raise AssertionError(done.stderr or done.stdout)
    return done.stdout


def listing(*numbers: int) -> dict:
    """An initiative whose table lists the epics of these issue numbers, as E00, E01 and on."""
    return issue(1, '[I01] First: Initiative', body=initiative_body(
        *((f"[E{n:02d}]({url('issues', number)})", '') for n, number in enumerate(numbers))))


def ticked(body: str) -> str:
    return body.replace('- [ ] **AC1.**', '- [x] **AC1.**')


class EpicActivity(unittest.TestCase):
    """An open epic is In Progress while a session holds a row or a delivery pull request is open
    on it, until it passes the reviewed-handoff gate."""

    def test_a_reservation_alone_puts_the_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({RECORD})', 'Go', '')))
        out = placed(listing(2), [(epic, 'Backlog')])
        self.assertIn('set #2 [I01:E00] First: Epic: Backlog → In Progress', out)
        self.assertIn('set #1 [I01] First: Initiative: Backlog → In Progress', out)

    def test_an_open_delivery_pull_request_alone_puts_the_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        task = pr(9, '[I01:E00] Go', base='i01/e00/workspace', head='i01/e00/w01-go')
        out = placed(listing(2), [(epic, 'Ready')], [task])
        self.assertIn('set #2 [I01:E00] First: Epic: Ready → In Progress', out)

    def test_an_integration_draft_alone_is_not_work_under_way(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=epic_body((f"[W01]({url('pull', 9)})", 'Go', ''), ('W02', 'More', '')))
        merged = pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')
        draft = pr(10, '[I01:E00] Integration', base='workspace', head='i01/e00/workspace', draft=True)
        out = placed(listing(2), [(epic, 'In Progress')], [merged, draft])
        self.assertIn('set #2 [I01:E00] First: Epic: In Progress → Backlog', out)
        self.assertNotIn('[I01] First: Initiative: Backlog →', out)

    def test_an_inactive_epic_keeps_ready_or_backlog_and_joins_the_board_at_backlog(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        for held in ('Ready', 'Backlog'):
            self.assertNotIn('[I01:E00] First: Epic:', placed(listing(2), [(epic, held)]))
        self.assertIn('add #2 [I01:E00] First: Epic (Backlog)', placed(listing(2), [(epic, None)]))

    def test_a_completed_epic_is_done(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed', body=epic_body((f'[W01]({RECORD})', 'Go', '')))
        out = placed(listing(2), [(epic, 'In Progress')])
        self.assertIn('set #2 [I01:E00] First: Epic: In Progress → Done', out)

    def test_an_active_epic_passing_the_handoff_gate_is_in_review(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=ticked(epic_body((f'[W01]({RECORD})', 'Go', ''))))
        pull, record = reviewed_pr('01:E00')
        out = placed(listing(2), [(epic, 'In Progress')], [pull], 'In Progress', reviews=(record,))
        self.assertIn('set #2 [I01:E00] First: Epic: In Progress → In Review', out)

    def test_stale_review_holds_an_active_completed_epic_in_progress(self):
        epic = issue(2, '[I01:E00] First: Epic',
                     body=ticked(epic_body((f'[W01]({RECORD})', 'Go', ''))))
        pull, record = reviewed_pr('01:E00')
        pull['head']['sha'] = 'c' * 40
        out = placed(listing(2), [(epic, 'In Review')], [pull], 'In Progress', reviews=(record,), code=1)
        self.assertIn('set #2 [I01:E00] First: Epic: In Review → In Progress', out)
        self.assertIn('stale agent review', out)


class InitiativeMembership(unittest.TestCase):
    """An initiative is raised to In Progress only by the epics its table lists."""

    def test_an_epic_that_has_left_the_table_does_not_raise_the_initiative(self):
        listed = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        left = issue(5, '[I01:E01] Moved: Epic', body=epic_body((f'[W01]({RECORD})', 'Go', '')))
        open_pr = pr(9, '[I01:E01] Go')
        for initiative_status in ('Backlog', 'Ready'):
            out = placed(listing(2), [(listed, 'Backlog'), (left, 'In Progress')], [open_pr],
                         initiative_status)
            self.assertNotIn('[I01] First: Initiative:', out)
            self.assertNotIn('#5', out)

    def test_the_same_epic_listed_raises_the_initiative(self):
        listed = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        member = issue(5, '[I01:E01] Moved: Epic', body=epic_body((f'[W01]({RECORD})', 'Go', '')))
        out = placed(listing(2, 5), [(listed, 'Backlog'), (member, 'In Progress')], [pr(9, '[I01:E01] Go')])
        self.assertIn('set #1 [I01] First: Initiative: Backlog → In Progress', out)

    def test_completed_work_alone_starts_no_initiative(self):
        done = issue(2, '[I01:E00] First: Epic', 'closed', body=epic_body(('W01', 'Go', '')))
        self.assertIn('add #1 [I01] First: Initiative (Backlog)', placed(listing(2), [(done, 'Done')], [], None))

    def test_an_initiative_with_no_active_epic_keeps_its_status(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Go', '')))
        for held in ('Backlog', 'Ready', 'In Progress'):
            self.assertNotIn('[I01] First: Initiative:', placed(listing(2), [(epic, 'Ready')], [], held))


if __name__ == '__main__':
    unittest.main()
