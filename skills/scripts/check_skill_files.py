"""Check a skill's markdown against the shared skill guidelines.

Resolution and layout are checked together because a reader meets them
together: a link that resolves to nothing and a bullet that swallowed its
code fence both cost the reader the content they were promised.

Fenced blocks and code spans hold specimen text, so a link inside one is a
placeholder rather than a reference, and a heading inside one belongs to the
template it illustrates rather than to the document. A template's `{{...}}`
stands for text the author supplies, so it is measured where it lands rather
than here.

Placement is judged by use. A command specification belongs to the procedure
that runs it, so a specification exactly one file cites, that file not the
one holding it, names a caller it should be sitting in. One test decides
every citing file alike, the file holding the specification included: a file
is a caller where a procedure of it carries the citation. A procedure is a
top-level section carrying a numbered step, whatever its heading names it:
the step is the author stating that the reader performs these, in this
order, and is the only place a file records that. Prose runs nothing
whatever its mood, order or count, so a sibling specification, a statement
of what a command does, and a sentence routing three commands in sequence
all name a command without running it. A skill's entry point holds no
command of its own, so a
specification standing there is reported wherever it is cited from. The
top-level sections of a file carrying a procedure are the set the guidelines
name, in the order they name them, Procedure among them, so the reader knows
what the file carries before opening it. A skill's entry point takes the set
the guidelines name for it whatever it carries. Any other file carrying no
procedure keeps its own shape.

A skill that adds directories of its own declares what they carry in its
`structure.json`, keyed by a directory name or by a `*suffix` its filenames
end with. An entry states the sections those files may take, in order, which
of them are required, the section holding their command specifications, and
whether a specification there belongs to its file whatever cites it. A file
no entry covers takes the shared set.

A prerequisite citation is recognised by the canonical form the guidelines
state, `Read [Name](target) first.`, which separates it from a selection
link naming the next operation. A selection link points wherever its target
sits; a prerequisite citation names a section the reader must already hold,
so its target belongs in another file.

Sibling sections whose titles end in one word state one kind of thing, so
they open in one mood, judged from the first words of each opening sentence.

A move is judged between two revisions rather than in one tree, so
`--compare <base> <head>` reads the named skill folders from git at each and
compares every third-level section's body with its counterpart, reporting
each one that differs other than by a link target.

    python3 skills/scripts/check_skill_files.py skills/workflow-canon
    python3 skills/scripts/check_skill_files.py --compare <base> <head> skills/work-planner
"""

import argparse
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

FENCE = re.compile(r'^\s*(`{3,}|~{3,})')
RULE = re.compile(r'^\s*(-{3,}|\*{3,}|_{3,})\s*$')
HEADING = re.compile(r'^(#{1,6})\s+(.*)$')
LINK = re.compile(r'\[[^\]]*\]\(([^)]+)\)')
CODE_SPAN = re.compile(r'`[^`]*`')
PLACEHOLDER = re.compile(r'\{\{.*\}\}|\{[a-z_]+\}|^[.…\s]*$')
PREREQUISITE = re.compile(r'Read ((?:\[[^\]]+\]\([^)]+\)(?:,\s*)?)+) first\.')
ORDERED = re.compile(r'^\s{0,3}\d+[.)]\s')
BULLET = re.compile(r'^(\s*)-(\s*)(.*)$')
BOLD_LEAD = re.compile(r'^\s*-\s+\*\*')
BARE_LEAD = re.compile(r'^\s*-\s+\*\*[^*]+\*\*\s*$')
INDENTED = re.compile(r'^\s+\S')
PROSE_LIMIT = 8
LEAD_WIDTH = 100
SECTIONS = ('Prerequisites', 'Procedure', 'Reference', 'Rules', 'Commands')
ENTRY_SECTIONS = ('Modes', 'Rules', 'Conventions', 'Dependencies')
STRUCTURE = 'structure.json'


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


def parse(text):
    """Each line of a text with the fence state it sits in, and its headings."""
    lines = text.splitlines()
    fenced = []
    inside = None
    for line in lines:
        if inside:
            fenced.append(True)
            if re.fullmatch(r'\s*' + re.escape(inside[0]) + '{' + str(len(inside)) + r',}\s*', line):
                inside = None
            continue
        if match := FENCE.match(line):
            fenced.append(True)
            inside = match[1]
            continue
        fenced.append(False)
    headings = [(index, len(match.group(1)), match.group(2))
                for index, line in enumerate(lines)
                if not fenced[index] and (match := HEADING.match(line))]
    return lines, fenced, headings


