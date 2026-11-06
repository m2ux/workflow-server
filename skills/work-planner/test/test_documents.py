"""The installed prose API exposes complete inputs and directed reading paths."""
import json
import re
import tempfile
import sys
import unittest
from unittest import mock
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker


def executable_scripts(paths):
    """Scripts in cited HTML operations selected by the installed declaration."""
    _, called = checker.citations(paths)
    run = set()
    for path in paths:
        lines, fenced, headings = checker.scan(path)
        entry = checker.contract(path, {})
        if not entry or entry.get('commands') != 'inline-html':
            continue
        steps = checker.procedure_spans(lines, fenced, headings, entry)
        for start, level, title, end in checker.procedure_headings(lines, headings, entry):
            if level != 3 or not called.get(path, {}).get(checker.anchor_of(title)):
                continue
            for first, last in checker.scan_blocks(lines).invocations:
                if not (start < first <= last < end and first in steps):
                    continue
                for line in lines[first:last + 1]:
                    run.update(re.findall(r'skills/work-planner/scripts/([\w-]+)\.py', line))
    return run


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
                                             'Outcomes'):
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

    def test_artifact_operations_bind_arguments_at_their_use_and_consecutive_steps(self):
        for path in sorted((ROOT / 'artifacts').glob('*.md')):
            lines, fenced, headings = checker.scan(path)
            payload = checker.scan_blocks(lines).html_lines
            entry = checker.contract(path, {})
            self.assertEqual(entry.get('steps'), 'headings')
            section = None
            for position, (start, level, title) in enumerate(headings):
                if level == 2:
                    section = title
                if section != entry['procedures'] or level != 3:
                    continue
                with self.subTest(file=path.name, operation=title):
                    end = next((i for i, depth, _ in headings[position + 1:] if depth <= 3), len(lines))
                    body = [lines[i] for i in range(start + 1, end)
                            if not fenced[i] and i not in payload]
                    steps = [(i, name) for i, depth, name in headings
                             if start < i < end and depth == 4 and checker.HEADING_STEP.match(name)]
                    self.assertGreaterEqual(len(title.split()), 2)
                    self.assertTrue(steps, 'operation exposes no heading steps')
                    numbers = [int(checker.HEADING_STEP.match(name)[1]) for _, name in steps]
                    self.assertEqual(numbers, list(range(1, len(numbers) + 1)))
                    self.assertFalse(any(re.match(r'^\d+\. ', line) for line in body))
                    self.assertFalse(any(re.match(r'^\*\*(?:Inputs|Outputs):', line) for line in body))
                    contracts = [(target, role) for i, target, role, _ in checker.role_links(lines, fenced)
                                 if start < i < end and (i in payload or not checker.HEADING.match(lines[i]))]
                    inputs = {target for target, role in contracts if role == 'input'}
                    arguments = [(match[2], checker.link_role(match)) for i in range(start + 1, end)
                                 if i in payload for match in checker.ARGUMENT_LINK.finditer(lines[i])]
                    self.assertTrue(all(role in ('input', 'output', 'operation') for _, role in arguments),
                                    'an executable annotation has no role')
                    self.assertLessEqual({target for target, role in arguments if role == 'input'}, inputs)
                    self.assertTrue(any(role == 'output' for _, role in contracts))
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
            cited |= set(checker.LINK.findall((ROOT / name).read_text()))
        for folder in folders:
            for path in sorted((ROOT / folder).glob('*.md')):
                cited |= set(checker.LINK.findall(path.read_text()))
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
        """Scripts are invoked by cited executable sections or imported by
        scripts invoked there. Literal specimens supply no executable reach."""
        paths = sorted(ROOT.rglob('*.md'))
        run = executable_scripts(paths)
        self.assertTrue(run, "installed declarations expose no script invocation")
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

    def test_script_reach_requires_the_installed_command_declaration(self):
        paths = sorted(ROOT.rglob('*.md'))
        self.assertIn('sync', executable_scripts(paths))
        installed = checker.contract

        def without_html(path, cache):
            entry = dict(installed(path, cache) or {})
            entry.pop('commands', None)
            return entry

        with mock.patch.object(checker, 'contract', side_effect=without_html):
            self.assertFalse(executable_scripts(paths))

    def test_script_reach_excludes_specimens_and_unexecuted_blocks(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = Path(directory)
            (fixture / 'structure.json').write_text(json.dumps({'artifacts': {
                'sections': ['Operations', 'Fields'], 'procedures': 'Operations',
                'steps': 'headings', 'commands': 'inline-html',
            }}))
            path = fixture / 'artifacts/control.md'
            path.parent.mkdir()
            path.write_text("""# Script Evidence

## Operations

### Run Selected Tool

#### 1. Invoke Selected Tool

Apply [Run Selected Tool](#run-selected-tool).

<big><pre>python3 skills/work-planner/scripts/live.py</pre></big>

````markdown
<big><pre>python3 skills/work-planner/scripts/literal.py</pre></big>
````

## Fields

### Example

<big><pre>python3 skills/work-planner/scripts/unexecuted.py</pre></big>
""")
            self.assertEqual(executable_scripts([path]), {'live'})

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
    r'\b[Aa]pply\s+\[Record Epic Delivery\]\(')


