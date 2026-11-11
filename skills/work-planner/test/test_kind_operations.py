"""Each kind operation the registration links is supplied under its registered name, and general files select it through the registration with its general contract."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker
from test_plan_mode import section

ENTRY = ROOT / 'SKILL.md'
CALL = re.compile(r'(?:Apply|Run) \[([^]]+)\]\(([^)\s]*)[^)]*"ƒ"\)')
KIND = re.compile(r'^\s+- \[([^]]+)\]\((artifacts/[\w-]+\.md)\)\s+(.*)$')
NAMED = re.compile(r'\[([^]]+)\]\(([^)\s]+)[^)]*\)')
SELECT = re.compile(r'Apply the ([A-Z][\w-]*(?: [A-Z][\w-]*)*) operation\b')
GENERAL = ('modes', 'protocols')
DECLARED = ('modes/deliver-mode.md', 'modes/hoist-mode.md', 'protocols/unit-dispatch.md',
            'protocols/issue-delivery.md', 'protocols/task-merge.md', 'protocols/issue-closure.md')
HIERARCHY = ('Initiative', 'Epic', 'Task')
KIND_NAMES = re.compile(r'\b(proposals?|[Ss]tandalone|[Hh]ot-?[Ff]ix(es)?)\b')
ARTIFACT = re.compile(r'^\s+- \[([^]]+)\]\((artifacts/[\w-]+\.md)\)(?:\s+(.*))?$')


def interface_names():
    """The interface operations the registration names, in order."""
    text = ENTRY.read_text()
    block = text.split('A kind supplies an interface operation', 1)[1].split('\n\n', 2)[1]
    return re.findall(r'^- \*\*(.+?)\*\*$', block, re.M)


def registered(kind):
    """The interface name and kind-operation link of each operation the kind registers."""
    for line in ENTRY.read_text().splitlines():
        match = KIND.match(line)
        if match and match[1] == kind:
            return match[2], [(name, target) for name, target in NAMED.findall(match[3])]
    raise AssertionError(f'{kind} has no registration line')


def kind_operation(name, kind):
    """The interface name with the kind's name after its verb."""
    verb, _, rest = name.partition(' ')
    return f'{verb} {kind} {rest}'


def operations(path):
    """Each Operations heading and its body."""
    lines, _, headings = checker.scan(path)
    section_name, found = None, {}
    for position, (start, level, title) in enumerate(headings):
        if level == 2:
            section_name = title
        elif level == 3 and section_name == 'Operations':
            end = checker.heading_end(headings, start, 3, len(lines))
            found[title] = '\n'.join(lines[start + 1:end])
    return found


def registration():
    """Each kind the entry point registers, with its artifacts and the interface names each supplies."""
    lines = ENTRY.read_text().splitlines()
    kinds, kind = {}, None
    for line in lines[:lines.index('## Modes')]:
        lead = re.match(r'- \*\*([^*]+)\*\*  ', line)
        if lead:
            kind = kinds.setdefault(lead[1], [])
        elif kind is not None and (match := ARTIFACT.match(line)):
            supplied = [name for name in re.sub(r'\]\([^)]*\)', '', match[3] or '').replace('[', '').split(', ') if name]
            kind.append((match[2], match[1], supplied))
        elif line.startswith('A kind supplies'):
            kind = None
    return kinds


def resolve(name, kind):
    """The artifact and operation heading the registration selects for one interface name of one kind."""
    for path, title, supplied in registration()[kind]:
        if name in supplied:
            stem = re.sub(r' Body$', '', title)
            verb, _, rest = name.partition(' ')
            return path, f'{verb} {stem} {rest}'
    return None


def selections(name, files=None):
    """Each general line that selects the named interface operation through the registration."""
    sites = []
    paths = [ROOT / name_ for name_ in files] if files else [
        path for folder in GENERAL for path in sorted((ROOT / folder).glob('*.md'))]
    for path in paths:
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if '](../SKILL.md)' in line and name in SELECT.findall(line):
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


class HotfixInterface(unittest.TestCase):
    """Hot-fix supplies every interface operation the registration names for it."""

    def setUp(self):
        self.path, self.links = registered('Hot-fix')
        self.supplied = operations(ROOT / self.path)

    def test_every_interface_name_is_linked_to_its_kind_operation(self):
        names = [name for name, _ in self.links]
        self.assertEqual(names, [name for name in interface_names() if name != 'Populate Body'])
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

    def test_general_callers_select_the_operation_through_the_registration(self):
        """Each interface name a general file selects names the registration, and the registration
        resolves it to the kind operation the hot-fix artifact supplies."""
        for name, target in self.links:
            with self.subTest(name=name):
                self.assertTrue(selections(name), f'no general caller selects {name}')
                self.assertEqual(general_calls(target.partition('#')[2]), [])
                path, operation = resolve(name, 'Hot-fix')
                self.assertEqual(f'{path}#{checker.anchor_of(operation)}', target)
                self.assertIn(operation, self.supplied)


