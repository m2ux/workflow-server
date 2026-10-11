"""Render reconciled recommendations and complete primary-entry coverage."""

import json
import re
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parent
inventory = json.loads((root / 'inventory.json').read_text())
index = {entry['id']: entry for entry in inventory['entries']}
findings, ledgers, paths = {}, {}, {}

for name in inventory['assignments']:
    for path in sorted((root / 'reviews' / name).glob('*.json')):
        key = ('entries' if path.name.startswith(('entries-', 'ledger-')) else
               'findings' if path.name.startswith('findings-') else None)
        if not key:
            continue
        data = json.loads(path.read_text())
        for item in data if isinstance(data, list) else data[key]:
            (ledgers if key == 'entries' else findings)[item['id']] = item
            paths[item['id']] = str(path.relative_to(root))

reviews = {}
for path in sorted((root / 'reconciliation').glob('ap-*.json')):
    for review in json.loads(path.read_text())['reviews']:
        review['review_path'] = str(path.relative_to(root))
        reviews[review['id']] = review

dp_categories = {
    'PD-01': 'improvement', 'PD-02': 'correction', 'PD-03': 'improvement',
    'PD-04': 'improvement', 'PD-05': 'improvement', 'PD-06': 'correction',
    'PD-07': 'correction', 'PD-08': 'improvement', 'PD-09': 'improvement',
    'PD-10': 'correction', 'PD-11': 'improvement', 'PD-12': 'no_change',
    'PD-13': 'improvement', 'PD-14': 'correction', 'PD-15': 'improvement',
    'PD-16': 'correction', 'PD-17': 'improvement', 'PD-18': 'improvement',
    'PD-19': 'improvement', 'PD-20': 'no_change',
}
for path in sorted((root / 'reviews' / 'principles').glob('independent-review-*.json')):
    data = json.loads(path.read_text())
    assert path.stat().st_size <= 16000
    for review in data['reviews']:
        review['reviewer'] = data['reviewer']
        review['priority'] = review['recommended_priority']
        review['category'] = dp_categories[review['id']]
        review['review_path'] = str(path.relative_to(root))
        reviews[review['id']] = review

assert set(findings) == set(reviews)
assert set(ledgers) == set(index)
assert all(review['disposition'] in ('confirmed', 'narrowed', 'rejected') for review in reviews.values())
assert all(review['reviewer'] != ('/root' if ident.startswith('PD-') else
    '/root/canon_contracts' if ident.startswith('AC-') else
    '/root/canon_structures' if ident.startswith('AS-') else '/root/canon_execution')
    for ident, review in reviews.items())

def anchor(text):
    return re.sub(r'[^\w\s-]', '', text.lower()).replace(' ', '-')

def source_link(ident):
    entry = index[ident]
    heading = (root / entry['source']).read_text().splitlines()[entry['start'] - 1].lstrip('# ')
    return '[' + ident + ' · ' + entry['title'] + '](' + entry['source'] + '#' + anchor(heading) + ')'

def cell(text):
    return text.replace('|', '\\|').replace('\n', ' ')

def literal_example_links(text):
    return re.sub(r'\[[^\]]+\]\([^)]+\)', lambda match: chr(96) + match.group(0) + chr(96), text)

documents = {'AS': 'recommendations-structures.md', 'AE': 'recommendations-execution.md',
             'AC': 'recommendations-contracts.md', 'PD': 'recommendations-principles.md'}

def recommendation_link(ident):
    return '[' + ident + '](' + documents[ident[:2]] + '#' + ident.lower() + ')'

