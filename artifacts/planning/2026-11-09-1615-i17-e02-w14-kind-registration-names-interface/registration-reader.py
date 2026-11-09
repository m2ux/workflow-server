"""Read the kind registration in SKILL.md and resolve every link it holds.

Usage: python3 w14-registration-reader.py <skills/work-planner>
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
lines = (ROOT / 'SKILL.md').read_text().splitlines()
end = lines.index('## Modes')
opening = lines[:end]


def anchors(path):
    return {checker.anchor_of(title) for _, _, title in checker.scan(path)[2]}


def resolve(target):
    name, _, fragment = target.partition('#')
    path = (ROOT / name).resolve()
    if not path.is_file():
        return False, f'missing file {name}'
    if fragment and checker.anchor_of(fragment) not in anchors(path):
        return False, f'missing anchor {target}'
    return True, target


interface = {}
kinds = {}
kind = None
section = 'kinds'
failures = []
for line in opening:
    if line.startswith('A kind supplies'):
        section = 'interface'
    lead = re.match(r'- \*\*([^*]+)\*\*', line)
    if section == 'kinds' and lead:
        kind = lead.group(1)
        kinds[kind] = []
    elif section == 'kinds' and line.startswith('  - [') and kind:
        text, target = LINK.search(line).groups()
        ops = line.split(')', 1)[1].strip()
        kinds[kind].append((text, target, [o.strip() for o in ops.split(',') if o.strip()]))
    elif section == 'interface' and lead:
        name = lead.group(1)
        interface[name] = None
    elif section == 'interface' and line.startswith('  [') and interface:
        name = list(interface)[-1]
        interface[name] = LINK.search(line).groups()

print('Interface operations and the general contract each fills:')
for name, (text, target) in interface.items():
    ok, note = resolve(target)
    failures += [] if ok else [note]
    print(f'  {name}: {text} -> {target} [{"resolves" if ok else note}]')

print('Kinds, their artifacts and the interface operations each supplies:')
for kind, artifacts in kinds.items():
    print(f'  {kind}')
    if not artifacts:
        failures.append(f'{kind} names no artifact')
    for text, target, ops in artifacts:
        ok, note = resolve(target)
        failures += [] if ok else [note]
        print(f'    {text} -> {target} [{"resolves" if ok else note}]')
        for op in ops:
            if op not in interface:
                failures.append(f'{kind}: {op} is not a registered operation')
            verb, _, rest = op.partition(' ')
            stem = re.sub(r' Body$', '', text)
            heading = f'{verb} {stem} {rest}'.strip() if rest else f'{verb} {stem}'
            present = checker.anchor_of(heading) in anchors((ROOT / target).resolve())
            print(f'      {op}: {heading} [{"present" if present else "not yet in artifact"}]')

print('Kinds:', len(kinds), 'Interface operations:', len(interface))
print('Failures:', failures or 'none')
sys.exit(1 if failures else 0)