class HotfixContracts(unittest.TestCase):
    """Each hot-fix operation takes its general contract's inputs and provides its results."""

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
        """The steps each operation owns live in the hot-fix artifact, not in the general files that select it."""
        owned = ('#sync-hot-fix-issue', 'hotfix.md#hot-fix-identity', 'hotfix.md#board-evidence',
                 'hotfix.md#board-result', 'Verify Hot-Fix Readiness', 'Restore Hot-Fix Draft')
        for name in DECLARED:
            text = (ROOT / name).read_text()
            for mark in owned:
                with self.subTest(file=name, mark=mark):
                    self.assertFalse(mark in text, f'{name} runs the step {mark} inline')

    def test_callers_supply_the_contract_inputs(self):
        expected = {
            'Release Hold': [('modes/deliver-mode.md', 'with its issue and the selected board')],
            'Record Dispatch Status': [('protocols/unit-dispatch.md', 'with them')],
            'Record Delivery': [('protocols/issue-delivery.md',
                                 'its delivering pull request and the selected criterion ids')],
            'Record Merge': [('protocols/task-merge.md',
                              'with the merge result and the complete issue-link snapshot')],
            'Settle Board Status': [('modes/hoist-mode.md', 'with the confirmed theme board and the saved issue'),
                                    ('protocols/task-merge.md', 'with the supplied board and the issue')],
            'Review Before Merge': [('modes/deliver-mode.md', 'for its draft pull request')],
        }
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
    """Hot-fix Body supplies the body population the registration names for it, and Hoist Mode selects it."""

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

    def test_hoist_selects_it_with_the_contract_inputs(self):
        self.assertEqual(general_calls('populate-hot-fix-body'), [])
        sites = selections('Populate Body', ['modes/hoist-mode.md'])
        self.assertEqual(len(sites), 1)
        self.assertIn("the destination's [registered kind](../SKILL.md) supplies, with the inputs it takes", sites[0][1])
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
    """Deliver Mode, Hoist Mode, Unit Dispatch, Issue Delivery, Task Merge and Issue Closure name no kind of work
    outside the plan hierarchy, and reach each kind's operations through the registration."""

    def kind_artifacts(self):
        return {path for kind, artifacts in registration().items() if kind not in HIERARCHY
                for path, _, _ in artifacts}

    def test_the_kind_search_finds_no_kind_name_or_link(self):
        """A capitalised Proposal names the body section, a literal; initiative, epic and task are the plan
        hierarchy the general route delivers."""
        kinds = self.kind_artifacts()
        self.assertEqual(kinds, {'artifacts/proposal-body.md', 'artifacts/standalone-body.md',
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

    def test_each_selection_names_a_registered_interface(self):
        names = set(interface_names())
        for name in DECLARED:
            for number, line in enumerate((ROOT / name).read_text().splitlines(), 1):
                if '](../SKILL.md)' not in line:
                    continue
                for selected in SELECT.findall(line):
                    with self.subTest(site=f'{name}:{number}'):
                        self.assertIn(selected, names)

    def test_each_selected_operation_resolves_for_every_kind_supplying_it(self):
        """Each interface the declared files select reaches, for every kind that registers it, an operation its
        artifact supplies, and the general contract the registration links for it resolves."""
        selected = {name for name in interface_names() if selections(name, DECLARED)}
        self.assertEqual(selected, set(interface_names()))
        for kind in registration():
            for name in selected:
                found = resolve(name, kind)
                if found is None:
                    continue
                path, operation = found
                with self.subTest(kind=kind, name=name):
                    self.assertIn(operation, operations(ROOT / path))

    def test_the_general_contracts_resolve(self):
        text = ENTRY.read_text()
        block = text.split('A kind supplies an interface operation', 1)[1].split('\n\n', 2)[1]
        for name, target in re.findall(r'^- \*\*(.+?)\*\*\n  \[[^]]+\]\(([^)\s]+)', block, re.M):
            file, _, anchor = target.partition('#')
            with self.subTest(name=name):
                self.assertTrue((ROOT / file).exists())
                if anchor:
                    titles = {checker.anchor_of(title) for _, _, title in checker.scan(ROOT / file)[2]}
                    self.assertIn(anchor, titles)


if __name__ == '__main__':
    unittest.main()
