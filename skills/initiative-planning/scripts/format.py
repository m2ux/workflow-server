"""Check an initiative, epic or task issue against its house template, and fix what is mechanical.

Usage:
  python3 format.py issue-943.json [--initiative issue-936.json] [--fix fixed-943.md]

issue-943.json is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. The kind comes
from the title prefix: [I07] initiative, [I07:E00] epic, [I07:E00:W01] task. The format is read
from templates/<kind>.md beside this script: its sections and their order, the sections it marks
optional ("delete the section", in any case), and its Work Breakdown columns.

Fixed in the body written to --fix, keeping the issue's wording:
  - a section alias renamed: Acceptance criteria to Acceptance Criteria, and Solution to Proposal
    on an open initiative or epic (a closed one keeps Solution)
  - a progress section removed (Where it stands, Progress, Outcome): the tables and criteria show
    where the work stands
  - template sections put in template order, each extra section moving with the one before it
  - Work Breakdown columns put in template order, and missing ones added empty, when every column
    present is a template column
  - a Can Accompany column renamed Join, and an Outcomes column renamed Description
  - the house's old explanatory sentences above a Work Breakdown table removed
  - a PR or Issue column folded into the row ids: each row's single link, or #n, moves onto its
    id, and an empty or "in flight" cell is dropped
  - table rows padded to the header's width
  - Work Breakdown references given colons (E01 W02 to E01:W02, I05 E00 to I05:E00), and each
    reference to an epic of the same initiative linked to that epic's issue. The epic issues come
    from the row-id links of the initiative's table: the issue's own, or --initiative's when the
    issue is an epic
  - an initiative's prose Non-goals made a bulleted list, one sentence per bullet
  - goals made checkboxes, labelled **Gn.** when none is labelled
  - acceptance criteria made checkboxes, labelled **ACn.** when none is labelled; references
    labelled **Rn.** when none is
Printed as fixes to apply to the issue itself:
  - a title prefix that separates levels with spaces, with its colon form
  - a type:* label that does not match the title's level
Left to decide, since each needs new content or a judgement:
  - a body that follows another kind's template
  - a required section missing, an extra section, or text before the first section
  - prose in the Work Breakdown outside its table
  - an epic's task delivering more than three criteria that no other task delivers, a candidate for
    splitting (a criterion several tasks deliver is shared, and does not count towards any one)
  - wording that narrates how the plan changed (moved to, was W06, renumbered, formerly,
    previously, no longer, discharged, superseded, subsumed, used to)
  - a goal that may state several invariants (a colon or semicolon in its statement), that names
    an initiative, epic, task or issue, or that carries a count (a figure or a number word) that is not the goal's own target
  - a Depends on cell holding anything but references, or, in an initiative, anything but epics
  - an initiative with acceptance criteria in place of Goals, which are rewritten as SMART goals
  - a non-goal of more than one sentence, or one naming an initiative, epic, task or issue; a
    Non-goals section in an epic or task, since non-goals belong to the initiative
  - a Work Breakdown column the template lacks, such as Work in place of Description; a PR or Issue
    cell holding anything but one link, or a link other than the one its row id already carries,
    such as a task's own issue; or a row id of the wrong form
  - an Description cell that does not end with what it delivers (an epic's → AC2, AC5; an
    initiative's → G1, G3) or cites one that does not exist, and a criterion or goal no row
    delivers
  - acceptance criteria or references partly labelled or numbered out of sequence
  - no theme:* label on an initiative or epic, or a title without "Name: Subtitle"
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
ALIASES = {'Acceptance criteria': 'Acceptance Criteria'}
PROGRESS = ('Where it stands', 'Where this stands', 'Progress', 'Outcome')
MAX_CRITERIA = 3
REFERENCE = re.compile(r'github\.com/[^)\s]*/(?:issues|pull)/\d+|#\d+\b|\bI\d\d(?:[: ]E\d\d(?:[: ]W\d\d)?)?\b|'
                       r'(?<![\w:])E\d\d(?:[: ]W\d\d)?\b|(?<![\w:])W\d\d\b')
COUNT = re.compile(r'\d[\d,.]*|\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|twenty|'
                   r'thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:-\w+)?\b', re.I)
HISTORY = re.compile(r'\bmoved to\b|\(was [EW]?\d|\bwas W\d\d|\brenumbered\b|\bformerly\b|\bpreviously\b|'
                     r'\bno longer\b|\bdischarged\b|\bsuperseded\b|\bsubsumed\b|\bused to\b', re.I)
ROW_ID = {'initiative': re.compile(r'E\d\d'), 'epic': re.compile(r'W\d\d')}
AC = re.compile(r'^- \[[ xX]\] \*\*AC(\d+)\.\*\*')
REF = re.compile(r'^- \*\*R(\d+)\.\*\*')
GOAL = re.compile(r'^- \[[ xX]\] \*\*G(\d+)\.\*\*')
SENTENCE = re.compile(r'(?<=[.!?])\s+(?=[A-Z\[`#])')
OUTCOMES = re.compile(r'→ ((?:AC|G)\d+(?:, (?:AC|G)\d+)*)')
LINK = re.compile(r'\[([^\]]*)\]\(([^)]*)\)')
EPIC_REF = re.compile(r'(?<![\w:])(?:I(\d\d):)?E(\d\d)(?::W\d\d)?(?![\w:])')
COLUMN_ALIASES = {'Can Accompany': 'Join', 'Outcomes': 'Description'}
FOLDED = ('PR', 'Issue')
HOUSE_PROSE = ('The work is split into ', 'Epics are numbered in the order they run')
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


def epic_issues(body: str) -> dict[str, int]:
    """Map each epic number in an initiative's Work Breakdown to the issue its row id links."""
    _, sections = split_sections(body.replace('\r\n', '\n'))
    lines = next((l for h, l in sections if h == 'Work Breakdown'), [])
    found = {}
    for line in [l for l in lines if l.startswith('|')][2:]:
        epic = re.fullmatch(r'\[E(\d\d)\]\([^)]*/issues/(\d+)\)', cells(line)[0])
        if epic:
            found[epic[1]] = int(epic[2])
    return found


