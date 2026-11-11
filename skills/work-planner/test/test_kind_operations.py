"""Work Kind holds one dispatching operation per interface operation, each resolving to the operation the item's registered
kind supplies or to its general route, general files reach a kind's operation only through it, and its Registration lists
each kind's lifecycle artifact ahead of its body."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker
from test_plan_mode import section

KIND = ROOT / 'artifacts' / 'work-kind.md'
CALL = re.compile(r'(?:Apply|Run) \[([^]]+)\]\(([^)\s]*)[^)]*"ƒ"\)')
NAMED = re.compile(r'\[([^]]+)\]\(([^)\s]+)[^)]*\)')
DISPATCH = re.compile(r'Apply \[([^]]+)\]\(\.\./artifacts/work-kind\.md#([a-z0-9-]+) "ƒ"\)')
RETIRED = re.compile(r'operation (?:the|that) [^.]*\bsupplies\b|the validate operation')
GENERAL = ('modes', 'protocols')
DECLARED = ('modes/align-mode.md', 'modes/deliver-mode.md', 'modes/hoist-mode.md', 'protocols/unit-dispatch.md',
            'protocols/issue-delivery.md', 'protocols/task-merge.md', 'protocols/issue-closure.md')
HIERARCHY = ('Initiative', 'Epic', 'Task')
KIND_NAMES = re.compile(r'\b(proposals?|[Ss]tandalone|[Hh]ot-?[Ff]ix(es)?)\b')
ARTIFACT = re.compile(r'^\s+- \[([^]]+)\]\(([\w-]+\.md)\)(?:\s+(.*))?$')
CODE = re.compile(r'`[^`]*`')


def operations(path):
    """Each Operations heading and its body."""
    lines, _, headings = checker.scan(path)
    section_name, found = None, {}
    for start, level, title in headings:
        if level == 2:
            section_name = title
        elif level == 3 and section_name == 'Operations':
            end = checker.heading_end(headings, start, 3, len(lines))
            found[title] = '\n'.join(lines[start + 1:end])
    return found


def interface_names():
    """The interface operations Work Kind holds, in order."""
    return list(operations(KIND))


def registration_lines():
    """Each line of Work Kind's Registration field, by its line number in the file."""
    lines, _, headings = checker.scan(KIND)
    start = next(index for index, level, title in headings if level == 3 and title == 'Registration')
    end = checker.heading_end(headings, start, 3, len(lines))
    return {number + 1: lines[number] for number in range(start + 1, end)}


def registration():
    """Each kind Work Kind's Registration lists, with each artifact and the interface name and target of each
    operation that artifact supplies, as paths from the skill folder."""
    kinds, kind = {}, None
    for line in registration_lines().values():
        lead = re.match(r'- \*\*([^*]+)\*\*  ', line)
        if lead:
            kind = kinds.setdefault(lead[1], [])
        elif kind is not None and (match := ARTIFACT.match(line)):
            kind.append((f'artifacts/{match[2]}', match[1],
                         [(name, f'artifacts/{target}') for name, target in NAMED.findall(match[3] or '')]))
        elif line and not line[0].isspace():
            kind = None
    return kinds


def registered(title):
    """The artifact path and the interface name and target of each operation one registered artifact supplies."""
    for artifacts in registration().values():
        for path, name, links in artifacts:
            if name == title:
                return path, links
    raise AssertionError(f'{title} has no registration line')


def resolve(name, kind):
    """The artifact and operation heading the registration selects for one interface name of one kind, or None
    when the kind supplies none."""
    for path, _, links in registration()[kind]:
        for supplied, target in links:
            if supplied == name:
                file, _, anchor = target.partition('#')
                assert file == path, target
                titles = {checker.anchor_of(title): title for title in operations(ROOT / path)}
                return path, titles.get(anchor)
    return None


def general_route(name):
    """What Work Kind's operation does when the kind supplies none: the operation it applies, `unsupplied`, or
    `template` for the body population it performs itself."""
    body = operations(KIND)[name]
    line = next(line for line in body.splitlines() if line.startswith('- When it lists none'))
    if calls := CALL.findall(line):
        return calls[0][0]
    return 'unsupplied' if '`unsupplied`' in line else 'template'