def frontmatter(lines):
    """Line indices of a leading YAML block, whose delimiters are not rules."""
    if not lines or lines[0].strip() != '---':
        return set()
    for index, line in enumerate(lines[1:], 1):
        if line.strip() == '---':
            return set(range(index + 1))
    return set()


def targets(path, lines, fenced):
    """Every link target outside fences and code spans, with its line."""
    for index, line in enumerate(lines):
        if fenced[index]:
            continue
        for target in LINK.findall(CODE_SPAN.sub('', line)):
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
    for key, entry in structure.items():
        if not isinstance(entry, dict) or not entry.get('sections'):
            raise ValueError(f'{path}: {key} states no sections')
    return structure


def contract(path, cache):
    """The entry covering this file: its directory's, or the one whose
    `*suffix` its name ends with. A file no entry covers has none."""
    structure = structure_at(path.parent, cache)
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
    """Line indices held by the file's procedures. A procedure is a top-level
    section carrying a numbered step, whatever its heading names it, and runs
    until the next heading of its own level or above, so the steps under a
    sub-heading belong to it. A command specification is neither, so its lines
    are read out before the steps are counted. A section a skill's structure
    names as holding procedures is one whatever its step count, which is how a
    single-bullet procedure counts as one."""
    specifications_here = specification_spans(headings, len(lines), held_section(entry))
    tops = [index for index, level, _ in headings if level <= 2]
    spans = set()
    for position, start in enumerate(tops):
        end = tops[position + 1] if position + 1 < len(tops) else len(lines)
        body = [index for index in range(start, end) if index not in specifications_here]
        named = (entry or {}).get('procedures')
        if (named and lines[start] == f'## {named}') or any(
                ORDERED.match(lines[index]) and not fenced[index] for index in body):
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
        lines, fenced, headings = scan(path)
        steps = procedure_spans(lines, fenced, headings, contract(path, structures))
        for index, target in targets(path, lines, fenced):
            name, _, fragment = target.partition('#')
            if not fragment:
                continue
            destination = (path.parent / name).resolve() if name else path
            anchor = anchor_of(fragment)
            cited.setdefault(destination, {}).setdefault(anchor, set()).add(path)
            if index in steps:
                called.setdefault(destination, {}).setdefault(anchor, set()).add(path)
    return cited, called


def check(path, root, cache, cited, called, structures=None):
    lines, fenced, headings = scan(path)
    skip = frontmatter(lines)
    where = path.relative_to(root)
    found = []

    def report(index, kind, detail=''):
        found.append((str(where), index + 1, kind, detail))

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
        measured = sections_against(headings, ENTRY_SECTIONS)
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
        if fenced[index] or index in skip or RULE.match(line):
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

    # Bounded prose: consecutive prose lines, lists and tables excluded
    # because each is one structure and is not split to meet the limit.
    run = 0
    start = 0
    for index, line in enumerate(lines):
        structural = (fenced[index] or index in skip or not line.strip()
                      or line.lstrip().startswith(('-', '|', '>', '#', '*'))
                      or INDENTED.match(line))
        if structural:
            run = 0
            continue
        start = index if run == 0 else start
        run += 1
        if run == PROSE_LIMIT + 1:
            report(start, 'prose over eight lines', 'split into named sub-sections')

    for index, detail in mixed_moods(lines, fenced, headings):
        report(index, 'parallel section in another mood', detail)

    if lines and not lines[-1].strip():
        report(len(lines) - 1, 'trailing blank line')

    for index, title in empty_sections(lines, headings):
        report(index, 'heading without content', title)
    for index, slug, first in duplicate_anchors(headings):
        report(index, 'duplicate anchor', f'{slug}, also at line {first + 1}')
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


def mixed_moods(lines, fenced, headings):
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
            key = (parent.get(level - 1), level, words[-1].lower())
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
    files = []
    for name in options.roots:
        root = Path(name).resolve()
        files += [(path, root.parent) for path in sorted(root.rglob('*.md'))
                  if 'fixtures' not in path.relative_to(root).parts]

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

    if not options.quiet:
        for where, line, kind, detail in findings:
            print(f'{where}:{line}: {kind}' + (f' — {detail}' if detail else ''))
    print(f'{len(files)} files checked, {len(findings)} findings')
    return 1 if findings else 0


if __name__ == '__main__':
    sys.exit(main())
