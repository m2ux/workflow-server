"""Advance answers select saved readback and refreshed queue evidence before writing."""
import copy
import json
import re
import tempfile
import unittest
from pathlib import Path

from fixtures import run
from test_board_queue import FIELDS
from test_plan_mode import section

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'modes' / 'advance-mode.md'
CAPTURES = json.loads(Path(__file__).with_name('advance-captures.json').read_text())['captures']
BEFORE = 'automatic-order-before-answer'
SAVED = 'automatic-order-saved-priority'
CONVERGED = 'automatic-order-converged-state'
CALL = re.compile(r'(?:Apply|Run) \[([^]]+)\]\([^)]* "ƒ"\)')


def compute(snapshot, unplanned=()):
    """Run board-queue.py over captured input, retaining its actual report and status."""
    with tempfile.TemporaryDirectory() as tmp:
        directory = Path(tmp)
        for name, data in (('items', snapshot['items']), ('fields', FIELDS), ('links', [])):
            (directory / f'{name}.json').write_text(json.dumps(data))
        (directory / 'prs.json').write_text(''.join(json.dumps(row) + '\n' for row in snapshot['prs']))
        extra = [arg for identity in (*snapshot['unplanned'], *unplanned) for arg in ('--unplanned', identity)]
        return run('board-queue.py', '--items', str(directory / 'items.json'),
                   '--prs', str(directory / 'prs.json'), '--links', str(directory / 'links.json'),
                   '--board', 'users/o/projectsV2/9', '--fields', str(directory / 'fields.json'),
                   '--out', str(directory / 'out'), '--assignee', 'me', *extra)


def complete(result):
    return result.returncode == 0 and not re.search(r'^\s+(?:order:|ask |unresolved:|invalid )', result.stdout, re.M)


def ask_snapshot():
    """An unranked running initiative beside an established priority set."""
    snapshot = copy.deepcopy(CAPTURES[BEFORE])
    another = copy.deepcopy(snapshot['items'][0])
    another['id'] = 104
    another['content'].update(number=4, id=1004, title='[I04] Other: Work',
                              labels=[{'name': 'priority: 3'}],
                              html_url='https://github.com/o/r/issues/4',
                              body='## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n| --- | --- | --- | --- | --- |\n')
    snapshot['items'].append(another)
    return snapshot


def walk(*, disposition='automatic', answer=1, save_ok=True, readback=SAVED, source=None, initial=None):
    """Observe this route's bounded call grammar with injected persistence receipts.

    This adapter executes source-selected calls, not general Markdown or an agent.
    Queue computations use the installed program; saved/read board results are offline
    captures. Independent fresh-context reading tests procedural interpretation.
    """
    text = SOURCE.read_text() if source is None else source
    body = section(text, '### 6. Resolve Queue Decisions')
    events = ['Compute Board Queue']
    initial = compute(initial or CAPTURES[BEFORE])
    if complete(initial):
        raise AssertionError('scenario has no pending initial decision')
    autonomy = next(line for line in body.splitlines() if 'Check Plan Change Autonomy' in line)
    events.append(CALL.search(autonomy)[1])
    if disposition == 'held' or answer == 'unanswered':
        if '- A held or unanswered decision leaves the queue pending until an answer is available.' not in body:
            raise AssertionError('unrecognized pending decision branch')
        return 'pending', events, initial
    if disposition == 'automatic':
        automatic = next(line for line in body.splitlines() if line.startswith('- For an automatic line, take'))
        events.append(CALL.search(automatic)[1])
    after = body.split('- After an answer, including an allowed automatic answer:', 1)[1]
    current = None
    result = initial
    confirmed = False
    for raw in after.splitlines():
        line = raw.removeprefix('- ').strip()
        operation = CALL.search(line)
        if operation:
            name = operation[1]
            if name in ('Ensure Repository Labels', 'Save Tracker Issue') and answer is None:
                continue
            events.append(name)
            if name == 'Read Board State':
                current = copy.deepcopy(CAPTURES[readback]) if isinstance(readback, str) else copy.deepcopy(readback)
            elif name == 'Compute Board Queue':
                if current is None:
                    return 'pending', events, result
                result = compute(current, ('1',) if answer is None else ())
            elif name not in ('Ensure Repository Labels', 'Save Tracker Issue'):
                raise AssertionError(f'unsupported call {name}')
        elif line.startswith('On a failed save,'):
            if not save_ok:
                return 'pending', events, result
        elif line.startswith('Check that the refreshed board items confirm'):
            if current is not None:
                labels = current['items'][0]['content']['labels']
                confirmed = answer is None or {'name': f'priority: {answer}'} in labels
        elif line.startswith('On an unavailable or disagreeing readback,'):
            if not confirmed:
                return 'pending', events, result
        elif line.startswith('Continue to step 7 only when'):
            return ('write' if complete(result) else 'pending'), events, result
        elif line and not line.startswith(('Resolve any further missing evidence', 'Repeat this step while')):
            raise AssertionError(f'unrecognized instruction {line}')
    raise AssertionError('route has no completion gate')


