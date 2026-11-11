"""Standup, Revise and Understand routes supply their per-entry context contracts on captured inputs, and a reading trace conforms when it retrieves that context before use"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

CAPTURES = json.loads(Path(__file__).with_name('reading-captures.json').read_text())
COMMON = ('SKILL.md', 'rules.md', 'conventions.md')

# Each route's per-entry context contract. A selection is (step, section, condition): the
# step whose span links the section at its point of use, and the captured input under which
# the step selects it. A condition names a boolean input; a leading '!' negates it.
CONTRACTS = {
    'standup': {
        'entry': 'modes/standup-mode.md',
        'whole': COMMON + ('modes/standup-mode.md',),
        'selections': [
            ('modes/standup-mode.md#1-select-the-scope', 'artifacts/board.md#select-project-board', None),
            ('modes/standup-mode.md#missing-checkpoint', 'artifacts/board.md#read-board-state', '!checkpoint'),
            ('modes/standup-mode.md#refresh-selected-initiatives', 'modes/sync-mode.md', '!checkpoint'),
            ('modes/standup-mode.md#3-fetch', 'artifacts/board.md#read-board-state', None),
            ('modes/standup-mode.md#3-fetch', 'artifacts/pull-request.md#fetch-all-delivery-pull-requests', None),
            ('modes/standup-mode.md#3-fetch', 'artifacts/pull-request.md#fetch-pull-request-issue-links', None),
            ('modes/standup-mode.md#4-compose', 'artifacts/standup-report.md#compose-standup-report', None),
            ('artifacts/standup-report.md#2-render-window-progress', 'artifacts/standup-report.md#summarise-progress', None),
            ('modes/standup-mode.md#5-resolve-evidence', 'artifacts/issue.md#find-initiative-issue', 'unresolved'),
            ('modes/standup-mode.md#5-resolve-evidence', 'artifacts/issue.md#read-tracker-issue', 'unresolved'),
            ('modes/standup-mode.md#6-report', 'artifacts/issue-body.md#repair-issue-format', 'unreadable'),
        ],
        'excluded': ('modes/hoist-mode.md', 'modes/deliver-mode.md', 'modes/plan-mode.md',
                     'protocols/epic-integration.md', 'artifacts/proposals-board.md#create-proposals-board',
                     'artifacts/pull-request.md#merge-delivery-pull-request'),
    },
    'revise': {
        'entry': 'modes/revise-mode.md',
        'whole': COMMON + ('modes/revise-mode.md', '../guidelines.md', 'guidelines.md'),
        'before_edit': ('../guidelines.md', 'guidelines.md'),
        'selections': [
            ('modes/revise-mode.md#6-verify', 'modes/revise-mode.md#check-skill-files', None),
            ('modes/revise-mode.md#6-verify', 'modes/revise-mode.md#run-tests', 'script_changed'),
            ('modes/revise-mode.md#6-verify', 'modes/revise-mode.md#compare-section-bodies', 'section_moved'),
        ],
        'edited': True,
        'excluded': ('modes/hoist-mode.md', 'modes/deliver-mode.md', 'modes/standup-mode.md',
                     'protocols/epic-integration.md', 'protocols/unit-dispatch.md'),
    },
    'understand': {
        'entry': 'modes/understand-mode.md',
        'whole': COMMON + ('modes/understand-mode.md',),
        'selections': [
            ('modes/understand-mode.md#2-explain-each-change', 'protocols/change-overview.md', 'pull_request'),
            ('protocols/change-overview.md#1-prepare-the-evidence', 'artifacts/pull-request.md#read-pull-request-state', 'pull_request'),
            ('protocols/change-overview.md#1-prepare-the-evidence', 'artifacts/delivery-branches.md#create-pull-request-worktree', 'pull_request'),
            ('protocols/change-overview.md#matching-head', 'artifacts/repository-graph.md#measure-repository-change', 'pull_request'),
            ('artifacts/repository-graph.md#1-read-index-status', 'artifacts/repository-graph.md#index-status', 'pull_request'),
            ('artifacts/repository-graph.md#2-refresh-absent-or-stale-index', 'artifacts/repository-graph.md#index-repository', 'stale_index'),
            ('artifacts/repository-graph.md#3-measure-change-surface', 'artifacts/repository-graph.md#change-surface', 'pull_request'),
            ('artifacts/repository-graph.md#4-measure-changed-symbols', 'artifacts/repository-graph.md#symbol-context', 'pull_request'),
            ('protocols/change-overview.md#2-write-the-overview', 'artifacts/architecture-overview.md#diagrams', 'pull_request'),
            ('protocols/change-overview.md#2-write-the-overview', 'artifacts/architecture-overview.md#template', 'pull_request'),
            ('protocols/change-overview.md#2-write-the-overview', 'artifacts/architecture-overview.md#code-references', 'pull_request'),
            ('protocols/change-overview.md#2-write-the-overview', 'artifacts/planning-record.md#populate-planning-record', 'pull_request'),
            ('protocols/change-overview.md#4-publish-and-link', 'artifacts/planning-record.md#publish-planning-record', 'publish'),
            ('protocols/change-overview.md#4-publish-and-link', 'artifacts/pull-request.md#publish-pull-request', 'publish'),
        ],
        'excluded': ('modes/hoist-mode.md', 'modes/deliver-mode.md', 'modes/standup-mode.md',
                     'protocols/epic-integration.md', 'artifacts/pull-request.md#merge-delivery-pull-request',
                     'artifacts/delivery-branches.md#prepare-delivery-bases'),
    },
}


def node(reference):
    """A contract reference as a before-use graph node: the resolved file and its anchor."""
    name, _, anchor = reference.partition('#')
    return (ROOT / name).resolve(), anchor


def section_lines(reference):
    """The line indexes a reference names: a whole file, or one heading and its subsections."""
    path, anchor = node(reference)
    lines, _, headings = checker.scan(path)
    if not anchor:
        return lines, range(len(lines))
    for start, level, title in headings:
        if checker.anchor_of(title) == anchor:
            return lines, range(start, checker.heading_end(headings, start, level, len(lines)))
    return lines, range(0)


def holds(condition, inputs):
    if condition is None:
        return True
    value = bool(inputs.get(condition.lstrip('!')))
    return not value if condition.startswith('!') else value


def selected(route, inputs):
    """The sections a route selects for its captured inputs, in procedure order."""
    contract = CONTRACTS[route]
    found = []
    for _, target, condition in contract['selections']:
        if holds(condition, inputs) and target not in found:
            found.append(target)
    return found


def required(route, inputs):
    """The whole files the entry requires, then each selected section."""
    contract = CONTRACTS[route]
    if not inputs.get('entered', True):
        return list(contract['whole'])
    return list(contract['whole']) + selected(route, inputs)


def covered(reference, text):
    """Whether retrieved text holds every nonblank line of the referenced section."""
    lines, span = section_lines(reference)
    wanted = [lines[index].strip() for index in span if lines[index].strip()]
    return bool(wanted) and all(line in text for line in wanted)


def conformance(route, inputs, trace):
    """The findings a reading trace raises against its route's contract. A trace is the ordered
    tool results of one run, each {'text': returned content, 'use': whether the call acted on
    the task rather than reading, 'edit': whether it edited a skill file}. Required context is
    retrieved when its every line has been returned, which a truncated result recovered by a
    later read satisfies. Common context precedes the first use, Revise's guidelines precede
    its first edit, and an excluded section retrieved whole is unrelated content."""
    contract = CONTRACTS[route]
    seen, first = '', {}
    references = required(route, inputs) + list(contract['excluded'])
    first_use = first_edit = None
    for index, call in enumerate(trace):
        seen += '\n' + call['text']
        for reference in references:
            if reference not in first and covered(reference, seen):
                first[reference] = index
        if (call.get('use') or call.get('edit')) and first_use is None:
            first_use = index
        if call.get('edit') and first_edit is None:
            first_edit = index
    findings = []
    for reference in required(route, inputs):
        if reference not in first:
            findings.append(('missing', reference))
    for reference in COMMON:
        if reference in first and first_use is not None and first[reference] > first_use:
            findings.append(('late', reference))
    for reference in contract.get('before_edit', ()):
        if reference in first and first_edit is not None and first[reference] > first_edit:
            findings.append(('late', reference))
    if contract.get('edited') and first_edit is None:
        findings.append(('missing', 'edit'))
    for reference in contract['excluded']:
        if reference in first:
            findings.append(('unrelated', reference))
    return findings


def linked(step, target):
    """Whether the step's own span links the target section."""
    path, _ = node(step)
    lines, fenced, _ = checker.scan(path)
    _, span = section_lines(step)
    want = node(target)
    for index, link in checker.targets(path, lines, fenced):
        if index not in span:
            continue
        name, _, fragment = link.partition('#')
        destination = (path.parent / name).resolve() if name else path
        if (destination, checker.anchor_of(fragment) if fragment else '') == want:
            return True
    return False