def dispatch(name, kind):
    """The operation Work Kind's operation reaches for one kind: the kind's own, or the general route."""
    return resolve(name, kind) or general_route(name)


def implementations(anchor):
    """Each kind operation, by resolved artifact and anchor, that Work Kind's operation of this anchor dispatches to."""
    names = {checker.anchor_of(name): name for name in interface_names()}
    found = []
    for artifacts in registration().values():
        for path, _, links in artifacts:
            for supplied, target in links:
                if supplied == names.get(anchor):
                    file, _, fragment = target.partition('#')
                    found.append(((ROOT / file).resolve(), fragment))
    return found


def kind_operation(name, kind):
    """The interface name with the kind's name after its verb."""
    verb, _, rest = name.partition(' ')
    return f'{verb} {kind} {rest}'


def selections(name, files=None):
    """Each general line that applies the named interface operation of Work Kind."""
    anchor = checker.anchor_of(name)
    sites = []
    paths = [ROOT / name_ for name_ in files] if files else [
        path for folder in GENERAL for path in sorted((ROOT / folder).glob('*.md'))]
    for path in paths:
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if any(fragment == anchor for _, fragment in DISPATCH.findall(line)):
                sites.append((f'{path.parent.name}/{path.name}:{number}', line))
    return sites


def general_calls(anchor):
    """Each general mode or protocol line that calls an operation by anchor."""
    sites = []
    for folder in GENERAL:
        for path in sorted((ROOT / folder).glob('*.md')):
            for number, line in enumerate(path.read_text().splitlines(), 1):
                for _, target in CALL.findall(line):
                    if target.endswith('#' + anchor):
                        sites.append((f'{folder}/{path.name}:{number}', line))
    return sites


