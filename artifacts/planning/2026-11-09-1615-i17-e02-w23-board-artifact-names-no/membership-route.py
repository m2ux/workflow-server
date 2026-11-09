"""Kind search and membership route check for the Board artifact.

Usage: python3 membership-route.py <skills/work-planner>

Kind search: every line of artifacts/board.md naming a registered kind that
departs from the planning hierarchy (Standalone issue, Hot-fix) or its title tag.

Route check: Board's Membership section links the registration and Status
Changes; every registered kind resolves to one membership route: its Settle
Board Status operation (which must reach Board's operations), its own
artifact's off-board rule, or Status Changes.
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
KIND_TERMS = re.compile(r'hot-?fix|standalone|\[F\d\d\]', re.IGNORECASE)
failures = []


def anchors(path):
    return {checker.anchor_of(title) for _, _, title in checker.scan(path)[2]}


def resolves(base, target):
    name, _, fragment = target.partition('#')
    path = (base.parent / name).resolve() if name else base
    return path.is_file() and (not fragment or fragment in anchors(path)), path


def section(path, heading):
    lines = path.read_text().splitlines()
    if heading not in lines:
        failures.append(f'{path.name}: no {heading}')
        return ''
    start = lines.index(heading)
    level = heading.split(' ')[0]
    end = next((i for i in range(start + 1, len(lines))
                if lines[i].startswith('#') and len(lines[i].split(' ')[0]) <= len(level)), len(lines))
    return '\n'.join(lines[start:end])


board = ROOT / 'artifacts' / 'board.md'
print('Kind search over artifacts/board.md:')
hits = [(n, line) for n, line in enumerate(board.read_text().splitlines(), 1) if KIND_TERMS.search(line)]
for n, line in hits:
    print(f'  {n}: {line}')
    failures.append(f'board.md:{n} names a kind')
print(f'  {len(hits)} hits')

membership = section(board, '### Membership')
links = dict((t, x) for x, t in LINK.findall(membership))
print('Membership links:')
for target in links:
    ok, _ = resolves(board, target)
    print(f'  {target} [{"resolves" if ok else "missing"}]')
    failures += [] if ok else [f'Membership link {target} missing']
for required in ('../SKILL.md', 'board-delivery.md#status-changes'):
    if required not in links:
        failures.append(f'Membership does not link {required}')

skill = (ROOT / 'SKILL.md').read_text().splitlines()
kinds, kind = {}, None
for line in skill[:skill.index('## Modes')]:
    if line.startswith('A kind supplies'):
        break
    lead = re.match(r'- \*\*([^*]+)\*\*', line)
    if lead:
        kind = lead.group(1)
        kinds[kind] = []
    elif line.startswith('  - [') and kind:
        first = LINK.search(line)
        rest = line[first.end():]
        linked = {text: target for text, target in LINK.findall(rest)}
        ops = linked or {o.strip(): None for o in rest.split(',') if o.strip()}
        kinds[kind].append((first.group(2), ops))

BOARD_OPS = ('board.md#read-board-state', 'board.md#place-issue-on-board', 'board.md#remove-board-item')
print('Membership route for each registered kind:')
for kind, artifacts in kinds.items():
    route = None
    for target, ops in artifacts:
        path = ROOT / target
        if 'Settle Board Status' in ops:
            heading = f'### Settle {kind.split(" ")[0]} Board Status'
            linked = ops['Settle Board Status']
            if linked:
                ok, path = resolves(ROOT / 'SKILL.md', linked)
                failures += [] if ok else [f'{kind}: Settle Board Status link {linked} missing']
                if ok:
                    heading = next(f'### {t}' for _, _, t in checker.scan(path)[2]
                                   if checker.anchor_of(t) == linked.partition('#')[2])
            body = section(path, heading)
            reached = [op for op in BOARD_OPS if op in body]
            route = f'{heading[4:]} in {target}, reaching {", ".join(reached)}'
            if len(reached) != len(BOARD_OPS):
                failures.append(f'{kind}: Settle Board Status reaches {reached}')
        elif 'sits on no board' in path.read_text():
            route = f'off every board, by {target}#placement'
            if 'placement' not in anchors(path):
                failures.append(f'{kind}: no Placement section in {target}')
    print(f'  {kind}: {route or "Status Changes (board-delivery.md#status-changes)"}')

print('Failures:' if failures else 'No failures')
for failure in failures:
    print(f'  {failure}')
sys.exit(1 if failures else 0)