for prefix, filename in documents.items():
    lines = ['# Reconciled ' + prefix + ' recommendations', '',
        'These are review suggestions at the captured revision. The independent disposition and wording below govern the recommendation; the original candidate remains available for comparison. No corpus change is implied. P1 concerns lost obligations, evidence or incompatible repairs; P2 clarifies a material boundary; P3 improves consistency or expression.', '']
    for ident, finding in findings.items():
        if not ident.startswith(prefix + '-'):
            continue
        review = reviews[ident]
        lines += ['## ' + ident, '',
            '**' + review['disposition'].capitalize() + ' · ' + review['category'].replace('_', ' ') +
            (' · ' + review['priority'] if review['priority'] else '') + '**', '',
            'Scope: ' + ', '.join(source_link(entry) for entry in finding['entries']) + '.', '',
            '**Assessment.** ' + review['reason'], '']
        if review['disposition'] == 'rejected':
            lines += ['**Recommendation.** ' + review['replacement_adjustment'], '']
        else:
            if 'retained_claim' in review:
                lines += ['**Retained issue.** ' + review['retained_claim'], '']
            else:
                lines += ['**Witness.** ' + literal_example_links(finding['witness']), '']
            if 'replacement_adjustment' in review:
                lines += ['**Suggested wording.** ' + review['replacement_adjustment'], '']
                if ident == 'PD-08':
                    lines += ['**Original wording retained within that adjustment.** ' + finding['proposed_fix'], '']
            else:
                lines += ['**Suggested wording.** ' + review.get('proposed_fix_override', finding['proposed_fix']), '']
        check = review.get('observing_check', finding['observing_check'])
        if isinstance(check, dict):
            lines += ['**Observing check.** ' + ' '.join(key.capitalize() + ': ' + value for key, value in check.items()
                                                       if key != 'method'), '']
        else:
            lines += ['**Observing check.** ' + check, '']
        evidence = finding['evidence']
        lines += ['Evidence addresses: ' + '; '.join(item['entry'] + ' lines ' + str(item['start']) +
                  '–' + str(item['end']) for item in evidence) + '.', '',
                  '[Original candidate](' + paths[ident] + ') · [Independent disposition](' + review['review_path'] + ').', '']
    (root / filename).write_text('\n'.join(lines))

lines = ['# Complete canon coverage ledger', '',
    'All 212 captured entries have a primary review. Final dispositions reflect independent reconciliation of the associated proposals. A clear entry has no required correction established in this review; that is not a proof of every possible natural-language interaction. Related entries cited as evidence are not counted as additional primary review.', '',
    '| Entry | Final disposition | Proposal records | Six-check primary evidence |',
    '| --- | --- | --- | --- |']
final_dispositions = Counter()
for entry in inventory['entries']:
    ident = entry['id']
    ledger = ledgers[ident]
    categories = {reviews[finding]['category'] for finding in ledger['finding_ids']}
    state = 'correction' if 'correction' in categories else 'improvement' if 'improvement' in categories else 'clear'
    if ident == 'AP-57':
        state = 'evidence limit'
    final_dispositions[state] += 1
    lines.append('| ' + cell(ident + ' · ' + entry['title']) + ' | ' + state + ' | ' +
                 (', '.join(recommendation_link(finding) for finding in ledger['finding_ids']) or '—') + ' | ' +
                 '[Review](' + paths[ident] + ') |')
lines += ['', 'AP-57 has an observable literal-escaping rule, but its renderer-specific premise is not proved by the pinned engine. See the [implementation check](reviews/ap_structures/implementation-check.md). It receives an explicit evidence limit rather than an unsupported current-client assertion.', '',
          'First-pass dispositions remain intact in the linked records. A rejected candidate contributes no required correction to the final entry disposition.', '']
(root / 'coverage-ledger.md').write_text('\n'.join(lines))

lines = ['# Candidate reconciliation index', '',
    '95 candidates are reconciled individually. Several describe the same cross-rule repair and are consolidated in the main report; these are not 95 distinct defects.', '',
    '| Candidate | Independent disposition | Classification | Priority |', '| --- | --- | --- | --- |']
for ident in sorted(findings):
    review = reviews[ident]
    lines.append('| ' + recommendation_link(ident) + ' | ' + review['disposition'] + ' | ' +
                 review['category'].replace('_', ' ') + ' | ' + (review['priority'] or '—') + ' |')
(root / 'candidate-index.md').write_text('\n'.join(lines) + '\n')
summary = {'primary_entries': len(ledgers), 'candidates': len(findings),
    'candidate_dispositions': dict(Counter(review['disposition'] for review in reviews.values())),
    'candidate_categories': dict(Counter(review['category'] for review in reviews.values())),
    'final_primary_dispositions': dict(final_dispositions),
    'source_revision': inventory['revision'],
    'scope': 'criterion quality and cross-entry repair review; no corpus edits and no formal global consistency proof'}
(root / 'reconciliation-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary))
