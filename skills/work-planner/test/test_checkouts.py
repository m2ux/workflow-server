"""Checkout-sensitive commands consume linked input contracts.

The citation graph follows actual procedural calls to their command owners.
Every git or GitNexus command that depends on its working directory has a
checkout input, and callers select a checkout from the shared vocabulary.
Literal examples and field/output citations establish no execution context.
"""
import re
import sys
import tempfile
import unittest
from unittest import mock
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

WHERE_IT_STANDS = re.compile(r'^\s*(git (?!-C )|gitnexus )')
VOCABULARY_LEAD = re.compile(r'^(\s*)- \*\*Checkouts\.\*\*')
VOCABULARY_ENTRY = re.compile(r'^\s+- `([^`]+)`')


def vocabulary():
    """The checkout names the common Conventions state."""
    lines = (ROOT / 'conventions.md').read_text().splitlines()
    names = []
    for position, line in enumerate(lines):
        if not (lead := VOCABULARY_LEAD.match(line)):
            continue
        for entry in lines[position + 1:]:
            if entry.strip() and len(entry) - len(entry.lstrip()) <= len(lead[1]):
                break
            if match := VOCABULARY_ENTRY.match(entry):
                names.append(match[1])
    return names


class Document:
    """One markdown file of the skill, with its headings' spans and steps."""

    def __init__(self, path, entry=None):
        self.path = path
        self.lines, self.fenced, self.headings = checker.scan(path)
        entry = checker.contract(path, {}) if entry is None else entry
        self.entry = entry or {}
        self.steps = checker.procedure_spans(self.lines, self.fenced, self.headings, entry)
        self.blocks = checker.scan_blocks(self.lines)
        self.spans = {}
        for position, (start, level, title) in enumerate(self.headings):
            end = next((index for index, depth, _ in self.headings[position + 1:]
                        if depth <= level), len(self.lines))
            self.spans[start] = (start, end, level, title)
        self.anchors = {checker.anchor_of(title): start for start, _, title in self.headings}

    @property
    def name(self):
        return str(self.path.relative_to(ROOT))

    def inputs(self, start):
        """Input names and owning Fields in this command specification."""
        _, end, _, _ = self.spans[start]
        contracts = []
        for index, target, role, _ in checker.role_links(self.lines, self.fenced):
            if not (start < index < end) or role != 'input':
                continue
            if index not in self.blocks.html_lines and checker.HEADING.match(self.lines[index]):
                continue
            name, _, fragment = target.partition('#')
            destination = (self.path.parent / name).resolve() if name else self.path
            if not checker.field_contract(self.path, target, 'Fields'):
                continue
            lines, _, headings = checker.scan(destination)
            first, depth, title = next((i, d, t) for i, d, t in headings
                                      if checker.anchor_of(t) == fragment)
            last = checker.heading_end(headings, first, depth, len(lines))
            contracts.append(title + '\n' + '\n'.join(lines[first + 1:last]))
        return '\n'.join(contracts)


    def enclosing(self, index):
        """The headings holding a line, innermost first."""
        held = [(start, level) for start, (_, end, level, _) in self.spans.items()
                if start < index < end]
        return [start for start, _ in sorted(held, key=lambda item: -item[1])]

    def section(self, index, level):
        """The heading of the given level holding a line."""
        return next((start for start in self.enclosing(index) if self.spans[start][2] == level), None)

    def commands(self):
        """Named command specifications and their linked checkout inputs."""
        if self.entry.get('commands') != 'html':
            return
        operations = {}
        specifications = checker.specification_spans(self.headings, len(self.lines), checker.held_section(self.entry))
        for first, last in self.blocks.invocations:
            if first not in specifications:
                continue
            start = self.section(first, 3)
            if start is not None:
                payload = '\n'.join(self.lines[first:last + 1]).strip()
                payload = payload.removeprefix('<big><pre>').removesuffix('</pre></big>')
                operations.setdefault(start, []).extend(checker.logical_command_lines(payload))
        for start, payload in operations.items():
            _, end, _, title = self.spans[start]
            bare = any(WHERE_IT_STANDS.match(line) for line in payload)
            checkout_input = bool(re.search(r'\bcheckout\b', self.inputs(start), re.I))
            yield start, title, bare, checkout_input

    def calls(self):
        """Each link a procedure step carries, with its destination."""
        for index, target, kind in checker.citation_kinds(self.path, self.entry):
            if index not in self.steps or kind != checker.STEP:
                continue
            name, _, fragment = target.partition('#')
            destination = (self.path.parent / name).resolve() if name else self.path
            yield index, destination, checker.anchor_of(fragment) if fragment else ''


def documents():
    return {path.resolve(): Document(path) for path in sorted(ROOT.rglob('*.md'))
            if 'test' not in path.relative_to(ROOT).parts}


def named(line, names):
    """The vocabulary checkouts a line names, as `the <name> checkout`."""
    visible = checker.LINK.sub(lambda match: match[0][1:match[0].index(']')], line).lower()
    return {name for name in names if f'the {name} checkout' in visible}


