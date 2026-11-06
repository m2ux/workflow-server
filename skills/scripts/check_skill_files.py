"""Check a skill's markdown against the shared skill guidelines.

Resolution and layout are checked together because a reader meets them
together: a link that resolves to nothing and a bullet that swallowed its
code fence both cost the reader the content they were promised.

Fenced blocks and code spans hold specimen text, so a link inside one is a
placeholder rather than a reference, and a heading inside one belongs to the
template it illustrates rather than to the document. HTML invocations hold
executable command text: their payload is opaque to Markdown headings and
fences, while bold argument links are actual contract references. A
template's `{{...}}` stands for text the author supplies, so it is measured where it lands rather
than here.

Placement is judged by use. A command specification belongs to the procedure
that runs it, so a specification exactly one file cites, that file not the
one holding it, names a caller it should be sitting in. One test decides
every citing file alike, the file holding the specification included: a file
is a caller where a procedure of it carries the citation. The selected model
identifies execution steps: numbered list items in the shared model, or
numbered headings under a declared procedure section. The
step is the author stating what the reader performs and in which order.
Prose runs nothing whatever its mood, order or count, so a sibling specification, a statement
of what a command does, and a sentence routing three commands in sequence
all name a command without running it. A skill's entry point holds no
command of its own, so a
specification standing there is reported wherever it is cited from. A
specification no procedure runs has no caller to place it, so it stays with
the subject of the file whose prose or sibling specification names it; one
nothing cites has no reader, and is reported whatever structure holds it.

Reach is a second relation over the same citations. A citation is required
where the reader must load its target to carry on: a procedure's step, a
command specification's own text, and a prerequisite, whether a canonical
prerequisite sentence or a file's Prerequisites section. A specification
citing another command needs it to run, so its file reaches that command
without becoming its caller. Placement reads callers alone; reach decides
what a scenario reads, which a retrieval walk measures.

The top-level sections of a file carrying a procedure are the set the guidelines
name, in the order they name them, Procedure among them, so the reader knows
what the file carries before opening it. An explicit entry-point contract
selects its section set; an entry point with none takes the shared set. Any
other file carrying no procedure keeps its own shape.

A skill that adds directories of its own declares what they carry in its
`structure.json`, keyed by an exact file name, a directory name or a
`*suffix` its filenames end with. An entry states the sections those files
may take, in order, which
of them are required, the section holding their command specifications, and
whether a specification there belongs to its file whatever cites it. An
explicit file-name entry selects that file before its directory or suffix
entry; an entry point's section set takes only its explicit file entry. A
file no entry covers takes the shared set. Heading-based entries declare
`steps: "headings"` and their `procedures` section. `commands: "html"`
selects enriched HTML invocations in the declared command specifications.
`contracts: "Fields"` selects command input/output links whose targets are
third-level Fields contracts. Procedures route calls and results; each
command specification owns its complete contextual I/O contract.
`link_roles: true` checks the ○, ● and ƒ link titles.
`preamble` lists required intro link targets; `calls` maps target directory
names to Apply or Follow. Malformed and unknown options fail declaration
validation before a partial model can run.
Each declared option has one validator; the parser preserves invocation
payload and reads its bold argument links as required contract citations.

A prerequisite citation is recognised by the canonical form the guidelines
state, `Read [Name](target) first.`, which separates it from a selection
link naming the next operation. A selection link points wherever its target
sits; a prerequisite citation names a section the reader must already hold,
so its target belongs in another file.

The skill-wide checks read what a skill declares rather than guessing from
its prose. A mode reaches command specifications by their names; HTML command
payloads sit within those specifications. A skill's `vocabulary.json`
names the terms its concepts retire, and each retired term is reported. A
skill's guide repeating a shared rule's label in a section of the same title
states one convention twice. A specification sending GraphQL states its REST
gap, and Projects (classic) is reported wherever it stands. Each labelled
rule of a guide names, in the `rules.json` beside it, the finding kinds or
the review that decide it, and the kinds are those this check registers.

Sibling sections whose titles end in one word state one kind of thing, so
they open in one mood, judged from the first words of each opening sentence.

A move is judged between two revisions rather than in one tree, so
`--compare <base> <head>` reads the named skill folders from git at each and
compares every third-level section's body with its counterpart, reporting
each one that differs other than by a link target.

A run names one skill or more, read together, so a citation crossing from
one into another resolves against the tree it lands in; a skill not named is
not read.

    python3 skills/scripts/check_skill_files.py skills/work-planner
    python3 skills/scripts/check_skill_files.py --compare <base> <head> skills/work-planner
"""

import argparse
import difflib
import html
import json
import re
import shlex
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

FENCE = re.compile(r'^\s*(`{3,}|~{3,})')
RULE = re.compile(r'^\s*(-{3,}|\*{3,}|_{3,})\s*$')
HEADING = re.compile(r'^(#{1,6})\s+(.*)$')
LINK_DESTINATION = r'([^)]+?)(?:\s+"(?:\\.|[^"\\])*")?'
LINK = re.compile(r'\[[^\]]*\]\(' + LINK_DESTINATION + r'\)')
ROLE_TITLES = {'○': 'input', '●': 'output', 'ƒ': 'operation'}
CODE_SPAN = re.compile(r'`[^`]*`')
PLACEHOLDER = re.compile(r'\{\{.*\}\}|\{[a-z_]+\}|^[.…\s]*$')
PREREQUISITE = re.compile(r'Read ((?:\[[^\]]+\]\([^)]+\)(?:,\s*)?)+) first\.')
ORDERED = re.compile(r'^\s{0,3}\d+[.)]\s')
BULLET = re.compile(r'^(\s*)-(\s*)(.*)$')
BOLD_LEAD = re.compile(r'^\s*-\s+\*\*')
BARE_LEAD = re.compile(r'^\s*-\s+\*\*[^*]+\*\*\s*$')
INDENTED = re.compile(r'^\s+\S')
DESCRIPTION = re.compile(r'^description:\s*(.*?)\s*$')
BLOCK_SCALARS = ('>', '>-', '>+', '|', '|-', '|+')
MODE = re.compile(r'^[-*]\s+(\*\*)?\[([^\]]+)\]\([^)]+\)(?(1)\*\*)')
BLOCK_START = re.compile(r'^\s*([-*+]\s|\d+[.)]\s|#|\||>|<|`{3,}|~{3,})')
BARE_LABEL = re.compile(r'^\s*(?:[-*+]\s+|\d+[.)]\s+)?\*\*[^*]+\*\*\s*$')
PROSE_LIMIT = 8
LEAD_WIDTH = 100
SECTIONS = ('Prerequisites', 'Procedure', 'Reference', 'Rules', 'Commands')
ENTRY_SECTIONS = ('Modes', 'Rules', 'Conventions', 'Dependencies')
STRUCTURE = 'structure.json'
VOCABULARY = 'vocabulary.json'
RULES = 'rules.json'
GUIDE = 'guidelines.md'
SHELL = ('', 'bash', 'sh', 'shell', 'zsh', 'console')
RULE_LABEL = re.compile(r'^- \*\*(.+?)\*\*')
SCRIPT = re.compile(r'(?<![\w./-])((?:[\w.-]+/)*scripts/[\w.-]+\.(?:py|sh|js|mjs|ts))')
SCRIPT_SUFFIXES = ('.py', '.sh', '.js', '.mjs', '.ts')
GRAPHQL = re.compile(r'\bapi\s+graphql\b|([\'"])graphql\1')
REST_GAP = re.compile(r'^\s*(?:[-*+]\s+)?\*\*REST gap:\*\*')
# Projects (classic) in every form: its card and column types, each of its
# mutations, its card and column connection fields, its REST routes rooted at
# projects/ or under a repository, organization, user or the authenticated
# user, whether relative or under an API base URL, its GraphQL project field
# called with arguments, and its projects field with or without them. A path
# segment beneath another, such as a board's web link or a local folder, names
# no route, and the V2 names carry their suffix.
API_BASE = r'(?<=api\.github\.com/)|(?<=/api/v3/)'
CLASSIC = re.compile(r'\bProject(?:Card|Column)s?\b'
                     r'|\b(?:(?:add|move|delete|update)Project(?:Card|Column)|(?:create|update|delete|clone)Project'
                     r'|convertProjectCard(?:NoteToIssue)|(?:link|unlink)Repository(?:To|From)Project)\b'
                     r'|\bproject(?:Card|Column)s\b'
                     rf'|(?:{API_BASE}|(?<![\w./}}>-])/?)(?:projects/(?:\d|columns\b|cards\b|[{{<:])|user/(?:projects)\b)'
                     rf'|(?:{API_BASE}|(?<!github\.com/))'
                     r'\b(?:repos/[^/\s]+/[^/\s]+|orgs/[^/\s]+|users/[^/\s]+)/projects\b'
                     r'|\bprojects?\s*\(\s*(?:first|last|after|before|number|orderBy|search|states)\s*:'
                     r'|\bprojects\s*\{')
