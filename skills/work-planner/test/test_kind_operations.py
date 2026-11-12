"""Work Kind holds Populate Body and Validate Body, each step linking each supplying kind's operation by name before
the general route, and every general step applying a kind's operation links it: the hot-fix's operations directly from
each caller, and a hot-fix step with one caller written in that caller."""
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
UNLINKED = re.compile(r'Apply (?:that|the [A-Z][\w-]* [\w -]*?) operation|operation (?:the|that) [^.]*\bsupplies\b')
GENERAL = ('modes', 'protocols', 'artifacts')
ARTIFACT = re.compile(r'^\s+- \[([^]]+)\]\(([\w-]+\.md)\)(?:\s+(.*))?$')


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


def registration_lines():
    """Each line of Work Kind's Registration field, by its line number in the file."""
    lines, _, headings = checker.scan(KIND)
    start = next(index for index, level, title in headings if level == 3 and title == 'Registration')
    end = checker.heading_end(headings, start, 3, len(lines))
    return {number + 1: lines[number] for number in range(start + 1, end)}


def registration():
    """Each kind Work Kind's Registration lists, with each artifact and the name and target of each operation that
    artifact supplies, as paths from the skill folder."""
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


def supplied(name):
    """Each artifact and target the Registration links for one Work Kind operation."""
    return [(path, target) for artifacts in registration().values() for path, _, links in artifacts
            for operation, target in links if operation == name]


def selections(name, files=None):
    """Each general line that applies the named operation of Work Kind."""
    anchor = checker.anchor_of(name)
    sites = []
    paths = [ROOT / name_ for name_ in files] if files else [
        path for folder in ('modes', 'protocols') for path in sorted((ROOT / folder).glob('*.md'))]
    for path in paths:
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if any(fragment == anchor for _, fragment in DISPATCH.findall(line)):
                sites.append((f'{path.parent.name}/{path.name}:{number}', line))
    return sites


def callers(anchor):
    """Each mode, protocol or artifact line outside the target's own file that calls an operation by anchor."""
    sites = []
    for folder in GENERAL:
        for path in sorted((ROOT / folder).glob('*.md')):
            for number, line in enumerate(path.read_text().splitlines(), 1):
                for _, target in CALL.findall(line):
                    if target.endswith('#' + anchor) and target.partition('#')[0]:
                        sites.append((f'{folder}/{path.name}:{number}', line))
    return sites


class WorkKind(unittest.TestCase):
    """Work Kind holds the two operations several kinds supply, each step linking each kind's operation by name."""

    def setUp(self):
        self.held = operations(KIND)

    def test_it_holds_populate_and_validate_body_alone(self):
        self.assertEqual(list(self.held), ['Populate Body', 'Validate Body'])

    def test_each_step_links_each_supplying_kind_operation_and_no_registration(self):
        for name, body in self.held.items():
            with self.subTest(operation=name):
                self.assertNotIn('#registration', body)
                linked = {target for _, target in CALL.findall(body)}
                for path, target in supplied(name):
                    self.assertIn(target.removeprefix('artifacts/'), linked)

    def test_each_registered_operation_names_its_kind(self):
        for kind, artifacts in registration().items():
            for _, _, links in artifacts:
                for name, target in links:
                    with self.subTest(kind=kind, name=name):
                        self.assertIn(name, self.held)
                        titles = {checker.anchor_of(title): title for title in operations(ROOT / target.partition('#')[0])}
                        verb, _, rest = name.partition(' ')
                        self.assertRegex(titles[target.partition('#')[2]], rf'^{verb} .+ {rest}$')

    def test_each_general_route(self):
        self.assertIn('- For any other kind, populate the template its body artifact\'s Fields state',
                      self.held['Populate Body'])
        self.assertIn('- For any other kind, Apply [Validate Issue Body](issue-body.md#validate-issue-body "ƒ")',
                      self.held['Validate Body'])

    def test_the_hot_fix_supplies_only_its_body_population(self):
        self.assertEqual([(path, links) for path, _, links in registration()['Hot-fix']],
                         [('artifacts/hotfix.md', []),
                          ('artifacts/hotfix-body.md',
                           [('Populate Body', 'artifacts/hotfix-body.md#populate-hot-fix-body')])])

    def test_each_lifecycle_artifact_precedes_its_body(self):
        for kind, lifecycle, body in (('Proposal', 'Proposal', 'Proposal Body'),
                                      ('Initiative', 'Initiative', 'Initiative Issue Body'),
                                      ('Epic', 'Epic', 'Epic Issue Body')):
            with self.subTest(kind=kind):
                self.assertEqual([title for _, title, _ in registration()[kind]], [lifecycle, body])