def closure(references):
    """Every node the before-use requirements reach from the referenced reads, a heading read
    taking only its own section's requirements and its file introduction's."""
    nodes = set()
    pending = [node(reference) for reference in references]
    while pending:
        current = pending.pop()
        if current in nodes:
            continue
        nodes.add(current)
        path, anchor = current
        if not path.is_file() or path.suffix != '.md':
            continue
        span = checker.read_span(path, anchor)
        for edge in checker.requirements(path, checker.contract(path, {})):
            if edge.line in span:
                pending.append((edge.target, edge.anchor))
    return nodes


def trace_of(route, inputs, drop=(), late=(), extra=(), split=()):
    """A synthetic trace retrieving the route's required context in contract order, then
    acting on the task; a late reference is retrieved only after that first use."""
    order = [reference for reference in required(route, inputs) if reference not in drop]
    order = [reference for reference in order if reference not in late] + [None] + list(late) + list(extra)
    trace = []
    for reference in order:
        if reference is None:
            trace.append({'text': '', 'use': True})
            continue
        lines, span = section_lines(reference)
        if reference in split:
            half = span.start + len(span) // 2
            trace.append({'text': '\n'.join(lines[span.start:half])})
            trace.append({'text': '\n'.join(lines[half:span.stop])})
        else:
            trace.append({'text': '\n'.join(lines[index] for index in span)})
        if reference == 'guidelines.md' and CONTRACTS[route].get('edited'):
            trace.append({'text': '', 'edit': True})
    return trace