class Dispatch(unittest.TestCase):
    """Each operation of Work Kind runs the kind's operation the registration links, or its general route."""

    def setUp(self):
        self.held = operations(KIND)

    def test_every_registered_interface_name_is_a_kind_operation_and_every_one_is_registered(self):
        registered_names = {name for artifacts in registration().values() for _, _, links in artifacts
                            for name, _ in links}
        self.assertEqual(registered_names, set(self.held))
        self.assertEqual(list(self.held), ['Release Hold', 'Record Dispatch Status', 'Record Delivery', 'Record Merge',
                                           'Settle Board Status', 'Populate Body', 'Review Before Merge',
                                           'Validate Body'])

    def test_each_operation_selects_through_the_registration_of_the_item_kind(self):
        for name, body in self.held.items():
            with self.subTest(operation=name):
                steps = re.findall(r'^#### \d+\. (.+)$', body, re.M)
                self.assertEqual(len(steps), 1)
                self.assertIn(f'- When the [Registration](#registration) of the [Item Work Kind](#item-work-kind) lists a '
                              f'{name} operation, Apply that operation with the [Operation Inputs](#operation-inputs)',
                              body)
                self.assertIn('[Work Kind Result](#work-kind-result)', body)
                self.assertEqual(sum(line.startswith('- When it lists none') for line in body.splitlines()), 1)

    def test_each_general_route(self):
        self.assertEqual({name: general_route(name) for name in self.held}, {
            'Release Hold': 'unsupplied', 'Record Dispatch Status': 'Record Dispatch Status',
            'Record Delivery': 'unsupplied', 'Record Merge': 'unsupplied', 'Settle Board Status': 'unsupplied',
            'Populate Body': 'template', 'Review Before Merge': 'unsupplied', 'Validate Body': 'Validate Issue Body'})
        self.assertIn('Apply [Record Dispatch Status](board-delivery.md#record-dispatch-status "ƒ")',
                      self.held['Record Dispatch Status'])
        self.assertIn('Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ") with the same '
                      '[Operation Inputs](#operation-inputs) and the [kind conditions](issue-body.md#kind-conditions) '
                      "the kind's body artifact Fields state", self.held['Validate Body'])
        self.assertIn("populate the template the kind's body artifact Fields state", self.held['Populate Body'])
        self.assertIn('[Body](issue-body.md#body)', self.held['Populate Body'])
        self.assertIn('[Status Change](board-status.md#status-change)', self.held['Settle Board Status'])

    def test_each_kind_resolves_to_its_operation_or_the_general_route(self):
        expected = {
            ('Validate Body', 'Proposal'): ('artifacts/proposal-body.md', 'Validate Proposal Body'),
            ('Validate Body', 'Initiative'): ('artifacts/initiative-issue-body.md', 'Validate Initiative Body'),
            ('Validate Body', 'Epic'): ('artifacts/epic-issue-body.md', 'Validate Epic Body'),
            ('Validate Body', 'Task'): 'Validate Issue Body',
            ('Validate Body', 'Standalone issue'): 'Validate Issue Body',
            ('Validate Body', 'Hot-fix'): 'Validate Issue Body',
            ('Populate Body', 'Standalone issue'): ('artifacts/standalone-body.md', 'Populate Standalone Body'),
            ('Populate Body', 'Hot-fix'): ('artifacts/hotfix-body.md', 'Populate Hot-fix Body'),
            ('Populate Body', 'Task'): 'template',
            ('Record Dispatch Status', 'Hot-fix'): ('artifacts/hotfix.md', 'Record Hot-fix Dispatch Status'),
            ('Record Dispatch Status', 'Epic'): 'Record Dispatch Status',
            ('Record Merge', 'Hot-fix'): ('artifacts/hotfix.md', 'Record Hot-fix Merge'),
            ('Record Merge', 'Task'): 'unsupplied',
            ('Record Delivery', 'Task'): 'unsupplied',
            ('Review Before Merge', 'Task'): 'unsupplied',
        }
        for (name, kind), target in expected.items():
            with self.subTest(name=name, kind=kind):
                self.assertEqual(dispatch(name, kind), target)

    def test_every_registered_operation_resolves_to_an_operation_its_artifact_holds(self):
        for kind, artifacts in registration().items():
            for path, _, links in artifacts:
                for name, _ in links:
                    with self.subTest(kind=kind, name=name):
                        found = resolve(name, kind)
                        self.assertIsNotNone(found[1], f'{kind} links {name} to no operation')
                        verb, _, rest = name.partition(' ')
                        self.assertRegex(found[1], rf'^{verb} .+ {rest}$')

    def test_only_its_registration_names_a_kind_or_links_a_kind_artifact(self):
        lines, fenced, _ = checker.scan(KIND)
        held = {number - 1 for number in registration_lines()}
        self.assertEqual([line for index, line in enumerate(lines)
                          if not fenced[index] and index not in held and KIND_NAMES.search(CODE.sub('', line))], [])
        kinds = {(ROOT / path).resolve() for kind, artifacts in registration().items() for path, _, _ in artifacts}
        targets = {(KIND.parent / target.partition('#')[0]).resolve()
                   for index, target in checker.targets(KIND, lines, fenced)
                   if target.partition('#')[0] and index not in held}
        self.assertEqual(targets & kinds, set())

    def test_no_route_recurses_into_its_caller(self):
        """Record Delivery and Record Merge fill the contract of the protocol calling them, so the general route
        stays with that protocol: the operation provides `unsupplied` and the protocol continues at its own steps."""
        for name in ('Record Delivery', 'Record Merge'):
            with self.subTest(operation=name):
                self.assertEqual(general_route(name), 'unsupplied')
        self.assertIn('- On the [Work Kind Result](../artifacts/work-kind.md#work-kind-result) `unsupplied`, continue at '
                      '[Task Issues](#2-task-issues).',
                      section((ROOT / 'protocols' / 'issue-delivery.md').read_text(), '### 1. Kind Delivery'))
        self.assertIn('- On the [Work Kind Result](../artifacts/work-kind.md#work-kind-result) `unsupplied`, continue at '
                      '[Read and Record](#2-read-and-record).',
                      section((ROOT / 'protocols' / 'task-merge.md').read_text(), '### 1. Kind Merge'))
        self.assertIn('- On the [Work Kind Result](../artifacts/work-kind.md#work-kind-result) `unsupplied`, continue to '
                      '[Merge](#10-merge).',
                      section((ROOT / 'modes' / 'deliver-mode.md').read_text(), '#### 9. Review Before Merge'))


