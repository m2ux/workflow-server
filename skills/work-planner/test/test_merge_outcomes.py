"""Merge instructions bind verified heads and select terminal or bounded recovery routes.

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

    def mutation(self, kind, head, actual_head=None):
        command = section(self.pull, 'Merge Pull Request' if kind == 'task' else 'Submit Epic Merge')
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
        self.events.append(('mutation', kind, captured))
        return run.returncode, json.loads(run.stdout)

    def delivery(self, outcome, *, head=HEAD, target=TARGET, default=False,
                 person_review=False, actual_head=None, readback=None):
        operation = section(self.pull, 'Merge Delivery Pull Request')
        requirements = section(operation, '1. Read Target Review Requirements')
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
        code, response = self.mutation('task', head, actual_head)
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

    def integration(self, outcomes, *, refresh_passes=True, heads=(HEAD, NEW_HEAD),
                    initial_head=HEAD):
        merge_step = section(self.epic, '3. Merge or Hand Off')
        self.events.append(('verify', initial_head))
        for attempt, outcome in enumerate(outcomes):
            head = heads[min(attempt, len(heads)-1)]
            self.events.append(('merge-operation', head))
            if outcome in ('human-handoff', 'harness-denial'):
                title = 'Human Handoff' if outcome == 'human-handoff' else 'Harness Denial'
                branch = section(merge_step, title)
                if 'return' not in branch or calls(branch):
                    raise ValueError(f'{outcome} is not terminal')
                return outcome
            if outcome == 'github-refusal':
                branch = section(merge_step, 'GitHub Refusal')
                self.events.extend(('capability', name) for name in calls(branch))
                if 'For each `github-refusal`' not in branch:
                    raise ValueError('refusal leaves readiness published')
                if attempt:
                    if 'without a further retry or merged-success readback' not in branch:
                        raise ValueError('repeated refusal has no terminal bound')
                    return outcome
                if 'before one further merge attempt' not in branch:
                    raise ValueError('retry has no bound')
                fresh = re.search(r'fresh (.*?) evidence before', branch)[1]
                for evidence in ('branch', 'criterion', 'head', 'target', 'review', 'check'):
                    if evidence not in fresh:
                        raise ValueError(f'retry lacks fresh {evidence}')
                self.events.append(('refresh', heads[1], fresh))
                if not refresh_passes:
                    if 'return that blocker without another attempt' not in branch:
                        raise ValueError('failed verification reaches retry')
                    return 'failure'
                self.events.append(('verify', heads[1]))
                continue
            if outcome == 'confirmed-merge':
                branch = section(merge_step, 'Confirmed Merge')
                if 'continue to confirm the result' not in branch:
                    raise ValueError('merge confirmation is unreachable')
                final = section(self.epic, '4. Confirm the Result')
                if not final.lstrip().startswith('- Only after `confirmed-merge`'):
                    raise ValueError('final readback lacks a success gate')
                self.events.extend(('capability', name) for name in calls(final))
                return outcome
            if 'an unclassified [Failure]' not in merge_step:
                raise ValueError('unclassified mutation result has no terminal route')
            return 'failure'
        raise ValueError('fixture ended before a terminal result')


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
        code, response = route.mutation('task', HEAD)
        self.assertEqual((code, response['merged']), (0, True))
        self.assertIn('sha=' + HEAD, route.events[0][2])
        self.assertIn('merge_method=merge', route.events[0][2])

    def test_epic_mutation_submits_verified_sha(self):
        route = Instructions()
        self.assertEqual(route.mutation('epic', HEAD)[0], 0)
        self.assertIn('sha=' + HEAD, route.events[0][2])

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

    def test_epic_human_handoff_has_no_retry_or_success_readback(self):
        route = Instructions()
        self.assertEqual(route.integration(['human-handoff']), 'human-handoff')
        self.assertEqual(route.events, [('verify', HEAD), ('merge-operation', HEAD)])

    def test_epic_harness_denial_has_no_retry_or_success_readback(self):
        route = Instructions()
        self.assertEqual(route.integration(['harness-denial']), 'harness-denial')
        self.assertEqual(route.events, [('verify', HEAD), ('merge-operation', HEAD)])

    def test_github_retry_withdraws_and_verifies_fresh_head_first(self):
        route = Instructions()
        self.assertEqual(route.integration(['github-refusal', 'confirmed-merge']), 'confirmed-merge')
        self.assertEqual([event[0] for event in route.events],
                         ['verify', 'merge-operation', 'capability', 'capability', 'refresh',
                          'verify', 'merge-operation', 'capability'])
        self.assertEqual(route.events[2:4], [('capability', 'Hold Epic Review'),
                                           ('capability', 'Record Epic Review')])
        self.assertEqual(route.events[5:7], [('verify', NEW_HEAD), ('merge-operation', NEW_HEAD)])
        self.assertEqual(route.events[-1], ('capability', 'Read Pull Request State'))

    def test_repeated_github_refusal_is_terminal_after_two_attempts(self):
        route = Instructions()
        self.assertEqual(route.integration(['github-refusal'] * 3), 'github-refusal')
        self.assertEqual(sum(e[0] == 'merge-operation' for e in route.events), 2)
        self.assertNotIn(('capability', 'Read Pull Request State'), route.events)
        self.assertEqual(route.events[-2:], [('capability', 'Hold Epic Review'),
                                            ('capability', 'Record Epic Review')])

    def test_failed_refresh_stops_before_second_merge(self):
        route = Instructions()
        self.assertEqual(route.integration(['github-refusal', 'confirmed-merge'], refresh_passes=False), 'failure')
        self.assertEqual(sum(e[0] == 'merge-operation' for e in route.events), 1)
        self.assertNotIn(('capability', 'Read Pull Request State'), route.events)

    def test_retry_terminal_outcomes_do_not_reach_success(self):
        for terminal in ('human-handoff', 'harness-denial', 'failure'):
            with self.subTest(outcome=terminal):
                route = Instructions()
                self.assertEqual(route.integration(['github-refusal', terminal]), terminal)
                self.assertNotIn(('capability', 'Read Pull Request State'), route.events)

    def test_confirmed_epic_merge_is_only_success_readback_route(self):
        route = Instructions()
        self.assertEqual(route.integration(['confirmed-merge']), 'confirmed-merge')
        self.assertEqual(route.events[-1], ('capability', 'Read Pull Request State'))

    def test_removed_sha_binding_is_observed_by_moving_head_fixture(self):
        source = re.sub(r'  -f sha=\[\*\*&lt;head-sha&gt;\*\*\]\(#verified-head "○"\) &#92;\n', '', PULL.read_text(), count=1)
        route = Instructions(pull=source)
        code, _ = route.mutation('task', HEAD)
        self.assertNotEqual(code, 0)
        self.assertNotIn('sha=' + HEAD, route.events[0][2])

    def test_removed_terminal_guard_is_rejected_by_route_fixture(self):
        source = EPIC.read_text().replace('provide the result to the reviewer and return.', 'provide the result to the reviewer.')
        with self.assertRaisesRegex(ValueError, 'not terminal'):
            Instructions(epic=source).integration(['human-handoff'])

    def test_removed_success_gate_is_rejected_by_route_fixture(self):
        source = EPIC.read_text().replace('- Only after `confirmed-merge`, Apply', '- Apply')
        with self.assertRaisesRegex(ValueError, 'lacks a success gate'):
            Instructions(epic=source).integration(['confirmed-merge'])


if __name__ == '__main__':
    unittest.main()
