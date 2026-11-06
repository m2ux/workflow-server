"""Plan publication validates confirmed saved epic and parent identities."""
import copy
import re
import unittest
from graphlib import TopologicalSorter
from pathlib import Path

from fixtures import epic_body, initiative_body, issue
from test_deps import run as check_graph
from test_format import Review
from test_plan_mode import section

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'modes' / 'plan-mode.md'
CALL = re.compile(r'Apply \[([^]]+)\]\([^)]* "ƒ"\)')
PLACEHOLDER = 'https://example.test/pending/'


def body(table):
    return ('## Overview\n\nRecords verified work.\n\n## Problem\n\nEvidence is absent.\n\n'
            '## Proposal\n\nRecord evidence.\n\n' + table + '\n## References\n\n- **R1.** [Source](https://example.test/source) — requirement evidence.\n')


class Tracker:
    """Captured saves and readbacks with concrete issue identities and injected faults."""

    def __init__(self, *, new_parent=False, dependent=False, existing_epic=False,
                 fail=None, mismatch=None, unreadable=False, sibling=False, invalid_graph=False):
        self.parent = issue(100, '[I01] Evidence Plan: Record Work', body='', labels=('type:initiative', 'theme:mechanical'))
        self.new_parent = new_parent
        self.epics = [issue(201 if existing_epic else 0, '[I01:E00] Producer Evidence: Record Result',
                            body=body(epic_body(('W01', 'Record result', ''))), labels=('type:epic', 'theme:mechanical'))]
        if dependent:
            self.epics.insert(0, issue(0, '[I01:E01] Consumer Evidence: Read Result', body=body(epic_body(
                ('W01', 'Read result', f'[E00:W01]({PLACEHOLDER}E00)'))), labels=('type:epic', 'theme:mechanical')))
        self.related = [issue(202, '[I01:E02] Sibling Evidence: Retain Result',
                              body=body(epic_body(('W01', 'Retain result', ''))),
                              labels=('type:epic', 'theme:mechanical'))] if sibling else []
        self.drafts = {self.tag(epic): epic for epic in self.epics + self.related}
        self.identities = {tag: epic['number'] for tag, epic in self.drafts.items() if epic['number']}
        self.invalid_graph = invalid_graph
        self.parent['body'] = self.parent_body()
        self.saved = {} if new_parent else {100: copy.deepcopy(self.parent)}
        self.saved.update({epic['number']: copy.deepcopy(epic) for epic in self.related})
        self.readbacks = {}
        self.events = []
        self.fail, self.mismatch, self.unreadable = fail, mismatch, unreadable
        self.failure = None
        self.last = None
        self.current = None
        self.next_id = 300
        self.checked = []
        self.findings = []

    @staticmethod
    def tag(epic):
        return re.search(r':(E\d+)\]', epic['title'])[1]

    def reference(self, tag):
        target = (f'https://github.com/o/r/issues/{self.identities[tag]}'
                  if tag in self.identities else PLACEHOLDER + tag)
        return f'[{tag}]({target})'

    def parent_body(self):
        rows = [(self.reference(tag), ', '.join(self.reference(dep) for dep in sorted(set(
            re.findall(r'\[(E\d+):W\d+\]', self.drafts[tag]['body'])))))
                for tag in sorted(self.drafts)]
        text = initiative_body(*[(tag, '' if self.invalid_graph else deps) for tag, deps in rows])
        for tag, epic in self.drafts.items():
            title = epic['title'].split('] ', 1)[1].split(': ', 1)[0]
            text = re.sub(r'(\| \[' + tag + r'\]\([^)]*\) \| )Work', r'\g<1>' + title, text)
        return body(text).replace("## References", "## Non-Goals\n\n- It changes no delivery policy.\n\n## References")

    def ordered_epics(self):
        graph = {tag: set(re.findall(r'\[(E\d+):W\d+\]', epic['body']))
                 for epic in self.epics for tag in [self.tag(epic)]}
        return [self.drafts[tag] for tag in TopologicalSorter(graph).static_order()]

    def replace_prerequisites(self):
        for tag, number in self.identities.items():
            self.current['body'] = self.current['body'].replace(
                PLACEHOLDER + tag, f'https://github.com/o/r/issues/{number}')

    def save(self, record, label):
        self.events.append(('Save Tracker Issue', label, record['number']))
        if self.fail == label:
            self.failure = f'{label} save refused'
            return
        if not record['number']:
            record['number'] = self.next_id
            record['html_url'] = f'https://github.com/o/r/issues/{self.next_id}'
            self.next_id += 1
        saved = copy.deepcopy(record)
        self.saved[saved['number']] = saved
        if self.mismatch == label:
            saved = dict(saved, body='disagreeing saved body')
        self.last = saved
        if saved['body'] != record['body']:
            self.failure = f'{label} saved fields disagree'

    def read(self, record):
        self.events.append(('Read Tracker Issue', record['number']))
        if self.unreadable:
            self.failure = 'saved context unreadable'
            return
        saved = copy.deepcopy(self.saved.get(record['number']))
        if saved is None or saved['body'] != record['body']:
            self.failure = 'saved context disagrees'
            return
        self.readbacks[record['number']] = saved

    def validate(self, operation):
        self.events.append((operation,))
        parent = self.readbacks[self.parent['number']]
        epics = [self.readbacks[epic['number']] for epic in self.epics + self.related]
        assert PLACEHOLDER not in parent['body']
        for epic in epics:
            assert epic['html_url'] in parent['body']
            assert PLACEHOLDER not in epic['body']
        if operation == 'Validate Epic Body':
            for epic in epics:
                review = Review(epic, initiative=parent)
                review.run()
                self.findings.extend(review.apply + review.decide)
        elif operation == 'Validate Initiative Body':
            review = Review(parent, epics=epics)
            review.run()
            self.findings.extend(review.apply + review.decide)
        elif operation == 'Check Dependencies and Numbering':
            code, output = check_graph([('I', parent['body'])] + [
                (self.tag(epic), epic['body']) for epic in epics])
            if code:
                self.findings.append(output)
        self.checked.append((operation, parent['number'], tuple(epic['number'] for epic in epics)))


