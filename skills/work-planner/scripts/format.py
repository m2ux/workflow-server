"""Check a proposal, initiative, epic, task or standalone issue against its agent-engineering template, and
fix what is mechanical.

Usage:
  python3 format.py issue-943.json [--initiative issue-936.json] [--fix fixed-943.md]
  python3 format.py issue-936.json --epic issue-943.json --epic issue-937.json … [--fix fixed-936.md]

issue-943.json is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. The kind comes
from the title prefix: [I07] initiative, [I07:E00] epic, [I07:E00:W01] task. A proposal has no prefix
and carries type:proposal. No prefix and no type:proposal is a standalone issue, which belongs to no
initiative and takes templates/issue.md. The format is read
from templates/<kind>.md beside this script: its sections and their order, the sections it marks
optional ("delete the section", in any case), and its Work Breakdown columns.

Fixed in the body written to --fix, keeping the issue's wording:
  - template sections put in template order, each extra section moving with the one before it
  - Work Breakdown columns put in template order, and missing ones added empty, when every column
    present is a template column. A checkbox in Done is set to ✓ or cleared
  - table rows padded to the header's width
  - Work Breakdown references given colons (E01 W02 to E01:W02, I05 E00 to I05:E00), and each
    reference to an epic of the same initiative linked to that epic's issue. The epic issues come
    from the row-id links of the initiative's table: the issue's own, or --initiative's when the
    issue is an epic
  - an initiative row's Description set to its epic's title name, the part before the colon,
    for each epic given with --epic
  - prose Non-Goals made a bulleted list, one sentence per bullet
  - a Problem or Proposal item that opens with a bold statement given its body on the next line,
    indented under the bullet, except a bulleted item with sub-bullets, whose line introducing
    them stays on, or rejoins, its bold statement's line
  - acceptance criteria made checkboxes, labelled **ACn.** when none is labelled; references
    labelled **Rn.** when none is
Printed as fixes to apply to the issue itself:
  - a title prefix that separates levels with spaces, with its colon form
  - a type:* label that does not match the title's level, a theme:* label on a proposal, or any type:* label on a standalone issue
  - an epic checked with --initiative whose row there does not carry the epic's title name
Left to decide, since each needs new content or a judgement:
  - a body that follows another kind's template
  - a required section missing, an extra section, or text before the first section
  - prose in the Work Breakdown outside its table
  - an epic's task delivering more than three criteria, a candidate for splitting, and a criterion
    more than one task cites, which is imprecise and is split into the invariant each task makes true
  - wording that narrates how the plan changed (moved to, was W06, renumbered, formerly,
    previously, no longer, discharged, superseded, subsumed, used to)
  - a Problem or Proposal that names an epic, task, or acceptance criterion of its own initiative
  - an initiative's acceptance criterion that may state several invariants (a colon or semicolon in
    its statement), that names an initiative, epic, task or issue, or that carries a count (a figure
    or a number word) that is not its own target
  - any other acceptance criterion that may state several invariants (a semicolon in its statement)
  - a Depends on cell holding anything but references, or, in an initiative, anything but epics
  - a non-goal of more than one sentence, or one naming an initiative, epic, task or issue; a
    Non-Goals section in an epic or task, since non-goals belong to the initiative, or in a
    standalone issue, whose Proposal states its boundary
  - a Work Breakdown column the template lacks, a Done cell that is neither empty nor a tick, or a row id of
    the wrong form
  - an Coverage cell that does not name the criteria the row delivers (AC2, AC5), or
    cites one that does not exist, and a criterion no row delivers
  - a Description cell over eight words or holding a semicolon, whose detail belongs in criteria
  - acceptance criteria or references partly labelled or numbered out of sequence
  - no theme:* label on an initiative or epic, a title without "Name: Subtitle" (after the prefix,
    or whole for a standalone issue), or a title whose name is not two or three words or whose
    subtitle runs past ten
  - an issue several row ids link, which backs several tasks and so belongs under References
  - an unfilled {{...}} field or #E00 placeholder
  - a Work Breakdown reference to an epic that cannot be linked: one of another initiative, one the
    initiative's table does not list, or any at all when an epic is checked without --initiative

With --fix, a diff of the body changes is printed. Exit status 1 when anything is left to decide.
"""
import argparse
import difflib
import json
import re
import sys
from pathlib import Path

