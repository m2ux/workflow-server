"""Check the W05 artifact family in the supplied clean commit checkout."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import sys

NAMES = 'acceptance-criteria epic epic-issue-body hotfix hotfix-body initiative initiative-issue-body issue issue-body proposal-body pull-request-body repository-labels standalone-body task-body'.split()

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--checkout', type=Path, default=Path.cwd())
parser.add_argument('--expected-revision', help='Expected exact commit of the supplied checkout')
args = parser.parse_args()
root = args.checkout.resolve()

def git(*arguments):
    return subprocess.check_output(['git', '-C', str(root), *arguments], text=True).strip()

try:
    top = Path(git('rev-parse', '--show-toplevel')).resolve()
    revision = git('rev-parse', 'HEAD')
    tree = git('rev-parse', 'HEAD^{tree}')
    dirty = git('status', '--porcelain=v1', '--untracked-files=all')
except (OSError, subprocess.CalledProcessError) as error:
    parser.exit(2, f'Unreadable checkout: {error}\n')
identity = {'checkout': str(root), 'revision': revision, 'tree': tree,
            'instrument_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
print(json.dumps(identity, sort_keys=True), flush=True)
if top != root:
    parser.exit(2, 'The supplied path must be the commit checkout root.\n')
if dirty:
    parser.exit(2, 'The supplied commit checkout has uncommitted files.\n')
if args.expected_revision and revision != args.expected_revision:
    parser.exit(2, 'The supplied checkout does not hold the expected exact revision.\n')

sys.path.insert(0, str(root / 'skills/scripts'))
import check_skill_files as checker

skill = root / 'skills/work-planner'
model = checker.loaded(skill / 'structure.json')
entry = {'sections': ['Prerequisites', 'Operations', 'Fields'], 'required': ['Fields'],
         'procedures': 'Operations', 'steps': 'headings', 'commands': 'inline-html',
         'contracts': 'Fields', 'calls': {'artifacts': 'Apply'}}
for name in NAMES:
    model[name + '.md'] = entry
for name, declaration in model.items():
    checker.validate_structure_entry(skill / 'structure.json', name, declaration)
cache = {skill: model, skill / 'artifacts': model}
paths = sorted(skill.rglob('*.md'))
cited, called = checker.citations(paths, cache)
findings = []
for name in NAMES:
    path = skill / 'artifacts' / (name + '.md')
    findings += checker.check(path, root, {}, cited, called, cache)
    findings += checker.mode_commands(path, root, cache)
    findings += checker.interfaces(path, root, cache)
for path, line, kind, detail in findings:
    print(f'{path}:{line}: {kind}: {detail}')
print(f'{len(NAMES)} converted files, {len(findings)} findings')
raise SystemExit(bool(findings))
