"""Verify review inventory, exact source evidence, bounded returns and coverage."""

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--slice', action='append')
parser.add_argument('--output', required=True)
args = parser.parse_args()
inventory = json.loads((root / 'inventory.json').read_text())
index = {entry['id']: entry for entry in inventory['entries']}
slices = args.slice or list(inventory['assignments'])
assert len(index) == 212
sources = {}
for source in inventory['sources']:
    captured = (root / source['capture']).read_bytes()
    current = (Path(inventory['corpus']) / source['path']).read_bytes()
    assert captured == current, source['path']
    assert hashlib.sha256(captured).hexdigest() == source['sha256']
    assert len(captured) == source['bytes']
    sources[source['capture']] = captured.decode().splitlines()

all_ids, all_findings, results = [], [], []
for name in slices:
    folder = root / 'reviews' / name
    entries, findings, files = [], [], []
    for path in sorted(folder.glob('*.json')):
        key = ('entries' if path.name.startswith(('ledger-', 'entries-')) else
               'findings' if path.name.startswith('findings-') else None)
        if key is None:
            continue
        data = json.loads(path.read_text())
        assert path.stat().st_size <= 16000, path
        if key == 'entries':
            assert len(data[key]) <= 8, path
            entries.extend(data[key])
        else:
            findings.extend(data[key])
        files.append({'path': str(path.relative_to(root)), 'bytes': path.stat().st_size,
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'count': len(data[key])})
    ids = [entry['id'] for entry in entries]
    assert len(ids) == len(set(ids)), name
    assert set(ids) == set(inventory['assignments'][name]['entries']), name
    finding_ids = {finding['id'] for finding in findings}
    assert len(finding_ids) == len(findings), name
    for entry in entries:
        assert entry['disposition'] in ('clear', 'finding', 'improvement')
        assert set(entry['checks']) == {'scope', 'observable', 'consistency', 'exceptions', 'fix', 'expression'}, entry
        assert all(isinstance(value, str) and value.strip() for value in entry['checks'].values())
        assert entry['rationale'].strip()
        assert set(entry['finding_ids']) <= finding_ids, entry['id']
        assert all(ident in index for ident in entry.get('related_ids', []))
    referenced = {ident for entry in entries for ident in entry['finding_ids']}
    assert finding_ids <= referenced, (name, finding_ids - referenced)
    quote_count = 0
    for finding in findings:
        for key in ('id', 'kind', 'priority', 'entries', 'evidence', 'problem', 'witness', 'proposed_fix', 'observing_check'):
            assert finding.get(key), (name, finding.get('id'), key)
        assert all(ident in index for ident in finding['entries'])
        for evidence in finding['evidence']:
            entry = index[evidence['entry']]
            source = evidence.get('source', entry['source'])
            assert source == entry['source']
            assert entry['start'] <= evidence['start'] <= evidence['end'] <= entry['end']
            span = '\n'.join(sources[source][evidence['start'] - 1:evidence['end']])
            assert evidence['quote'].strip() in span, (finding['id'], evidence['entry'])
            quote_count += 1
    all_ids.extend(ids)
    all_findings.extend(finding_ids)
    results.append({'slice': name, 'entries': len(entries), 'candidates': len(findings),
        'dispositions': dict(Counter(entry['disposition'] for entry in entries)),
        'exact_quotes': quote_count, 'files': files})
assert len(all_ids) == len(set(all_ids))
assert len(all_findings) == len(set(all_findings))
if not args.slice:
    assert set(all_ids) == set(index)
result = {'result': 'PASS', 'scope': 'record integrity, exact source evidence and primary coverage; not automated semantic judgment',
    'revision': inventory['revision'], 'sources_match_current_corpus': True,
    'entries': len(all_ids), 'candidates': len(all_findings), 'slices': results}
(root / args.output).write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key != 'slices'}))
