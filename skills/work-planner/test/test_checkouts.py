"""Each command acting on its checkout is run in a named one.

A command whose block runs git or GitNexus where it stands acts on whichever
checkout it runs in: the same merge lands on an epic base or on a unit's task
branch depending only on the directory. The skill names its checkouts once, in the
common Conventions, and the tests here hold every call to that
vocabulary.

- A command running git or GitNexus in its working directory declares that it acts on
  the checkout it runs in, and a command taking its checkout as an argument
  does not.
- An artifact operation declares no checkout of its own. One whose steps run
  an acting command acts on a checkout too, so every call to either names one
  from the vocabulary on the line that makes it.
- Each mode and protocol declares the checkout it runs in under its opening
  paragraph, and a procedure subsection declares its own only where it
  differs from its file's.
- A call naming a checkout other than its procedure's passes it: the
  operation called names that checkout in contextual input links, the protocol or
  mode called runs in it, or the command called acts wherever it is run.

The walk reads the citation graph the skill check builds, so a call is a link
inside a procedure step.
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

ACTS_ON = '**Acts on:** the checkout it runs in.'
RUNS_IN = re.compile(r'^\*\*Runs in:\*\* the (.+) checkout\.$')
WHERE_IT_STANDS = re.compile(r'^\s*(git (?!-C )|gitnexus )')
VOCABULARY_LEAD = re.compile(r'^(\s*)- \*\*Checkouts\.\*\*')
VOCABULARY_ENTRY = re.compile(r'^\s+- `([^`]+)`')
PROCEDURE_FOLDERS = ('modes', 'protocols')


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

    def lead(self, start):
        """The lines between a heading and the heading after it."""
        following = next((index for index, _, _ in self.headings if index > start), len(self.lines))
        return [self.lines[index] for index in range(start + 1, following)
                if not self.fenced[index] and index not in self.blocks.html_lines]

    def declared(self, start):
        """The checkout a heading's own lead declares it runs in."""
        for line in self.lead(start):
            if match := RUNS_IN.match(line.strip()):
                return match[1]
        return None

    def inputs(self, start):
        """Input names and owning Field definitions inside this operation's steps."""
        _, end, _, _ = self.spans[start]
        contracts = []
        for index in range(start + 1, end):
            if index not in self.steps or self.fenced[index] or index in self.blocks.html_lines:
                continue
            for match in checker.LINK.finditer(checker.CODE_SPAN.sub('', self.lines[index])):
                if checker.link_role(match) != 'input':
                    continue
                name, _, fragment = match[1].partition('#')
                destination = (self.path.parent / name).resolve() if name else self.path
                if not checker.field_contract(self.path, match[1], 'Fields'):
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

    def runs_in(self, index):
        """The checkout the procedure holding a line runs in: the nearest
        declaration on a heading that encloses it."""
        for start in self.enclosing(index):
            if found := self.declared(start):
                return found
        return None

    def section(self, index, level):
        """The heading of the given level holding a line."""
        return next((start for start in self.enclosing(index) if self.spans[start][2] == level), None)

    def commands(self):
        """Executing HTML operations and their working-directory declarations."""
        if self.entry.get('commands') != 'inline-html':
            return
        operations = {}
        for first, last in self.blocks.invocations:
            if first not in self.steps:
                continue
            start = self.section(first, 3)
            if start is not None:
                payload = '\n'.join(self.lines[first:last + 1]).strip()
                payload = payload.removeprefix('<big><pre>').removesuffix('</pre></big>')
                operations.setdefault(start, []).extend(payload.splitlines())
        for start, payload in operations.items():
            _, end, _, title = self.spans[start]
            bare = any(WHERE_IT_STANDS.match(line) for line in payload)
            declares = any(self.lines[index].strip() == ACTS_ON
                           for index in range(start + 1, end)
                           if not self.fenced[index] and index not in self.blocks.html_lines)
            yield start, title, bare, declares

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
            for start, title, bare, declares in document.commands():
                if bare or declares:
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

    def accepts(self, destination, anchor, checkout):
        """Whether a section called with a checkout takes it: a command acts
        wherever it is run, an operation names it in contextual input links, and a
        procedure runs in it."""
        if (destination, anchor) in self.commands:
            return True
        document = self.documents.get(destination)
        if document is None:
            return False
        if not anchor:
            return bool(document.headings) and document.declared(document.headings[0][0]) == checkout
        start = document.anchors.get(anchor)
        if start is None:
            return False
        if document.declared(start) == checkout:
            return True
        return f'{checkout} checkout' in document.inputs(start).lower()


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

    def test_only_executing_html_supplies_command_and_declaration_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'artifacts/control.md'
            path.parent.mkdir()
            path.write_text("""# Checkout Evidence

## Operations

### Inspect Current Checkout

#### 1. Inspect Current State

**Acts on:** the checkout it runs in.

<big><pre>
git status
# Opaque Payload Heading
</pre></big>

### Inspect Explicit Checkout

#### 1. Inspect Supplied State

<big><pre>git -C '/tmp/control' status</pre></big>

### Inspect Undeclared Checkout

#### 1. Inspect Undeclared State

<big><pre>
**Acts on:** the checkout it runs in.
git status
</pre></big>

### Unexecuted Operation

<big><pre>git status</pre></big>

## Fields

### Template

````markdown
### Literal Command Operation

#### 1. Inspect Literal State

**Acts on:** the checkout it runs in.

<big><pre>git status</pre></big>
````

### Unexecuted Field

<big><pre>git status</pre></big>
""")
            document = Document(path, {'sections': ['Operations', 'Fields'],
                                       'procedures': 'Operations', 'steps': 'headings',
                                       'commands': 'inline-html'})
            commands = {title: (bare, declares) for _, title, bare, declares in document.commands()}
            self.assertEqual(commands, {
                'Inspect Current Checkout': (True, True),
                'Inspect Explicit Checkout': (False, False),
                'Inspect Undeclared Checkout': (True, False),
            })

    def test_inputs_require_contextual_step_prose(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'artifacts/control.md'
            path.parent.mkdir()
            content = '\n'.join([
                '# Contextual Input', '', '## Operations', '', '### Inspect Supplied State', '',
                '[Review Checkout](#review-checkout "○")', '', '#### 1. Inspect Checkout', '',
                'Inspect the supplied state.', '',
                '```markdown', 'Use [Review Checkout](#review-checkout "○").', '```', '',
                '<big><pre>[Review Checkout](#review-checkout "○")</pre></big>', '',
                'Provide [Review Checkout](#review-checkout "●").', '',
                '## Fields', '', '### Review Checkout', '', 'The review checkout holding the change.', '',
            ])
            entry = {'sections': ['Operations', 'Fields'], 'procedures': 'Operations',
                     'steps': 'headings', 'commands': 'inline-html'}
            path.write_text(content)
            document = Document(path, entry)
            start = document.anchors['inspect-supplied-state']
            self.assertEqual(document.inputs(start), '')
            path.write_text(content.replace('Inspect the supplied state.',
                                            'Inspect [Review Checkout](#review-checkout "○").'))
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
                                       'commands': 'inline-html'})
            self.assertEqual([anchor for _, _, anchor in document.calls()], ['live-target'])