TEMPLATES = Path(__file__).resolve().parent.parent / 'templates'
PREFIX = re.compile(r'^\[(I\d\d)((?:[: ][EW]\d\d)*)\]')
KINDS = {0: 'initiative', 1: 'epic', 2: 'task'}
MAX_CRITERIA = 3
MAX_DESCRIPTION = 8
TITLE_NAME = (2, 3)
MAX_SUBTITLE = 10
REFERENCE = re.compile(r'github\.com/[^)\s]*/(?:issues|pull)/\d+|#\d+\b|\bI\d\d(?:[: ]E\d\d(?:[: ]W\d\d)?)?\b|'
                       r'(?<![\w:])E\d\d(?:[: ]W\d\d)?\b|(?<![\w:])W\d\d\b')
COUNT = re.compile(r'\d[\d,.]*|\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|twenty|'
                   r'thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:-\w+)?\b', re.I)
HISTORY = re.compile(r'\bmoved to\b|\(was [EW]?\d|\bwas W\d\d|\brenumbered\b|\bformerly\b|\bpreviously\b|'
                     r'\bno longer\b|\bdischarged\b|\bsuperseded\b|\bsubsumed\b|\bused to\b', re.I)
PLAN_ID = re.compile(r'(?<![\w:])E\d\d(?:[: ]W\d\d)?\b|(?<![\w:])W\d\d\b|\bAC\d+\b')
ROW_ID = {'initiative': re.compile(r'E\d\d'), 'epic': re.compile(r'W\d\d')}
TICK = '✓'
CHECKBOX = {'[ ]': '', '[x]': TICK, '[X]': TICK}
AC = re.compile(r'^- \[[ xX]\] \*\*AC(\d+)\.\*\*')
REF = re.compile(r'^- \*\*R(\d+)\.\*\*')
LEAD = re.compile(r'^(\s*)(- )?(\*\*[^*]+?[.:!?]\*\*)[ \t]+(\S.*)$')
LEAD_ALONE = re.compile(r'^(\s*)- \*\*[^*]+?[.:!?]\*\*$')
BULLET = re.compile(r'^(\s*)[-*] ')
SENTENCE = re.compile(r'(?<=[.!?])\s+(?=[A-Z\[`#])')
OUTCOMES = re.compile(r'→ (AC\d+(?:, AC\d+)*)')
COVERAGE = re.compile(r'AC\d+(?:, AC\d+)*')
LINK = re.compile(r'\[([^\]]*)\]\(([^)]*)\)')
EPIC_REF = re.compile(r'(?<![\w:])(?:I(\d\d):)?E(\d\d)(?::W\d\d)?(?![\w:])')
DEPENDENCY = {
    'epic': re.compile(r'W\d\d(?:[–-]W\d\d)?|E\d\d(?::W\d\d)?|I\d\d:E\d\d(?::W\d\d)?|#\d+'),
    'initiative': re.compile(r'E\d\d|I\d\d:E\d\d|#\d+'),
}


def split_sections(text: str) -> tuple[list[str], list[list]]:
    """Return the lines before the first H2, and [heading, lines] for each H2 section."""
    preamble, sections, fence = [], [], False
    for line in text.split('\n'):
        if line.startswith('```'):
            fence = not fence
        m = None if fence else re.match(r'^## (.+?)\s*$', line)
        if m:
            sections.append([m[1], []])
        elif sections:
            sections[-1][1].append(line)
        else:
            preamble.append(line)
    return preamble, sections


def join_sections(preamble: list[str], sections: list[list]) -> str:
    parts = ['\n'.join(preamble).strip('\n')] if '\n'.join(preamble).strip() else []
    for heading, lines in sections:
        content = '\n'.join(lines).strip('\n')
        parts.append(f'## {heading}\n\n{content}' if content else f'## {heading}')
    return '\n\n'.join(parts) + '\n'


def cells(line: str) -> list[str]:
    return [c.strip() for c in line.strip().strip('|').split('|')]


def row(values: list[str]) -> str:
    return '|' + '|'.join(f' {v} ' if v else ' ' for v in values) + '|'


class Template:
    def __init__(self, kind: str):
        _, sections = split_sections((TEMPLATES / f'{kind}.md').read_text())
        self.headings = [h for h, _ in sections]
        self.optional = {h for h, lines in sections if 'delete the section' in '\n'.join(lines).lower()}
        self.columns = next((cells(l) for h, lines in sections for l in lines
                             if h == 'Work Breakdown' and l.startswith('|')), None)


def work_table(body: str) -> tuple[list[str], list[str]]:
    """An issue body's Work Breakdown header and its data rows."""
    _, sections = split_sections(body.replace('\r\n', '\n'))
    lines = next((l for h, l in sections if h == 'Work Breakdown'), [])
    table = [l for l in lines if l.startswith('|')]
    return (cells(table[0]), table[2:]) if len(table) >= 2 else ([], [])


