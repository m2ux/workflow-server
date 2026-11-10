"""Kind search, field-boundary checks and caller-route checks for W35's general artifacts.

Usage: python3 kind-routes.py <skills/work-planner>

Kind search: every line of the eight declared artifacts naming a registered kind
that departs from the planning hierarchy, its title tag or one of its own
artifacts, outside inline code (literal examples stay as controls).

Field-boundary check: the Fields of Delivery Branches and Delivery Brief carry no
fetch, report, refusal or caller-finding clause.

Caller-route checks: each moved clause has its owning operation, every link in
the declared files resolves, and each registered kind resolves to the route the
general files select through the registration.
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
sys.path.insert(0, str(ROOT / 'scripts'))
import check_skill_files as checker

DECLARED = ('delivery-plan', 'delivery-branches', 'delivery-brief', 'dispatch-batch',
            'board-queue', 'pull-request', 'agent-review', 'standup-report')
LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
CODE = re.compile(r'`[^`]*`')
KIND_TERMS = re.compile(r'hot-?fix|standalone|proposal-body|\[F\d\d\]|startswith\("\[F', re.IGNORECASE)
ACTION = re.compile(r'\bis fetched\b|\breport(s|ed)?\b|\brefuse|\bfinding provided\b|\bprovided to the caller\b',
                    re.IGNORECASE)
failures = []


def art(name):
    return ROOT / 'artifacts' / f'{name}.md'


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


def need(ok, message):
    print(f'  {"ok" if ok else "FAIL"}: {message}')
    if not ok:
        failures.append(message)


print('Kind search over the declared artifacts:')
total = 0
for name in DECLARED:
    for n, line in enumerate(art(name).read_text().splitlines(), 1):
        if KIND_TERMS.search(CODE.sub('', line)) or re.search(r'\]\((hotfix|hotfix-body|standalone-body|proposal-body)\.md', line):
            total += 1
            print(f'  {name}.md:{n}: {line.strip()[:160]}')
            failures.append(f'{name}.md:{n} names a kind')
print(f'  {total} hits')

print('Field-boundary check:')
for name in ('delivery-branches', 'delivery-brief'):
    fields = section(art(name), '## Fields')
    hits = [line for line in fields.splitlines() if ACTION.search(CODE.sub('', line))]
    for line in hits:
        print(f'  {name}.md Fields: {line.strip()[:160]}')
        failures.append(f'{name}.md Fields carry an action clause')
    print(f'  {name}.md Fields: {len(hits)} action clauses')

print('Caller routes for moved clauses:')
branches = art('delivery-branches')
read = section(branches, '### Read Delivery Branches')
need('#fetch-remote-branch' in read, 'Read Delivery Branches fetches its evaluated revision')
for caller in ('modes/deliver-mode.md', 'modes/align-mode.md', 'protocols/issue-closure.md'):
    need('delivery-branches.md#read-delivery-branches' in (ROOT / caller).read_text(),
         f'{caller} reaches Read Delivery Branches')
need('#fetch-remote-branch' in section(branches, '### Prepare Delivery Bases'),
     'Prepare Delivery Bases fetches the branch it evaluates')
sync_epic = section(ROOT / 'artifacts' / 'epic-issue-body.md', '### Sync Epic')
need('disagree' in sync_epic and 'unevaluable' in sync_epic, 'Sync Epic reports disagreeing declarations')
findings = (ROOT / 'artifacts' / 'epic.md').read_text()
need('| Target |' in findings, 'Delivery Findings states the target finding an epic sync reports')
need('delivery-brief.md#missing-context' in (ROOT / 'protocols' / 'unit-dispatch.md').read_text(),
     'Unit Dispatch retains and resolves missing brief context')
need('Provide missing context' in (ROOT / 'modes' / 'deliver-mode.md').read_text(),
     'Run Delivery Session provides missing brief context')
need('instruction or prerequisite' in section(art('delivery-brief'), '### Missing Context'),
     'Missing Context holds a missing instruction or prerequisite')

print('Links in the declared artifacts:')
count = 0
for name in DECLARED:
    for text, target in LINK.findall(art(name).read_text()):
        if target.startswith('http'):
            continue
        count += 1
        ok, _ = resolves(art(name), target)
        if not ok:
            need(False, f'{name}.md link {target} resolves')
print(f'  {count} links checked')

print('Registered kinds and the routes the general files select:')
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
        ops = {text for text, _ in LINK.findall(line[first.end():])}
        ops |= {o.strip() for o in line[first.end():].split(',') if o.strip() and '[' not in o}
        kinds[kind].append((ROOT / first.group(2), ops))

import kinds as registry
units = []
for kind, artifacts in kinds.items():
    ops = set().union(*(o for _, o in artifacts))
    heads = set().union(*(anchors(p) for p, _ in artifacts))
    unit = 'delivery-unit' in heads
    routes = []
    if unit:
        units.append(kind)
        for field in ('branch', 'delivering-pull-request'):
            need(field in heads, f'{kind}: kind unit names its {field}')
        routes.append('kind unit (Delivery Unit, Branch, Delivering Pull Request)')
    if 'Review Before Merge' in ops:
        text = ' '.join(p.read_text() for p, _ in artifacts)
        need('as a draft' in text, f'{kind}: Review Before Merge kind opens its delivering pull request as a draft')
        routes.append('draft pull request, readied by Review Before Merge')
    if 'Settle Board Status' in ops:
        need(any(f'### Settle {kind.split(" ")[0]} Board Status' in p.read_text() for p, _ in artifacts),
             f'{kind}: its artifact supplies Settle Board Status')
        need('board.md#membership' in art('board-queue').read_text(), 'Board Queue reaches Membership')
        routes.append('board status through Settle Board Status')
    print(f'  {kind}: {"; ".join(routes) or "general routes only"}')

print('Script registry against the registration:')
for name in registry.KINDS:
    need(name.lower() in {k.lower() for k in units}, f'script kind {name} is a registered kind unit')
    operations = registry.interface(name)
    tag = operations.tag({'title': '[F04] Reject Bad Keys'})
    need(tag is not None and f'[{tag}] Reject Bad Keys'.startswith('['),
         f'the delivery pull request fetch keeps a captured {name} title, [{tag}]')
    need(registry.kind_of({'title': '[I07:E00] Purpose'}) is None, 'an initiative title selects no kind')
pull = art('pull-request').read_text()
need(pull.count('select(.title | startswith("["))') == 2, 'both delivery fetches select every bracketed tag')

print('Failures:' if failures else 'No failures')
for failure in failures:
    print(f'  {failure}')
sys.exit(1 if failures else 0)