# Every kind of finding the check reports. A rule's `rules.json` entry names
# the kinds that decide it, or `review` where the read against the guidelines
# does, so a kind outside this set names no operation.
KINDS = (
    'duplicate anchor', 'heading jump',
    'command specification in the entry point', 'command specification with one caller',
    'command specification nothing cites',
    'section outside the set', 'sections out of order', 'section missing',
    'unresolved link', 'unresolved anchor',
    'empty bullet', 'bullet without a space', 'bullet holding a code fence', 'bullet holding a bullet',
    'inline bold lead too wide', 'prerequisite citation inside one file',
    'prose over eight lines', 'trailing blank line',
    'parallel section in another mood', 'heading without content', 'heading without a blank line above',
    'command spelled out in a mode', 'retired term', 'convention in both guides',
    'GraphQL without a REST gap', 'Projects classic interface',
    'house rule no operation decides', 'ambiguous house rule', 'declared rule absent',
    'mode without a trigger phrase', 'hard-wrapped line',
    'list step in heading model', 'indented detail in heading model',
    'heading step sequence', 'procedure without heading steps', 'procedure preamble missing',
    'command contract links', 'operation link role', 'fenced invocation in HTML model', 'malformed HTML invocation',
    'invocation outside command specification', 'invocation argument contract', 'unescaped HTML in invocation', 'operation call verb',
    'unwrapped shell invocation', 'duplicate command parameter prose', 'redundant command wrapper', 'repeated procedure title',
)
OPERATIONS = KINDS + ('review',)


def anchor_of(text):
    """GitHub's slug for a heading, which is what a fragment link must match."""
    return re.sub(r'[\s_]+', '-', re.sub(r'[^\w\s-]', '', text.strip().lower()))


def named(path, root):
    """A path as a finding names it: relative to the root given where it lies
    under it, and whole otherwise, since the roots checked together may have
    different parents and a citation may cross between them."""
    return path.relative_to(root) if path.is_relative_to(root) else path


def scan(path):
    """Each line with the fence state it sits in, and the file's headings."""
    return parse(path.read_text())


@dataclass(frozen=True)
class BlockSpans:
    """The lexical contexts shared by structural, citation and invocation checks."""
    fenced: list[bool]
    invocations: list[tuple[int, int]]
    errors: list[tuple[int, str]]
    openings: list[tuple[int, str]]

    @property
    def html_lines(self):
        return {index for start, end in self.invocations for index in range(start, end + 1)}


def scan_blocks(lines):
    """Fence and HTML boundaries from one lexical state, preserving every input line."""
    fenced, invocations, errors, openings = [], [], [], []
    fence = None
    invocation = None
    for index, line in enumerate(lines):
        if fence:
            fenced.append(True)
            if re.fullmatch(r'\s*' + re.escape(fence[0]) + '{' + str(len(fence)) + r',}\s*', line):
                fence = None
            continue
        opening = re.match(r'^\s*<big><pre>', line)
        closing = re.search(r'</pre></big>\s*$', line)
        if invocation is not None:
            fenced.append(False)
            if opening:
                errors.append((index, 'nested invocation wrapper'))
            if closing:
                invocations.append((invocation, index))
                invocation = None
            continue
        if match := FENCE.match(line):
            fenced.append(True)
            fence = match[1]
            words = line.strip()[len(fence):].split()
            openings.append((index, words[0].lower() if words else ''))
            continue
        fenced.append(False)
        if opening:
            if closing:
                invocations.append((index, index))
            else:
                invocation = index
        elif closing:
            errors.append((index, 'closing invocation wrapper has no opening'))
        elif re.match(r'^\s*<(?:big|pre)(?:\s[^>]*)?>', line, re.I):
            errors.append((index, 'expected <big><pre>'))
    if invocation is not None:
        errors.append((invocation, 'invocation wrapper is not closed'))
        invocations.append((invocation, len(lines) - 1))
    return BlockSpans(fenced, invocations, errors, openings)


def parse(text):
    """Unchanged text lines, Markdown-fence state and headings outside command payload."""
    lines = text.splitlines()
    blocks = scan_blocks(lines)
    commands = blocks.html_lines
    headings = [(index, len(match.group(1)), match.group(2))
                for index, line in enumerate(lines)
                if not blocks.fenced[index] and index not in commands and (match := HEADING.match(line))]
    return lines, blocks.fenced, headings


def frontmatter(lines):
    """Line indices of a leading YAML block, whose delimiters are not rules."""
    if not lines or lines[0].strip() != '---':
        return set()
    for index, line in enumerate(lines[1:], 1):
        if line.strip() == '---':
            return set(range(index + 1))
    return set()


def targets(path, lines, fenced):
    """Ordinary Markdown links and bold HTML argument targets, with their source lines."""
    commands = scan_blocks(lines).html_lines
    for index, line in enumerate(lines):
        if fenced[index]:
            continue
        found = ([match[2] for match in ARGUMENT_LINK.finditer(line)] if index in commands
                 else LINK.findall(CODE_SPAN.sub('', line)))
        for target in found:
            if '://' in target or target.startswith('mailto:') or PLACEHOLDER.search(target):
                continue
            yield index, target


def structure_at(directory, cache):
    """The structure governing a directory, from the nearest `structure.json`
    at or above it, so a skill's contract reaches its files whether the check
    is given the skill, the tree holding it, or one directory of it. A tree
    with none gives an empty structure."""
    if directory not in cache:
        path = directory / STRUCTURE
        if path.is_file():
            cache[directory] = loaded(path)
        elif directory.parent == directory:
            cache[directory] = {}
        else:
            cache[directory] = structure_at(directory.parent, cache)
    return cache[directory]


def loaded(path):
    """One structure file, refused whole where an entry states no sections,
    since a contract that names none would pass every file it covers."""
    try:
        structure = json.loads(path.read_text())
    except json.JSONDecodeError as error:
        raise ValueError(f'{path}: {error}') from error
    if not isinstance(structure, dict):
        raise ValueError(f'{path}: structure must be an object')
    for key, entry in structure.items():
        validate_structure_entry(path, key, entry)
    return structure


