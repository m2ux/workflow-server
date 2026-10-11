"""Prepare bounded, disjoint drafting packets from the reconciled canon review."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REVIEW = ROOT.parent
inventory = json.loads((REVIEW / 'inventory.json').read_text())
entries = inventory['entries']
sources = {item['capture']: (REVIEW / item['capture']).read_text().splitlines(keepends=True) for item in inventory['sources']}
recommendations = []
for name in ('structures', 'execution', 'contracts', 'principles'):
    text = (REVIEW / f'recommendations-{name}.md').read_text()
    matches = list(re.finditer(r'^## ([A-Z]{2}-\d+)\n', text, re.M))
    for i, match in enumerate(matches):
        body = text[match.start():matches[i + 1].start() if i + 1 < len(matches) else len(text)].strip()
        scope = re.search(r'^Scope: (.*)$', body, re.M)
        metadata = re.search(r'^\*\*(.*?)\*\*$', body, re.M)
        recommendations.append({'id': match.group(1), 'metadata': metadata.group(1), 'entries': sorted(set(re.findall(r'\b(?:AP|DP|MR)-\d+\b', scope.group(1)))), 'source': f'recommendations-{name}.md', 'text': body})
assert len(recommendations) == 95
(ROOT / 'recommendations.json').write_text(json.dumps(recommendations, indent=2, ensure_ascii=False) + '\n')
groups = {
    'structures': [e for e in entries if e['kind'] == 'AP' and e['number'] <= 68],
    'execution': [e for e in entries if e['kind'] == 'AP' and 69 <= e['number'] <= 123],
    'contracts': [e for e in entries if (e['kind'] == 'AP' and e['number'] >= 124) or e['kind'] == 'MR'],
    'principles': [e for e in entries if e['kind'] == 'DP'],
}
measurements = []
for name, owned in groups.items():
    ids = {entry['id'] for entry in owned}
    relevant = [rec for rec in recommendations if ids.intersection(rec['entries'])]
    content = ['# Drafting packet: ' + name, 'Source revision: ' + inventory['revision'], '## Owned source entries']
    for entry in owned:
        content.append('Review address: ' + entry['id'])
        content.append(''.join(sources[entry['source']][entry['start'] - 1:entry['end']]).rstrip())
    content.append('## Reconciled recommendations affecting these entries')
    content.extend(rec['text'] for rec in relevant)
    text = '\n\n'.join(content) + '\n'
    (ROOT / f'packet-{name}.md').write_text(text)
    measurements.append({'slice': name, 'entries': len(owned), 'recommendations': len(relevant), 'packet_bytes': len(text.encode()), 'context_budget_proxy': len(text.encode()) + 5000 + 20000 + 20000 + 30000, 'maximum_additional_source_bytes': 60000})
assert all(item['context_budget_proxy'] + item['maximum_additional_source_bytes'] <= 258400 for item in measurements)
(ROOT / 'packet-measurements.json').write_text(json.dumps(measurements, indent=2) + '\n')
print(json.dumps(measurements, indent=2))
