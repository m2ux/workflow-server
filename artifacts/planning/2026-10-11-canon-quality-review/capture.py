"""Capture the complete canon and disjoint primary quality-review assignments."""

import hashlib
import json
from pathlib import Path
import re
import subprocess

record = Path(__file__).resolve().parent
corpus = Path('/home/mike1/projects/dev/workflow-server/.project/workflows')
revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=corpus, text=True).strip()
paths = ['corpus/canon/resources/anti-patterns.md', 'corpus/canon/resources/design-principles.md']
dirty = subprocess.check_output(['git', 'status', '--porcelain', '--', *paths], cwd=corpus, text=True)
assert not dirty, dirty
(record / 'sources').mkdir(exist_ok=True)
entries, sources = [], []
for relative in paths:
    source = corpus / relative
    raw = source.read_bytes()
    saved = record / 'sources' / source.name
    assert not saved.exists() or saved.read_bytes() == raw, 'Preserve the existing captured source generation'
    saved.write_bytes(raw)
    lines = raw.decode().splitlines()
    sources.append({'path': relative, 'capture': str(saved.relative_to(record)),
                    'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw), 'lines': len(lines)})
    family = None
    for index, line in enumerate(lines):
        if line.startswith('## ') and source.name == 'anti-patterns.md':
            family = line[3:]
        match = re.match(r'^### (AP|MR)-(\d+)\. (.+)', line) if source.name == 'anti-patterns.md' else re.match(r'^## (\d+)\. (.+)', line)
        if not match:
            continue
        if source.name == 'anti-patterns.md':
            kind, number, title = match.groups()
            level = 3
        else:
            number, title = match.groups()
            kind, level = 'DP', 2
        end = next((position for position in range(index + 1, len(lines))
                    if (heading := re.match(r'^(#{1,6}) ', lines[position])) and len(heading[1]) <= level), len(lines))
        text = '\n'.join(lines[index:end])
        entries.append({'id': kind + '-' + number.zfill(2), 'kind': kind, 'number': int(number),
                        'title': title, 'family': family if kind != 'DP' else 'Design Principles',
                        'source': str(saved.relative_to(record)), 'start': index + 1, 'end': end,
                        'bytes': len(text.encode()), 'sha256': hashlib.sha256(text.encode()).hexdigest()})
assert len(entries) == len({item['id'] for item in entries}) == 212
assert {kind: sum(item['kind'] == kind for item in entries) for kind in ('AP', 'DP', 'MR')} == {'AP': 161, 'DP': 47, 'MR': 4}
assignments = {}
for name, predicate in {
    'ap_structures': lambda entry: entry['kind'] == 'AP' and entry['number'] <= 68,
    'ap_execution': lambda entry: entry['kind'] == 'AP' and 69 <= entry['number'] <= 123,
    'ap_contracts': lambda entry: entry['kind'] == 'MR' or entry['kind'] == 'AP' and entry['number'] >= 124,
    'principles': lambda entry: entry['kind'] == 'DP',
}.items():
    selected = [entry for entry in entries if predicate(entry)]
    assignments[name] = {'entries': [entry['id'] for entry in selected], 'primary_bytes': sum(entry['bytes'] for entry in selected),
                         'shared_sources': [source['capture'] for source in sources]}
assigned = [key for assignment in assignments.values() for key in assignment['entries']]
assert len(assigned) == len(set(assigned)) == len(entries)
payload = {'corpus': str(corpus), 'revision': revision, 'source_status': dirty, 'sources': sources,
           'entries': entries, 'assignments': assignments,
           'scope': 'Review criterion quality; no corpus changes or definition-conformance verdict.'}
(record / 'inventory.json').write_text(json.dumps(payload, indent=2) + '\n')
rows = ['# Captured Canon Inventory', '', '| ID | Entry | Source Lines | Primary Review |', '| --- | --- | --- | --- |']
for entry in entries:
    owner = next(name for name, assignment in assignments.items() if entry['id'] in assignment['entries'])
    rows.append('| ' + entry['id'] + ' | ' + entry['title'] + ' | ' + entry['source'] + ':' + str(entry['start']) + '–' + str(entry['end']) + ' | ' + owner + ' |')
(record / 'inventory.md').write_text('\n'.join(rows) + '\n')
print(json.dumps({'revision': revision, 'sources': sources,
    'assignments': {name: {'entries': len(value['entries']), 'primary_bytes': value['primary_bytes']} for name, value in assignments.items()}}, indent=2))
