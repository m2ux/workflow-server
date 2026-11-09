"""Kind search and route checks for Align Mode.

Usage: python3 align-routes.py <skills/work-planner> [<base revision's align-mode.md>]

The kind search finds each name of a kind of work outside the plan hierarchy Align's scope names
(initiative, epic and its task rows) — a capitalised Proposal names the body section, a literal — and each kind-specific validate or populate operation, in Align
Mode. The route check reads the kind registration in SKILL.md and, for each registered kind, resolves
the validation and boundary routes Align Mode selects through it, comparing each with the route the
base revision named directly.
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

ALIGN = ROOT / 'modes' / 'align-mode.md'
KIND_NAMES = re.compile(r'\b(proposals?|[Ss]tandalone|[Hh]ot-?fix(es)?)\b')
KIND_OPERATIONS = re.compile(r'\b(Validate|Populate) (Proposal|Initiative|Epic|Task|Standalone|Hot-fix)\b')
LINK = re.compile(r'\[([^\]]+)\]\(([^)\s#]+)\)')
failures = []


def headings(path):
    return [title for _, _, title in checker.scan(path)[2]]


def operations(path):
    lines, _, found = checker.scan(path)
    section = next((i for i, depth, title in found if depth == 2 and title == 'Operations'), None)
    if section is None:
        return []
    end = checker.heading_end(found, section, 2, len(lines))
    return [title for start, depth, title in found if section < start < end and depth == 3]


print('Kind search over', ALIGN.relative_to(ROOT))
text = ALIGN.read_text().splitlines()
hits = [(n + 1, line) for n, line in enumerate(text) if KIND_NAMES.search(line) or KIND_OPERATIONS.search(line)]
for n, line in hits:
    print(f'  {n}: {line.strip()}')
print('  matches:', len(hits))
failures += [f'kind mention at align-mode.md:{n}' for n, _ in hits]
selections = [n + 1 for n, line in enumerate(text) if '](../SKILL.md)' in line]
print('  registration selections at lines', selections)
if not selections:
    failures.append('Align Mode selects no kind through the registration')

if len(sys.argv) > 2:
    base = Path(sys.argv[2]).read_text().splitlines()
    before = [(n + 1, line.strip()) for n, line in enumerate(base) if KIND_NAMES.search(line) or KIND_OPERATIONS.search(line)]
    print('Kind mentions at the base revision:', len(before))
    for n, line in before:
        print(f'  {n}: {line[:140]}')

lines = (ROOT / 'SKILL.md').read_text().splitlines()
registration = {}
kind = None
for line in lines[:lines.index('## Modes')]:
    lead = re.match(r'- \*\*([^*]+)\*\*  ', line)
    if lead:
        kind = lead.group(1)
        registration[kind] = []
    elif kind and line.startswith('  - ['):
        name, target = LINK.search(line).groups()
        supplied = line.split(')', 1)[1].strip()
        registration[kind].append((name, ROOT / target, [o for o in supplied.split(', ') if o]))
    elif line.startswith('A kind supplies'):
        kind = None

# The route the base revision named directly for each kind it listed.
BASE_VALIDATE = {
    'Proposal': 'Validate Proposal Body',
    'Initiative': 'Validate Initiative Body',
    'Epic': 'Validate Epic Body',
    'Task': 'Validate Issue Body with task-body.md Fields',
    'Standalone issue': 'Validate Issue Body with standalone-body.md Fields',
}
BASE_BOUNDARY = {'Standalone issue': 'Populate Standalone Body'}
# Captured kind facts the boundary route reads: whether the kind's issues sit in an initiative.
IN_INITIATIVE = {'Proposal': False, 'Initiative': True, 'Epic': True, 'Task': True,
                 'Standalone issue': False, 'Hot-fix': False}

print('Routes selected through the registration:')
for kind, artifacts in registration.items():
    body = next(((n, p, ops) for n, p, ops in artifacts if n.endswith('Body')), None)
    if body is None:
        failures.append(f'{kind}: no body artifact registered')
        continue
    name, path, supplied = body
    validate = [t for t in operations(path) if t.startswith('Validate ')]
    if validate:
        route = validate[0]
    elif 'Fields' in headings(path):
        route = f'Validate Issue Body with {path.name} Fields'
    else:
        route = None
        failures.append(f'{kind}: no validate operation and no Fields')
    template = '\n'.join(path.read_text().splitlines())
    sections = re.search(r'### Sections\n\n(.+)', template)
    inherits = sections and LINK.search(sections.group(1))
    holder = (path.parent / inherits.group(2)).resolve() if inherits else path
    non_goals = '## Non-Goals' in holder.read_text()
    boundary = None
    if not non_goals and not IN_INITIATIVE[kind]:
        if 'Populate Body' not in supplied:
            failures.append(f'{kind}: outside an initiative with no Non-Goals but supplies no Populate Body')
        else:
            stem = re.sub(r' Body$', '', name)
            heading = f'Populate {stem} Body'
            present = checker.anchor_of(heading) in {checker.anchor_of(t) for t in headings(path)}
            boundary = heading + ('' if present else ' (not yet in artifact)')
    print(f'  {kind}: validate -> {route}; boundary -> {boundary or "initiative Non-Goals or own section"}')
    if kind in BASE_VALIDATE and BASE_VALIDATE[kind] != route:
        failures.append(f'{kind}: validate route {route} differs from base {BASE_VALIDATE[kind]}')
    if BASE_BOUNDARY.get(kind) and BASE_BOUNDARY[kind] != boundary:
        failures.append(f'{kind}: boundary route {boundary} differs from base {BASE_BOUNDARY[kind]}')

sys.path.insert(0, str(ROOT / 'scripts'))
from kinds import kind_of
captured = {'[F00] Board: Status': 'hot-fix', '[I17:E02] Skill Separation': None, 'Name: Subtitle': None}
print('Script registry selection on captured titles:')
for title, expected in captured.items():
    got = kind_of({'title': title})
    print(f'  {title!r} -> {got}')
    if got != expected:
        failures.append(f'{title}: kind_of gave {got}, expected {expected}')

print('Failures:', failures or 'none')
sys.exit(1 if failures else 0)