def walk(tracker, text=None):
    """Execute this source route's selected calls over captured issue operations.

    The bounded adapter recognizes the publication clauses it executes. It uses
    the existing formatter and dependency test helpers for saved-body validation;
    a removed call or guard changes the observations or rejects the fixture.
    """
    text = SOURCE.read_text() if text is None else text
    parent = section(text, '#### Parent Identity')
    for raw in parent.splitlines():
        line = raw.removeprefix('- ').strip()
        if not line:
            continue
        if line.startswith('For a new initiative,'):
            if tracker.new_parent:
                for operation in CALL.findall(line):
                    if operation == 'Select Tracker Number':
                        tracker.events.append((operation,))
                        tracker.parent['number'] = 0
                    else:
                        assert operation == 'Save Tracker Issue'
                        tracker.save(tracker.parent, 'parent-create')
        elif line.startswith('For an existing initiative,'):
            assert tracker.new_parent or tracker.parent['number'] == 100
        elif line.startswith('On a failed save'):
            if tracker.failure:
                return 'blocked', tracker.events
        else:
            raise AssertionError(f'unsupported parent clause: {line}')

    publication = section(text, '#### Epic Publication').splitlines()
    boundary = next(i for i, line in enumerate(publication) if line.startswith('- After every epic'))
    loop = publication[:boundary]
    assert any('For each new or revised epic in dependency order:' in line for line in loop)
    for epic in tracker.ordered_epics():
        tracker.current = epic
        tag = tracker.tag(epic)
        for raw in loop:
            line = raw.removeprefix('- ').strip()
            if not line or line.startswith('For each new or revised epic'):
                continue
            if line.startswith('Replace its temporary prerequisite links'):
                tracker.replace_prerequisites()
            elif CALL.findall(line):
                assert CALL.findall(line) == ['Save Tracker Issue']
                tracker.save(epic, tag)
            elif line.startswith('On a failed save'):
                if tracker.failure:
                    return 'blocked', tracker.events
            elif line.startswith('Use the provided saved identity'):
                assert tracker.last['number'] == epic['number']
                tracker.identities[tag] = tracker.last['number']
                tracker.parent['body'] = tracker.parent_body()
            else:
                raise AssertionError(f'unsupported epic clause: {line}')
    for raw in publication[boundary:]:
        line = raw.removeprefix('- ').strip()
        if not line:
            continue
        if line.startswith('After every epic is saved'):
            assert PLACEHOLDER not in tracker.parent['body']
            assert all(PLACEHOLDER not in epic['body'] for epic in tracker.epics)
        elif CALL.findall(line):
            assert CALL.findall(line) == ['Save Tracker Issue']
            tracker.save(tracker.parent, 'parent-rows')
        elif line.startswith('On a failed parent save'):
            if tracker.failure:
                return 'blocked', tracker.events
        else:
            raise AssertionError(f'unsupported parent publication clause: {line}')

    for raw in section(text, '#### Saved Validation').splitlines():
        line = raw.removeprefix('- ').strip()
        if not line:
            continue
        operations = CALL.findall(line)
        if operations:
            operation, = operations
            if operation == 'Read Tracker Issue':
                for record in [tracker.parent] + tracker.epics + tracker.related:
                    tracker.read(record)
            elif operation == 'Publish Planning Record':
                tracker.events.append((operation,))
            else:
                tracker.validate(operation)
        elif line.startswith('On unreadable or disagreeing saved context'):
            if tracker.failure:
                return 'blocked', tracker.events
        elif line.startswith('Resolve findings in the drafts'):
            if tracker.findings:
                tracker.events.append(('Resolve Findings',))
                return 'needs-correction', tracker.events
        elif line.startswith(('Continue only when', 'Update the planning record')):
            continue
        else:
            raise AssertionError(f'unsupported validation clause: {line}')
    tracker.events.append(('Prepare Epic Delivery',))
    return 'prepared', tracker.events