def validate_structure_entry(path, key, entry):
    """A complete typed file contract, refused before any selected file is checked."""
    if not isinstance(entry, dict) or not entry.get('sections'):
        raise ValueError(f'{path}: {key} states no sections')
    allowed = {'sections', 'required', 'procedures', 'specifications', 'keeps_commands',
               'steps', 'commands', 'contracts', 'preamble', 'calls', 'link_roles'}
    unknown = set(entry) - allowed
    if unknown:
        raise ValueError(f'{path}: {key} has unknown options: {", ".join(sorted(unknown))}')
    if not key or '*' in key[1:] or key == '*' or '/' in key or key in {'.', '..'}:
        raise ValueError(f'{path}: invalid file selector {key!r}')
    for field in ('sections', 'required', 'preamble'):
        if field not in entry:
            continue
        values = entry[field]
        if (not isinstance(values, list) or not all(isinstance(v, str) and v.strip() for v in values)
                or len(set(values)) != len(values) or (field == 'preamble' and not values)):
            raise ValueError(f'{path}: {key} {field} must be distinct nonempty strings')
    sections = entry['sections']
    if any(value not in sections for value in entry.get('required', ())):
        raise ValueError(f'{path}: {key} requires an undeclared section')
    for field in ('procedures', 'specifications', 'contracts'):
        if field in entry and (not isinstance(entry[field], str) or entry[field] not in sections):
            raise ValueError(f'{path}: {key} {field} must name a declared section')
    if 'link_roles' in entry and not isinstance(entry['link_roles'], bool):
        raise ValueError(f'{path}: {key} link_roles must be boolean')
    if 'keeps_commands' in entry and not isinstance(entry['keeps_commands'], bool):
        raise ValueError(f'{path}: {key} keeps_commands must be boolean')
    for field, value in (('steps', 'headings'), ('commands', 'html')):
        if field in entry and entry[field] != value:
            raise ValueError(f'{path}: {key} {field} must be {value}')
    if entry.get('steps') == 'headings' and not entry.get('procedures'):
        raise ValueError(f'{path}: {key} heading steps need a procedure section')
    if any(field in entry for field in ('commands', 'contracts', 'preamble', 'calls')) and entry.get('steps') != 'headings':
        raise ValueError(f'{path}: {key} procedure options need heading steps')
    if entry.get('commands') == 'html' and not entry.get('specifications'):
        raise ValueError(f'{path}: {key} HTML commands need a specification section')
    if 'calls' in entry:
        calls = entry['calls']
        if (not isinstance(calls, dict) or not calls or not all(
                isinstance(name, str) and name and '/' not in name and verb in ('Apply', 'Follow')
                for name, verb in calls.items())):
            raise ValueError(f'{path}: {key} calls must map target directories to Apply or Follow')


def contract(path, cache):
    """The exact-file, directory or suffix entry covering this file, in that order."""
    structure = structure_at(path.parent, cache)
    if entry := structure.get(path.name):
        return entry
    if entry := structure.get(path.parent.name):
        return entry
    return next((entry for key, entry in structure.items()
                 if key.startswith('*') and path.name.endswith(key[1:])), None)


def specifications(headings, section='commands'):
    """Each command specification: a sub-section of a Commands section, or of a
    listing of a catalog, whose title makes the whole file one. A catalog's
    Conventions section states how its commands run, so it lists none."""
    catalog = any(level == 1 and anchor_of(title) == 'commands' for _, level, title in headings)
    inside = catalog
    for index, level, title in headings:
        if level == 3 and inside:
            yield index, title
        elif level == 2:
            inside = (anchor_of(title) != 'conventions' if catalog
                      else anchor_of(title) == section)
        elif level == 1 and not catalog:
            inside = False


def specification_spans(headings, total, section='commands'):
    """Line indices held by the file's command specifications. A specification
    states how one command runs, so a citation standing in it names a sibling
    operation rather than running it, and its own numbered detail is part of
    that statement."""
    spans = set()
    for start, _ in specifications(headings, section):
        end = next((index for index, level, _ in headings
                    if index > start and level <= 3), total)
        spans.update(range(start, end))
    return spans


def held_section(entry):
    """The section a file's command specifications sit under."""
    return anchor_of((entry or {}).get('specifications', 'Commands'))


def procedure_spans(lines, fenced, headings, entry=None):
    """Execution regions selected by the file model. Heading models use the
    numbered step sections. List models use top-level sections carrying
    numbered steps, excluding command specifications; a declared procedure
    section also holds single-step procedures."""
    if (entry or {}).get('steps') == 'headings':
        return {index for start, level, title, end in procedure_headings(lines, headings, entry)
                if HEADING_STEP.match(title) for index in range(start, end)}
    specifications_here = specification_spans(headings, len(lines), held_section(entry))
    commands = scan_blocks(lines).html_lines
    tops = [index for index, level, _ in headings if level <= 2]
    spans = set()
    for position, start in enumerate(tops):
        end = tops[position + 1] if position + 1 < len(tops) else len(lines)
        body = [index for index in range(start, end) if index not in specifications_here]
        named = (entry or {}).get('procedures')
        if (named and lines[start] == f'## {named}') or any(
                ORDERED.match(lines[index]) and not fenced[index] and index not in commands for index in body):
            spans.update(body)
    return spans


def citations(paths, structures=None):
    """Which files cite each fragment of each file, and which of them run it.
    A file is a caller where a procedure of it carries the citation, and the
    same question is asked of every citing file."""
    structures = {} if structures is None else structures
    cited = {}
    called = {}
    for path in paths:
        for _, target, kind in citation_kinds(path, contract(path, structures)):
            name, _, fragment = target.partition('#')
            if not fragment:
                continue
            destination = (path.parent / name).resolve() if name else path
            anchor = anchor_of(fragment)
            cited.setdefault(destination, {}).setdefault(anchor, set()).add(path)
            if kind == STEP:
                called.setdefault(destination, {}).setdefault(anchor, set()).add(path)
    return cited, called


HEADING_STEP = re.compile(r'^(\d+)\.\s+\S')
ARGUMENT_LINK = re.compile(r'\[\*\*([^*\]\n]+)\*\*\]\(' + LINK_DESTINATION + r'\)')


def heading_end(headings, start, level, total):
    """The boundary before the next sibling or ancestor heading."""
    return next((index for index, depth, _ in headings if index > start and depth <= level), total)


def procedure_headings(lines, headings, entry):
    """Headings inside the declared procedure section, with their boundaries."""
    section = entry.get('procedures')
    for start, level, title in headings:
        if level != 2 or title != section:
            continue
        end = heading_end(headings, start, level, len(lines))
        for index, depth, name in headings:
            if start < index < end:
                yield index, depth, name, heading_end(headings, index, depth, end)


def field_contract(path, target, section):
    """Whether a local heading link names a third-level field contract."""
    name, _, fragment = target.partition('#')
    if not fragment or '://' in name or name.startswith('mailto:'):
        return False
    destination = (path.parent / name).resolve() if name else path
    if not destination.is_file():
        return False
    current = ''
    for _, level, title in scan(destination)[2]:
        if level == 2:
            current = title
        if level == 3 and current == section and anchor_of(title) == anchor_of(fragment):
            return True
    return False


def link_role(match):
    """The semantic role identified by one Markdown link's symbol title."""
    title = re.search(r'\s+"((?:\\.|[^"\\])*)"\)$', match[0])
    return ROLE_TITLES.get(title[1], '') if title else ''


def role_links(lines, fenced):
    """Explicit role links in prose and bold invocation annotations, outside specimens."""
    commands = scan_blocks(lines).html_lines
    for index, line in enumerate(lines):
        if fenced[index]:
            continue
        matches = (ARGUMENT_LINK.finditer(line) if index in commands
                   else LINK.finditer(CODE_SPAN.sub('', line)))
        for match in matches:
            target = match[2] if index in commands else match[1]
            yield index, target, link_role(match), match[0]


def logical_command_lines(payload):
    """Unfold the invocation model’s token-boundary shell continuations."""
    return re.sub(r'\\\n[ \t]*', '', html.unescape(payload)).splitlines()


def command_target(path, target):
    """Whether a heading link names a declared command specification."""
    name, _, fragment = target.partition('#')
    if not fragment or '://' in name or name.startswith('mailto:'):
        return False
    destination = (path.parent / name).resolve() if name else path
    if not destination.is_file() or destination.suffix != '.md':
        return False
    entry = contract(destination, {}) or {}
    return any(anchor_of(title) == anchor_of(fragment)
               for _, title in specifications(scan(destination)[2], held_section(entry)))


def operation_target(path, target):
    """Whether a link selects a callable entry point or named procedure."""
    name, _, fragment = target.partition('#')
    if '://' in name or name.startswith('mailto:'):
        return False
    destination = (path.parent / name).resolve() if name else path
    if not destination.is_file() or destination.suffix != '.md':
        return False
    entry = contract(destination, {}) or {}
    if command_target(path, target):
        return True
    if not fragment:
        return entry.get('procedures') == 'Procedure' and entry.get('steps') == 'headings'
    lines, _, headings = scan(destination)
    for start, depth, title, end in procedure_headings(lines, headings, entry):
        if (depth == 3 and not HEADING_STEP.match(title)
                and anchor_of(title) == anchor_of(fragment)):
            return True
    return fragment == 'procedure' and entry.get('procedures') == 'Procedure'


