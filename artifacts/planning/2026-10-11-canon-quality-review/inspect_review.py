"""Print bounded source and candidate excerpts for independent reconciliation."""

import argparse
import json
from pathlib import Path

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('kind', choices=['findings', 'independent', 'source', 'summary'])
parser.add_argument('selector')
parser.add_argument('--start', type=int, default=1)
parser.add_argument('--end', type=int)
args = parser.parse_args()
inventory = json.loads((root / 'inventory.json').read_text())
index = {entry['id']: entry for entry in inventory['entries']}

if args.kind == 'source':
    for ident in args.selector.split(','):
        entry = index[ident]
        lines = (root / entry['source']).read_text().splitlines()
        print(ident, entry['title'], entry['source'])
        for number in range(entry['start'], entry['end'] + 1):
            print(str(number) + ': ' + lines[number - 1])
elif args.kind in ('findings', 'independent'):
    records = []
    pattern = 'findings-*.json' if args.kind == 'findings' else 'independent-review-*.json'
    key = 'findings' if args.kind == 'findings' else 'reviews'
    for path in sorted((root / 'reviews' / args.selector).glob(pattern)):
        data = json.loads(path.read_text())
        records.extend(data if isinstance(data, list) else data[key])
    for finding in records[args.start - 1:args.end]:
        print(json.dumps({key: value for key, value in finding.items() if key != 'evidence'}, indent=2))
        print('EVIDENCE', json.dumps([{key: value for key, value in evidence.items() if key != 'quote'}
                                     for evidence in finding['evidence']]))
else:
    folder = root / 'reviews' / args.selector
    entries, findings = [], []
    for path in sorted(folder.glob('*.json')):
        if path.name.startswith(('ledger-', 'entries-')):
            data = json.loads(path.read_text())
            entries.extend(data if isinstance(data, list) else data['entries'])
        if path.name.startswith('findings-'):
            data = json.loads(path.read_text())
            findings.extend(data if isinstance(data, list) else data['findings'])
    print(json.dumps({'slice': args.selector, 'entries': len(entries), 'findings': len(findings),
        'dispositions': {value: sum(entry['disposition'] == value for entry in entries)
                         for value in ('clear', 'finding', 'improvement')},
        'candidates': [{key: finding[key] for key in ('id', 'kind', 'entries', 'problem')}
                       for finding in findings]}, indent=2))