class ContractSource(unittest.TestCase):
    def test_every_contracted_section_resolves(self):
        for route, contract in CONTRACTS.items():
            references = list(contract['whole']) + list(contract['excluded'])
            for step, target, _ in contract['selections']:
                references += [step, target]
            for reference in references:
                with self.subTest(route=route, reference=reference):
                    self.assertTrue(section_lines(reference)[1], 'names no heading or file')

    def test_each_selection_is_linked_at_its_step(self):
        for route, contract in CONTRACTS.items():
            for step, target, _ in contract['selections']:
                with self.subTest(route=route, step=step, target=target):
                    self.assertTrue(linked(step, target), 'the step does not link the section it selects')

    def test_entries_require_exactly_the_common_context(self):
        """The entry point binds Rules and Conventions before a mode is selected; a mode's
        preamble binds the same pair, and Revise alone adds both guidelines whole."""
        skill = {(edge.target, edge.anchor) for edge in checker.requirements(ROOT / 'SKILL.md')}
        self.assertEqual(skill, {node('rules.md'), node('conventions.md')})
        for route, contract in CONTRACTS.items():
            path = node(contract['entry'])[0]
            stated = {(edge.target, edge.anchor) for edge in
                      checker.requirements(path, checker.contract(path, {}))
                      if edge.target != path}
            expected = {node(reference) for reference in contract['whole']
                        if reference not in ('SKILL.md', contract['entry'])}
            with self.subTest(route=route):
                self.assertEqual(stated, expected)

    def test_selected_sections_add_no_before_use_context(self):
        """A selected section's read takes no requirement beyond the common context, so no
        union of its file's links is preloaded."""
        for route, contract in CONTRACTS.items():
            allowed = {node(reference) for reference in contract['whole']}
            for _, target, _ in contract['selections']:
                reached = closure([target]) - {node(target)}
                with self.subTest(route=route, target=target):
                    self.assertLessEqual(reached, allowed)

    def test_route_closure_is_acyclic_and_excludes_unrelated_content(self):
        for route, contract in CONTRACTS.items():
            references = list(contract['whole']) + [target for _, target, _ in contract['selections']]
            graph = checker.before_use_graph([node(reference)[0] for reference in references])
            reached = closure(references)
            with self.subTest(route=route):
                self.assertFalse(checker.before_use_cycles(graph))
                for reference in contract['excluded']:
                    self.assertNotIn(node(reference), reached)
                    for step, _, _ in contract['selections']:
                        self.assertFalse(linked(step, reference), f'{step} links {reference}')