class Registration(unittest.TestCase):
    """Work Kind's Registration lists each kind's lifecycle artifact ahead of its body artifact."""

    def test_proposal_is_registered_beside_proposal_body(self):
        self.assertEqual([(path, title) for path, title, _ in registration()['Proposal']],
                         [('artifacts/proposal.md', 'Proposal'), ('artifacts/proposal-body.md', 'Proposal Body')])

    def test_each_lifecycle_artifact_precedes_its_body(self):
        for kind, lifecycle, body in (('Proposal', 'Proposal', 'Proposal Body'),
                                      ('Initiative', 'Initiative', 'Initiative Issue Body'),
                                      ('Epic', 'Epic', 'Epic Issue Body')):
            with self.subTest(kind=kind):
                self.assertEqual([title for _, title, _ in registration()[kind]], [lifecycle, body])


class HotfixInterface(unittest.TestCase):
    """Hot-fix supplies its registered interface operations under their names, reached only through Work Kind."""

    def setUp(self):
        self.path, self.links = registered('Hot-fix')
        self.supplied = operations(ROOT / self.path)

    def test_every_interface_name_is_linked_to_its_kind_operation(self):
        names = [name for name, _ in self.links]
        self.assertEqual(names, [name for name in interface_names() if name not in ('Populate Body', 'Validate Body')])
        for name, target in self.links:
            with self.subTest(name=name):
                operation = kind_operation(name, 'Hot-fix')
                self.assertIn(operation, self.supplied)
                self.assertEqual(target, f'{self.path}#{checker.anchor_of(operation)}')

    def test_every_operation_ends_by_providing_its_result(self):
        for name, _ in self.links:
            body = self.supplied[kind_operation(name, 'Hot-fix')]
            steps = re.findall(r'^#### \d+\. (.+)$', body, re.M)
            with self.subTest(name=name):
                self.assertTrue(steps)
                last = section(body, '#### ' + body.split('#### ')[-1].splitlines()[0])
                self.assertRegex(last, r'\bProvide\b|\bprovides\b')

    def test_general_callers_reach_the_operation_through_kind(self):
        for name, target in self.links:
            with self.subTest(name=name):
                self.assertTrue(selections(name), f'no general caller applies {name}')
                self.assertEqual(general_calls(target.partition('#')[2]), [])
                path, operation = resolve(name, 'Hot-fix')
                self.assertEqual(f'{path}#{checker.anchor_of(operation)}', target)
                self.assertIn(operation, self.supplied)