def link_roles(path, lines, fenced, entry):
    """Role titles select Field contracts or callable operations."""
    if not entry or not (entry.get('link_roles') or entry.get('contracts')):
        return
    for index, target, role, source in role_links(lines, fenced):
        callable_target = operation_target(path, target)
        if entry.get('link_roles') and callable_target and role != 'operation':
            yield index, 'operation link role', source
        elif entry.get('link_roles') and role == 'operation' and not callable_target:
            yield index, 'operation link role', source
        if role in ('input', 'output') and not field_contract(path, target, entry.get('contracts', 'Fields')):
            yield index, 'command contract links', source


def heading_model(path, lines, fenced, headings, entry):
    """Findings selected by a heading-based procedure declaration."""
    if not entry or entry.get('steps') != 'headings':
        return
    inside = {index for start, level, title in headings
              if level == 2 and title == entry['procedures']
              for index in range(start, heading_end(headings, start, level, len(lines)))}
    commands = scan_blocks(lines).html_lines
    scopes = list(procedure_headings(lines, headings, entry))
    steps = [(index, level, title, end) for index, level, title, end in scopes
             if HEADING_STEP.match(title)]
    for index, line in enumerate(lines):
        if index not in inside or fenced[index] or index in commands:
            continue
        if ORDERED.match(line):
            yield index, 'list step in heading model', line.strip()
        if INDENTED.match(line):
            yield index, 'indented detail in heading model', line.strip()
    parents, groups = {}, {}
    for index, level, title in headings:
        if index in inside and HEADING_STEP.match(title):
            parent = parents.get(level - 1)
            groups.setdefault(parent, []).append((index, title))
            if parent is not None and re.sub(r'^\d+\.\s+', '', title) == lines[parent].lstrip('# '):
                yield index, 'repeated procedure title', title
        parents[level] = index
        for depth in [depth for depth in parents if depth > level]:
            del parents[depth]
    for group in groups.values():
        for expected, (index, title) in enumerate(group, 1):
            if int(HEADING_STEP.match(title)[1]) != expected:
                yield index, 'heading step sequence', f'expected {expected}. in this procedure'
    roots = [(index, level, title) for index, level, title in headings
             if level == 2 and title == entry['procedures']]
    for index, level, title in roots:
        end = heading_end(headings, index, level, len(lines))
        if not any(index < start < end for start, _, _, _ in steps):
            yield index, 'procedure without heading steps', title
    for index, level, title, end in scopes:
        if level == 3 and not HEADING_STEP.match(title) and not any(
                index < start < end for start, _, _, _ in steps):
            yield index, 'procedure without heading steps', title
    if required := entry.get('preamble'):
        title = next((index for index, level, _ in headings if level == 1), -1)
        end = next((index for index, level, _ in headings if index > title and level <= 2), len(lines))
        candidates = [index for index in range(title + 1, end)
                      if not fenced[index] and all(target in LINK.findall(lines[index]) for target in required)]
        if len(candidates) != 1:
            yield max(title, 0), 'procedure preamble missing', 'one intro line linking ' + ', '.join(required)
    if entry.get('commands') == 'html':
        for start, level, title, end in scopes:
            if level != 3 or HEADING_STEP.match(title):
                continue
            first = next((index for index, _, _, _ in steps if start < index < end), end)
            body = [lines[index].removeprefix('- ').strip() for index in range(first + 1, end)
                    if lines[index].strip() and not HEADING.match(lines[index]) and not fenced[index]]
            if body and (match := re.fullmatch(r'Run (\[[^\]]+\]\([^\s)]+(?: "[^"]+")?\))\.', body[0])):
                target = next(iter(LINK.finditer(match[1])), None)
                if target and command_target(path, target[1]) and all(line.startswith('Provide ') for line in body[1:]):
                    yield start, 'redundant command wrapper', 'caller can Run the command specification directly'
        for index, target, role, source in role_links(lines, fenced):
            if index in inside and role in ('input', 'output'):
                yield index, 'command contract links', 'I/O roles belong to command specifications'
        specs = [(index, title, heading_end(headings, index, 3, len(lines)))
                 for index, title in specifications(headings, held_section(entry))]
        if entry.get('contracts'):
            for start, title, end in specs:
                roles = {role for index, _, role, _ in role_links(lines, fenced)
                         if start < index < end and not HEADING.match(lines[index])}
                for role in ('input', 'output'):
                    if role not in roles:
                        yield start, 'command contract links', f'{title}: contextual {role} link required'
        yield from html_commands(path, lines, fenced, entry, specs)
    if entry.get('calls'):
        yield from operation_calls(path, lines, fenced, entry,
                                   procedure_spans(lines, fenced, headings, entry))


def html_commands(path, lines, fenced, entry, specs):
    """Invocation syntax and contracts within named command specifications."""
    lexical = scan_blocks(lines)
    blocks, errors = lexical.invocations, lexical.errors
    for index, detail in errors:
        yield index, 'malformed HTML invocation', detail
    for index, language in fence_openings(lines):
        if language in SHELL or language == 'tool':
            yield index, 'fenced invocation in HTML model', language or 'unlabelled'
    for first, title, last in specs:
        if sum(first < start <= end < last for start, end in blocks) != 1:
            yield first, 'malformed HTML invocation', title + ': exactly one invocation required'
    for start, end in blocks:
        if not any(index < start <= end < stop for index, _, stop in specs):
            yield start, 'invocation outside command specification', 'place the invocation in its named Commands specification'
        if lines[start] != lines[start].lstrip():
            yield start, 'indented detail in heading model', 'invocation wrapper must be flush'
        payload = '\n'.join(lines[start:end + 1]).strip()
        payload = payload.removeprefix('<big><pre>').removesuffix('</pre></big>')
        if not payload.strip():
            yield start, 'malformed HTML invocation', 'invocation is empty'
        for index in range(start, end + 1):
            literal = lines[index]
            if index == start:
                literal = literal.removeprefix('<big><pre>')
            if index == end:
                literal = literal.removesuffix('</pre></big>')
            if re.search(r'[<>]', literal):
                yield index, 'unescaped HTML in invocation', 'encode literal angle brackets as &lt; and &gt;'
            for match in ARGUMENT_LINK.finditer(lines[index]):
                role = link_role(match)
                if entry.get('link_roles') and role == 'operation':
                    continue
                if not field_contract(path, match[2], entry.get('contracts', 'Fields')):
                    yield index, 'invocation argument contract', match[2]
                if entry.get('link_roles') and role not in ('input', 'output'):
                    yield index, 'invocation argument contract', 'argument links identify their input/output role'
            visible = html.unescape(ARGUMENT_LINK.sub(lambda match: match[1], lines[index])).strip()
            if entry.get('link_roles') and len(visible) > 120 and not visible.endswith('\\'):
                try:
                    words = shlex.split(visible)
                except ValueError:
                    words = []
                if sum(word.startswith('--') or (word.startswith('-') and len(word) == 2) for word in words) >= 2:
                    yield index, 'unwrapped shell invocation', 'split option/value groups with shell continuations'
            ordinary = ARGUMENT_LINK.sub('', lines[index])
            for match in LINK.finditer(ordinary):
                if field_contract(path, match[1], entry.get('contracts', 'Fields')):
                    yield index, 'invocation argument contract', 'contract-backed arguments use bold links'

    if entry.get('link_roles'):
        for start, _, end in specs:
            parameters = {match[2] for first, last in blocks if start < first <= last < end
                          for index in range(first, last + 1) for match in ARGUMENT_LINK.finditer(lines[index])}
            for index in range(start + 1, end):
                if fenced[index] or index in lexical.html_lines:
                    continue
                matches = list(LINK.finditer(lines[index]))
                bare = LINK.sub('', lines[index])
                if len(matches) >= 2 and all(match[1] in parameters for match in matches) and re.fullmatch(
                        r'(?:- )?Run (?:the following|the|this) command using[\s,.]*(?:and[\s,.]*)*', bare):
                    yield index, 'duplicate command parameter prose', 'command annotations already bind these parameters'