class Corpus:
    """The skill's documents and the sections that act on a checkout."""

    def __init__(self):
        self.names = vocabulary()
        self.documents = documents()
        self.commands = set()
        for path, document in self.documents.items():
            for start, title, bare, checkout_input in document.commands():
                if bare:
                    self.commands.add((path, checker.anchor_of(title)))
        self.acting = set(self.commands)
        changed = True
        while changed:
            changed = False
            for path, document in self.documents.items():
                if path.parent.name != 'artifacts':
                    continue
                for index, destination, anchor in document.calls():
                    operation = document.section(index, 3)
                    if operation is None or (destination, anchor) not in self.acting:
                        continue
                    key = (path, checker.anchor_of(document.spans[operation][3]))
                    if key not in self.acting:
                        self.acting.add(key)
                        changed = True

    def calls(self):
        for path, document in self.documents.items():
            for index, destination, anchor in document.calls():
                yield document, index, destination, anchor

    def title(self, destination, anchor):
        document = self.documents.get(destination)
        if document is None:
            return f'{destination.name}#{anchor}'
        if not anchor:
            return document.name
        start = document.anchors.get(anchor)
        return document.spans[start][3] if start is not None else anchor

    def accepts(self, destination, anchor, checkout, visited=None):
        """Whether the selected capability reaches a command input for this checkout."""
        visited = set() if visited is None else visited
        key = (destination, anchor)
        if key in visited:
            return False
        visited.add(key)
        document = self.documents.get(destination)
        if document is None:
            return False
        start = document.anchors.get(anchor) if anchor else document.headings[0][0]
        if start is None:
            return False
        if anchor and checker.command_target(document.path, '#' + anchor):
            inputs = document.inputs(start).lower()
            return bool(re.search(re.escape(checkout) + r' (?:checkout|worktree)\b', inputs)
                        or re.search(r'^checkout$', inputs, re.M))
        end = document.spans[start][1]
        return any(self.accepts(target, fragment, checkout, visited)
                   for index, target, fragment in document.calls() if start < index < end)