def colon_refs(text: str) -> str:
    text = re.sub(r'\bI(\d\d) E(\d\d)(?: W(\d\d))?\b',
                  lambda m: f'I{m[1]}:E{m[2]}' + (f':W{m[3]}' if m[3] else ''), text)
    return re.sub(r'\bE(\d\d) W(\d\d)\b', r'E\1:W\2', text)


class Review:
    def __init__(self, issue: dict, initiative: dict | None = None):
        self.issue = issue
        self.initiative = initiative
        self.fixed: list[str] = []
        self.apply: list[str] = []
        self.decide: list[str] = []

    def run(self) -> str | None:
        title = self.issue['title']
        m = PREFIX.match(title)
        if not m:
            self.decide.append(f'title has no [Ixx], [Ixx:Eyy] or [Ixx:Eyy:Wzz] prefix: {title}')
            return None
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
        if ': ' not in title[m.end():]:
            self.decide.append('title has no "Name: Subtitle" after the prefix')

    def check_labels(self) -> None:
        labels = [l['name'] if isinstance(l, dict) else l for l in self.issue.get('labels', [])]
        want = f'type:{self.kind}'
        wrong = [l for l in labels if l.startswith('type:') and l != want]
        if wrong or want not in labels:
            self.apply.append('labels: ' + ', '.join([f'remove {l}' for l in wrong] +
                                                      ([f'add {want}'] if want not in labels else [])))
        if self.kind != 'task' and not any(l.startswith('theme:') for l in labels):
            self.decide.append('no theme:* label')

    def check_body(self) -> str:
        body = (self.issue.get('body') or '').replace('\r\n', '\n')
        preamble, sections = split_sections(body)
        template = Template(self.kind)
        closed = self.kind != 'task' and self.issue.get('state') == 'closed'
        progress = [h for h, _ in sections if h in PROGRESS]
        if progress:
            sections = [s for s in sections if s[0] not in PROGRESS]
            self.fixed.append(f'section "{progress[0]}" removed: the tables and criteria show where the '
                              'work stands')

        aliases = dict(ALIASES)
        if self.kind != 'task':
            aliases['Solution'] = 'Proposal'
        names = [aliases.get(h, h) for h, _ in sections]
        as_own = ['Goals' if self.kind == 'initiative' and h.lower() == 'acceptance criteria' else h
                  for h in names]
        own = sum(h in template.headings for h in as_own)
        for other in KINDS.values():
            if other != self.kind and sum(h in Template(other).headings for h in names) > own:
                self.decide.append(f'body follows the {other} template, not the {self.kind} one')
                return body

        present = {h for h, _ in sections}
        for section in sections:
            target = aliases.get(section[0])
            if target and target in template.headings and target not in present:
                if section[0] == 'Solution' and closed:
                    continue
                self.fixed.append(f'section "{section[0]}" renamed "{target}"')
                present.add(target)
                section[0] = target

        def canonical(h: str) -> str:
            return 'Proposal' if closed and h == 'Solution' else h

        names = [canonical(h) for h, _ in sections]

        if '\n'.join(preamble).strip():
            self.decide.append('text before the first section')
        criteria = self.kind == 'initiative' and 'Goals' not in names and \
            any(h.lower() == 'acceptance criteria' for h in names)
        if criteria:
            self.decide.append('acceptance criteria, not Goals: rewrite them as SMART goals the epics make '
                               'true, naming no epic or task, then head the section Goals')
        for h in template.headings:
            if h not in names and h not in template.optional and not (criteria and h == 'Goals'):
                self.decide.append(f'required section missing: {h}')
        for h in names:
            if criteria and h.lower() == 'acceptance criteria':
                continue
            if h == 'Non-goals' and self.kind != 'initiative':
                self.decide.append('Non-goals belong to the initiative: lift any that bound it into the '
                                   "initiative's Non-goals, then remove the section")
            elif h not in template.headings:
                self.decide.append(f'extra section: {h}')

        sections = self.reorder(sections, template, canonical)
        for section in sections:
            h = canonical(section[0])
            if h == 'Work Breakdown' and template.columns:
                lines = self.strip_prose(section[1])
                section[1] = self.fix_references(self.fix_table(lines, template.columns))
                self.check_dependencies(section[1])
            elif h == 'Non-goals':
                section[1] = self.fix_bullets(section[1], h)
                self.check_non_goals(section[1])
            elif h == 'Goals':
                section[1] = self.fix_goals(section[1])
            elif h == 'Acceptance Criteria':
                section[1] = self.fix_list(section[1], 'AC', checkbox=True)
            elif h == 'References':
                section[1] = self.fix_list(section[1], 'R', checkbox=False)

        self.check_outcomes(sections, canonical)
        self.check_history(sections)
        fixed = join_sections(preamble, sections) if self.fixed else body
        if '{{' in fixed:
            self.decide.append('unfilled {{…}} field')
        if re.search(r'#E\d\d\b', fixed):
            self.decide.append('unreplaced #Exx placeholder')
        return fixed

    def fix_goals(self, lines: list[str]) -> list[str]:
        """Goals are checkboxes labelled Gn, which the user ticks once satisfied."""
        lines = self.fix_list(lines, 'G', checkbox=True)
        for line in lines:
            goal = GOAL.match(line)
            statement = re.split(r',? (?:when|by|once) ', line[goal.end():], maxsplit=1)[0] if goal else ''
            if goal and (';' in statement or ': ' in statement):
                self.decide.append(f'G{goal[1]} may state several invariants; state one per goal')
            plain = LINK.sub(r'\1', line[goal.end():]) if goal else ''
            figures = COUNT.findall(re.sub(r'\b(?:AC|G|R|E|W|I)\d+\b|\bv\d+(?:\.\d+)*\b', '', plain))
            if figures:
                self.decide.append(f'G{goal[1]} carries a count ({", ".join(figures)}); counts go stale, so a goal '
                                   'measures against a named baseline or check, unless the figure is its own target')
            named = sorted(set(REFERENCE.findall(line[goal.end():]))) if goal else []
            if named:
                self.decide.append(f'G{goal[1]} names {", ".join(named)}; a goal names no initiative, epic, task '
                                   'or issue, and is local to this initiative')
        return lines

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

    def check_outcomes(self, sections: list[list], canonical) -> None:
        by_name = {canonical(h): lines for h, lines in sections}
        table = [l for l in by_name.get('Work Breakdown', []) if l.startswith('|')]
        if len(table) < 3 or 'Description' not in cells(table[0]):
            return
        tag, noun, nouns, heading, label = (('G', 'goal', 'goals', 'Goals', GOAL) if self.kind == 'initiative'
                                            else ('AC', 'criterion', 'criteria', 'Acceptance Criteria', AC))
        column = cells(table[0]).index('Description')
        wanted = {int(m[1]) for l in by_name.get(heading, []) if (m := label.match(l))}
        delivered: set[int] = set()
        cited: list[tuple[str, set[int]]] = []
        for line in table[2:]:
            r = cells(line)
            name = LINK.sub(r'\1', r[0])
            cell = r[column] if column < len(r) else ''
            listed = OUTCOMES.search(cell)
            if not listed:
                self.decide.append(f'{name}: Description does not end with the {nouns} it delivers')
                continue
            numbers = {int(n) for n in re.findall(rf'\b{tag}(\d+)', listed[1])}
            other = re.findall(r'\b(?:AC|G)\d+', listed[1])
            if len(other) != len(numbers):
                self.decide.append(f'{name}: Description cites {", ".join(other)}; an {self.kind} cites {tag}n')
            for n in sorted(numbers - wanted):
                self.decide.append(f'{name}: Description cites {tag}{n}, which is not a {noun}')
            delivered |= numbers
            cited.append((name, numbers))
        if self.kind != 'initiative':
            rows_citing = {n: sum(n in c for _, c in cited) for n in delivered}
            for name, numbers in cited:
                own = {n for n in numbers if rows_citing[n] == 1}
                if len(own) > MAX_CRITERIA:
                    self.decide.append(f'{name}: delivers {len(own)} criteria no other task delivers; split it into '
                                       'tasks one pull request each can deliver')
        for n in sorted(wanted - delivered):
            self.decide.append(f'{tag}{n} is delivered by no Work Breakdown row')

    def reorder(self, sections: list[list], template: Template, canonical) -> list[list]:
        groups: list[list[list]] = []
        for section in sections:
            if canonical(section[0]) in template.headings or not groups:
                groups.append([section])
            else:
                groups[-1].append(section)

        def rank(group: list[list]) -> int:
            h = canonical(group[0][0])
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
        renamed = [c for c in header if COLUMN_ALIASES.get(c) in columns]
        for c in renamed:
            self.fixed.append(f'Work Breakdown column "{c}" renamed "{COLUMN_ALIASES[c]}"')
        header = [COLUMN_ALIASES[c] if c in renamed else c for c in header]
        folded = any(c in header and c not in columns for c in FOLDED)
        if folded:
            header, rows = self.fold_columns(header, rows, columns)
            if header is None:
                return lines
        unknown = [c for c in header if c not in columns]
        if 'Work' in unknown and 'Description' in columns:
            self.decide.append('Work Breakdown has Work, not Description: rename it and end each cell with '
                               'the acceptance criteria the row delivers')
            return lines
        if unknown:
            self.decide.append(f'Work Breakdown column not in the template: {", ".join(unknown)}')
            return lines

        width = len(header)
        for r in rows:
            if len(r) > width:
                self.decide.append(f'Work Breakdown row wider than its header: {r[0]}')
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
        pattern = ROW_ID[self.kind]
        for r in padded:
            if not pattern.fullmatch(re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', r[0])):
                self.decide.append(f'Work Breakdown row id not of the form {pattern.pattern}: '
                                   f'{LINK.sub(chr(92) + "1", r[0])}')
        table = [row(columns), row(['---'] * len(columns))] + [row(r) for r in padded]
        if header == columns and padded == rows and not folded and not renamed:
            return lines
        return lines[:start] + table + lines[end:]

    def strip_prose(self, lines: list[str]) -> list[str]:
        """Keep the Work Breakdown to its table: drop the house's old explanatory sentences."""
        out, dropped, other = [], 0, []
        for line in lines:
            if line.startswith(HOUSE_PROSE):
                dropped += 1
            else:
                out.append(line)
                if line.strip() and not line.startswith('|'):
                    other.append(line.strip()[:60])
        if dropped:
            self.fixed.append(f'Work Breakdown explanatory sentences removed: {dropped}')
        if other:
            self.decide.append('Work Breakdown holds prose outside its table: ' + ' / '.join(other))
        while out and not out[0].strip():
            out.pop(0)
        return out

    def check_dependencies(self, lines: list[str]) -> None:
        table = [l for l in lines if l.startswith('|')]
        if len(table) < 3 or 'Depends on' not in cells(table[0]):
            return
        at = cells(table[0]).index('Depends on')
        for line in table[2:]:
            r = cells(line)
            items = [LINK.sub(r'\1', x).strip() for x in (r[at] if at < len(r) else '').split(',')]
            prose = [x for x in items if x and not DEPENDENCY[self.kind].fullmatch(x)]
            if prose:
                what = 'epics' if self.kind == 'initiative' else 'references'
                self.decide.append(f'{LINK.sub(chr(92) + "1", r[0])}: Depends on holds more than '
                                   f'{what}: {", ".join(prose)}')

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

    def fold_columns(self, header: list[str], rows: list[list[str]], columns: list[str]):
        """Move a PR or Issue column's link onto each row id, and drop the column."""
        base = self.issue.get('html_url', '').rsplit('/issues/', 1)[0]
        for name in FOLDED:
            if name not in header or name in columns:
                continue
            at = header.index(name)
            out = []
            for r in rows:
                cell = r[at] if at < len(r) else ''
                link, number = LINK.fullmatch(cell), re.fullmatch(r'#(\d+)', cell)
                url = link[2] if link else f'{base}/issues/{number[1]}' if number else None
                current, ident = LINK.fullmatch(r[0]), r[0]
                plain = LINK.sub(r'\1', ident)
                if url and not current:
                    ident = f'[{plain}]({url})'
                elif url and current[2] != url:
                    self.decide.append(f'{plain}: id links {current[2]}, but its {name} cell holds {cell}')
                    return None, None
                elif not url and cell not in ('', 'in flight'):
                    self.decide.append(f'{plain}: {name} cell "{cell}" is not one link a row id can carry')
                    return None, None
                out.append([ident] + [c for i, c in enumerate(r[1:], 1) if i != at])
            self.fixed.append(f'{name} column folded into row-id links')
            header, rows = [c for c in header if c != name], out
        return header, rows

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
                self.decide.append(f'Non-goals: not one sentence: "{words}…"')
            named = sorted(set(REFERENCE.findall(line)))
            if named:
                self.decide.append(f'Non-goals: names {", ".join(named)}; a non-goal names no initiative, epic, '
                                   f'task or issue: "{words}…"')

    def fix_list(self, lines: list[str], tag: str, checkbox: bool) -> list[str]:
        """Checkbox and label a list's items; tag is AC, G or R."""
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
        label = {'AC': AC, 'G': GOAL, 'R': REF}[tag]
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
    parser.add_argument('--fix', help='write the mechanically fixed body here')
    args = parser.parse_args()

    issue = json.loads(Path(args.issue).read_text())
    initiative = json.loads(Path(args.initiative).read_text()) if args.initiative else None
    review = Review(issue, initiative)
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