def operation_calls(path, lines, fenced, entry, inside):
    """The declared routing verb on an actual operation call, excluding field citations."""
    commands = scan_blocks(lines).html_lines
    for index, line in enumerate(lines):
        if index not in inside or index in commands or fenced[index]:
            continue
        text = CODE_SPAN.sub('', line)
        for match in LINK.finditer(text):
            name, _, fragment = match[1].partition('#')
            destination = (path.parent / name).resolve() if name else path
            verb = 'Run' if command_target(path, match[1]) else entry['calls'].get(destination.parent.name)
            if not verb or not destination.is_file():
                continue
            if operation_target(path, match[1]) and not re.search(r'\b' + re.escape(verb) + r'\s+$', text[:match.start()]):
                yield index, 'operation call verb', f'{verb} {match[0]}'


def html_interfaces(path, root, lines, fenced, headings, entry):
    """Interface evidence belongs to the specification containing an invocation."""
    if not entry or entry.get('commands') != 'html':
        return []
    blocks = scan_blocks(lines).invocations
    specs = [(start, title, heading_end(headings, start, 3, len(lines)))
             for start, title in specifications(headings, held_section(entry))]
    found = []
    for start, title, end in specs:
        command_lines = [index for first, last in blocks if start < first and last < end
                         for index in range(first, last + 1)]
        graphql = any(GRAPHQL.search(lines[index]) or any(
            GRAPHQL.search(script.read_text()) for script in script_of(path, lines[index]))
                      for index in command_lines)
        if graphql and not any(not fenced[index] and index not in command_lines
                               and REST_GAP.match(lines[index]) for index in range(start + 1, end)):
            found.append(finding(path, root, start, 'GraphQL without a REST gap', title))
    return found



def check(path, root, cache, cited, called, structures=None):
    lines, fenced, headings = scan(path)
    skip = frontmatter(lines)
    commands = scan_blocks(lines).html_lines
    specimens = [fenced[index] or index in commands for index in range(len(lines))]
    found = []

    def report(index, kind, detail=''):
        found.append(finding(path, root, index, kind, detail))

    def anchors(target):
        if target not in cache:
            cache[target] = {anchor_of(title) for _, _, title in scan(target)[2]}
        return cache[target]

    callers = called.get(path, {})

    previous = 0
    for index, level, title in headings:
        if previous and level > previous + 1:
            report(index, 'heading jump', f'h{previous} to h{level}')
        previous = level

    # A specification belongs to the procedure that runs it, so one exactly
    # one procedure cites, in a file other than its own, stands away from
    # home. The file holding the specification is read by that same test. A
    # skill's entry point holds no command, so a specification there is
    # reported whatever cites it, which is the one placement no caller count
    # can reach.
    entry = contract(path, {} if structures is None else structures)
    for index, title in specifications(headings, held_section(entry)):
        if path.name == 'SKILL.md':
            report(index, 'command specification in the entry point', title)
            continue
        citing = callers.get(anchor_of(title), ())
        if not (entry or {}).get('keeps_commands') and len(citing) == 1 and path not in citing:
            caller = named(next(iter(citing)), root)
            report(index, 'command specification with one caller', f'{title}, cited from {caller}')

    # The top-level sections of a file carrying a procedure are a named set in
    # a named order, and its procedure is the one named Procedure, so the reader
    # knows what the file holds before opening it. What the file carries selects
    # it: a catalog, a context file and a contract file state what a procedure
    # consults, and nothing about them is a sequence. A skill's entry point
    # takes the set the guidelines give it whatever it carries. Where the skill
    # declares a contract for the file, that contract is the set, and the file
    # takes it whether or not it carries a step.
    measured = ()
    if path.name == 'SKILL.md':
        selected = structure_at(path.parent, {} if structures is None else structures).get(path.name)
        measured = sections_against(headings, selected['sections'] if selected else ENTRY_SECTIONS,
                                    selected.get('required', ()) if selected else ())
    elif entry or procedure_spans(lines, fenced, headings):
        allowed = tuple(entry['sections']) if entry else SECTIONS
        required = tuple(entry.get('required', ())) if entry else ('Procedure',)
        measured = sections_against(headings, allowed, required)
    for index, kind, detail in measured:
        report(index, kind, detail)

    for index, target in targets(path, lines, fenced):
        name, _, fragment = target.partition('#')
        destination = (path.parent / name).resolve() if name else path
        if not destination.is_file():
            report(index, 'unresolved link', target)
        elif fragment and destination.suffix == '.md' and anchor_of(fragment) not in anchors(destination):
            report(index, 'unresolved anchor', target)

    for index, line in enumerate(lines):
        if specimens[index] or index in skip or RULE.match(line):
            continue
        if match := BULLET.match(line):
            gap, rest = match.group(2), match.group(3)
            if not rest.strip():
                report(index, 'empty bullet')
            elif not gap:
                report(index, 'bullet without a space', line.strip()[:60])
            elif FENCE.match(rest):
                report(index, 'bullet holding a code fence', line.strip()[:60])
            elif BULLET.match(rest):
                report(index, 'bullet holding a bullet', line.strip()[:60])
        if (BOLD_LEAD.match(line) and not BARE_LEAD.match(line)
                and '{{' not in line and len(line) > LEAD_WIDTH):
            report(index, 'inline bold lead too wide', f'{len(line)} characters, limit {LEAD_WIDTH}')

        # A prerequisite citation asserts the reader already holds a section.
        # Within one file position carries that, so the citation states an
        # order the reader has passed and the section it names must be elsewhere.
        for sentence in PREREQUISITE.findall(CODE_SPAN.sub('', line)):
            for target in LINK.findall(sentence):
                name, _, fragment = target.partition('#')
                if not fragment or PLACEHOLDER.search(target):
                    continue
                destination = (path.parent / name).resolve() if name else path
                if destination == path:
                    report(index, 'prerequisite citation inside one file', target)

    # Bounded prose: the prose lines of one run, lists and tables excluded
    # because each is one structure and is not split to meet the limit. Each
    # paragraph is one line, so the blank line between two continues the run.
    run = 0
    start = 0
    for index, line in enumerate(lines):
        if not line.strip() and not specimens[index]:
            continue
        structural = (specimens[index] or index in skip
                      or line.lstrip().startswith(('-', '|', '>', '#', '*'))
                      or INDENTED.match(line))
        if structural:
            run = 0
            continue
        start = index if run == 0 else start
        run += 1
        if run == PROSE_LIMIT + 1:
            report(start, 'prose over eight lines', 'split into named sub-sections')

    # A heading flush against the line above it can be read into that line's
    # list item or paragraph, losing its section and anchor to a strict reader.
    # The file's first line and the close of its frontmatter have nothing
    # above them to absorb it.
    for index, _, title in headings:
        if index in skip:
            continue
        if index and lines[index - 1].strip() and index - 1 not in skip:
            report(index, 'heading without a blank line above', title)

    for index, detail in mixed_moods(lines, specimens, headings, entry):
        report(index, 'parallel section in another mood', detail)

    if lines and not lines[-1].strip():
        report(len(lines) - 1, 'trailing blank line')

    for index, title in empty_sections(lines, headings):
        report(index, 'heading without content', title)

    for index, slug, first in duplicate_anchors(headings):
        report(index, 'duplicate anchor', f'{slug}, also at line {first + 1}')

    for index, title in uncited_specifications(path, headings, entry, cited):
        report(index, 'command specification nothing cites', title)

    if path.name == 'SKILL.md':
        for index, name in untriggered_modes(lines, headings, skip):
            report(index, 'mode without a trigger phrase', name)
    for index, text in hard_wraps(lines, specimens, headings, skip):
        report(index, 'hard-wrapped line', text)
    for index, kind, detail in link_roles(path, lines, fenced, entry):
        report(index, kind, detail)

    for index, kind, detail in heading_model(path, lines, fenced, headings, entry):
        report(index, kind, detail)
    return found