class HotfixCallers(unittest.TestCase):
    """Each hot-fix operation is applied through a direct link from the step that applies it."""

    EXPECTED = {
        'settle-hot-fix-board-status': [('modes/hoist-mode.md', 'with the confirmed theme board and the saved issue'),
                                        ('protocols/task-merge.md', 'with the supplied board and the hot-fix issue')],
        'review-hot-fix-before-merge': [('modes/deliver-mode.md', 'for its draft delivering pull request')],
    }

    def test_every_hot_fix_operation_has_its_direct_callers(self):
        held = {checker.anchor_of(title) for title in operations(ROOT / 'artifacts' / 'hotfix.md')}
        self.assertEqual(set(self.EXPECTED), held)
        for anchor, expected in self.EXPECTED.items():
            with self.subTest(operation=anchor):
                sites = callers(anchor)
                self.assertEqual([site.partition(':')[0] for site, _ in sites], [where for where, _ in expected])
                for (_, line), (_, inputs) in zip(sites, expected):
                    self.assertIn('hot-fix', line.lower())
                    self.assertIn(inputs, line)

    def test_a_hot_fix_step_with_one_caller_is_a_step_of_that_caller(self):
        delivery = section((ROOT / 'protocols' / 'issue-delivery.md').read_text(), '### 1. Hot-Fix')
        self.assertEqual([name for name, _ in CALL.findall(delivery)],
                         ['Verify Selected Criteria', 'Sync Hot-fix Issue', 'Save Tracker Issue'])
        merge = section((ROOT / 'protocols' / 'task-merge.md').read_text(), '### 1. Record a Hot-Fix')
        self.assertIn('Follow [Issue Delivery](issue-delivery.md "ƒ") for the hot-fix, with the merge result and the '
                      'complete issue-link snapshot as its evidence.', merge)
        release = section((ROOT / 'modes' / 'deliver-mode.md').read_text(), '###### Hot-Fix Hold')
        self.assertEqual([name for name, _ in CALL.findall(release)], ['Capture Issue Development', 'Place Issue on Board'])
        self.assertIn('Refuse the release while its [Delivery Unit](../artifacts/hotfix.md#delivery-unit) is running or '
                      'unrecorded', release)
        self.assertIn('- For any other issue, continue at [Task Issues](#2-task-issues).',
                      section((ROOT / 'protocols' / 'issue-delivery.md').read_text(), '### 1. Hot-Fix'))
        self.assertIn('- For any other merge, continue at [Read and Record](#2-read-and-record).',
                      section((ROOT / 'protocols' / 'task-merge.md').read_text(), '### 1. Record a Hot-Fix'))
        hold = section((ROOT / 'protocols' / 'unit-dispatch.md').read_text(), '##### New Hot-Fix Unit')
        self.assertIn('use that issue, board identity and refreshed board items', hold)
        self.assertIn('The session starts only once it is confirmed', hold)