class EpicDeliveryCallers(unittest.TestCase):
    """Sync Epic reads the long-lived branch names at the epic's bases, so a
    call to Record Epic Delivery without them never reports an epic closable."""

    def calls(self):
        found = []
        for path in sorted(ROOT.rglob('*.md')):
            lines, fenced, headings = checker.scan(path)
            steps = checker.procedure_spans(lines, fenced, headings, checker.contract(path, {}))
            payload = checker.scan_blocks(lines).html_lines
            for index, line in enumerate(lines):
                if index in steps and not fenced[index] and index not in payload and RECORD_EPIC_DELIVERY.search(line):
                    found.append((f'{path.relative_to(ROOT)}:{index + 1}', line))
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
                self.assertIn('epic bases', checker.LINK.sub(lambda match: match[0][1:match[0].index(']')], line).lower())

    def test_record_epic_delivery_takes_the_epic_bases(self):
        path = ROOT / 'artifacts' / 'epic-issue-body.md'
        lines, _, headings = checker.scan(path)
        start = next(i for i, level, title in headings
                     if level == 3 and checker.anchor_of(title) == 'record-epic-delivery')
        end = checker.heading_end(headings, start, 3, len(lines))
        section = '\n'.join(lines[start + 1:end])
        for target in checker.LINK.findall(section):
            if target.startswith('#') and checker.field_contract(path, target, 'Fields'):
                contract_start = next(i for i, level, title in headings
                                      if level == 3 and checker.anchor_of(title) == target[1:])
                contract_end = checker.heading_end(headings, contract_start, 3, len(lines))
                section += '\n' + '\n'.join(lines[contract_start + 1:contract_end])
        self.assertIn('fetched epic bases', section)
        self.assertIn('`--revision`', section)

    def test_a_report_of_the_operation_is_not_a_call(self):
        self.assertIsNone(RECORD_EPIC_DELIVERY.search(
            'When [Record Epic Delivery](x.md) reports an epic base unmerged'))
        self.assertIsNone(RECORD_EPIC_DELIVERY.search(
            'When the preceding Record Epic Delivery call reports a row done'))
        for verb in ('Run', 'Re-run', 'Repeat', 'Repeating'):
            self.assertIsNone(RECORD_EPIC_DELIVERY.search(
                f'{verb} [Record Epic Delivery](x.md) with the saved epic.'))
        self.assertIsNotNone(RECORD_EPIC_DELIVERY.search(
            'Apply [Record Epic Delivery](x.md) with the saved epic bases.'))