def finding(path, root, index, kind, detail=''):
    """One finding, of a kind the check registers, so every rule a
    `rules.json` names a kind for reaches a check that reports it."""
    if kind not in KINDS:
        raise KeyError(f'unregistered finding kind: {kind}')
    return (str(named(path, root)), index + 1, kind, detail)


def fence_openings(lines):
    """Each Markdown fence opening and language outside HTML command payload."""
    yield from scan_blocks(lines).openings


def mode_commands(path, root, structures):
    """Commands check: a mode reaches a command by its operation's name, so a
    shell or unlabelled block in a mode file outside its command
    specifications is a command spelled out where it should be named. A mode
    file is named `<mode>-mode.md`, as the guidelines name it."""
    if not path.name.endswith('-mode.md'):
        return []
    entry = contract(path, structures)
    if (entry or {}).get('commands') == 'html':
        return []
    lines, _, headings = scan(path)
    held = specification_spans(headings, len(lines), held_section(entry))
    return [finding(path, root, index, 'command spelled out in a mode', lines[index].strip())
            for index, language in fence_openings(lines)
            if language in SHELL and index not in held]


def declaration_at(directory, name, cache, read):
    """The nearest declaration file of a name at or above a directory, read
    once, empty where none stands."""
    key = (directory, name)
    if key not in cache:
        path = directory / name
        if path.is_file():
            cache[key] = read(path)
        elif directory.parent == directory:
            cache[key] = {}
        else:
            cache[key] = declaration_at(directory.parent, name, cache, read)
    return cache[key]


def vocabulary(path):
    """One skill's vocabulary: each concept's term mapped to the terms it
    retires, refused whole where it is not that shape."""
    try:
        terms = json.loads(path.read_text())
    except json.JSONDecodeError as error:
        raise ValueError(f'{path}: {error}') from error
    if not isinstance(terms, dict) or not all(
            isinstance(retired, list) and all(isinstance(term, str) for term in retired)
            for retired in terms.values()):
        raise ValueError(f'{path}: maps no term to a list of retired terms')
    return {term: [(old, re.compile(r'(?<![\w-])' + re.escape(old) + r'(?![\w-])')) for old in retired]
            for term, retired in terms.items()}


def retired_terms(path, root, cache):
    """Vocabulary check: a concept carries the one term its skill's
    `vocabulary.json` names, so a retired term is reported in the skill's
    markdown outside code, and anywhere in a script, identifiers included."""
    terms = declaration_at(path.parent, VOCABULARY, cache, vocabulary)
    if not terms:
        return []
    if path.suffix == '.md':
        lines, fenced, _ = scan(path)
        commands = scan_blocks(lines).html_lines
        lines = ['' if fenced[index] or index in commands else CODE_SPAN.sub('', line)
                 for index, line in enumerate(lines)]
    else:
        lines = path.read_text().splitlines()
    return [finding(path, root, index, 'retired term', f'{old} for {term}')
            for index, line in enumerate(lines)
            for term, retired in terms.items()
            for old, pattern in retired if pattern.search(line)]


def labelled_rules(path):
    """A guide's house rules: each top-level bullet opening with a bold label,
    keyed by the anchors of its section and its label, with its line."""
    lines, fenced, _ = scan(path)
    section = ''
    commands = scan_blocks(lines).html_lines
    for index, line in enumerate(lines):
        if fenced[index] or index in commands:
            continue
        if line.startswith('## '):
            section = anchor_of(line[3:])
        elif match := RULE_LABEL.match(line):
            yield f'{section}/{anchor_of(match[1])}', index


def skill_of(path):
    """The folder holding the skill a file belongs to: the nearest one at or
    above it carrying a SKILL.md."""
    return next((folder for folder in path.parents if (folder / 'SKILL.md').is_file()), None)


def shared_guide(path):
    """The shared guide binding the skill a file belongs to, in the folder
    holding that skill, where it stands."""
    skill = skill_of(path)
    guide = skill.parent / GUIDE if skill else None
    return guide if guide and guide.is_file() else None


def doubled_conventions(path, root):
    """Guides check: a convention has one home, so a rule a skill's guide
    states under the label and section title of a shared rule is reported."""
    shared = shared_guide(path)
    if path.name != GUIDE or not shared or shared == path:
        return []
    homes = {key: index for key, index in labelled_rules(shared)}
    return [finding(path, root, index, 'convention in both guides',
                    f'{key}, stated in {named(shared, root)}:{homes[key] + 1}')
            for key, index in labelled_rules(path) if key in homes]


def script_of(path, line):
    """Each skill script a command line runs, resolved against the folders
    above the file holding it."""
    for name in SCRIPT.findall(line):
        script = next((folder / name for folder in path.parents if (folder / name).is_file()), None)
        if script:
            yield script


def interfaces(path, root, structures):
    """GitHub commands carry REST-gap evidence in their governing specification
    or execution step when they send GraphQL, including through a script.
    Every trace of Projects (classic) is reported."""
    lines, fenced, headings = scan(path) if path.suffix == '.md' else (
        path.read_text().splitlines(), [], [])
    found = [finding(path, root, index, 'Projects classic interface', match[0])
             for index, line in enumerate(lines) if (match := CLASSIC.search(line))]
    if path.suffix != '.md':
        return found
    entry = contract(path, structures)
    found += html_interfaces(path, root, lines, fenced, headings, entry)
    total = len(lines)
    for start, title in specifications(headings, held_section(entry)):
        end = next((index for index, level, _ in headings if index > start and level <= 3), total)
        span = range(start, end)
        graphql = any(fenced[index] and (GRAPHQL.search(lines[index]) or any(
            GRAPHQL.search(script.read_text()) for script in script_of(path, lines[index])))
            for index in span)
        if graphql and not any(REST_GAP.match(lines[index]) for index in span):
            found.append(finding(path, root, start, 'GraphQL without a REST gap', title))
    return found


def rule_operations(path):
    """A guide's `rules.json`: each rule key mapped to the operations that
    decide it, refused whole where it is not that shape."""
    try:
        rules = json.loads(path.read_text())
    except json.JSONDecodeError as error:
        raise ValueError(f'{path}: {error}') from error
    if not isinstance(rules, dict) or not all(
            isinstance(operations, list) and operations for operations in rules.values()):
        raise ValueError(f'{path}: maps no rule to a list of operations')
    return rules


def undecided_rules(guide, root):
    """Rules check: each house rule a guide states names, in the `rules.json`
    beside it, the operations that decide it: the kinds this check reports,
    or the review against the guidelines. Prose that is no labelled rule
    states no rule, so it names nothing."""
    declared = guide.parent / RULES
    operations = rule_operations(declared) if declared.is_file() else {}
    found = []
    seen = {}
    for key, index in labelled_rules(guide):
        if key in seen:
            found.append(finding(guide, root, index, 'ambiguous house rule', f'{key}, also at line {seen[key] + 1}'))
            continue
        seen[key] = index
        unknown = [name for name in operations.get(key, ()) if name not in OPERATIONS]
        if key not in operations or unknown:
            found.append(finding(guide, root, index, 'house rule no operation decides',
                                 key + (f', naming {", ".join(unknown)}' if unknown else '')))
    found += [finding(declared, root, 0, 'declared rule absent', key)
              for key in operations if key not in seen]
    return found


def sections_against(headings, allowed, required=()):
    """Each departure of a file's top-level sections from a named set: a
    section outside it, one standing ahead of a section the set places before
    it, and a required one the file lacks, each with the line index it stands
    on, its kind and its detail."""
    sections = [(index, title.strip()) for index, level, title in headings if level == 2]
    rank = -1
    for index, title in sections:
        if title not in allowed:
            yield index, 'section outside the set', title
            continue
        place = allowed.index(title)
        if place < rank:
            yield index, 'sections out of order', f'{allowed[place]} after {allowed[rank]}'
        rank = max(rank, place)
    carried = {title for _, title in sections}
    for title in required:
        if title not in carried:
            yield 0, 'section missing', title