class ExecutingCheckoutEvidence(unittest.TestCase):
    def test_actual_graph_commands_and_transitive_calls_are_present(self):
        corpus = Corpus()
        graph = (ROOT / 'artifacts/repository-graph.md').resolve()
        self.assertIn((graph, 'index-status'), corpus.commands)
        self.assertIn((graph, 'index-repository'), corpus.commands)
        self.assertIn((graph, 'measure-repository-change'), corpus.acting)
        self.assertTrue(any(destination == graph and anchor == 'measure-repository-change'
                            for _, _, destination, anchor in corpus.calls()))

    def test_installed_declaration_selects_execution_steps(self):
        path = ROOT / 'artifacts/repository-graph.md'
        self.assertTrue(Document(path).steps)
        self.assertTrue(list(Document(path).commands()))
        with mock.patch.object(checker, 'contract', return_value=None):
            self.assertFalse(Document(path).steps)
            self.assertFalse(list(Document(path).commands()))
        installed = checker.contract

        def without_html(path, cache):
            entry = dict(installed(path, cache) or {})
            entry.pop('commands', None)
            return entry

        with mock.patch.object(checker, 'contract', side_effect=without_html):
            self.assertTrue(Document(path).steps)
            self.assertFalse(list(Document(path).commands()))

    def test_named_commands_use_input_contracts_as_checkout_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'artifacts/control.md'
            path.parent.mkdir()
            path.write_text("""# Checkout Evidence

Use [Checkout](#checkout "○").

## Commands

### Inspect Current Checkout

Use [Checkout](#checkout "○").

<big><pre>
git status
# Opaque Payload Heading
</pre></big>

### Inspect Explicit Checkout

<big><pre>git -C '/tmp/control' status</pre></big>

### Inspect Unbound Checkout

```markdown
Use [Checkout](#checkout "○").
```

<big><pre>
git status
</pre></big>

## Operations

### Unexecuted Operation

<big><pre>git status</pre></big>

## Fields

### Template

````markdown
### Literal Command Operation

#### 1. Inspect Literal State

Use [Checkout](#checkout "○").

<big><pre>git status</pre></big>
````

### Unexecuted Field

<big><pre>git status</pre></big>

### Checkout

The selected working checkout.
""")
            document = Document(path, {'sections': ['Operations', 'Fields'],
                                       'procedures': 'Operations', 'steps': 'headings',
                                       'commands': 'html', 'specifications': 'Commands'})
            commands = {title: (bare, checkout_input) for _, title, bare, checkout_input in document.commands()}
            self.assertEqual(commands, {
                'Inspect Current Checkout': (True, True),
                'Inspect Explicit Checkout': (False, False),
                'Inspect Unbound Checkout': (True, False),
            })

    def test_inputs_require_actual_step_prose_or_command_annotations(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'artifacts/control.md'
            path.parent.mkdir()
            content = '\n'.join([
                '# Contextual Input', '', '## Commands', '', '### Inspect Supplied State', '',
                'Inspect supplied checkout state.', '',
                'Inspect the supplied state.', '',
                '```markdown', 'Use [Review Checkout](#review-checkout "○").', '```', '',
                '<big><pre>inspect</pre></big>', '',
                'Provide [Review Checkout](#review-checkout "●").', '',
                '## Fields', '', '### Review Checkout', '', 'The review checkout holding the change.', '',
            ])
            entry = {'sections': ['Operations', 'Fields'], 'procedures': 'Operations',
                     'steps': 'headings', 'commands': 'html', 'specifications': 'Commands'}
            path.write_text(content)
            document = Document(path, entry)
            start = document.anchors['inspect-supplied-state']
            self.assertEqual(document.inputs(start), '')
            path.write_text(content.replace('Inspect the supplied state.',
                                            'Inspect [Review Checkout](#review-checkout "○").'))
            document = Document(path, entry)
            self.assertIn('review checkout', document.inputs(start).lower())
            path.write_text(content.replace('Inspect the supplied state.',
                                            '<big><pre>inspect --checkout [**checkout**](#review-checkout "○")</pre></big>'))
            document = Document(path, entry)
            self.assertIn('review checkout', document.inputs(start).lower())

    def test_calls_follow_heading_steps_and_exclude_literal_and_lead_links(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'artifacts/control.md'
            path.parent.mkdir()
            path.write_text("""# Call Evidence

## Operations

### Inspect Current Checkout

[Unexecuted lead](#lead-target)

#### 1. Inspect Current State

Apply [Inspect Live Target](#live-target) in the review checkout.

````markdown
Apply [Inspect Literal Target](#literal-target) in the review checkout.
````

<big><pre>
[Opaque payload](#payload-target)
</pre></big>

## Fields

### Reference

[Unexecuted field](#field-target)
""")
            document = Document(path, {'sections': ['Operations', 'Fields'],
                                       'procedures': 'Operations', 'steps': 'headings',
                                       'commands': 'html', 'specifications': 'Commands'})
            self.assertEqual([anchor for _, _, anchor in document.calls()], ['live-target'])


class CheckoutVocabulary(unittest.TestCase):
    def test_conventions_name_the_checkouts(self):
        """The vocabulary every checkout-selecting call draws from."""
        names = vocabulary()
        self.assertTrue(names, 'conventions.md states no Checkouts')
        self.assertEqual(len(names), len(set(names)))


class CommandsActingOnTheirCheckout(unittest.TestCase):
    def test_working_directory_commands_link_their_checkout_input(self):
        for path, document in documents().items():
            for start, title, bare, checkout_input in document.commands():
                if bare:
                    with self.subTest(file=document.name, command=title):
                        self.assertTrue(checkout_input, f'{document.name}: {title} lacks a checkout input')

    def test_each_call_to_an_acting_section_names_a_checkout(self):
        """A call to an acting command, or to an operation reaching one,
        names the checkout it runs in, so the directory is never implied."""
        corpus = Corpus()
        self.assertTrue(corpus.commands, 'no command acts on its checkout')
        for document, index, destination, anchor in corpus.calls():
            if (destination, anchor) not in corpus.acting:
                continue
            caller = document.section(index, 3) or document.section(index, 2)
            where = f'{document.name}:{index + 1}'
            label = document.spans[caller][3] if caller is not None else document.name
            with self.subTest(call=where):
                self.assertTrue(named(document.lines[index], corpus.names),
                                f'{where} {label} calls {corpus.title(destination, anchor)} '
                                'naming no checkout')


class SelectedCheckoutContracts(unittest.TestCase):
    def test_checkout_roles_follow_command_and_transitive_input_contracts(self):
        corpus = Corpus()
        graph = (ROOT / 'artifacts/repository-graph.md').resolve()
        branches = (ROOT / 'artifacts/delivery-branches.md').resolve()
        for anchor in ('index-status', 'measure-repository-change'):
            with self.subTest(operation=anchor):
                self.assertTrue(corpus.accepts(graph, anchor, 'review'))
                self.assertFalse(corpus.accepts(graph, anchor, 'unit'))
        self.assertTrue(corpus.accepts(branches, 'push-task-branch', 'unit'))
        self.assertFalse(corpus.accepts(branches, 'push-task-branch', 'project'))

    def test_selected_checkouts_reach_accepting_command_inputs(self):
        corpus = Corpus()
        lines = {}
        for document, index, destination, anchor in corpus.calls():
            if checker.operation_target(document.path, str(destination) + ('#' + anchor if anchor else '')):
                lines.setdefault((document.path.resolve(), index), []).append((destination, anchor))
        for (path, index), callees in lines.items():
            document = corpus.documents[path]
            for checkout in sorted(named(document.lines[index], corpus.names)):
                with self.subTest(call=f'{document.name}:{index + 1}', checkout=checkout):
                    self.assertTrue(any(corpus.accepts(destination, anchor, checkout)
                                        for destination, anchor in callees),
                                    f'{document.name}:{index + 1} selects the {checkout} checkout '
                                    'without an accepting command input')


if __name__ == '__main__':
    unittest.main()
