"""W33 kind, import and duplicate-function searches over the Work Planner scripts.

Usage: python3 w33-search.py <skill directory> [<directory of base copies of the four files>]

Kind search: each spelling of a registered kind's name or module, or a tag of its letter, in
board-queue.py, progress.py and statuses.py, and each kind module they import. Import search: every
script importing a kind module, by import statement or by name through import_module. Duplicate
search: each script defining a shared rule's function or pattern outside its single home. Exports:
the hot-fix module's public names against the Kind interface.
"""
import ast
import re
import sys
from pathlib import Path

skill = Path(sys.argv[1]).resolve()
scripts = skill / 'scripts'
sys.path.insert(0, str(scripts))
sys.path.insert(0, str(skill / 'test'))
from kinds import KINDS, Kind  # noqa: E402
from test_kinds import kind_mentions  # noqa: E402

GENERAL = ('board-queue.py', 'progress.py', 'statuses.py')
HOMES = {'tags': 'board', 'issue_key': 'sync', 'key_of': None, 'rank': 'priority', 'untagged': 'format'}
PATTERNS = {r"r'\^\\\[I\(\\d\\d\)\(\?::E\(\\d\\d\)\)\?\(\?::W\(\\d\\d\)\)\?\\\]'": 'tag prefix',
            r"r'\^priority: \(\[1-9\]\\d\*\)\$'": 'priority label'}


def kinds_search(folder: Path, label: str) -> int:
    total = 0
    for name in GENERAL:
        found = kind_mentions((folder / name).read_text())
        total += len(found)
        print(f'{label} {name}: {len(found)} kind mentions {sorted(set(found))}')
    return total


print('## Kind search')
head = kinds_search(scripts, 'head')
base = kinds_search(Path(sys.argv[2]), 'base') if len(sys.argv) > 2 else None
print(f'head total {head}' + (f', base total {base}' if base is not None else ''))

print('\n## Import search')
for path in sorted(scripts.glob('*.py')):
    text = path.read_text()
    tree = ast.parse(text)
    modules = {alias.name for node in ast.walk(tree) if isinstance(node, ast.Import) for alias in node.names}
    modules |= {node.module for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)}
    by_name = {m for m in KINDS.values() if 'import_module' in text and re.search(rf"['\"]{m}['\"]", text)}
    reached = (modules & set(KINDS.values())) | by_name
    if reached:
        print(f'{path.name}: {sorted(reached)}' + (' (by name, import_module)' if by_name else ''))

print('\n## Duplicate search')
for path in sorted(scripts.glob('*.py')):
    tree = ast.parse(path.read_text())
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name in HOMES and HOMES[node.name] != path.stem:
            print(f'{path.name}: defines {node.name}, whose home is {HOMES[node.name]}')
    for pattern, rule in PATTERNS.items():
        if re.search(pattern, path.read_text()):
            print(f'{path.name}: compiles the {rule} pattern')
print('homes:', ', '.join(f'{name} in {home}.py' for name, home in HOMES.items() if home))

print('\n## Hot-fix exports')
tree = ast.parse((scripts / 'hotfix.py').read_text())
public = {node.name for node in tree.body if isinstance(node, ast.FunctionDef)}
public |= {t.id for node in tree.body if isinstance(node, ast.Assign) for t in node.targets if isinstance(t, ast.Name)}
public = sorted(name for name in public if not name.startswith('_'))
interface = sorted(name for name, member in vars(Kind).items() if callable(member) and not name.startswith('_'))
print('public:', public)
print('interface:', interface)
print('match' if public == interface else 'MISMATCH')
