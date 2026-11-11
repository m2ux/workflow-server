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
HELD = re.compile(r'- A held or unanswered decision(?P<allowance> under an allowance has no user to answer it)?'
                  r'(?::| stops this step:) provide the pending queue with the \[change list\]\([^)]+\) and stop\. '
                  r'\[Write\]\(#7-write\) treats that queue as incomplete\.'
                  r'|- A held or unanswered decision leaves the queue (?P<waits>pending) until an answer is available\.')
USER = ('- A held decision put to the user continues with the user\'s answer; '
        'one the user leaves unanswered stops this step as one under an allowance does.')
REPEAT = {'- Repeat this step while a decision is pending.': 'loop',
          '- Repeat this step while an answer leaves a further decision pending.': 'pending'}


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


def settle(body, allowance, answered=True):
    """The outcome step 6's held-decision lines give a held decision, read as whole sentences:
    'stopped', 'loop' or 'pending' where a line governs it, or None where it reaches the user's
    answer. A held line names the allowance it is scoped to or governs every held decision."""
    lines = body.splitlines()
    held = [line for line in lines if line.startswith('- A held or unanswered decision')]
    if not held:
        raise AssertionError('unrecognized pending decision branch')
    for line in held:
        match = HELD.fullmatch(line)
        if not match:
            raise AssertionError(f'unrecognized held decision line {line}')
        if match['allowance'] and not allowance:
            continue
        if match['waits']:
            repeat = [REPEAT[line] for line in lines if line in REPEAT]
            if len(repeat) != 1:
                raise AssertionError('no recognized repeat line')
            return repeat[0]
        return 'stopped'
    if allowance:
        raise AssertionError('no held line governs a decision under an allowance')
    if USER not in lines:
        raise AssertionError('no route for a decision put to the user')
    return None if answered else 'stopped'


def walk(*, disposition='automatic', answer=1, save_ok=True, readback=SAVED, source=None, initial=None):
    """Observe this route's bounded call grammar with injected persistence receipts.

    disposition is 'automatic' (allowed under an allowance), 'held' (held under an allowance, with no
    user to answer it) or 'user' (held with no allowance and put to the user, who answers).

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
    if disposition == 'user':
        outcome = settle(body, allowance=False, answered=answer != 'unanswered')
        if outcome:
            return outcome, events, initial
    elif disposition == 'held' or answer == 'unanswered':
        return settle(body, allowance=True), events, initial
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
        elif line.startswith('Continue to [Write](#7-write) only when'):
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

    def test_held_decision_stops_with_the_change_list_and_no_write(self):
        outcome, events, _ = walk(disposition='held')
        self.assertEqual(outcome, 'stopped')
        self.assertEqual(events, ['Compute Board Queue', 'Check Plan Change Autonomy'])

    def test_automatic_decision_without_an_answer_stops(self):
        outcome, events, _ = walk(answer='unanswered')
        self.assertEqual(outcome, 'stopped')
        self.assertNotIn('Save Tracker Issue', events)

    def test_no_decision_repeats_the_step_without_an_answer(self):
        for disposition, answer in (('automatic', 1), ('user', 1), ('held', 1), ('automatic', 'unanswered'),
                                    ('user', 'unanswered')):
            outcome, _, _ = walk(disposition=disposition, answer=answer)
            self.assertNotEqual(outcome, 'loop', disposition)

    def test_a_held_line_governing_every_decision_stops_the_users_answer(self):
        text = SOURCE.read_text()
        line = next(line for line in text.splitlines() if line.startswith('- A held or unanswered decision'))
        unscoped = text.replace(line, line.replace(' under an allowance has no user to answer it:', ' stops this step:'), 1)
        self.assertEqual(walk(disposition='user', source=unscoped)[0], 'stopped')

    def test_a_held_line_waiting_for_an_answer_under_an_allowance_loops(self):
        text = SOURCE.read_text()
        line = next(line for line in text.splitlines() if line.startswith('- A held or unanswered decision'))
        repeat = next(line for line in text.splitlines() if line.startswith('- Repeat this step while'))
        waiting = text.replace(line, '- A held or unanswered decision leaves the queue pending until an answer is available.', 1)
        self.assertEqual(walk(disposition='held', source=waiting.replace(repeat, '- Repeat this step while a decision is pending.', 1))[0], 'loop')

    def test_a_decision_the_user_leaves_unanswered_stops(self):
        outcome, events, _ = walk(disposition='user', answer='unanswered')
        self.assertEqual(outcome, 'stopped')
        self.assertEqual(events, ['Compute Board Queue', 'Check Plan Change Autonomy'])

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
