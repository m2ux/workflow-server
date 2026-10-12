"""Score a retrieval trace against the prerequisites each specification cites.

The acceptance rule asks whether every cited section was received before the
specification citing it. Receipt order is byte order, so a prerequisite earlier
in the same delivered range counts as received first; that case is reported
separately, because a range covering both is its own anti-pattern.
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from read_trace import trace

CATALOG = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices'
               '/skills/workflow-canon/references/commands.md')
HEADING = re.compile(r'^(#{2,3})\s+(.*)$')
CITES = re.compile(r'Read ((?:\[\d+\]\([^)]+\)(?:,\s*)?)+) first')
LINK = re.compile(r'\[(\d+)\]\(([^)]+)\)')


def slug(text):
    return re.sub(r'[\s_]+', '-', re.sub(r'[^\w\s-]', '', text.strip().lower()))


def sections(path):
    """Anchor to (start, end) over the file's own line numbers."""
    lines = path.read_text().splitlines()
    marks = [(index + 1, slug(m.group(2))) for index, line in enumerate(lines) if (m := HEADING.match(line))]
    spans = {}
    for position, (start, anchor) in enumerate(marks):
        end = marks[position + 1][0] - 1 if position + 1 < len(marks) else len(lines)
        spans[anchor] = (start, end)
    return spans, lines


def citations(lines, spans):
    """Specification anchor to the prerequisite anchors it cites, in cited order."""
    found = {}
    for anchor, (start, end) in spans.items():
        for line in lines[start - 1:end]:
            if match := CITES.search(line):
                ordered = sorted(LINK.findall(match.group(1)), key=lambda pair: int(pair[0]))
                found[anchor] = [target.lstrip('#') for _, target in ordered if target.startswith('#')]
                break
    return found


def first_delivery(entries, path_name, span):
    """Index and in-range offset of the first read delivering any of span's lines."""
    start, end = span
    for index, (kind, target, read_start, read_end, _) in enumerate(entries):
        if kind != 'read' or not target or Path(target).name != path_name:
            continue
        if read_start <= end and (read_end is None or read_end >= start):
            return index, max(read_start, start)
    return None, None


def score(path):
    spans, lines = sections(CATALOG)
    cited = citations(lines, spans)
    entries = trace(path)
    verdicts = []
    for spec, prerequisites in sorted(cited.items()):
        spec_at, spec_line = first_delivery(entries, CATALOG.name, spans[spec])
        if spec_at is None:
            continue
        for anchor in prerequisites:
            if anchor not in spans:
                verdicts.append((spec, anchor, 'unknown anchor', ''))
                continue
            pre_at, pre_line = first_delivery(entries, CATALOG.name, spans[anchor])
            if pre_at is None:
                verdicts.append((spec, anchor, 'FAIL', 'never delivered'))
            elif pre_at < spec_at:
                verdicts.append((spec, anchor, 'pass', f'call {pre_at + 1} before call {spec_at + 1}'))
            elif pre_at == spec_at and pre_line < spec_line:
                verdicts.append((spec, anchor, 'pass', f'same call {spec_at + 1}, line {pre_line} before {spec_line}'))
            else:
                verdicts.append((spec, anchor, 'FAIL', f'call {pre_at + 1} not before call {spec_at + 1}'))
    return verdicts


for argument in sys.argv[1:]:
    results = score(argument)
    failed = [row for row in results if row[2] == 'FAIL']
    same = [row for row in results if 'same call' in row[3]]
    print(f'=== {Path(argument).name}: {len(results)} cited pairs reached, {len(failed)} failed, '
          f'{len(same)} satisfied inside one range')
    for spec, anchor, verdict, detail in results:
        print(f'  {verdict:<14} {spec} needs {anchor}   {detail}')
    print()