def epic_issues(body: str) -> dict[str, int]:
    """Map each epic number in an initiative's Work Breakdown to the issue its row id links."""
    header, rows = work_table(body)
    found = {}
    for line in rows:
        epic = re.fullmatch(r'\[E(\d\d)\]\([^)]*/issues/(\d+)\)', id_cell(header, cells(line)))
        if epic:
            found[epic[1]] = int(epic[2])
    return found


def initiative_rows(body: str) -> list[str]:
    """The rows of an initiative's Work Breakdown table."""
    return work_table(body)[1]


def epic_name(title: str) -> str:
    """The name an epic's title gives it: the text between the prefix and the first colon."""
    rest = PREFIX.sub('', title).strip()
    return rest.split(': ', 1)[0].strip()


def description(line: str, header: list[str]) -> str:
    """A row's Description phrase, without the criteria it cites."""
    return phrase(cell(header, cells(line), 'Description'))


def cell(header: list[str], r: list[str], column: str) -> str:
    """A table row's cell in the named column, empty where the table has none."""
    at = header.index(column) if column in header else None
    return r[at] if at is not None and at < len(r) else ''


def phrase(text: str) -> str:
    """A Description cell's phrase, without the criteria it cites."""
    return text.split(' →', 1)[0].strip()


def done_mark(value: str) -> str | None:
    """The Done cell as the table writes it: empty, or a tick. None when the cell is something else."""
    if value in ('', TICK):
        return value
    return CHECKBOX.get(value)


def id_cell(header: list[str], r: list[str]) -> str:
    """A row's id cell: the Task column, or the Epic column where the table has no Task."""
    name = 'Task' if 'Task' in header else 'Epic' if 'Epic' in header else ''
    return cell(header, r, name) if name else (r[0] if r else '')


def row_id(text: str) -> str:
    """The id a cell names: the text of its first link, or the cell itself where it has none."""
    found = LINK.search(text)
    return found[1] if found else text.strip()


def id_form(text: str) -> str:
    """The id a cell names once its links are read, where every link names that same id."""
    bare = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    parts = [p.strip() for p in bare.split(',') if p.strip()]
    return parts[0] if parts and all(p == parts[0] for p in parts) else bare


def colon_refs(text: str) -> str:
    text = re.sub(r'\bI(\d\d) E(\d\d)(?: W(\d\d))?\b',
                  lambda m: f'I{m[1]}:E{m[2]}' + (f':W{m[3]}' if m[3] else ''), text)
    return re.sub(r'\bE(\d\d) W(\d\d)\b', r'E\1:W\2', text)


