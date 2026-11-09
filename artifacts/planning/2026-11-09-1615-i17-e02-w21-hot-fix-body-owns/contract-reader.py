"""Check the hot-fix body population against the kind registration and its callers.

Usage: python3 contract-reader.py <skills/work-planner>
"""
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

LINK = re.compile(r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)')
ARTIFACT = ROOT / 'artifacts' / 'hotfix-body.md'
OPERATION = 'Populate Hot-fix Body'
ANCHOR = checker.anchor_of(OPERATION)
INPUTS = ('Hot-fix Identity', 'Defect Evidence', 'Target', 'Output Body')
failures = []


def check(condition, note):
    print(f'  [{"ok" if condition else "FAIL"}] {note}')
    if not condition:
        failures.append(note)


def sections(path):
    lines, _, headings = checker.scan(path)
    return lines, headings


def body_of(path, title, depth):
    lines, headings = sections(path)
    start = next(i for i, d, t in headings if d == depth and t == title)
    end = checker.heading_end(headings, start, depth, len(lines))
    return lines[start:end]


def anchors(path):
    return {checker.anchor_of(t) for _, _, t in sections(path)[1]}


print('Registration')
skill = (ROOT / 'SKILL.md').read_text().splitlines()
entry = next(line for line in skill if '(artifacts/hotfix-body.md)' in line)
text = LINK.search(entry).group(1)
ops = [name for name, _, _ in LINK.findall(entry.split(')', 1)[1])]
check(ops == ['Populate Body'], f'{text} registers Populate Body: {entry.strip()}')
check(f'(artifacts/hotfix-body.md#{ANCHOR} "ƒ")' in entry, f'the registration links Populate Body to #{ANCHOR}')
derived = 'Populate ' + re.sub(r' Body$', '', text) + ' Body'
check(derived == OPERATION, f'naming rule derives {derived}')
contract = next(i for i, line in enumerate(skill) if line.startswith('- **Populate Body**'))
check('artifacts/issue-body.md#body' in skill[contract + 1], f'contract: {skill[contract + 1].strip()}')

print('Operation')
lines, headings = sections(ARTIFACT)
operations = next((i for i, d, t in headings if d == 2 and t == 'Operations'), None)
check(operations is not None, 'hotfix-body.md has an Operations section')
owned = [t for i, d, t in headings if d == 3 and operations is not None and i > operations
         and i < checker.heading_end(headings, operations, 2, len(lines))]
check(owned == [OPERATION], f'Operations holds {owned}')
procedure = body_of(ARTIFACT, OPERATION, 3)
steps = [line for line in procedure if line.startswith('#### ')]
print('  steps:', steps)
check(steps[-1] == '#### 2. Provide Populated Hot-fix Body', 'last step provides the body')
check(any('[Output Body](#output-body)' in line and 'publication' in line for line in procedure),
      'provides Output Body for publication, as the Body contract')
check(any('(standalone-body.md#template)' in line for line in procedure),
      'populates the standalone Template the hot-fix Sections name')
fields = anchors(ARTIFACT)
for name in INPUTS:
    check(checker.anchor_of(name) in fields and f'(#{checker.anchor_of(name)})' in '\n'.join(procedure),
          f'input {name} is a field the operation reads')
for _, target, _ in LINK.findall('\n'.join(procedure)):
    name, _, fragment = target.partition('#')
    path = (ARTIFACT.parent / name).resolve() if name else ARTIFACT
    check(path.is_file() and (not fragment or checker.anchor_of(fragment) in anchors(path)),
          f'link {target} resolves')

print('Callers')
sites = []
for path in sorted(ROOT.rglob('*.md')):
    if 'test' in path.relative_to(ROOT).parts or path.name == 'SKILL.md':
        continue
    for number, line in enumerate(path.read_text().splitlines(), 1):
        for _, target, title in LINK.findall(line):
            if target.endswith(f'hotfix-body.md#{ANCHOR}'):
                sites.append((path.relative_to(ROOT).as_posix(), number, title, line.strip()))
for site in sites:
    print(f'  {site[0]}:{site[1]} title={site[2]!r}: {site[3]}')
calls = [s for s in sites if s[2] == 'ƒ']
check(len(sites) == 1, f'{len(sites)} general call site(s) beside the registration')
check(calls and calls == sites and all('Apply [' + OPERATION in s[3] for s in calls),
      'every linked use is an ƒ call that applies the operation')
hoist = ROOT / 'modes' / 'hoist-mode.md'
branch = body_of(hoist, 'Hot-Fix Body', 6)
print('  hoist Hot-Fix Body branch:', [line for line in branch if line.strip()])
restated = [t for _, t, _ in LINK.findall('\n'.join(branch)) if not t.endswith(f'#{ANCHOR}')]
check(not restated, f'hoist branch restates no body rule: {restated}')
check(all(word in calls[0][3] for word in ('number', 'theme label', 'target', 'defect evidence')),
      'the call passes number and theme label (Hot-fix Identity), target (Target) and defect evidence')
elsewhere = [f'{p.relative_to(ROOT)}:{n}' for p in sorted((ROOT / 'modes').glob('*.md'))
             + sorted((ROOT / 'protocols').glob('*.md'))
             for n, line in enumerate(p.read_text().splitlines(), 1)
             for anchor in ('defect-evidence', 'output-body', 'hot-fix-identity')
             if f'hotfix-body.md#{anchor}' in line]
check(not elsewhere, f'no mode or protocol reads the operation inputs directly: {elsewhere}')

print('Failures:', failures or 'none')
sys.exit(1 if failures else 0)
