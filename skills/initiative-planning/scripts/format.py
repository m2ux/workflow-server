"""Check an initiative, epic or task issue against its house template, and fix what is mechanical.

Usage:
  python3 format.py issue-943.json [--fix fixed-943.md]

issue-943.json is the issue as `gh api repos/{owner}/{repo}/issues/943` returns it. The kind comes
from the title prefix: [I07] initiative, [I07:E00] epic, [I07:E00:W01] task. The format is read
from templates/<kind>.md beside this script: its sections and their order, the sections it marks
optional ("Delete the section"), its fixed sentences, and its Work Breakdown columns.

Fixed in the body written to --fix, keeping the issue's wording:
  - a section alias renamed: Progress, Outcome or Where this stands to Where it stands, and
    Solution to Proposal on an open epic (a closed epic keeps Solution)
  - template sections put in template order, each extra section moving with the one before it
  - missing Work Breakdown columns added, empty, when the present columns are in template order
  - table rows padded to the header's width
  - acceptance criteria made checkboxes, labelled **ACn.** when none is labelled; references
    labelled **Rn.** when none is
Printed as fixes to apply to the issue itself:
  - a title prefix that separates levels with spaces, with its colon form
  - a type:* label that does not match the title's level
Left to decide, since each needs new content or a judgement:
  - a body that follows another kind's template
  - a required section missing, an extra section, or text before the first section
  - a fixed template sentence missing or reworded
  - a Work Breakdown column the template lacks, columns out of order, or a row id of the wrong form
  - acceptance criteria or references partly labelled or numbered out of sequence
  - no theme:* label on an initiative or epic, or a title without "Name: Subtitle"
  - an unfilled {{...}} field or #E00 placeholder

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
ALIASES = {'Progress': 'Where it stands', 'Outcome': 'Where it stands',
           'Where this stands': 'Where it stands'}
ROW_ID = {'initiative': re.compile(r'E\d\d'), 'epic': re.compile(r'W\d\d')}
AC = re.compile(r'^- \[[ xX]\] \*\*AC(\d+)\.\*\*')
REF = re.compile(r'^- \*\*R(\d+)\.\*\*')


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


def paragraphs(lines: list[str]) -> list[str]:
    return [' '.join(p.split()) for p in re.split(r'\n\s*\n', '\n'.join(lines)) if p.strip()]


class Template:
    def __init__(self, kind: str):
        _, sections = split_sections((TEMPLATES / f'{kind}.md').read_text())
        self.headings = [h for h, _ in sections]
        self.optional = {h for h, lines in sections if 'Delete the section' in '\n'.join(lines)}
        self.fixed = {h: [p for p in paragraphs(lines)
                          if '{{' not in p and not p.startswith(('|', '- '))]
                      for h, lines in sections}
        self.columns = next((cells(l) for h, lines in sections for l in lines
                             if h == 'Work Breakdown' and l.startswith('|')), None)


class Review:
    def __init__(self, issue: dict):
        self.issue = issue
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
        closed_epic = self.kind == 'epic' and self.issue.get('state') == 'closed'

        aliases = dict(ALIASES)
        if self.kind == 'epic':
            aliases['Solution'] = 'Proposal'
        names = [aliases.get(h, h) for h, _ in sections]
        own = sum(h in template.headings for h in names)
        for other in KINDS.values():
            if other != self.kind and sum(h in Template(other).headings for h in names) > own:
                self.decide.append(f'body follows the {other} template, not the {self.kind} one')
                return body

        present = {h for h, _ in sections}
        for section in sections:
            target = aliases.get(section[0])
            if target and target in template.headings and target not in present:
                if section[0] == 'Solution' and closed_epic:
                    continue
                self.fixed.append(f'section "{section[0]}" renamed "{target}"')
                present.add(target)
                section[0] = target

        def canonical(h: str) -> str:
            return 'Proposal' if closed_epic and h == 'Solution' else h

        names = [canonical(h) for h, _ in sections]

        if '\n'.join(preamble).strip():
            self.decide.append('text before the first section')
        for h in template.headings:
            if h not in names and h not in template.optional:
                self.decide.append(f'required section missing: {h}')
        for h in names:
            if h not in template.headings:
                self.decide.append(f'extra section: {h}')

        sections = self.reorder(sections, template, canonical)
        for section in sections:
            h = canonical(section[0])
            text = ' '.join(paragraphs(section[1]))
            for sentence in template.fixed.get(h, []):
                if sentence not in text:
                    self.decide.append(f'{h}: fixed sentence missing or reworded: "{sentence[:70]}…"')
            if h == 'Work Breakdown' and template.columns:
                section[1] = self.fix_table(section[1], template.columns)
            elif h == 'Acceptance criteria':
                section[1] = self.fix_list(section[1], 'AC', checkbox=True)
            elif h == 'References':
                section[1] = self.fix_list(section[1], 'R', checkbox=False)

        fixed = join_sections(preamble, sections) if self.fixed else body
        if '{{' in fixed:
            self.decide.append('unfilled {{…}} field')
        if re.search(r'#E\d\d\b', fixed):
            self.decide.append('unreplaced #Exx placeholder')
        return fixed

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
        if [c for c in columns if c in header] != header:
            self.decide.append('Work Breakdown columns out of template order')
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
            self.fixed.append('Work Breakdown columns added: ' +
                              ', '.join(c for c in columns if c not in header))
            padded = [[r[header.index(c)] if c in header else '' for c in columns] for r in padded]
        pattern = ROW_ID[self.kind]
        for r in padded:
            if not pattern.fullmatch(re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', r[0])):
                self.decide.append(f'Work Breakdown row id not of the form {pattern.pattern}: {r[0]}')
        table = [row(columns), row(['---'] * len(columns))] + [row(r) for r in padded]
        if header == columns and padded == rows:
            return lines
        return lines[:start] + table + lines[end:]

    def fix_list(self, lines: list[str], tag: str, checkbox: bool) -> list[str]:
        items = [i for i, l in enumerate(lines) if l.startswith('- ')]
        if not items:
            return lines
        lines = list(lines)
        if checkbox:
            plain = [i for i in items if not re.match(r'^- \[[ xX]\] ', lines[i])]
            for i in plain:
                lines[i] = '- [ ] ' + lines[i][2:]
            if plain:
                self.fixed.append(f'{len(plain)} acceptance criteria made checkboxes')
        label = AC if tag == 'AC' else REF
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
    parser.add_argument('--fix', help='write the mechanically fixed body here')
    args = parser.parse_args()

    issue = json.loads(Path(args.issue).read_text())
    review = Review(issue)
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
