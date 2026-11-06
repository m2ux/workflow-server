"""Hot-fix readiness routes restore and confirm draft before repair."""
import copy
import re
import sys
import unittest
from pathlib import Path

from fixtures import SCRIPTS
from test_agent_review import hotfix_pr
from test_plan_mode import section

sys.path.insert(0, str(SCRIPTS))
from agent_review import check

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'modes' / 'deliver-mode.md'
CALL = re.compile(r'(?:Apply|Run) \[([^]]+)\]\([^)]* "ƒ"\)')


class Tracker:
    """Captured tracker operations with injected write and readback outcomes."""

    def __init__(self, *, draft=True, records=True, change_head=False, invalid_after_ready=False,
                 ready_ok=True, ready_partial=False, restore_ok=True, restore_disagrees=False, restore_unreadable=False,
                 initial_unreadable=False, closed=False):
        self.pull, review = hotfix_pr()
        self.pull.update(draft=draft, state='closed' if closed else 'open')
        self.records = [review] if records else []
        self.change_head = change_head
        self.invalid_after_ready = invalid_after_ready
        self.ready_ok = ready_ok
        self.ready_partial = ready_partial
        self.restore_ok = restore_ok
        self.restore_disagrees = restore_disagrees
        self.restore_unreadable = restore_unreadable
        self.initial_unreadable = initial_unreadable
        self.events = []
        self.current = None
        self.problem = None
        self.write_failure = None
        self.restoration_selected = False
        self.restoration_failure = None

    def call(self, name):
        self.events.append(name)
        if name == 'Read Pull Request State':
            if self.initial_unreadable or (self.restoration_selected and self.restore_unreadable):
                self.current = None
            else:
                self.current = copy.deepcopy(self.pull)
        elif name == 'Validate Agent Review':
            self.problem = check(self.current, self.records)
        elif name == 'Mark Review Ready':
            self.write_failure = None if self.ready_ok else 'ready write refused'
            if self.ready_ok or self.ready_partial:
                self.pull['draft'] = False
            if self.change_head:
                self.pull['head']['sha'] = 'c' * 40
            if self.invalid_after_ready:
                self.records[-1]['findings'] = [dict(description='Open finding', severity='blocking',
                                                    disposition='open')]
        elif name == 'Mark Review Draft':
            self.restoration_selected = True
            self.restoration_failure = None if self.restore_ok else 'draft write refused'
            if self.restore_ok and not self.restore_disagrees:
                self.pull['draft'] = True
        else:
            raise AssertionError(f'unsupported captured operation {name}')


def walk(tracker, text=None):
    """Execute the installed route's calls and bounded branch clauses over captured inputs.

    The adapter recognizes this route's instruction grammar. Unknown branches fail, and
    a missing or reordered source call changes the observed events or state. The review
    check is the installed validator; fresh-context readings cover agent interpretation.
    """
    text = SOURCE.read_text() if text is None else text
    routes = {name: section(text, '##### ' + name).splitlines() for name in (
        'Verify Hot-Fix Readiness', 'Restore Hot-Fix Draft')}
    selected = 'Verify Hot-Fix Readiness'
    for _ in range(2):
        redirected = False
        for raw in routes[selected]:
            line = raw.removeprefix('- ').strip()
            if not line:
                continue
            operation = CALL.search(line)
            if operation:
                name = operation[1]
                if name == 'Mark Review Ready' and not tracker.current['draft']:
                    continue
                if name == 'Mark Review Draft' and tracker.current['draft']:
                    continue
                if line.startswith('After a selected restoration write') and not tracker.restoration_selected:
                    continue
                tracker.call(name)
                continue
            if line.startswith(('Use the pull request', 'Retain every review or readiness finding')):
                continue
            if line.startswith(('If metadata is unreadable', 'On an unreadable or closed result')):
                if tracker.current is None or tracker.current['state'] != 'open':
                    result = 'blocked-restoration' if selected == 'Restore Hot-Fix Draft' else 'blocked-current-state'
                    return result, tracker.events
                continue
            if line.startswith('On a finding, continue directly'):
                condition = bool(tracker.problem)
            elif line.startswith('On a failed ready write'):
                condition = bool(tracker.write_failure)
            elif line.startswith('On a finding or a draft readback'):
                condition = bool(tracker.problem) or tracker.current['draft']
            elif line.startswith('Only a confirmed open, ready pull request'):
                # This sentence selects the next step; the step owns the actual call.
                operations = CALL.findall(section(text, '#### 10. Merge'))
                assert 'Merge Task Pull Requests' in operations
                tracker.events.append('Merge Task Pull Requests')
                return 'merge', tracker.events
            elif line.startswith('If the restoration write failed'):
                if (tracker.restoration_failure or tracker.current is None
                        or tracker.current['state'] != 'open' or not tracker.current['draft']):
                    return 'blocked-restoration', tracker.events
                continue
            elif line.startswith('With a successful selected write and confirmed open draft'):
                tracker.events.append('Repair Hot-Fix Findings')
                return 'repair', tracker.events
            else:
                raise AssertionError(f'unsupported route clause: {line}')
            if condition:
                destination = re.search(r'continue directly to (.+?) below', line)
                assert destination, line
                selected = destination[1]
                redirected = True
                break
        if not redirected:
            raise AssertionError(f'route {selected} has no terminal result')
    raise AssertionError('route exceeds its bounded restoration continuation')