class CheckoutVocabulary(unittest.TestCase):
    def test_conventions_name_the_checkouts(self):
        """The vocabulary every declaration and call draws from."""
        names = vocabulary()
        self.assertTrue(names, 'conventions.md states no Checkouts')
        self.assertEqual(len(names), len(set(names)))


class CommandsActingOnTheirCheckout(unittest.TestCase):
    def test_a_command_running_git_where_it_stands_declares_it(self):
        """Git without `-C`, and GitNexus, act on the working directory, so the command
        says so; one naming its checkout as an argument does not."""
        for path, document in documents().items():
            for start, title, bare, declares in document.commands():
                with self.subTest(file=document.name, command=title):
                    self.assertEqual(declares, bare,
                                     f'{document.name}: {title} runs git where it stands'
                                     if bare else f'{document.name}: {title} declares a '
                                     'checkout but runs no git where it stands')

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


class ProceduresDeclaringTheirCheckout(unittest.TestCase):
    def test_each_mode_and_protocol_declares_where_it_runs(self):
        names = vocabulary()
        for folder in PROCEDURE_FOLDERS:
            for path in sorted((ROOT / folder).glob('*.md')):
                document = Document(path)
                with self.subTest(file=document.name):
                    self.assertTrue(document.headings)
                    self.assertIn(document.declared(document.headings[0][0]), names,
                                  f'{document.name} declares no checkout from the vocabulary')

    def test_a_subsection_declares_only_a_differing_checkout(self):
        """A subsection's declaration names a checkout from the vocabulary,
        and one restating its file's would add nothing."""
        names = vocabulary()
        for path, document in documents().items():
            if path.parent.name not in PROCEDURE_FOLDERS:
                continue
            outer = document.declared(document.headings[0][0]) if document.headings else None
            for start, level, title in document.headings[1:]:
                found = document.declared(start)
                if found is None:
                    continue
                with self.subTest(file=document.name, section=title):
                    self.assertIn(found, names)
                    self.assertNotEqual(found, outer,
                                        f'{document.name}: {title} restates its file\'s checkout')

    def test_an_artifact_declares_no_checkout(self):
        """An operation runs where its caller names, so it carries none."""
        for path, document in documents().items():
            if path.parent.name != 'artifacts':
                continue
            for start, level, title in document.headings:
                with self.subTest(file=document.name, section=title):
                    self.assertIsNone(document.declared(start))


class CallsIntoAnotherCheckout(unittest.TestCase):
    def test_a_call_into_another_checkout_passes_it(self):
        """A call naming a checkout other than its procedure's hands it over:
        the operation takes it in contextual input links, the procedure runs in it, or
        the command acts wherever it is run. A call to a procedure running
        elsewhere names that checkout."""
        corpus = Corpus()
        lines = {}
        for document, index, destination, anchor in corpus.calls():
            lines.setdefault((document.path.resolve(), index), []).append((destination, anchor))
        for (path, index), callees in lines.items():
            document = corpus.documents[path]
            own = document.runs_in(index)
            if own is None:
                continue
            where = f'{document.name}:{index + 1}'
            line = document.lines[index]
            for checkout in sorted(named(line, corpus.names) - {own}):
                with self.subTest(call=where, checkout=checkout):
                    self.assertTrue(
                        any(corpus.accepts(destination, anchor, checkout)
                            for destination, anchor in callees),
                        f'{where} names the {checkout} checkout, which '
                        f'{", ".join(corpus.title(d, a) for d, a in callees)} does not take')
            for destination, anchor in callees:
                callee = corpus.documents.get(destination)
                if callee is None or anchor or destination.parent.name not in PROCEDURE_FOLDERS:
                    continue
                theirs = callee.declared(callee.headings[0][0]) if callee.headings else None
                if theirs and theirs != own:
                    with self.subTest(call=where, callee=callee.name):
                        self.assertIn(f'the {theirs} checkout', line,
                                      f'{where} runs {callee.name} in the {theirs} checkout '
                                      'without naming it')


if __name__ == '__main__':
    unittest.main()
