"""Kind search and route checks for the W34 general callers.

Usage: python3 w34-routes.py <skills/work-planner> [<directory holding the base revision's six files>]

The kind search finds each name of a kind of work outside the plan hierarchy (initiative, epic and its task
rows) - a capitalised Proposal names the body section, a literal - and each link to a kind artifact, in Deliver
Mode, Hoist Mode, Unit Dispatch, Issue Delivery, Task Merge and Issue Closure. The route check reads the kind
registration in SKILL.md and resolves each interface operation those files select, with the inputs the
selecting line supplies, to the operation every registering kind's artifact supplies. The script registry
selects a kind from captured titles.
"""
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT / 'test'))
sys.path.insert(0, str(ROOT / 'scripts'))
import test_kind_operations as kinds_test  # noqa: E402
from kinds import kind_of  # noqa: E402

failures = []
kind_artifacts = {(ROOT / path).resolve() for kind, artifacts in kinds_test.registration().items()
                  if kind not in kinds_test.HIERARCHY for path, _, _ in artifacts}


def search(path, base_dir):
    lines = path.read_text().splitlines()
    hits = [(n, line.strip()) for n, line in enumerate(lines, 1) if kinds_test.KIND_NAMES.search(line)]
    links = []
    for n, line in enumerate(lines, 1):
        for _, target in kinds_test.NAMED.findall(line):
            name = target.partition('#')[0]
            if name and (base_dir / name).resolve() in kind_artifacts:
                links.append((n, target))
    return hits, links


for label, folder in (('head', None), ('base', Path(sys.argv[2]) if len(sys.argv) > 2 else None)):
    if label == 'base' and folder is None:
        continue
    total = 0
    print(f'Kind search at the {label}:')
    for name in kinds_test.DECLARED:
        path = ROOT / name if folder is None else folder / Path(name).name
        hits, links = search(path, (ROOT / name).parent)
        total += len(hits) + len(links)
        print(f'  {name}: {len(hits)} kind names, {len(links)} kind-artifact links')
        for n, line in hits:
            print(f'    {n}: {line[:150]}')
        for n, target in links:
            print(f'    {n}: link {target}')
        if label == 'head' and (hits or links):
            failures.append(f'{name}: kind mention at the head')
    print(f'  matches: {total}')

print('Routes selected through the registration:')
for name in kinds_test.interface_names():
    sites = kinds_test.selections(name, kinds_test.DECLARED)
    for where, line in sites:
        inputs = line.rsplit(' supplies', 1)[1].strip(' ,.') if ' supplies' in line else ''
        print(f'  {where}: {name} <- "{inputs[:110]}"')
    for kind in kinds_test.registration():
        found = kinds_test.resolve(name, kind)
        if found is None:
            continue
        path, operation = found
        present = operation in kinds_test.operations(ROOT / path)
        print(f'    {kind}: -> {path}#{operation}' + ('' if present else ' (missing)'))
        if not present:
            failures.append(f'{kind}: {name} resolves to missing {operation}')
    if not sites:
        failures.append(f'{name}: no declared file selects it')

captured = {'[F00] Board: Status': 'hot-fix', '[I17:E02] Skill Separation': None, 'Name: Subtitle': None}
print('Script registry selection on captured titles:')
for title, expected in captured.items():
    got = kind_of({'title': title})
    print(f'  {title!r} -> {got}')
    if got != expected:
        failures.append(f'{title}: kind_of gave {got}, expected {expected}')

print('Failures:', failures or 'none')
sys.exit(1 if failures else 0)