class HotFixReadiness(unittest.TestCase):
    def test_initial_invalid_ready_review_restores_and_reads_before_repair(self):
        tracker = Tracker(draft=False, records=False)
        result, events = walk(tracker)
        self.assertEqual(result, 'repair')
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review',
                                  'Read Pull Request State', 'Mark Review Draft', 'Read Pull Request State', 'Repair Hot-Fix Findings'])
        self.assertTrue(tracker.current['draft'])

    def test_initial_invalid_draft_review_confirms_without_an_extra_write(self):
        tracker = Tracker(records=False)
        result, events = walk(tracker)
        self.assertEqual(result, 'repair')
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review',
                                  'Read Pull Request State', 'Repair Hot-Fix Findings'])

    def test_changed_head_after_ready_restores_before_repair(self):
        tracker = Tracker(change_head=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'repair')
        self.assertIn('stale', tracker.problem)
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review', 'Mark Review Ready',
                                  'Read Pull Request State', 'Validate Agent Review', 'Read Pull Request State', 'Mark Review Draft',
                                  'Read Pull Request State', 'Repair Hot-Fix Findings'])

    def test_new_review_finding_after_ready_restores_before_repair(self):
        tracker = Tracker(invalid_after_ready=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'repair')
        self.assertIn('blocking', tracker.problem)
        self.assertEqual(events[-3:], ['Mark Review Draft', 'Read Pull Request State', 'Repair Hot-Fix Findings'])

    def test_failed_restoration_reads_and_stops_with_the_discrepancy(self):
        tracker = Tracker(change_head=True, restore_ok=False)
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked-restoration')
        self.assertEqual(events[-2:], ['Mark Review Draft', 'Read Pull Request State'])
        self.assertFalse(tracker.current['draft'])
        self.assertEqual(tracker.restoration_failure, 'draft write refused')

    def test_successful_write_with_ready_readback_stops(self):
        tracker = Tracker(change_head=True, restore_disagrees=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked-restoration')
        self.assertEqual(events[-2:], ['Mark Review Draft', 'Read Pull Request State'])
        self.assertFalse(tracker.current['draft'])

    def test_unreadable_restoration_readback_stops(self):
        tracker = Tracker(change_head=True, restore_unreadable=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked-restoration')
        self.assertIsNone(tracker.current)
        self.assertNotIn('Repair Hot-Fix Findings', events)
        self.assertNotIn('Merge Task Pull Requests', events)

    def test_failed_ready_write_restores_a_partial_write_before_repair(self):
        tracker = Tracker(ready_ok=False, ready_partial=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'repair')
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review', 'Mark Review Ready',
                                  'Read Pull Request State', 'Mark Review Draft', 'Read Pull Request State', 'Repair Hot-Fix Findings'])
        self.assertTrue(tracker.current['draft'])

    def test_passing_draft_reaches_merge_once_after_ready_readback(self):
        result, events = walk(Tracker())
        self.assertEqual(result, 'merge')
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review', 'Mark Review Ready',
                                  'Read Pull Request State', 'Validate Agent Review', 'Merge Task Pull Requests'])

    def test_passing_ready_reaches_merge_once_without_a_ready_write(self):
        result, events = walk(Tracker(draft=False))
        self.assertEqual(result, 'merge')
        self.assertEqual(events, ['Read Pull Request State', 'Validate Agent Review',
                                  'Read Pull Request State', 'Validate Agent Review', 'Merge Task Pull Requests'])

    def test_unreadable_or_closed_initial_state_stops_without_writes(self):
        for fixture in (dict(initial_unreadable=True), dict(closed=True)):
            with self.subTest(fixture=fixture):
                result, events = walk(Tracker(**fixture))
                self.assertEqual(result, 'blocked-current-state')
                self.assertEqual(events, ['Read Pull Request State'])

    def test_missing_restoration_call_changes_the_observed_failure_route(self):
        text = SOURCE.read_text()
        text = '\n'.join(line for line in text.splitlines() if '[Mark Review Draft]' not in line)
        result, events = walk(Tracker(change_head=True), text)
        self.assertEqual(result, 'blocked-restoration')
        self.assertNotIn('Mark Review Draft', events)
        self.assertNotIn('Repair Hot-Fix Findings', events)
