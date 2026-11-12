"""Each Work Kind step links each supplying kind's operation and no Registration, each hot-fix operation has its linked
callers, and no general step applies an unlinked kind operation."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

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
    """Each Work Kind step links each supplying kind's operation and no Registration."""

    def setUp(self):
        self.held = operations(KIND)

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


class HotfixCallers(unittest.TestCase):
    """Each hot-fix operation is applied through a direct link from each step applying it."""

    def test_every_hot_fix_operation_has_its_linked_callers(self):
        held = [checker.anchor_of(title) for title in operations(ROOT / 'artifacts' / 'hotfix.md')]
        self.assertTrue(held)
        for anchor in held:
            with self.subTest(operation=anchor):
                self.assertTrue(callers(anchor), f'no step applies {anchor} through a link')


class GeneralCallers(unittest.TestCase):
    """No general step dispatches a kind's operation without linking it, and each application names a Work Kind
    operation that exists."""

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
