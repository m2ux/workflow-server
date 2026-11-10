"""Each kind operation the registration links is supplied under its registered name and called with its general contract."""
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
GENERAL = ('modes', 'protocols')


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

    def test_general_callers_select_the_operation_by_its_registered_name(self):
        """Each interface name a general file selects reaches the kind operation, not the
        steps the kind runs inside it."""
        for name, target in self.links:
            anchor = target.partition('#')[2]
            with self.subTest(name=name):
                sites = general_calls(anchor)
                self.assertTrue(sites, f'no general caller selects {name}')
                for where, line in sites:
                    self.assertIn(f'[{kind_operation(name, "Hot-fix")}]', line, where)


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
        for name in ('modes/deliver-mode.md', 'protocols/unit-dispatch.md',
                     'protocols/issue-delivery.md', 'protocols/task-merge.md'):
            text = (ROOT / name).read_text()
            for mark in owned:
                with self.subTest(file=name, mark=mark):
                    self.assertFalse(mark in text, f'{name} runs the step {mark} inline')

    def test_callers_supply_the_contract_inputs(self):
        expected = {
            'release-hot-fix-hold': ('modes/deliver-mode.md', 'with its issue and the selected board'),
            'record-hot-fix-dispatch-status': ('protocols/unit-dispatch.md', 'with them'),
            'record-hot-fix-delivery': ('protocols/issue-delivery.md',
                                        'its delivering pull request and the selected criterion ids'),
            'record-hot-fix-merge': ('protocols/task-merge.md',
                                     'with the merge result and the complete issue-link snapshot'),
            'review-hot-fix-before-merge': ('modes/deliver-mode.md', 'for its draft [delivering pull request]'),
        }
        for anchor, (where, inputs) in expected.items():
            with self.subTest(operation=anchor):
                sites = general_calls(anchor)
                self.assertEqual([site.partition(':')[0] for site, _ in sites], [where])
                self.assertIn(inputs, sites[0][1])

    def test_unit_dispatch_supplies_the_issue_and_board_evidence(self):
        hold = section((ROOT / 'protocols' / 'unit-dispatch.md').read_text(), '##### New Hot-Fix Unit')
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
        sites = general_calls('populate-hot-fix-body')
        self.assertEqual([site.partition(':')[0] for site, _ in sites], ['modes/hoist-mode.md'])
        self.assertIn('[Populate Hot-fix Body]', sites[0][1])
        self.assertIn('with its number, theme label, target and defect evidence', sites[0][1])

    def test_hoist_runs_no_body_step_inline(self):
        text = (ROOT / 'modes' / 'hoist-mode.md').read_text()
        for mark in ('hotfix-body.md#hot-fix-identity', 'hotfix-body.md#defect-evidence',
                     'hotfix-body.md#output-body', 'hotfix-body.md#fields'):
            with self.subTest(mark=mark):
                self.assertNotIn(mark, text)


if __name__ == '__main__':
    unittest.main()