class CapturedInputs(unittest.TestCase):
    def test_every_route_has_captured_trial_inputs(self):
        self.assertEqual(set(CAPTURES['routes']), set(CONTRACTS))
        for route, capture in CAPTURES['routes'].items():
            with self.subTest(route=route):
                self.assertTrue(capture['request'])
                self.assertTrue(capture['authority'])
                self.assertTrue(capture['source'])

    def test_a_supplied_checkpoint_selects_no_refresh(self):
        inputs = CAPTURES['routes']['standup']['inputs']
        self.assertTrue(inputs['checkpoint'])
        self.assertNotIn('modes/sync-mode.md', selected('standup', inputs))
        self.assertIn('artifacts/pull-request.md#fetch-pull-request-issue-links', selected('standup', inputs))

    def test_a_direct_standup_refreshes_through_sync(self):
        inputs = CAPTURES['routes']['standup']['alternates']['direct']
        chosen = selected('standup', inputs)
        self.assertIn('modes/sync-mode.md', chosen)
        self.assertLess(chosen.index('artifacts/board.md#read-board-state'), chosen.index('modes/sync-mode.md'))

    def test_unresolved_evidence_selects_its_issue_reads(self):
        inputs = dict(CAPTURES['routes']['standup']['inputs'], unresolved=True)
        self.assertIn('artifacts/issue.md#find-initiative-issue', selected('standup', inputs))
        self.assertNotIn('artifacts/issue.md#find-initiative-issue',
                         selected('standup', CAPTURES['routes']['standup']['inputs']))

    def test_a_missing_pull_request_selects_nothing_past_the_entry(self):
        inputs = CAPTURES['routes']['understand']['alternates']['unnamed']
        self.assertEqual(selected('understand', inputs), [])
        self.assertEqual(required('understand', inputs), list(CONTRACTS['understand']['whole']))

    def test_read_only_understand_stops_before_publication(self):
        chosen = selected('understand', CAPTURES['routes']['understand']['inputs'])
        self.assertIn('artifacts/repository-graph.md#measure-repository-change', chosen)
        self.assertNotIn('artifacts/planning-record.md#publish-planning-record', chosen)
        self.assertNotIn('artifacts/repository-graph.md#index-repository', chosen)

    def test_a_bounded_edit_selects_the_skill_check_alone(self):
        chosen = selected('revise', CAPTURES['routes']['revise']['inputs'])
        self.assertEqual(chosen, ['modes/revise-mode.md#check-skill-files'])


class TraceConformance(unittest.TestCase):
    def inputs(self, route):
        return CAPTURES['routes'][route]['inputs']

    def test_a_trace_retrieving_the_contract_in_order_conforms(self):
        for route in CONTRACTS:
            with self.subTest(route=route):
                self.assertEqual(conformance(route, self.inputs(route), trace_of(route, self.inputs(route))), [])

    def test_missing_common_context_is_reported(self):
        trace = trace_of('standup', self.inputs('standup'), drop=('rules.md',))
        self.assertIn(('missing', 'rules.md'), conformance('standup', self.inputs('standup'), trace))

    def test_common_context_after_the_first_use_is_late(self):
        trace = trace_of('understand', self.inputs('understand'), late=('conventions.md',))
        self.assertIn(('late', 'conventions.md'), conformance('understand', self.inputs('understand'), trace))

    def test_a_skipped_selected_operation_is_reported(self):
        skipped = 'artifacts/board.md#read-board-state'
        trace = trace_of('standup', self.inputs('standup'), drop=(skipped,))
        self.assertIn(('missing', skipped), conformance('standup', self.inputs('standup'), trace))

    def test_guidelines_after_the_first_edit_are_late(self):
        trace = trace_of('revise', self.inputs('revise'), drop=('guidelines.md',))
        trace.append({'text': '', 'edit': True})
        lines, span = section_lines('guidelines.md')
        trace.append({'text': '\n'.join(lines[index] for index in span)})
        self.assertIn(('late', 'guidelines.md'), conformance('revise', self.inputs('revise'), trace))

    def test_recovered_truncation_conforms(self):
        trace = trace_of('revise', self.inputs('revise'), split=('../guidelines.md',))
        self.assertEqual(conformance('revise', self.inputs('revise'), trace), [])

    def test_unrecovered_truncation_is_missing_context(self):
        trace = trace_of('revise', self.inputs('revise'), split=('../guidelines.md',))
        lines, span = section_lines('../guidelines.md')
        rest = '\n'.join(lines[span.start + len(span) // 2:span.stop])
        trace = [call for call in trace if call['text'] != rest]
        self.assertIn(('missing', '../guidelines.md'), conformance('revise', self.inputs('revise'), trace))

    def test_an_excluded_section_retrieved_whole_is_unrelated(self):
        trace = trace_of('standup', self.inputs('standup'), extra=('modes/hoist-mode.md',))
        self.assertIn(('unrelated', 'modes/hoist-mode.md'), conformance('standup', self.inputs('standup'), trace))


if __name__ == '__main__':
    unittest.main()