class HotfixContracts(unittest.TestCase):
    """Hot-fix holds the operations several callers apply, each providing its results."""

    def setUp(self):
        self.supplied = operations(ROOT / 'artifacts' / 'hotfix.md')

    def calls(self, name):
        return [called for called, _ in CALL.findall(self.supplied[name])]

    def test_it_holds_the_operations_several_callers_apply(self):
        self.assertEqual(list(self.supplied), ['Review Hot-fix Before Merge', 'Settle Hot-fix Board Status'])

    def test_review_produces_the_general_review_and_provides_review_state(self):
        body = self.supplied['Review Hot-fix Before Merge']
        self.assertEqual(self.calls('Review Hot-fix Before Merge')[0], 'Produce Agent Review')
        self.assertIn('(agent-review.md#produce-agent-review "ƒ")', body)
        self.assertIn('provides [Review State](pull-request.md#review-state)', body)

    def test_no_general_file_runs_a_hot_fix_step_inline(self):
        """The steps each operation owns live in the hot-fix artifact, not in the general files that apply it."""
        for folder in ('modes', 'protocols'):
            for path in sorted((ROOT / folder).glob('*.md')):
                text = path.read_text()
                for mark in ('Verify Hot-Fix Readiness', 'Restore Hot-Fix Draft', 'Repair Hot-Fix Findings'):
                    with self.subTest(file=path.name, mark=mark):
                        self.assertNotIn(mark, text)


class BodyCallers(unittest.TestCase):
    """A caller whose kind varies applies Work Kind's body operation; one outside any initiative links Standalone."""

    def test_work_kind_body_operations_have_their_callers(self):
        self.assertEqual([site.partition(':')[0] for site, _ in selections('Validate Body')], ['modes/align-mode.md'])
        self.assertEqual([site.partition(':')[0] for site, _ in selections('Populate Body')], ['modes/hoist-mode.md'])

    def test_a_body_outside_any_initiative_links_populate_standalone_body(self):
        self.assertEqual(sorted({site.partition(':')[0] for site, _ in callers('populate-standalone-body')}),
                         ['artifacts/work-kind.md', 'modes/align-mode.md', 'modes/deliver-mode.md'])

    def test_hoist_reaches_the_hot_fix_body_through_work_kind(self):
        self.assertEqual([site.partition(':')[0] for site, _ in callers('populate-hot-fix-body')],
                         ['artifacts/work-kind.md'])
        rewrite = section((ROOT / 'modes' / 'hoist-mode.md').read_text(), '##### 1. Populate Selected Body')
        self.assertIn('[Rewrite Inputs](../artifacts/placement.md#rewrite-inputs)', rewrite)
        self.assertIn('for a hot-fix, its supplied number, theme label and target', rewrite)


class GeneralCallers(unittest.TestCase):
    """No general step dispatches a kind's operation without linking it."""

    def test_no_step_applies_an_unlinked_kind_operation(self):
        for folder in GENERAL:
            for path in sorted((ROOT / folder).glob('*.md')):
                for number, line in enumerate(path.read_text().splitlines(), 1):
                    with self.subTest(site=f'{folder}/{path.name}:{number}'):
                        self.assertIsNone(UNLINKED.search(line), line)

    def test_the_search_recognises_an_unlinked_dispatch(self):
        for line in ('Apply that operation with the inputs', 'Apply the Settle Board Status operation that kind',
                     'the Populate Body operation the kind supplies'):
            with self.subTest(line=line):
                self.assertTrue(UNLINKED.search(line))
        self.assertIsNone(UNLINKED.search('Apply [Populate Body](../artifacts/work-kind.md#populate-body "ƒ")'))

    def test_no_general_file_uses_the_kind_unit_term(self):
        for folder in GENERAL:
            for path in sorted((ROOT / folder).glob('*.md')):
                with self.subTest(file=path.name):
                    self.assertNotRegex(path.read_text(), r'(?i)kind units?\b|#kind-units')

    def test_each_application_names_a_work_kind_operation(self):
        anchors = {checker.anchor_of(name) for name in operations(KIND)}
        for folder in ('modes', 'protocols'):
            for path in sorted((ROOT / folder).glob('*.md')):
                for number, line in enumerate(path.read_text().splitlines(), 1):
                    for name, anchor in DISPATCH.findall(line):
                        with self.subTest(site=f'{folder}/{path.name}:{number}'):
                            self.assertIn(anchor, anchors)
                            self.assertEqual(checker.anchor_of(name), anchor)


if __name__ == '__main__':
    unittest.main()