def empty_sections(lines, headings):
    """Each heading whose section holds nothing but blank lines. A section runs
    to the next heading of its own level or above, so one whose body is its
    sub-sections has content, and a fenced example under a heading is content
    like any other line."""
    for position, (start, level, title) in enumerate(headings):
        end = next((index for index, depth, _ in headings[position + 1:]
                    if depth <= level), len(lines))
        if not any(line.strip() for line in lines[start + 1:end]):
            yield start, title


def description(lines, skip):
    """The frontmatter's description as one string, a folded or literal block
    joined at its line breaks, since YAML reads it as one value."""
    text = []
    inside = False
    for index in sorted(skip)[1:-1]:
        line = lines[index]
        if match := DESCRIPTION.match(line):
            inside = True
            if match[1] not in BLOCK_SCALARS:
                text.append(match[1].strip('\'"'))
        elif inside and line[:1].isspace():
            text.append(line.strip())
        else:
            inside = False
    return ' '.join(text)


def modes(lines, headings):
    """Each mode an entry point lists: a top-level bullet under its Modes
    section whose name, bold or plain, links the mode's file, with the line it
    stands on."""
    start = next((index for index, level, title in headings
                  if level == 2 and anchor_of(title) == 'modes'), None)
    if start is None:
        return
    end = next((index for index, level, _ in headings if index > start and level <= 2), len(lines))
    for index in range(start, end):
        if match := MODE.match(lines[index]):
            yield index, match[2]


def untriggered_modes(lines, headings, skip):
    """Each mode the description carries no trigger phrase for. The description
    alone decides whether the skill loads, so a request reaches a mode only
    through a phrase there naming it by its own word: "audit workflow X"
    reaches Audit. A word carries the mode where it opens with the mode's name,
    a final "e" dropped, so "revising" carries Revise."""
    words = description(lines, skip).lower()
    for index, name in modes(lines, headings):
        stems = [word.lower().removesuffix('e') for word in re.findall(r'\w+', name)]
        if not re.search(r'\b' + r'\w*\W+'.join(map(re.escape, stems)) + r'\w*', words):
            yield index, name


def hard_wraps(lines, fenced, headings, skip):
    """Each paragraph or list item carried past its first line. Every item is
    one line and the editor wraps, so a line that a following line continues,
    rather than a new block opening, is hard-wrapped. A bold label standing
    alone takes its body on the next line, which is the one continuation the
    layout gives a line."""
    titled = {index for index, _, _ in headings}
    wrapped = False
    for index in range(len(lines) - 1):
        line, following = lines[index], lines[index + 1]
        continues = not (
            fenced[index] or fenced[index + 1] or index in skip or index + 1 in skip
            or index in titled or not line.strip() or not following.strip()
            or RULE.match(line) or RULE.match(following) or line.lstrip().startswith(('|', '<'))
            or BLOCK_START.match(following) or BARE_LABEL.match(line))
        if continues and not wrapped:
            yield index, line.strip()[:60]
        wrapped = continues


INSTRUCTIONS = {'Use', 'Select', 'Apply', 'Follow', 'Read', 'Run', 'Check', 'Include',
                'Inspect', 'Trace', 'Call', 'Record', 'Keep', 'Add', 'Write', 'See'}
SUBJECTS = {'The', 'A', 'An', 'Each', 'Every', 'This', 'These', 'That', 'Those', 'Its',
            'Their', 'No', 'Any', 'All', 'One', 'It', 'They', 'Both', 'Neither', 'Either'}
ADVERBIALS = {'For', 'When', 'Where', 'If', 'Once', 'After', 'Before', 'In', 'On', 'With',
              'Unless', 'While', 'Within', 'Under', 'Without', 'At'}
PREPOSITIONS = {'for', 'with', 'from', 'to', 'on', 'in', 'over', 'against', 'under', 'at',
                'by', 'across', 'into', 'through', 'then'}
LINK_RUN = re.compile(r'^\x00(?:\s*(?:,\s*(?:and\s+|or\s+)?|and\s+|or\s+)\x00)*\s*(\w*)')


def mood(sentence, verbs):
    """The mood a section's opening sentence is stated in: 'directs' where it
    tells the reader what to do, 'states' where it says what holds, and None
    where its first words decide neither. A leading adverbial phrase sets a
    condition rather than the mood, so the clause after it is read. A run of
    links opening the sentence is its subject where a verb follows, and is a
    command used as the verb where a preposition follows."""
    text = LINK.sub('\x00', CODE_SPAN.sub('\x01', sentence)).strip()
    words = text.split()
    if words and words[0] in ADVERBIALS and ',' in text:
        text = text.split(',', 1)[1].strip()
    if text.startswith('\x00'):
        follower = LINK_RUN.match(text).group(1)
        if not follower:
            return None
        return 'directs' if follower in PREPOSITIONS else 'states'
    first = text.split(' ', 1)[0].strip('*_')
    if first in verbs:
        return 'directs'
    if first in SUBJECTS:
        return 'states'
    return None


def mixed_moods(lines, fenced, headings, entry=None):
    """Each section stated in another mood than its parallel siblings. Sibling
    headings whose titles end in the same word, such as Main Coverage and
    Docker Coverage, state the same kind of thing, so they open in one mood:
    each says what holds, or each directs the reader. The first sibling whose
    mood its opening sentence decides sets the mood the others follow. A
    command specification's title opens with the verb it performs, so those
    verbs read as instructions alongside the common ones."""
    verbs = INSTRUCTIONS | {title.split()[0].strip('*_') for _, title in specifications(headings)}
    groups = {}
    parent = {}
    for position, (index, level, title) in enumerate(headings):
        parent[level] = index
        for deeper in [key for key in parent if key > level]:
            del parent[deeper]
        words = re.sub(r'[*_`]', '', title).split()
        if len(words) < 2:
            continue
        end = next((later for later, _, _ in headings[position + 1:]), len(lines))
        opening = next((lines[line] for line in range(index + 1, end)
                        if not fenced[line] and lines[line].strip()), '')
        if opening.lstrip().startswith(('-', '|', '>', '#', '*')) or ORDERED.match(opening):
            continue
        found = mood(opening, verbs)
        if found:
            role = bool(HEADING_STEP.match(title)) if (entry or {}).get('steps') == 'headings' else None
            key = (parent.get(level - 1), level, words[-1].lower(), role)
            groups.setdefault(key, []).append((index, title.strip(), found))
    for members in groups.values():
        _, first_title, first_mood = members[0]
        for index, title, found in members[1:]:
            if found != first_mood:
                yield index, f'{title} {found}, {first_title} {first_mood}'


def bodies(texts):
    """Every third-level section of each file, as (file, heading, body) in
    file order. A body runs to the next heading of its level or above, and is
    held with its relative link targets reduced to their fragments, since a
    moved section's links must change and a retarget is not an edit."""
    found = []
    for name in sorted(texts):
        lines, _, headings = parse(texts[name])
        for position, (start, level, title) in enumerate(headings):
            if level != 3:
                continue
            end = next((index for index, depth, _ in headings[position + 1:] if depth <= 3),
                       len(lines))
            body = [LINK.sub(retarget, line) for line in lines[start + 1:end]]
            while body and not body[0].strip():
                body.pop(0)
            while body and not body[-1].strip():
                body.pop()
            found.append((name, title.strip(), body))
    return found


def retarget(match):
    """A link with its target reduced to its fragment. An absolute URL is kept
    whole, since no move within a repository changes it."""
    target = match[1]
    if '://' in target or target.startswith('mailto:'):
        return match[0]
    _, hash_, fragment = target.partition('#')
    return match[0][:match.start(1) - match.start(0)] + hash_ + fragment + ')'


