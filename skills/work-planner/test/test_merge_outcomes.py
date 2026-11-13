"""Merge instructions bind verified heads and select terminal or bounded recovery routes, and no route
merges an epic review pull request.

The fixture executor supports the changed instruction forms, records selected
capabilities and runs each documented mutation against a local gh double. It
does not claim to execute unrestricted prose or establish live agent behavior.
"""
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PULL = ROOT / 'artifacts' / 'pull-request.md'
EPIC = ROOT / 'protocols' / 'epic-integration.md'
HEAD = '1' * 40
NEW_HEAD = '2' * 40
MERGE = '3' * 40
TARGET = 'workspace'


def section(source, title):
    match = re.search(r'^(#{1,6}) ' + re.escape(title) + r'\n', source, re.M)
    if not match:
        raise ValueError(f'missing section: {title}')
    rest = source[match.end():]
    end = re.search(r'^#{1,' + str(len(match[1])) + r'} ', rest, re.M)
    return rest[:end.start()] if end else rest


def calls(source):
    return re.findall(r'(?:Apply|Run) \[([^]]+)\]\([^)]+ "ƒ"\)', source)


class Instructions:
    """Bounded interpreter for the documented outcome/continuation clauses."""

    def __init__(self, pull=None, epic=None):
        self.pull = PULL.read_text() if pull is None else pull
        self.epic = EPIC.read_text() if epic is None else epic
        self.events = []

    def mutation(self, head, actual_head=None):
        command = section(self.pull, 'Merge Pull Request')
        raw = re.search(r'<big><pre>\n(.*?)\n</pre></big>', command, re.S)[1]
        rendered = re.sub(r'\[\*\*(.*?)\*\*\]\([^)]*\)', r'\1', raw)
        rendered = html.unescape(rendered)
        values = {'owner': 'fixture', 'repo': 'repo', 'pull-request-number': '9', 'head-sha': head}
        rendered = re.sub(r'<([^>]+)>', lambda m: values[m[1]], rendered)
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            gh = root / 'gh'
            gh.write_text(f'#!{sys.executable}\n' + '''import json, os, sys
from pathlib import Path
args = sys.argv[1:]
Path(os.environ['CAPTURE']).write_text(json.dumps(args))
head = next((a[4:] for a in args if a.startswith('sha=')), None)
if head != os.environ['ACTUAL_HEAD']:
    print(json.dumps({'merged': False, 'message': 'Head branch was modified', 'sha': None}))
    sys.exit(1)
print(json.dumps({'merged': True, 'message': 'merged', 'sha': os.environ['MERGE_SHA']}))
''')
            gh.chmod(0o700)
            env = dict(os.environ, PATH=folder + os.pathsep + os.environ['PATH'],
                       CAPTURE=str(root/'capture.json'), ACTUAL_HEAD=actual_head or head,
                       MERGE_SHA=MERGE)
            run = subprocess.run(rendered, shell=True, env=env, capture_output=True, text=True)
            captured = json.loads((root/'capture.json').read_text())
        self.events.append(('mutation', captured))
        return run.returncode, json.loads(run.stdout)

    def delivery(self, outcome, *, head=HEAD, target=TARGET, default=False,
                 person_review=False, epic_review=False, actual_head=None, readback=None):
        operation = section(self.pull, 'Merge Delivery Pull Request')
        requirements = section(operation, '1. Read Target Review Requirements')
        if epic_review:
            clause = next((line for line in requirements.splitlines()
                           if 'epic review' in line and '`human-handoff`' in line), None)
            if not clause or 'return without a merge attempt' not in clause:
                raise ValueError('an epic review reaches a merge attempt')
            return 'human-handoff'
        if default or person_review:
            clause = next(line for line in requirements.splitlines()
                          if 'When the target' in line and '`human-handoff`' in line)
            if default and 'default branch' not in clause:
                raise ValueError('default branch has no human handoff')
            if 'return without a merge attempt' not in clause:
                raise ValueError('human handoff is not terminal')
            return 'human-handoff'
        branches = section(operation, 'Mutation Outcome')
        if outcome == 'harness-denial':
            self.events.append(('harness-denial', head, target))
            clause = next(line for line in branches.splitlines() if '`harness-denial`' in line)
            if 'GitHub supplies no response' not in clause or 'and return' not in clause:
                raise ValueError('harness denial lacks a terminal no-response clause')
            return outcome
        code, response = self.mutation(head, actual_head)
        if code or not response['merged']:
            clause = next(line for line in branches.splitlines() if '`github-refusal`' in line)
            if 'and return' not in clause:
                raise ValueError('GitHub refusal reaches confirmation')
            return 'github-refusal'
        confirmation = section(operation, '3. Confirm Delivery Merge')
        self.events.extend(('capability', name) for name in calls(confirmation))
        current = readback or dict(merged=True, head=head, base=target, merge_commit_sha=MERGE)
        if current != dict(merged=True, head=head, base=target, merge_commit_sha=MERGE):
            if 'provide [Failure]' not in confirmation or 'and return' not in confirmation:
                raise ValueError('readback discrepancy has no terminal failure')
            return 'failure'
        return 'confirmed-merge'

    def integration(self):
        merging = [name for name in calls(self.epic)
                   if 'Merge' in name and name != 'Fetch Merge Readiness']
        if merging:
            raise ValueError(f'epic integration merges: {merging}')
        hand_off = section(self.epic, '3. Hand Off')
        if 'to the user' not in hand_off or 'and return' not in hand_off:
            raise ValueError('the handoff is not terminal')
        self.events.extend(('capability', name) for name in calls(hand_off))
        return 'human-handoff'