class AdvanceDecisions(unittest.TestCase):
    def test_automatic_answer_saves_reads_and_recomputes_before_write(self):
        outcome, events, result = walk()
        self.assertEqual(outcome, 'write')
        self.assertEqual(events, ['Compute Board Queue', 'Check Plan Change Autonomy', 'Record Plan Change',
                                  'Ensure Repository Labels', 'Save Tracker Issue', 'Read Board State', 'Compute Board Queue'])
        self.assertIn('Backlog → Ready', result.stdout)

    def test_user_answer_uses_the_same_saved_evidence_route(self):
        outcome, events, _ = walk(disposition='user')
        self.assertEqual(outcome, 'write')
        self.assertEqual(events[-4:], ['Ensure Repository Labels', 'Save Tracker Issue',
                                      'Read Board State', 'Compute Board Queue'])

    def test_held_decision_has_no_priority_or_status_write(self):
        outcome, events, _ = walk(disposition='held')
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events, ['Compute Board Queue', 'Check Plan Change Autonomy'])

    def test_automatic_decision_without_an_answer_stays_pending(self):
        outcome, events, _ = walk(answer='unanswered')
        self.assertEqual(outcome, 'pending')
        self.assertNotIn('Save Tracker Issue', events)

    def test_failed_save_stops_before_queue_continuation(self):
        outcome, events, _ = walk(save_ok=False)
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events[-1], 'Save Tracker Issue')

    def test_unavailable_readback_stops_before_recomputation(self):
        outcome, events, _ = walk(readback=None)
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events[-1], 'Read Board State')

    def test_stale_readback_does_not_confirm_the_answer(self):
        outcome, events, _ = walk(readback=BEFORE)
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events.count('Compute Board Queue'), 1)

    def test_refreshed_queue_with_another_decision_stays_pending(self):
        snapshot = copy.deepcopy(CAPTURES[SAVED])
        another = copy.deepcopy(snapshot['items'][0])
        another['id'] = 104
        another['content'].update(number=4, id=1004, title='[I04] Other: Work', labels=[],
                                  html_url='https://github.com/o/r/issues/4',
                                  body='## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n| --- | --- | --- | --- | --- |\n')
        snapshot['items'].append(another)
        outcome, events, result = walk(readback=snapshot)
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events[-1], 'Compute Board Queue')
        self.assertIn('ask #4', result.stdout)

    def test_missing_dependency_evidence_keeps_recomputation_pending(self):
        snapshot = copy.deepcopy(CAPTURES[SAVED])
        body = snapshot['items'][0]['content']['body']
        snapshot['items'][0]['content']['body'] = body.replace('issues/2)', 'issues/99)')
        outcome, events, result = walk(readback=snapshot)
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events[-1], 'Compute Board Queue')
        self.assertIn('unresolved:', result.stdout)

    def test_none_answer_retains_confirmed_unplanned_identity(self):
        snapshot = ask_snapshot()
        outcome, events, result = walk(disposition='user', answer=None, readback=snapshot, initial=snapshot)
        self.assertEqual(outcome, 'write')
        self.assertNotIn('Save Tracker Issue', events)
        self.assertNotRegex(result.stdout, r'\b(?:order:|ask #)')

    def test_automatic_ask_answer_recomputes_from_its_saved_number(self):
        before = ask_snapshot()
        saved = copy.deepcopy(before)
        saved['items'][0]['content']['labels'] = [{'name': 'priority: 3'}]
        self.assertIn('ask #1', compute(before).stdout)
        outcome, events, result = walk(answer=3, readback=saved, initial=before)
        self.assertEqual(outcome, 'write')
        self.assertEqual(events[-2:], ['Read Board State', 'Compute Board Queue'])
        self.assertNotIn('ask #1', result.stdout)

    def test_captured_converged_snapshot_has_no_further_calls(self):
        result = compute(CAPTURES[CONVERGED])
        self.assertTrue(complete(result))
        self.assertIn('(the queue is current)', result.stdout)
        self.assertNotIn('gh api', result.stdout)

    def test_missing_source_readback_call_changes_the_observed_result(self):
        source = SOURCE.read_text().replace('- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") again.', '', 1)
        outcome, events, _ = walk(source=source)
        self.assertEqual(outcome, 'pending')
        self.assertNotIn('Read Board State', events)

    def test_missing_source_recompute_call_cannot_reuse_initial_queue(self):
        source = SOURCE.read_text()
        after = source.index('- After an answer, including an allowed automatic answer:')
        start = source.index('- Run [Compute Board Queue]', after)
        end = source.index('\n', start)
        outcome, events, _ = walk(source=source[:start] + source[end:])
        self.assertEqual(outcome, 'pending')
        self.assertEqual(events.count('Compute Board Queue'), 1)


if __name__ == '__main__':
    unittest.main()
