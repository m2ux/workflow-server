"""The installed prose API exposes complete inputs and directed reading paths."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker


class DocumentInterfaces(unittest.TestCase):
    def test_prerequisites_match_direct_required_reads(self):
        for folder in ('modes', 'artifacts', 'protocols'):
            for path in sorted((ROOT / folder).glob('*.md')):
                with self.subTest(file=path.name):
                    lines, fenced, headings = checker.scan(path)
                    section = None
                    declared, used = set(), set()
                    by_line = {i: title for i, level, title in headings if level == 2}
                    sections = {}
                    for i in range(len(lines)):
                        section = by_line.get(i, section)
                        sections[i] = section
                    for i, target in checker.targets(path, lines, fenced):
                        name = target.partition('#')[0]
                        if not name:
                            continue
                        destination = (path.parent / name).resolve()
                        if destination == path:
                            continue
                        if sections[i] == 'Prerequisites':
                            declared.add(destination)
                        elif sections[i] in ('Procedure', 'Operations', 'Fields',
                                             'Outcomes', 'Commands'):
                            used.add(destination)
                    self.assertEqual(declared, used)

    def test_calls_go_down_the_layer_stack(self):
        """A mode aggregates protocol calls as an application calls services,
        so a call reaches the layer below it. A protocol that runs a mode, or
        an artifact that names either, inverts that and the lifecycle of one
        user goal becomes a step of the change it was meant to coordinate."""
        below = {'modes': ('modes', 'protocols', 'artifacts'),
                 'protocols': ('protocols', 'artifacts'),
                 'artifacts': ('artifacts',)}
        for folder, reachable in below.items():
            for path in sorted((ROOT / folder).glob('*.md')):
                lines, fenced, _ = checker.scan(path)
                for _, target in checker.targets(path, lines, fenced):
                    name = target.partition('#')[0]
                    if not name:
                        continue
                    destination = (path.parent / name).resolve()
                    if destination.parent.name not in below:
                        continue
                    with self.subTest(file=path.name, target=target):
                        self.assertIn(destination.parent.name, reachable)

    def test_artifact_operations_expose_inputs_and_consecutive_steps(self):
        for path in sorted((ROOT / 'artifacts').glob('*.md')):
            lines, fenced, headings = checker.scan(path)
            section = None
            for position, (start, level, title) in enumerate(headings):
                if level == 2:
                    section = title
                if section != 'Operations' or level != 3:
                    continue
                with self.subTest(file=path.name, operation=title):
                    end = next((i for i, depth, _ in headings[position + 1:] if depth <= 3), len(lines))
                    body = lines[start + 1:end]
                    self.assertGreaterEqual(len(title.split()), 3)
                    # The leading verb is italicised and nothing else is, so the
                    # anchors one procedure reaches read as its IO contract.
                    self.assertRegex(title, r'^\*[A-Z][a-z]+\* \S')
                    self.assertEqual(title.count('*'), 2, title)
                    self.assertTrue(any(line.startswith('**Inputs:**') for line in body))
                    numbers = [int(m[1]) for line in body if (m := re.match(r'^(\d+)\. ', line))]
                    if numbers:
                        self.assertGreater(len(numbers), 1)
                        self.assertEqual(numbers, list(range(1, len(numbers) + 1)))
                    else:
                        self.assertEqual(len([line for line in body if line.startswith('- ')]), 1)
                    self.assertFalse(any(re.match(r'^(?:\d+\. |\- )\*\*', line) for line in body))
                    self.assertFalse(any(line.startswith(('Result:', '**Result:')) for line in body))

    def test_references_cannot_route_to_modes_or_artifacts(self):
        for path in (ROOT / 'references').glob('*.md'):
            lines, fenced, _ = checker.scan(path)
            for _, target in checker.targets(path, lines, fenced):
                name = target.partition('#')[0]
                self.assertNotIn((path.parent / name).resolve().parent.name,
                                 ('modes', 'artifacts', 'protocols'))

    def test_link_text_names_no_dissolved_document(self):
        """Link text naming a document outlives the document. `Work Breakdown
        Guide` survived the reference it named by a year, on an anchor that
        pointed at neither rule its sentences invoked."""
        nouns = ('guide', 'manual', 'handbook', 'specification')
        titles = set()
        for folder in ('modes', 'artifacts', 'protocols', 'references'):
            for path in (ROOT / folder).glob('*.md'):
                for _, _, title in checker.scan(path)[2]:
                    titles.add(title.strip().lower().replace('*', ''))
        for folder in ('modes', 'artifacts', 'protocols', 'references'):
            for path in sorted((ROOT / folder).glob('*.md')):
                for text in re.findall(r'\[([^\]]+)\]\([^)\s]*#[a-z0-9-]+\)',
                                       path.read_text()):
                    if text.strip().lower().endswith(nouns):
                        with self.subTest(file=path.name, text=text):
                            self.assertIn(text.strip().lower(), titles)

    def test_every_operation_and_protocol_is_reached(self):
        """An operation exists because a procedure calls it. Splitting one
        document into many invents surface on the way, so the orphan is the
        thing to look for, not only the dropped link."""
        folders = ('modes', 'artifacts', 'protocols', 'references')
        cited, operations, protocols = set(), {}, set()
        for name in ('SKILL.md', 'guidelines.md'):
            cited |= set(re.findall(r'\]\(([^)\s]+)\)', (ROOT / name).read_text()))
        for folder in folders:
            for path in sorted((ROOT / folder).glob('*.md')):
                cited |= set(re.findall(r'\]\(([^)\s]+)\)', path.read_text()))
                if folder == 'protocols':
                    protocols.add(path.name)
                section = None
                for _, level, title in checker.scan(path)[2]:
                    if level == 2:
                        section = title
                    elif level == 3 and section == 'Operations':
                        operations[checker.anchor_of(title)] = f'{folder}/{path.name}'
        fragments = {t.rpartition('#')[2] for t in cited if '#' in t}
        files = {t.rpartition('/')[2] for t in cited}
        for anchor, where in sorted(operations.items()):
            with self.subTest(operation=anchor, file=where):
                self.assertIn(anchor, fragments)
        for name in sorted(protocols):
            with self.subTest(protocol=name):
                self.assertIn(name, files)

    def test_every_script_is_run_by_a_cited_command(self):
        """A script exists because a procedure runs it. It is run where a
        command specification names it and a procedure cites that
        specification, or where a script so run imports it."""
        paths = sorted(ROOT.rglob('*.md'))
        _, called = checker.citations(paths)
        run = set()
        for path in paths:
            lines, fenced, headings = checker.scan(path)
            for start, title in checker.specifications(headings):
                if not called.get(path, {}).get(checker.anchor_of(title)):
                    continue
                end = next((i for i, level, _ in headings if i > start and level <= 3), len(lines))
                for line in lines[start:end]:
                    run |= set(re.findall(r'skills/work-planner/scripts/([\w-]+)\.py', line))
        scripts = {path.stem: path.read_text() for path in (ROOT / 'scripts').glob('*.py')}
        grown = True
        while grown:
            imported = {name for name, text in scripts.items() if any(
                re.search(rf'^(?:import|from) {re.escape(name)}\b', scripts[user], re.MULTILINE)
                for user in run if user in scripts)}
            grown = not imported <= run
            run |= imported
        for name in sorted(scripts):
            with self.subTest(script=name):
                self.assertIn(name, run)

    def test_protocols_are_entered_whole(self):
        """A protocol is one coordinated sequence, so a caller runs the file
        rather than reaching into a step of it."""
        for folder in ('modes', 'protocols'):
            for path in sorted((ROOT / folder).glob('*.md')):
                lines, fenced, _ = checker.scan(path)
                for _, target in checker.targets(path, lines, fenced):
                    name, _, fragment = target.partition('#')
                    if not name:
                        continue
                    destination = (path.parent / name).resolve()
                    if destination.parent.name == 'protocols' and destination != path:
                        with self.subTest(file=path.name, target=target):
                            self.assertEqual(fragment, '')


RECORD_EPIC_DELIVERY = re.compile(
    r'\b(?:[Rr]un|[Rr]e-run|[Rr]epeat(?:ing)?)\s+\[?Record Epic Delivery\b')


class EpicDeliveryCallers(unittest.TestCase):
    """Sync Epic reads the long-lived branch names at the epic's bases, so a
    call to Record Epic Delivery without them never reports an epic closable."""

    def calls(self):
        found = []
        for path in sorted(ROOT.rglob('*.md')):
            for number, line in enumerate(path.read_text().splitlines(), 1):
                if RECORD_EPIC_DELIVERY.search(line):
                    found.append((f'{path.relative_to(ROOT)}:{number}', line))
        return found

    def test_record_epic_delivery_calls_pass_the_epic_bases(self):
        calls = self.calls()
        callers = {where.partition(':')[0] for where, _ in calls}
        self.assertTrue({'modes/deliver-mode.md', 'modes/sync-mode.md',
                         'modes/align-mode.md', 'protocols/review-pull-request.md',
                         'protocols/task-merge.md', 'protocols/issue-delivery.md',
                         'artifacts/epic-issue-body.md'} <= callers)
        for where, line in calls:
            with self.subTest(call=where):
                self.assertIn('epic bases', line)

    def test_record_epic_delivery_takes_the_epic_bases(self):
        text = (ROOT / 'artifacts' / 'epic-issue-body.md').read_text()
        section = text.split('### *Record* Epic Delivery', 1)[1].split('\n### ', 1)[0]
        self.assertIn('fetched epic bases', section)
        self.assertIn('`--revision`', section)

    def test_a_report_of_the_operation_is_not_a_call(self):
        self.assertIsNone(RECORD_EPIC_DELIVERY.search(
            'When [Record Epic Delivery](x.md) reports an epic base unmerged'))
        self.assertIsNone(RECORD_EPIC_DELIVERY.search(
            'When the preceding Record Epic Delivery call reports a row done'))
        self.assertIsNotNone(RECORD_EPIC_DELIVERY.search(
            'Repeat Record Epic Delivery with the saved epic.'))
