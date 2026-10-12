"""Restamp the disposition rows onto the rebased commits.

The rebase onto origin/workflows rewrote every commit, so the shas the rows
carried address objects no branch holds. Subjects are unchanged, so they map
the old sha to the new one.
"""

import re
import subprocess
from pathlib import Path

CORPUS = Path('/home/mike1/projects/dev/workflow-server/.worktrees/workflow/technique-vocabulary')
DOC = Path(__file__).resolve().parent / 'dispositions.md'

OLD = {
    '19b2ee0a': 'Key the declaration and completion entries on their owning construct',
    '787f82e2': 'Compare rules across the delivered set, and reach every worker that holds one',
    '9ea3be34': 'Hold the evidence a verdict rests on, and bind enforcement to it',
    '8a19f735': "Carry shared work on the run's binding sites",
    'df2643ef': 'Resolve a contract before judging what reaches its reader',
    '7f005bb5': 'Judge a call, a relocation and an output against evidence that reaches them',
    '5a73004a': 'State the principles as boundaries an observer can decide',
    '4d333ca0': 'Give each catalog defect one entry, and number the catalog by file order',
    '65be29e4': 'Key the runtime-rule entry on restatement rather than subject matter',
}

log = subprocess.run(
    ['git', 'log', '--format=%h\t%s', 'origin/workflows..HEAD'],
    cwd=CORPUS, capture_output=True, text=True, check=True).stdout.strip().splitlines()
current = {}
for line in log:
    sha, subject = line.split('\t', 1)
    current[subject] = sha

mapping = {old: current[subject] for old, subject in OLD.items() if subject in current}
missing = sorted(set(OLD) - set(mapping))
assert not missing, f'no rebased commit for: {missing}'

text = DOC.read_text()
for old, new in mapping.items():
    text = re.sub(rf'\b{old}\b', new, text)
DOC.write_text(text)

print(f'restamped {len(mapping)} commits')
for old, new in sorted(mapping.items()):
    print(f'  {old} -> {new}')
leftover = sorted(set(re.findall(r'`([0-9a-f]{8})`', text)) - set(mapping.values()))
print(f'unmapped shas still in the document: {leftover}')