class SavedPlanPublication(unittest.TestCase):
    def test_existing_parent_saves_epic_then_parent_then_reads_before_validation(self):
        tracker = Tracker()
        result, events = walk(tracker)
        self.assertEqual(result, 'prepared')
        self.assertEqual(events[:4], [('Save Tracker Issue', 'E00', 0),
                                    ('Save Tracker Issue', 'parent-rows', 100),
                                    ('Read Tracker Issue', 100), ('Read Tracker Issue', 300)])
        self.assertNotIn(('Select Tracker Number',), events)
        self.assertIn('/issues/300', tracker.saved[100]['body'])
        self.assertEqual([entry[0] for entry in tracker.checked], [
            'Validate Epic Body', 'Validate Initiative Body', 'Review Initiative Goal',
            'Check Dependencies and Numbering'])

    def test_two_new_epics_resolve_dependency_identities_in_dependency_order(self):
        tracker = Tracker(dependent=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'prepared')
        self.assertEqual(events[:3], [('Save Tracker Issue', 'E00', 0),
                                    ('Save Tracker Issue', 'E01', 0),
                                    ('Save Tracker Issue', 'parent-rows', 100)])
        self.assertIn('[E00:W01](https://github.com/o/r/issues/300)', tracker.saved[301]['body'])
        self.assertTrue(all(parent == 100 and set(epics) == {300, 301}
                            for _, parent, epics in tracker.checked))

    def test_new_parent_is_created_once_and_then_receives_confirmed_epic_rows(self):
        tracker = Tracker(new_parent=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'prepared')
        self.assertEqual(events[:4], [('Select Tracker Number',),
                                    ('Save Tracker Issue', 'parent-create', 0),
                                    ('Save Tracker Issue', 'E00', 0),
                                    ('Save Tracker Issue', 'parent-rows', 300)])
        self.assertIn('/issues/301', tracker.saved[300]['body'])

    def test_existing_epic_identity_is_retained(self):
        tracker = Tracker(existing_epic=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'prepared')
        self.assertEqual(events[0], ('Save Tracker Issue', 'E00', 201))
        self.assertEqual(tracker.epics[0]['number'], 201)
        self.assertIn('/issues/201', tracker.saved[100]['body'])

    def test_existing_sibling_is_retained_and_read_without_an_extra_save(self):
        tracker = Tracker(sibling=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'prepared')
        self.assertIn('/issues/202', tracker.saved[100]['body'])
        self.assertIn(('Read Tracker Issue', 202), events)
        self.assertFalse(any(event[:2] == ('Save Tracker Issue', 'E02') for event in events))
        self.assertTrue(all(set(epics) == {300, 202} for _, _, epics in tracker.checked))

    def test_failed_epic_save_stops_before_parent_save_reads_checks_or_preparation(self):
        tracker = Tracker(fail='E00', dependent=True)
        result, events = walk(tracker)
        self.assertEqual((result, events), ('blocked', [('Save Tracker Issue', 'E00', 0)]))
        self.assertEqual(tracker.failure, 'E00 save refused')

    def test_failed_parent_save_preserves_epic_identity_without_validation(self):
        tracker = Tracker(fail='parent-rows')
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked')
        self.assertEqual(events[-1], ('Save Tracker Issue', 'parent-rows', 100))
        self.assertEqual(tracker.identities, {'E00': 300})
        self.assertFalse(tracker.checked)

    def test_new_parent_save_failure_stops_before_epic_creation(self):
        tracker = Tracker(new_parent=True, fail='parent-create')
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked')
        self.assertEqual(len(events), 2)

    def test_disagreeing_epic_or_parent_save_stops_with_exact_evidence(self):
        for label in ('E00', 'parent-rows'):
            with self.subTest(label=label):
                tracker = Tracker(mismatch=label)
                result, events = walk(tracker)
                self.assertEqual(result, 'blocked')
                self.assertEqual(tracker.failure, f'{label} saved fields disagree')
                self.assertEqual(events[-1][0], 'Save Tracker Issue')
                self.assertFalse(tracker.checked)

    def test_unreadable_saved_context_blocks_validation_and_preparation(self):
        tracker = Tracker(unreadable=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'blocked')
        self.assertEqual(events[-1][0], 'Read Tracker Issue')
        self.assertFalse(tracker.checked)

    def test_saved_dependency_finding_returns_to_correction_before_preparation(self):
        tracker = Tracker(dependent=True, invalid_graph=True)
        result, events = walk(tracker)
        self.assertEqual(result, 'needs-correction')
        self.assertIn('initiative E01: Depends on should be E00', '\n'.join(tracker.findings))
        self.assertEqual(events[-1], ('Resolve Findings',))
        self.assertNotIn(('Prepare Epic Delivery',), events)

    def test_removing_saved_parent_publication_rejects_the_stale_parent_fixture(self):
        text = '\n'.join(line for line in SOURCE.read_text().splitlines()
                         if not line.startswith('- Apply [Save Tracker Issue]')
                         or "for the initiative with its complete intended rows" not in line)
        tracker = Tracker()
        result, events = walk(tracker, text)
        self.assertEqual(result, 'blocked')
        self.assertEqual(tracker.failure, 'saved context disagrees')
        self.assertNotIn(('Prepare Epic Delivery',), events)

    def test_removing_epic_save_cannot_supply_a_confirmed_identity(self):
        text = '\n'.join(line for line in SOURCE.read_text().splitlines()
                         if 'with its intended body and confirmed priority label' not in line)
        with self.assertRaises((AssertionError, TypeError)):
            walk(Tracker(), text)

    def test_removing_fresh_read_cannot_supply_validation_context(self):
        text = '\n'.join(line for line in SOURCE.read_text().splitlines()
                         if 'for the initiative and every epic its saved Work Breakdown names' not in line)
        with self.assertRaises(KeyError):
            walk(Tracker(), text)


if __name__ == '__main__':
    unittest.main()