class Review:
    def __init__(self, issue: dict, initiative: dict | None = None, epics: list[dict] | None = None):
        self.issue = issue
        self.initiative = initiative
        self.epics = {e['number']: epic_name(e['title']) for e in epics or []}
        self.fixed: list[str] = []
        self.apply: list[str] = []
        self.decide: list[str] = []

    def run(self) -> str | None:
        title = self.issue['title']
        if 'type:proposal' in self.labels():
            self.kind, self.number = 'proposal', None
            if ': ' not in title:
                self.decide.append('title has no "Name: Subtitle"')
            else:
                name, _, subtitle = title.partition(': ')
                self.check_title_shape(name, subtitle)
            self.check_labels()
            return self.check_body()
        m = PREFIX.match(title)
        if not m:
            self.kind, self.number = 'issue', None
            name, colon, subtitle = title.partition(': ')
            if colon:
                self.check_title_shape(name, subtitle)
            else:
                self.decide.append('title has no "Name: Subtitle"')
            typed = [l for l in self.labels() if l.startswith('type:')]
            if typed:
                self.apply.append('labels: ' + ', '.join(f'remove {l}' for l in typed))
            return self.check_body()
        parts = re.findall(r'[EW]\d\d', m[2])
        self.number = m[1][1:]
        self.kind = KINDS.get(len(parts))
        if self.kind is None:
            self.decide.append(f'title prefix has too many levels: {m[0]}')
            return None
        self.check_title(m, parts)
        self.check_labels()
        return self.check_body()

    def check_title(self, m: re.Match, parts: list[str]) -> None:
        title = self.issue['title']
        if ' ' in m[2]:
            fixed = '[' + ':'.join([m[1], *parts]) + ']' + title[m.end():]
            self.apply.append(f'title: {fixed}')
        name = epic_name(title)
        if ': ' not in title[m.end():]:
            self.decide.append('title has no "Name: Subtitle" after the prefix')
        else:
            self.check_title_shape(name, PREFIX.sub('', title).partition(': ')[2])
        if self.kind == 'epic' and self.initiative:
            header, rows = work_table(self.initiative['body'] or '')
            for line in rows:
                epic = re.fullmatch(r'\[(E\d\d)\]\([^)]*/issues/(\d+)\)', id_cell(header, cells(line)))
                if epic and int(epic[2]) == self.issue.get('number') and description(line, header) != name:
                    self.apply.append(f"initiative row {epic[1]}: Description {name}, the epic's title name")

    def check_title_shape(self, name: str, subtitle: str) -> None:
        """A title's name is two or three words, and its subtitle a succinct summary."""
        if not TITLE_NAME[0] <= len(name.split()) <= TITLE_NAME[1]:
            self.decide.append(f'title name runs to {len(name.split())} words; a name is '
                               f'{TITLE_NAME[0]} or {TITLE_NAME[1]}')
        if len(subtitle.split()) > MAX_SUBTITLE:
            self.decide.append(f'title subtitle runs to {len(subtitle.split())} words; it is a succinct summary '
                               f'of at most {MAX_SUBTITLE}')

    def labels(self) -> list[str]:
        return [l['name'] if isinstance(l, dict) else l for l in self.issue.get('labels', [])]

    def check_labels(self) -> None:
        labels = self.labels()
        want = f'type:{self.kind}'
        themes = [l for l in labels if l.startswith('theme:')]
        wrong = [l for l in labels if l.startswith('type:') and l != want]
        if self.kind == 'proposal':
            wrong += themes
        if wrong or want not in labels:
            self.apply.append('labels: ' + ', '.join([f'remove {l}' for l in wrong] +
                                                      ([f'add {want}'] if want not in labels else [])))
        if self.kind in ('initiative', 'epic') and not themes:
            self.decide.append('no theme:* label')

    def check_body(self) -> str:
        body = (self.issue.get('body') or '').replace('\r\n', '\n')
        preamble, sections = split_sections(body)
        template = Template(self.kind)
        names = [h for h, _ in sections]
        own = sum(h in template.headings for h in names)
        for other in KINDS.values() if self.kind != 'issue' else ():
            if other != self.kind and sum(h in Template(other).headings for h in names) > own:
                self.decide.append(f'body follows the {other} template, not the {self.kind} one')
                return body

        if '\n'.join(preamble).strip():
            self.decide.append('text before the first section')
        for h in template.headings:
            if h not in names and h not in template.optional:
                self.decide.append(f'required section missing: {h}')
        for h in names:
            if h == 'Non-Goals' and self.kind == 'issue':
                self.decide.append('Non-Goals: a standalone issue states its boundary in the Proposal')
            elif h == 'Non-Goals' and self.kind not in ('initiative', 'proposal'):
                self.decide.append('Non-Goals belong to the initiative: lift any that bound it into the '
                                   "initiative's Non-Goals, then remove the section")
            elif h not in template.headings:
                self.decide.append(f'extra section: {h}')

        sections = self.reorder(sections, template)
        for section in sections:
            h = section[0]
            if h == 'Work Breakdown' and template.columns:
                self.check_prose(section[1])
                section[1] = self.fix_names(self.fix_references(self.fix_table(section[1], template.columns)))
                self.check_dependencies(section[1])
                self.check_shared(section[1])
            elif h in ('Problem', 'Proposal'):
                section[1] = self.fix_leads(section[1], h)
            elif h == 'Non-Goals':
                section[1] = self.fix_bullets(section[1], h)
                self.check_non_goals(section[1])
            elif h == 'Acceptance Criteria':
                section[1] = self.fix_list(section[1], 'AC', checkbox=True)
                if self.kind in ('initiative', 'proposal'):
                    self.check_initiative_criteria(section[1])
                else:
                    self.check_criteria(section[1])
            elif h == 'References':
                section[1] = self.fix_list(section[1], 'R', checkbox=False)

        self.check_outcomes(sections)
        self.check_history(sections)
        self.check_plan_ids(sections)
        fixed = join_sections(preamble, sections) if self.fixed else body
        if '{{' in fixed:
            self.decide.append('unfilled {{…}} field')
        if re.search(r'#E\d\d\b', fixed):
            self.decide.append('unreplaced #Exx placeholder')
        return fixed

    def check_initiative_criteria(self, lines: list[str]) -> None:
        """An initiative's criteria are SMART, local, one invariant each, and carry no stale counts."""
        for line in lines:
            criterion = AC.match(line)
            if not criterion:
                continue
            text = line[criterion.end():]
            statement = re.split(r',? (?:when|by|once) ', text, maxsplit=1)[0]
            if ';' in statement or ': ' in statement:
                self.decide.append(f'AC{criterion[1]} may state several invariants; state one per criterion')
            figures = COUNT.findall(re.sub(r'\b(?:AC|R|E|W|I)\d+\b|\bv\d+(?:\.\d+)*\b|#\d+\b', '', LINK.sub(r'\1', text)))
            if figures:
                self.decide.append(f'AC{criterion[1]} carries a count ({", ".join(figures)}); counts go stale, so an '
                                   "initiative's criterion measures against a named baseline or check, unless the "
                                   'figure is its own target')
            named = sorted(set(REFERENCE.findall(text)))
            if named:
                self.decide.append(f'AC{criterion[1]} names {", ".join(named)}; an initiative\'s criterion names no '
                                   'initiative, epic, task or issue, and is local to this initiative')

    def check_plan_ids(self, sections: list[list]) -> None:
        """A Problem or Proposal names no epic, task, or acceptance criterion of its own initiative."""
        own = re.compile(rf'\bI{self.number}[: ]E\d\d(?:[: ]W\d\d)?\b') if self.number else None
        for heading, lines in sections:
            if heading not in ('Problem', 'Proposal'):
                continue
            found: list[str] = []
            for line in lines:
                text = LINK.sub(r'\1', line)
                found += PLAN_ID.findall(text)
                if own:
                    found += own.findall(text)
            if found:
                names = ', '.join(dict.fromkeys(found))
                self.decide.append(f'{heading}: names {names}; a Problem or Proposal names no epic, task, or '
                                   'acceptance criterion of its own initiative')

    def check_history(self, sections: list[list]) -> None:
        """A body states the plan as it is: report wording that narrates how it changed."""
        for heading, lines in sections:
            for line in lines:
                text = LINK.sub(r'\1', line)
                hit = HISTORY.search(text)
                if hit:
                    start = max(0, hit.start() - 40)
                    self.decide.append(f'{heading}: change narrative "{text[start:hit.end() + 30].strip()}"; '
                                       'state the plan as it is')

    def check_criteria(self, lines: list[str]) -> None:
        """Each acceptance criterion states one invariant."""
        for line in lines:
            criterion = AC.match(line)
            if criterion and ';' in LINK.sub(r'\1', line[criterion.end():]):
                self.decide.append(f'AC{criterion[1]} may state several invariants; state one per criterion')

    def check_outcomes(self, sections: list[list]) -> None:
        by_name = {h: lines for h, lines in sections}
        table = [l for l in by_name.get('Work Breakdown', []) if l.startswith('|')]
        if len(table) < 3 or 'Coverage' not in cells(table[0]):
            return
        header = cells(table[0])
        described = header.index('Description') if 'Description' in header else None
        covered = header.index('Coverage')
        wanted = {int(m[1]) for l in by_name.get('Acceptance Criteria', []) if (m := AC.match(l))}
        delivered: set[int] = set()
        cited: list[tuple[str, set[int]]] = []
        for line in table[2:]:
            r = cells(line)
            name = row_id(id_cell(header, r))
            if described is not None:
                phrase = LINK.sub(r'\1', r[described] if described < len(r) else '').strip()
                if len(phrase.split()) > MAX_DESCRIPTION or ';' in phrase:
                    self.decide.append(f'{name}: Description runs to {len(phrase.split())} words; shorten it to a '
                                       f'phrase of at most {MAX_DESCRIPTION}, and state its detail as criteria of '
                                       'one invariant each')
            listed = r[covered] if covered < len(r) else ''
            if not COVERAGE.fullmatch(listed):
                self.decide.append(f'{name}: Coverage does not name the criteria it delivers')
                continue
            numbers = {int(n) for n in re.findall(r'\bAC(\d+)', listed)}
            for n in sorted(numbers - wanted):
                self.decide.append(f'{name}: Coverage cites AC{n}, which is not a criterion')
            delivered |= numbers
            cited.append((name, numbers))
        if self.kind == 'epic':
            rows_citing = {n: [name for name, c in cited if n in c] for n in delivered}
            for n in sorted(rows_citing):
                if len(rows_citing[n]) > 1:
                    self.decide.append(f'AC{n} is cited by {", ".join(rows_citing[n])}; one task delivers a '
                                       'criterion, so split it into the invariant each task makes true')
            for name, numbers in cited:
                if len(numbers) > MAX_CRITERIA:
                    self.decide.append(f'{name}: delivers {len(numbers)} criteria; split it into '
                                       'tasks one pull request each can deliver')
        for n in sorted(wanted - delivered):
            self.decide.append(f'AC{n} is delivered by no Work Breakdown row')

    def reorder(self, sections: list[list], template: Template) -> list[list]:
        groups: list[list[list]] = []
        for section in sections:
            if section[0] in template.headings or not groups:
                groups.append([section])
            else:
                groups[-1].append(section)

        def rank(group: list[list]) -> int:
            h = group[0][0]
            return template.headings.index(h) if h in template.headings else -1

        ordered = sorted(groups, key=rank)
        if ordered != groups:
            self.fixed.append('sections put in template order')
        return [s for g in ordered for s in g]

    def fix_table(self, lines: list[str], columns: list[str]) -> list[str]:
        """Rewrite the table, or leave it whole and report no table fix when a finding stops it."""
        mark = len(self.fixed)
        out = self.rewrite_table(lines, columns)
        if out is lines:
            del self.fixed[mark:]
        return out

    def rewrite_table(self, lines: list[str], columns: list[str]) -> list[str]:
        start = next((i for i, l in enumerate(lines) if l.startswith('|')), None)
        if start is None:
            self.decide.append('Work Breakdown has no table')
            return lines
        end = start
        while end < len(lines) and lines[end].startswith('|'):
            end += 1
        header, rows = cells(lines[start]), [cells(l) for l in lines[start + 2:end]]
        unknown = [c for c in header if c not in columns]
        if unknown:
            self.decide.append(f'Work Breakdown column not in the template: {", ".join(unknown)}')
            return lines
        if 'Done' in header:
            at = header.index('Done')
            for r in rows:
                value = r[at] if at < len(r) else ''
                if done_mark(value) is None:
                    self.decide.append(f'{row_id(id_cell(header, r))}: Done holds more than a tick: {value}')
                    return lines

        width = len(header)
        for r in rows:
            if len(r) > width:
                self.decide.append(f'Work Breakdown row wider than its header: {row_id(id_cell(header, r))}')
                return lines
        padded = [r + [''] * (width - len(r)) for r in rows]
        if padded != rows:
            self.fixed.append('Work Breakdown rows padded to the header width')
        if header != columns:
            missing = [c for c in columns if c not in header]
            if missing:
                self.fixed.append('Work Breakdown columns added: ' + ', '.join(missing))
            if [c for c in columns if c in header] != header:
                self.fixed.append('Work Breakdown columns put in template order')
            padded = [[r[header.index(c)] if c in header else '' for c in columns] for r in padded]
        if 'Done' in columns:
            at = columns.index('Done')
            ticks = cleared = False
            for r in padded:
                mark = done_mark(r[at])
                if mark is None or mark == r[at]:
                    continue
                r[at] = mark
                ticks = ticks or mark == TICK
                cleared = cleared or mark == ''
            if ticks:
                self.fixed.append('Done set to a tick')
            if cleared:
                self.fixed.append('Done cleared')
        if 'Coverage' in columns and 'Description' in columns:
            desc_at = columns.index('Description')
            covered = columns.index('Coverage')
            for r in padded:
                text = r[desc_at] if desc_at < len(r) else ''
                found = OUTCOMES.search(text)
                if found and r[covered] and r[covered] != found[1]:
                    self.decide.append(f'{row_id(id_cell(columns, r))}: Description and Coverage '
                                       'name different criteria')
                    return lines
            moved = False
            for r in padded:
                text = r[desc_at] if desc_at < len(r) else ''
                found = OUTCOMES.search(text)
                if not found:
                    continue
                r[covered] = found[1]
                phrase = text[:found.start()].strip()
                rest = text[found.end():].strip()
                r[desc_at] = f'{phrase} {rest}'.strip() if rest else phrase
                moved = True
            if moved:
                self.fixed.append('Coverage filled from the Description')
        pattern = ROW_ID[self.kind]
        for r in padded:
            ident = id_cell(columns, r)
            if not pattern.fullmatch(id_form(ident)):
                self.decide.append(f'Work Breakdown row id not of the form {pattern.pattern}: {row_id(ident)}')
        table = [row(columns), row(['---'] * len(columns))] + [row(r) for r in padded]
        if header == columns and padded == rows:
            return lines
        return lines[:start] + table + lines[end:]

    def check_prose(self, lines: list[str]) -> None:
        """The Work Breakdown holds its table and nothing else."""
        other = [l.strip()[:60] for l in lines if l.strip() and not l.startswith('|')]
        if other:
            self.decide.append('Work Breakdown holds prose outside its table: ' + ' / '.join(other))

    def check_dependencies(self, lines: list[str]) -> None:
        table = [l for l in lines if l.startswith('|')]
        if len(table) < 3 or 'Depends on' not in cells(table[0]):
            return
        header = cells(table[0])
        at = header.index('Depends on')
        for line in table[2:]:
            r = cells(line)
            items = [LINK.sub(r'\1', x).strip() for x in (r[at] if at < len(r) else '').split(',')]
            prose = [x for x in items if x and not DEPENDENCY[self.kind].fullmatch(x)]
            if prose:
                what = 'epics' if self.kind == 'initiative' else 'references'
                self.decide.append(f'{row_id(id_cell(header, r))}: Depends on holds more than '
                                   f'{what}: {", ".join(prose)}')

    def fix_names(self, lines: list[str]) -> list[str]:
        """Give each initiative row whose epic was given the Description its epic's title names."""
        if self.kind != 'initiative' or not self.epics:
            return lines
        out, named = list(lines), []
        table = [i for i, l in enumerate(lines) if l.startswith('|')]
        if len(table) < 3:
            return lines
        header = cells(lines[table[0]])
        id_at = header.index('Epic') if 'Epic' in header else 0
        desc_at = header.index('Description') if 'Description' in header else 1
        for i in table[2:]:
            r = cells(lines[i])
            epic = re.fullmatch(r'\[(E\d\d)\]\([^)]*/issues/(\d+)\)', r[id_at] if id_at < len(r) else '')
            name = self.epics.get(int(epic[2])) if epic else None
            if name is None or description(lines[i], header) == name:
                continue
            while len(r) <= desc_at:
                r.append('')
            r[desc_at] = name
            out[i] = row(r)
            named.append(epic[1])
        if named:
            self.fixed.append("Description set to the epic's title name: " + ', '.join(named))
        return out

    def check_shared(self, lines: list[str]) -> None:
        """An issue several row ids link backs several tasks, so it is a reference, not a task's own."""
        table = [l for l in lines if l.startswith('|')]
        if len(table) < 3:
            return
        header = cells(table[0])
        linked: dict[str, list[str]] = {}
        for line in table[2:]:
            m = re.fullmatch(r'\[([EW]\d\d)\]\([^)]*/issues/(\d+)\)', id_cell(header, cells(line)))
            if m:
                linked.setdefault(m[2], []).append(m[1])
        for issue, rows in linked.items():
            if len(rows) > 1:
                self.decide.append(f'{", ".join(rows)} all link #{issue}: an issue backing several tasks is a '
                                   'reference, cited under References with the ids unlinked')

    def fix_references(self, lines: list[str]) -> list[str]:
        """Give table references colons, and link each epic reference to its issue."""
        if self.kind == 'initiative':
            issues = epic_issues('\n'.join(['## Work Breakdown', *lines]))
        else:
            issues = epic_issues(self.initiative['body'] or '') if self.initiative else None
        base = self.issue.get('html_url', '').rsplit('/issues/', 1)[0]
        colons, linked, unlinked = False, [], []

        def link(m: re.Match) -> str:
            same = m[1] is None or m[1] == self.number
            if not same or issues is None or m[2] not in issues:
                unlinked.append(m[0])
                return m[0]
            linked.append(m[0])
            return f'[{m[0]}]({base}/issues/{issues[m[2]]})'

        out = list(lines)
        rows = [i for i, l in enumerate(lines) if l.startswith('|')][2:]
        for i in rows:
            parts = re.split(r'(\[[^\]]*\]\([^)]*\))', lines[i])
            for j, part in enumerate(parts):
                converted = colon_refs(part) if not LINK.fullmatch(part) else \
                    LINK.sub(lambda m: f'[{colon_refs(m[1])}]({m[2]})', part)
                colons |= converted != part
                parts[j] = converted if LINK.fullmatch(part) else EPIC_REF.sub(link, converted)
            out[i] = ''.join(parts)
        if colons:
            self.fixed.append('Work Breakdown references given colons')
        if linked:
            self.fixed.append('Work Breakdown epic references linked: ' + ', '.join(dict.fromkeys(linked)))
        if unlinked:
            why = 'give --initiative to link them' if issues is None else \
                'another initiative, or not in the initiative table'
            self.decide.append(f'Work Breakdown epic references unlinked ({why}): ' +
                               ', '.join(dict.fromkeys(unlinked)))
        return out

    def fix_leads(self, lines: list[str], heading: str) -> list[str]:
        """Put the body of each item that opens with a bold statement on the line after it, except
        a bulleted item's line introducing its sub-bullets, which stays on the bold statement's."""
        out, fence, split, joined = [], False, 0, 0
        for i, line in enumerate(lines):
            if line.lstrip().startswith('```'):
                fence = not fence
            m = None if fence else LEAD.match(line)
            alone = None if fence or not i else LEAD_ALONE.match(lines[i - 1])
            if m and not (m.group(2) and self.opens_sub_bullets(lines, i, m.group(1))):
                indent, bullet, lead, rest = m.groups()
                out += [f'{indent}{bullet or ""}{lead}', f'{indent}{"  " if bullet else ""}{rest}']
                split += 1
            elif (alone and line.startswith(f'{alone.group(1)}  ') and not BULLET.match(line)
                  and self.opens_sub_bullets(lines, i, alone.group(1))):
                out[-1] += f' {line.strip()}'
                joined += 1
            else:
                out.append(line)
        if split:
            self.fixed.append(f'{heading}: {split} bold leads given their body on the next line')
        if joined:
            self.fixed.append(f'{heading}: {joined} bold leads given back the line introducing their sub-bullets')
        return out

    @staticmethod
    def opens_sub_bullets(lines: list[str], i: int, indent: str) -> bool:
        """Whether the line after lines[i] is a bullet nested deeper than indent."""
        m = BULLET.match(lines[i + 1]) if i + 1 < len(lines) else None
        return bool(m) and len(m.group(1)) > len(indent)

    def fix_bullets(self, lines: list[str], heading: str) -> list[str]:
        """Make a prose section a bulleted list, one sentence per bullet."""
        prose = ' '.join(l.strip() for l in lines if l.strip() and not l.startswith('- '))
        if not prose:
            return lines
        bullets = [l for l in lines if l.startswith('- ')]
        bullets += [f'- {s}' for s in SENTENCE.split(prose)]
        self.fixed.append(f'{heading} made a bulleted list, one sentence per bullet')
        return bullets

    def check_non_goals(self, lines: list[str]) -> None:
        """Each non-goal is one sentence and names no initiative, epic, task or issue."""
        for line in lines:
            if not line.startswith('- '):
                continue
            text = LINK.sub(r'\1', line[2:])
            words = ' '.join(text.split()[:6])
            if len(SENTENCE.split(text.strip())) > 1:
                self.decide.append(f'Non-Goals: not one sentence: "{words}…"')
            named = sorted(set(REFERENCE.findall(line)))
            if named:
                self.decide.append(f'Non-Goals: names {", ".join(named)}; a non-goal names no initiative, epic, '
                                   f'task or issue: "{words}…"')

    def fix_list(self, lines: list[str], tag: str, checkbox: bool) -> list[str]:
        """Checkbox and label a list's items; tag is AC or R."""
        items = [i for i, l in enumerate(lines) if l.startswith('- ')]
        if not items:
            return lines
        lines = list(lines)
        if checkbox:
            plain = [i for i in items if not re.match(r'^- \[[ xX]\] ', lines[i])]
            for i in plain:
                lines[i] = '- [ ] ' + lines[i][2:]
            if plain:
                self.fixed.append(f'{len(plain)} {tag} items made checkboxes')
        label = {'AC': AC, 'R': REF}[tag]
        numbers = [label.match(lines[i]) for i in items]
        if not any(numbers):
            for n, i in enumerate(items, 1):
                box = lines[i][:6] if checkbox else '- '
                lines[i] = f'{box}**{tag}{n}.** ' + lines[i][len(box):]
            self.fixed.append(f'{len(items)} items labelled {tag}1–{tag}{len(items)}')
        elif not all(numbers) or [int(m[1]) for m in numbers] != list(range(1, len(items) + 1)):
            self.decide.append(f'{tag} labels partly missing or out of sequence')
        return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('issue', help='issue JSON as the REST API returns it')
    parser.add_argument('--initiative', help="epic: its initiative's issue JSON, for epic links")
    parser.add_argument('--epic', action='append', help="initiative: an epic's issue JSON, whose title "
                        'names its row; repeat for each epic')
    parser.add_argument('--fix', help='write the mechanically fixed body here')
    args = parser.parse_args()

    issue = json.loads(Path(args.issue).read_text())
    initiative = json.loads(Path(args.initiative).read_text()) if args.initiative else None
    epics = [json.loads(Path(e).read_text()) for e in args.epic or []]
    review = Review(issue, initiative, epics)
    fixed = review.run()
    kind = getattr(review, 'kind', None) or 'unknown kind'
    print(f"#{issue.get('number')} {kind} ({issue.get('state')}): {len(review.fixed)} fixed, "
          f"{len(review.apply)} to apply, {len(review.decide)} to decide")
    for name, items in (('fixed', review.fixed), ('apply', review.apply), ('decide', review.decide)):
        for item in items:
            print(f'  {name}: {item}')
    if args.fix and fixed is not None:
        Path(args.fix).write_text(fixed)
        original = (issue.get('body') or '').replace('\r\n', '\n')
        sys.stdout.writelines(difflib.unified_diff(original.splitlines(True), fixed.splitlines(True),
                                                   'body', args.fix, n=1))
    return 1 if review.decide else 0


if __name__ == '__main__':
    sys.exit(main())
