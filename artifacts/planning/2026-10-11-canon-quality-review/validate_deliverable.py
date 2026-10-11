"""Validate the rendered report and independent review evidence without semantic scoring."""

import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parent
inventory = json.loads((root / 'inventory.json').read_text())
index = {entry['id']: entry for entry in inventory['entries']}
corpus = Path(inventory['corpus'])
engine = Path('/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin')
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=corpus, text=True).strip() == inventory['revision']
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=engine, text=True).strip() == 'e889276ae7c49a6b5cd37b4928d5f983e76c9770'
assert not subprocess.check_output(['git', 'status', '--porcelain', '--',
    *[source['path'] for source in inventory['sources']]], cwd=corpus, text=True).strip()

independent, quotes = [], 0
for path in sorted((root / 'reviews/principles').glob('independent-review-*.json')):
    data = json.loads(path.read_text())
    assert path.stat().st_size <= 16000
    for review in data['reviews']:
        independent.append(review['id'])
        assert review['reason'] and review['replacement_adjustment'] and review['observing_check']
        for evidence in review['evidence']:
            entry = index[evidence['entry']]
            lines = (root / entry['source']).read_text().splitlines()
            assert entry['start'] <= evidence['start'] <= evidence['end'] <= entry['end']
            assert evidence['quote'].strip() in '\n'.join(lines[evidence['start'] - 1:evidence['end']])
            quotes += 1
assert Counter(independent) == Counter('PD-' + str(number).zfill(2) for number in range(1, 21))

def anchors(path):
    result, fenced = set(), False
    for line in path.read_text().splitlines():
        if line.lstrip().startswith((chr(96) * 3, '~~~')):
            fenced = not fenced
        if fenced:
            continue
        match = re.match(r'^#{1,6}\s+(.+)', line)
        if match:
            result.add(re.sub(r'[^\w\s-]', '', match.group(1).lower()).replace(' ', '-'))
    return result

reports = ['README.md', 'review-report.md', 'coverage-ledger.md', 'candidate-index.md',
    'recommendations-structures.md', 'recommendations-execution.md',
    'recommendations-contracts.md', 'recommendations-principles.md',
    'reviews/ap_structures/implementation-check.md', 'reviews/principles/independent-summary.md']
checked_links = 0
for name in reports:
    path = root / name
    prose = re.sub(chr(96) + r'[^' + chr(96) + r'\n]*' + chr(96), '', path.read_text())
    for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)', prose):
        target = target.strip('<>')
        if re.match(r'^https?://', target):
            continue
        filename, separator, fragment = target.partition('#')
        match = re.match(r'^(.*):(\d+)$', filename)
        line_number = None
        if match:
            filename, line_number = match.group(1), int(match.group(2))
        destination = Path(filename) if filename.startswith('/') else path.parent / filename if filename else path
        if destination.resolve() != root / 'validation-final.json':
            assert destination.exists(), (name, target)
        if line_number is not None:
            assert 1 <= line_number <= len(destination.read_text().splitlines()), target
        if separator:
            assert destination.suffix == '.md' and fragment in anchors(destination), (name, target)
        checked_links += 1

coverage = (root / 'coverage-ledger.md').read_text()
ids = re.findall(r'^\| ((?:AP|DP|MR)-\d+) ·', coverage, re.M)
assert Counter(ids) == Counter(index.keys())
summary = json.loads((root / 'reconciliation-summary.json').read_text())
assert sum(summary['candidate_dispositions'].values()) == 95
assert sum(summary['final_primary_dispositions'].values()) == 212
result = {'result': 'PASS', 'current_corpus_and_engine_pins_verified': True,
    'current_canon_sources_clean': True, 'primary_rows': len(ids),
    'independent_principle_dispositions': len(independent), 'independent_exact_quotes': quotes,
    'resolved_report_links': checked_links,
    'report_sha256': {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in reports},
    'limits': 'Structural artifact validation only. Semantic judgments are attributed to their independent reviewers.'}
(root / 'validation-final.json').write_text(json.dumps(result, indent=2) + '\n')
assert (root / 'validation-final.json').is_file()
print(json.dumps({key: value for key, value in result.items() if key != 'report_sha256'}))