class HotfixContracts(unittest.TestCase):
    """Each hot-fix operation takes its interface's inputs and provides its results."""

    def setUp(self):
        self.supplied = operations(ROOT / 'artifacts' / 'hotfix.md')

    def calls(self, name):
        return [called for called, _ in CALL.findall(self.supplied[name])]

    def test_release_hold_refuses_a_live_unit_and_provides_the_board(self):
        body = self.supplied['Release Hot-fix Hold']
        self.assertEqual(self.calls('Release Hot-fix Hold'), ['Capture Issue Development', 'Place Issue on Board'])
        self.assertIn('Refuse the release while its [Delivery Unit](#delivery-unit) is running or unrecorded', body)
        self.assertIn('Provide [Board Result](#board-result)', body)

    def test_dispatch_status_substitutes_the_general_operation(self):
        body = self.supplied['Record Hot-fix Dispatch Status']
        self.assertEqual(self.calls('Record Hot-fix Dispatch Status'), ['Record Dispatch Status'])
        self.assertIn('(board-delivery.md#record-dispatch-status "ƒ")', body)
        self.assertIn('[Confirmed Statuses](board-delivery.md#confirmed-statuses)', body)

    def test_delivery_verifies_syncs_and_saves(self):
        self.assertEqual(self.calls('Record Hot-fix Delivery'),
                         ['Verify Selected Criteria', 'Sync Hot-fix Issue', 'Save Tracker Issue'])
        self.assertIn('Provide the saved identity and [Delivery Findings]', self.supplied['Record Hot-fix Delivery'])

    def test_merge_records_the_delivery_on_the_issue_alone(self):
        body = self.supplied['Record Hot-fix Merge']
        self.assertEqual(self.calls('Record Hot-fix Merge'), ['Record Hot-fix Delivery'])
        self.assertIn('merge result and the complete issue-link snapshot', body)
        self.assertIn('records nothing on an epic or initiative', body)

    def test_review_produces_the_general_review_and_provides_review_state(self):
        body = self.supplied['Review Hot-fix Before Merge']
        calls = self.calls('Review Hot-fix Before Merge')
        self.assertEqual(calls[0], 'Produce Agent Review')
        self.assertIn('(agent-review.md#produce-agent-review "ƒ")', body)
        self.assertIn('provides [Review State](pull-request.md#review-state)', body)

    def test_no_general_file_runs_a_hotfix_step_inline(self):
        """The steps each operation owns live in the hot-fix artifact, not in the general files that reach it."""
        owned = ('#sync-hot-fix-issue', 'hotfix.md#hot-fix-identity', 'hotfix.md#board-evidence',
                 'hotfix.md#board-result', 'Verify Hot-Fix Readiness', 'Restore Hot-Fix Draft')
        for name in (*DECLARED, 'artifacts/work-kind.md'):
            text = (ROOT / name).read_text()
            for mark in owned:
                with self.subTest(file=name, mark=mark):
                    self.assertFalse(mark in text, f'{name} runs the step {mark} inline')

    def test_callers_supply_the_contract_inputs(self):
        expected = {
            'Release Hold': [('modes/deliver-mode.md', 'with its issue and the selected board')],
            'Record Dispatch Status': [('protocols/unit-dispatch.md', 'with them, requesting In Progress')],
            'Record Delivery': [('protocols/issue-delivery.md',
                                 'its delivering pull request and the selected criterion ids')],
            'Record Merge': [('protocols/task-merge.md',
                              'with the merge result and the complete issue-link snapshot')],
            'Settle Board Status': [('modes/hoist-mode.md', 'with the confirmed theme board and the saved issue'),
                                    ('protocols/task-merge.md', 'with the supplied board and the issue')],
            'Populate Body': [('modes/align-mode.md', 'to the current body with the confirmed boundary'),
                              ('modes/deliver-mode.md', 'for work outside any initiative'),
                              ('modes/hoist-mode.md', 'with the inputs it takes from them')],
            'Review Before Merge': [('modes/deliver-mode.md', "for the unit's pull request")],
            'Validate Body': [('modes/align-mode.md', "for the issue's [registered kind](../artifacts/work-kind.md#registration)")],
        }
        self.assertEqual(set(expected), set(interface_names()))
        for name, callers in expected.items():
            with self.subTest(operation=name):
                sites = selections(name)
                self.assertEqual([site.partition(':')[0] for site, _ in sites], [where for where, _ in callers])
                for (_, line), (_, inputs) in zip(sites, callers):
                    self.assertIn(inputs, line)

    def test_unit_dispatch_supplies_the_issue_and_board_evidence(self):
        hold = section((ROOT / 'protocols' / 'unit-dispatch.md').read_text(), '##### New Kind Unit')
        self.assertIn('use that issue, board identity and refreshed board items', hold)
        self.assertIn('The session starts only once it is confirmed', hold)


class HotfixBodyInterface(unittest.TestCase):
    """Hot-fix Body supplies the body population the registration names for it, and Hoist Mode reaches it."""

    def setUp(self):
        self.path, self.links = registered('Hot-fix Body')
        self.supplied = operations(ROOT / 'artifacts' / 'hotfix-body.md')

    def test_populate_body_is_linked_to_its_kind_operation(self):
        operation = kind_operation('Populate Body', 'Hot-fix')
        self.assertEqual(self.path, 'artifacts/hotfix-body.md')
        self.assertEqual(self.links, [('Populate Body', f'{self.path}#{checker.anchor_of(operation)}')])
        self.assertEqual(list(self.supplied), [operation])

    def test_operation_reads_its_fields_and_provides_the_body(self):
        body = self.supplied['Populate Hot-fix Body']
        for field in ('standalone-body.md#template', '#hot-fix-identity', '#defect-evidence', '#target'):
            with self.subTest(field=field):
                self.assertIn(f']({field})', body)
        self.assertIn('Provide the populated [Output Body](#output-body) for publication.',
                      section(body, '#### 2. Provide Populated Hot-fix Body'))

    def test_hoist_reaches_it_with_the_contract_inputs(self):
        self.assertEqual(general_calls('populate-hot-fix-body'), [])
        sites = selections('Populate Body', ['modes/hoist-mode.md'])
        self.assertEqual(len(sites), 1)
        self.assertIn("for the destination's [registered kind](../artifacts/work-kind.md#registration), with the inputs it takes", sites[0][1])
        rewrite = section((ROOT / 'modes' / 'hoist-mode.md').read_text(), '##### 1. Populate Selected Body')
        self.assertIn('[Rewrite Inputs](../artifacts/placement.md#rewrite-inputs)', rewrite)
        self.assertEqual(resolve('Populate Body', 'Hot-fix'), ('artifacts/hotfix-body.md', 'Populate Hot-fix Body'))

    def test_hoist_runs_no_body_step_inline(self):
        text = (ROOT / 'modes' / 'hoist-mode.md').read_text()
        for mark in ('hotfix-body.md#hot-fix-identity', 'hotfix-body.md#defect-evidence',
                     'hotfix-body.md#output-body', 'hotfix-body.md#fields'):
            with self.subTest(mark=mark):
                self.assertNotIn(mark, text)