class MergeOutcomes(unittest.TestCase):
    def test_task_caller_verifies_before_its_first_mutation(self):
        operation = section(PULL.read_text(), 'Merge Task Pull Requests')
        first_attempt = section(operation, '2. Merge Verified Task Pull').split('- Stop on', 1)[0]
        selected = []
        for line in first_attempt.splitlines():
            if line.startswith('- Merge '):
                selected.append('unverified mutation')
            selected.extend(calls(line))
        self.assertEqual(selected, ['Update Epic Base', 'Fetch Merge Readiness',
                                    'Merge Delivery Pull Request'])

    def test_task_mutation_submits_verified_sha(self):
        route = Instructions()
        code, response = route.mutation(HEAD)
        self.assertEqual((code, response['merged']), (0, True))
        self.assertIn('sha=' + HEAD, route.events[0][1])
        self.assertIn('merge_method=merge', route.events[0][1])

    def test_no_command_merges_an_epic_review(self):
        source = PULL.read_text()
        self.assertNotIn('Submit Epic Merge', source)
        merges = re.findall(r'^### (.*)\n\n(.*)', section(source, 'Commands'), re.M)
        self.assertEqual([title for title, opening in merges if opening.startswith('Merge ')],
                         ['Merge Pull Request'])

    def test_moving_head_refuses_exact_documented_mutation(self):
        route = Instructions()
        self.assertEqual(route.delivery('attempt', actual_head=NEW_HEAD), 'github-refusal')
        self.assertEqual([event[0] for event in route.events], ['mutation'])

    def test_person_review_hands_off_without_mutation(self):
        route = Instructions()
        self.assertEqual(route.delivery('attempt', person_review=True), 'human-handoff')
        self.assertEqual(route.events, [])

    def test_default_branch_keeps_human_merge_boundary(self):
        route = Instructions()
        self.assertEqual(route.delivery('attempt', default=True), 'human-handoff')
        self.assertEqual(route.events, [])

    def test_harness_denial_has_no_github_response(self):
        route = Instructions()
        self.assertEqual(route.delivery('harness-denial'), 'harness-denial')
        self.assertEqual(route.events, [('harness-denial', HEAD, TARGET)])

    def test_confirmed_merge_reads_state_after_mutation(self):
        route = Instructions()
        self.assertEqual(route.delivery('attempt'), 'confirmed-merge')
        self.assertEqual([event[0] for event in route.events], ['mutation', 'capability'])
        self.assertEqual(route.events[1], ('capability', 'Read Merge Result'))

    def test_readback_disagreements_cannot_confirm_merge(self):
        for update in (dict(merged=False), dict(head=NEW_HEAD), dict(base='main'),
                       dict(merge_commit_sha=None), dict(merge_commit_sha=NEW_HEAD)):
            with self.subTest(update=update):
                state = dict(merged=True, head=HEAD, base=TARGET, merge_commit_sha=MERGE)
                state.update(update)
                self.assertEqual(Instructions().delivery('attempt', readback=state), 'failure')

    def test_removed_sha_binding_is_observed_by_moving_head_fixture(self):
        source = re.sub(r'  -f sha=\[\*\*&lt;head-sha&gt;\*\*\]\(#verified-head "○"\) &#92;\n', '', PULL.read_text(), count=1)
        route = Instructions(pull=source)
        code, _ = route.mutation(HEAD)
        self.assertNotEqual(code, 0)
        self.assertNotIn('sha=' + HEAD, route.events[0][1])

    def test_an_epic_review_hands_off_before_any_mutation(self):
        route = Instructions()
        self.assertEqual(route.delivery('attempt', epic_review=True), 'human-handoff')
        self.assertEqual(route.events, [])

    def test_epic_integration_hands_off_without_a_merge(self):
        route = Instructions()
        self.assertEqual(route.integration(), 'human-handoff')
        self.assertEqual(route.events, [('capability', 'Validate Agent Review')])

    def test_a_current_handed_off_review_returns_before_any_hold(self):
        prepare = section(EPIC.read_text(), '1. Prepare the Evidence')
        order = calls(prepare)
        self.assertLess(order.index('Validate Agent Review'), order.index('Hold Epic Review'))
        handed = next(line for line in prepare.splitlines() if 'already handed off' in line)
        self.assertNotIn('Hold Epic Review', handed)
        self.assertIn('return without holding it', handed)

    def test_removed_epic_guard_is_rejected_by_route_fixture(self):
        source = '\n'.join(line for line in PULL.read_text().splitlines()
                           if not line.startswith('- When the pull request is an epic review'))
        with self.assertRaisesRegex(ValueError, 'epic review reaches a merge'):
            Instructions(pull=source).delivery('attempt', epic_review=True)

    def test_a_merge_call_in_epic_integration_is_rejected_by_route_fixture(self):
        call = '- Apply [Merge Delivery Pull Request](../artifacts/pull-request.md#merge-delivery-pull-request "ƒ").\n'
        source = EPIC.read_text().replace('### 3. Hand Off\n\n', '### 3. Hand Off\n\n' + call)
        with self.assertRaisesRegex(ValueError, 'epic integration merges'):
            Instructions(epic=source).integration()

    def test_removed_handoff_return_is_rejected_by_route_fixture(self):
        source = EPIC.read_text().replace('published agent review records, and return.', 'published agent review records.')
        with self.assertRaisesRegex(ValueError, 'not terminal'):
            Instructions(epic=source).integration()


if __name__ == '__main__':
    unittest.main()