def compare(before, after):
    """Each section of two revisions paired with its counterpart and judged.
    A section keeps its file where that file still holds its heading, and
    otherwise pairs with the same heading in another file, so a move reads
    as a move. Returns (kind, base file, head file, heading, diff)."""
    left = bodies(before)
    right = bodies(after)
    unpaired = list(range(len(right)))
    pairs = []
    pending = []
    for index, (name, title, _) in enumerate(left):
        match = next((other for other in unpaired
                      if right[other][0] == name and right[other][1] == title), None)
        if match is None:
            pending.append(index)
        else:
            unpaired.remove(match)
            pairs.append((index, match))
    removed = []
    for index in pending:
        match = next((other for other in unpaired if right[other][1] == left[index][1]), None)
        if match is None:
            removed.append(index)
        else:
            unpaired.remove(match)
            pairs.append((index, match))

    results = []
    for index, other in sorted(pairs):
        name, title, body = left[index]
        moved_to, _, carried = right[other]
        if body != carried:
            diff = list(difflib.unified_diff(body, carried, name, moved_to, lineterm=''))
            results.append(('differing', name, moved_to, title, diff))
        else:
            results.append(('identical' if name == moved_to else 'moved', name, moved_to, title, []))
    results += [('removed', left[index][0], None, left[index][1], []) for index in removed]
    results += [('added', None, right[other][0], right[other][1], []) for other in unpaired]
    return results, len(left), len(right)


def tree_at(revision, roots):
    """The text of each markdown file under the roots at a revision, keyed by
    its path relative to the working directory."""
    listed = subprocess.run(['git', 'ls-tree', '-r', '--name-only', revision, '--', *roots],
                            capture_output=True, text=True, check=True).stdout.split('\n')
    return {name: subprocess.run(['git', 'show', f'{revision}:./{name}'],
                                 capture_output=True, text=True, check=True).stdout
            for name in listed if name.endswith('.md')}


def compare_revisions(base, head, roots, quiet=False):
    """The comparison as the review's evidence: each section's judgement, a
    diff for each differing body, and the section count at each revision.
    Exit 1 where any section is added, removed or differing."""
    try:
        results, counted_base, counted_head = compare(tree_at(base, roots), tree_at(head, roots))
    except subprocess.CalledProcessError as error:
        print(f'unreadable revision — {error.stderr.strip()}')
        return 1
    for kind, name, moved_to, title, diff in results:
        if quiet:
            continue
        where = f'{name} -> {moved_to}' if name and moved_to and name != moved_to else name or moved_to
        print(f'{kind}: {where} ### {title}')
        for line in diff:
            print(f'  {line}')
    changed = sum(kind in ('added', 'removed', 'differing') for kind, *_ in results)
    print(f'{counted_base} sections at {base}, {counted_head} sections at {head}, '
          f'{changed} added, removed or differing')
    return 1 if changed else 0


STEP = 'step'
SPECIFICATION = 'specification'
PREREQUISITE_READ = 'prerequisite'
DESCRIPTIVE = 'descriptive'
REQUIRED = (STEP, SPECIFICATION, PREREQUISITE_READ)


def citation_kinds(path, entry=None):
    """Each link target of a file with the kind of citation it stands in.

    A step runs its target, so it alone makes a caller. A command
    specification, an HTML argument and a linked operation contract state
    required evidence without calling its target, and a prerequisite
    names what the reader must already hold, so each is required reach
    without running anything. Any other link is descriptive: the reader may
    follow it and need not."""
    lines, fenced, headings = scan(path)
    steps = procedure_spans(lines, fenced, headings, entry)
    commands = scan_blocks(lines).html_lines
    held = specification_spans(headings, len(lines), held_section(entry))
    listed = set()
    tops = [index for index, level, _ in headings if level <= 2]
    for position, start in enumerate(tops):
        if lines[start].strip() == '## Prerequisites':
            end = tops[position + 1] if position + 1 < len(tops) else len(lines)
            listed.update(range(start, end))
    kinds = []
    for index, target in targets(path, lines, fenced):
        sentences = PREREQUISITE.findall(CODE_SPAN.sub('', lines[index]))
        contextual_contract = any(match[1] == target and link_role(match) in ('input', 'output')
                                  for match in LINK.finditer(CODE_SPAN.sub('', lines[index])))
        if index in commands or contextual_contract:
            kind = SPECIFICATION
        elif index in steps:
            kind = STEP
        elif index in held:
            kind = SPECIFICATION
        elif index in listed or any(target in LINK.findall(sentence) for sentence in sentences):
            kind = PREREQUISITE_READ
        else:
            kind = DESCRIPTIVE
        kinds.append((index, target, kind))
    return kinds


def reach(paths, structures=None):
    """Which files require each fragment of each file, and by which kind of
    citation. A whole-file citation reaches the file under the empty
    fragment. Callers are the step citations of this relation; the rest of it
    loads content without running it."""
    structures = {} if structures is None else structures
    reached = {}
    for path in paths:
        for _, target, kind in citation_kinds(path, contract(path, structures)):
            if kind not in REQUIRED:
                continue
            name, _, fragment = target.partition('#')
            destination = (path.parent / name).resolve() if name else path
            anchor = anchor_of(fragment) if fragment else ''
            reached.setdefault(destination, {}).setdefault(anchor, set()).add((path, kind))
    return reached


def uncited_specifications(path, headings, entry, cited):
    """Each command specification no file cites. One no procedure runs has no
    caller to place it, so it stays with the subject of the file whose prose or
    sibling specification names it. One nothing names at all has no reader,
    whatever structure holds it. The entry point's specifications are reported
    as misplaced already."""
    if path.name == 'SKILL.md':
        return
    citing = cited.get(path, {})
    for index, title in specifications(headings, held_section(entry)):
        if not citing.get(anchor_of(title)):
            yield index, title


def duplicate_anchors(headings):
    """Each heading whose anchor an earlier heading of the file holds, with
    that anchor and the earlier heading's index. A fragment reaches the first
    heading of its anchor, so a repeat is ambiguous before any link cites it."""
    seen = {}
    for index, _, title in headings:
        slug = anchor_of(title)
        if slug in seen:
            yield index, slug, seen[slug]
        seen.setdefault(slug, index)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('roots', nargs='+', help='skill folders to check')
    parser.add_argument('--quiet', action='store_true', help='print the counts alone')
    parser.add_argument('--compare', nargs=2, metavar=('BASE', 'HEAD'),
                        help='compare section bodies between two revisions')
    options = parser.parse_args(argv)
    if options.compare:
        return compare_revisions(*options.compare, options.roots, options.quiet)

    # A fixture tree holds test inputs in the format its suite reads, which is
    # specimen text rather than a skill file, so the guidelines do not reach it.
    roots = [Path(name).resolve() for name in options.roots]
    files = []
    scripts = []
    for root in roots:
        files += [(path, root.parent) for path in sorted(root.rglob('*.md'))
                  if 'fixtures' not in path.relative_to(root).parts]
        scripts += [(path, root.parent) for path in sorted(root.rglob('*'))
                    if path.suffix in SCRIPT_SUFFIXES and 'scripts' in path.relative_to(root.parent).parts]

    declared = {}
    try:
        cited, called = citations([path for path, _ in files], declared)
    except ValueError as error:
        print(f'unreadable structure — {error}')
        return 1
    cache = {}
    findings = []
    for path, root in files:
        findings += check(path, root, cache, cited, called, declared)

    guides = {path: root for path, root in files if path.name == GUIDE}
    for path, root in files:
        if (shared := shared_guide(path)):
            guides.setdefault(shared, root)
    terms = {}
    try:
        for path, root in files:
            findings += mode_commands(path, root, declared)
            findings += doubled_conventions(path, root)
            findings += interfaces(path, root, declared)
        for path, root in files + scripts:
            findings += retired_terms(path, root, terms)
        for path, root in scripts:
            findings += interfaces(path, root, declared)
        for guide, root in guides.items():
            findings += undecided_rules(guide, root)
    except ValueError as error:
        print(f'unreadable declaration — {error}')
        return 1

    if not options.quiet:
        for where, line, kind, detail in findings:
            print(f'{where}:{line}: {kind}' + (f' — {detail}' if detail else ''))
    print(f'{len(files)} files checked, {len(findings)} findings')
    return 1 if findings else 0


if __name__ == '__main__':
    sys.exit(main())