class GeneralCallers(unittest.TestCase):
    """The general callers of the interface name no kind of work outside the plan hierarchy, and reach each kind's
    operations through Work Kind."""

    def kind_artifacts(self):
        return {path for kind, artifacts in registration().items() if kind not in HIERARCHY
                for path, _, _ in artifacts}

    def test_the_kind_search_finds_no_kind_name_or_link(self):
        """A capitalised Proposal names the body section, a literal; initiative, epic and task are the plan
        hierarchy the general route delivers."""
        kinds = self.kind_artifacts()
        self.assertEqual(kinds, {'artifacts/proposal.md', 'artifacts/proposal-body.md', 'artifacts/standalone-body.md',
                                 'artifacts/hotfix.md', 'artifacts/hotfix-body.md'})
        for name in DECLARED:
            path = ROOT / name
            lines, fenced, _ = checker.scan(path)
            with self.subTest(file=name):
                hits = [f'{number}: {line}' for number, line in enumerate(lines, 1) if KIND_NAMES.search(line)]
                self.assertEqual(hits, [])
                targets = {(path.parent / target.partition('#')[0]).resolve()
                           for _, target in checker.targets(path, lines, fenced) if target.partition('#')[0]}
                self.assertFalse(targets & {(ROOT / kind).resolve() for kind in kinds})

    def test_the_kind_search_recognises_each_kind_name(self):
        for line in ('For a hot-fix hold', 'Apply [Release Hot-fix Hold](x.md)', 'as a standalone issue',
                     'Standalone Body', 'a proposal', 'Hot-Fix Unit'):
            with self.subTest(line=line):
                self.assertTrue(KIND_NAMES.search(line))
        for line in ('Carry evidence into Problem and design into Proposal.', 'Add its design to Proposal.',
                     'the epic and its task rows'):
            with self.subTest(line=line):
                self.assertFalse(KIND_NAMES.search(line))

    def test_each_application_names_an_interface_operation(self):
        anchors = {checker.anchor_of(name) for name in interface_names()}
        for folder in GENERAL:
            for path in sorted((ROOT / folder).glob('*.md')):
                for number, line in enumerate(path.read_text().splitlines(), 1):
                    for name, anchor in DISPATCH.findall(line):
                        with self.subTest(site=f'{folder}/{path.name}:{number}'):
                            self.assertIn(anchor, anchors)
                            self.assertEqual(checker.anchor_of(name), anchor)

    def test_every_interface_operation_is_applied_by_a_general_caller(self):
        for name in interface_names():
            with self.subTest(name=name):
                self.assertTrue(selections(name, DECLARED))

    def test_no_caller_selects_a_kind_operation_in_prose(self):
        """Work Kind alone states how an interface operation reaches a kind's; every other file applies it."""
        for folder in (*GENERAL, 'artifacts'):
            for path in sorted(path for path in (ROOT / folder).glob('*.md') if path != KIND):
                for number, line in enumerate(path.read_text().splitlines(), 1):
                    with self.subTest(site=f'{folder}/{path.name}:{number}'):
                        self.assertIsNone(RETIRED.search(line), line)


if __name__ == '__main__':
    unittest.main()
