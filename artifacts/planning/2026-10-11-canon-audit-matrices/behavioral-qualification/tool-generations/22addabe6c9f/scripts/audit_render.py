"""Sectioned Markdown views of the authoritative audit state."""

from collections import defaultdict
from pathlib import Path

from audit_common import cell_id, digest, require, view_fingerprint
from audit_inventory import KINDS
from audit_state import gate


def safe(value):
    return str(value).replace('|', '&#124;').replace('\n', ' ')


def render(state, folder, columns=8, rows_per_table=30):
    require(columns > 0 and rows_per_table > 0, 'Table dimensions must be positive')
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    snapshots = folder / 'sources'
    snapshots.mkdir(exist_ok=True)
    artifact_hashes = {}
    captured = list(state['sources'].values()) + [item['check'] for item in state['obligation_results'].values()
                                                  if item.get('check')]
    for source in captured:
        (snapshots / (source['hash'] + '.txt')).write_text(source['text'])
        artifact_hashes['sources/' + source['hash'] + '.txt'] = source['hash']
    status = gate(state, check_views=False)
    for kind in KINDS:
        sections = defaultdict(list)
        for key, row in state['rows'].items():
            if row['type'] == kind:
                sections[(row['source'], row['section'])].append(key)
        lines = [f'# {kind.title()} Change Surface', '',
                 f'Snapshot: {state["snapshot"]}', '',
                 'Each cell links to its disposition and evidence. A = applicable; N = not applicable; U = unresolved.', '']
        expected, represented = set(), set()
        if not sections:
            lines += ['No scoped elements of this type. See [coverage](audit-coverage.md).', '']
        criteria = list(state['criteria'])
        families = defaultdict(list)
        for key, unit in state['criteria'].items():
            families['AP / ' + unit['family'] if key.startswith('ap:') else 'DP'].append(key)
        bands = [(family + ' / ' + state['criteria'][members[start]]['label'] + '–' +
                  state['criteria'][members[min(start + columns, len(members)) - 1]]['label'],
                  members[start:start + columns])
                 for family, members in families.items() for start in range(0, len(members), columns)]
        for (source, section), row_ids in sorted(sections.items()):
            lines += [f'## {safe(source)} — {safe(section)}', '',
                      '[Captured source](sources/' + state['sources'][source]['hash'] + '.txt)', '']
            for r in range(0, len(row_ids), rows_per_table):
                group = row_ids[r:r + rows_per_table]
                for band, units in bands:
                    lines += [f'### {safe(band)}, Rows {r + 1}–{r + len(group)}', '',
                              '| Item | ' + ' | '.join(safe(state['criteria'][key]['label']) for key in units) + ' |',
                              '| --- | ' + ' | '.join('---' for key in units) + ' |']
                    for row in group:
                        values = []
                        for criterion in units:
                            key = cell_id(row, criterion)
                            require(key not in represented, 'A matrix cell was rendered twice')
                            represented.add(key)
                            disposition = state['mappings'].get(key, {}).get('status', 'U')
                            values.append(f'[{disposition}](audit-evidence.md#cell-{key})')
                        lines.append('| ' + safe(row) + ' | ' + ' | '.join(values) + ' |')
                    lines.append('')
            expected.update(cell_id(row, criterion) for row in row_ids for criterion in criteria)
        require(represented == expected, 'Rendered tables omit required cells')
        name = f'change-surface-{kind}.md'
        text = '\n'.join(lines).rstrip() + '\n'
        (folder / name).write_text(text)
        artifact_hashes[name] = digest(text.encode())
    evidence = ['# Audit Evidence', '', f'Snapshot: {state["snapshot"]}', '']
    for row in state['rows']:
        for criterion, unit in state['criteria'].items():
            key = cell_id(row, criterion)
            evidence += ['## Cell ' + key, '', f'Row: {safe(row)}', '',
                         'Criterion: ' + safe(unit['label'] + ' — ' + unit['title']), '']
            for group, label in (('mappings', 'Applicability'), ('verifications', 'Verification'),
                                 ('evaluations', 'Evaluation')):
                record = state[group].get(key)
                if not record:
                    evidence += [label + ': unresolved.', '']
                    continue
                evidence += [label + ': ' + record['status'] + ' — ' + safe(record['reason']), '',
                             'Agent: ' + safe(record['actor']), '']
                for cite in record['evidence']:
                    source = state['sources'][cite['source']]
                    evidence += ['- [' + safe(cite['source']) + '](sources/' + source['hash'] + '.txt), lines '
                                 + str(cite['start']) + '–' + str(cite['end'])]
                evidence.append('')
    (folder / 'audit-evidence.md').write_text('\n'.join(evidence))
    coverage = ['# Audit Coverage', '', f'Snapshot: {state["snapshot"]}', '',
                'Status: ' + ('complete' if status['complete'] else 'incomplete'), '',
                '| Measure | Count |', '| --- | --- |']
    for key in ('rows', 'criteria', 'cells', 'unknown', 'unverified', 'unevaluated'):
        coverage.append(f'| {key} | {status[key]} |')
    coverage += ['', '## Criterion Index', '', '| ID | Display | Source heading |', '| --- | --- | --- |']
    for identifier, unit in state['criteria'].items():
        coverage.append('| ' + safe(identifier) + ' | ' + safe(unit['label']) + ' | ' + safe(unit['title']) + ' |')
    coverage += ['', '## Obligations', '', '| Obligation | Status |', '| --- | --- |']
    for key in state['obligations']:
        result = state['obligation_results'].get(key, {})
        coverage.append('| ' + safe(key) + ' | ' + result.get('status', 'unresolved') + ' |')
    coverage += ['', '## Assignments', '', '| Assignment | Phase | Items | Status | Agent |',
                 '| --- | --- | --- | --- | --- |']
    for key, assignment in state['assignments'].items():
        coverage.append(f'| {key} | {assignment["phase"]} | {len(assignment["items"])} | '
                        + assignment['status'] + ' | ' + safe(assignment.get('actor') or 'unassigned') + ' |')
    coverage += ['', '## Stale Inputs', '', *status['stale'], '']
    (folder / 'audit-coverage.md').write_text('\n'.join(coverage))
    applicable = sum(item['status'] == 'A' for item in state['mappings'].values())
    source_origins = {row['source']: row['origin'] for row in state['rows'].values()}
    unread = [key[5:] for key in status['obligations_missing'] if key.startswith('read:')]
    guards = state['obligation_results'].get('check:guards', {}).get('status', 'unmeasured')
    report = ['# Canon Audit', '', 'Status: ' + ('finished' if status['complete'] else 'in progress'), '',
              'Base ref: ' + str(state['identity']['base']) + ' · Snapshot: ' + state['snapshot'], '',
              f'Coverage: {status["rows"]} rows × {status["criteria"]} AP/DP criteria; '
              f'{status["cells"] - status["unknown"] - status["unverified"]} of {status["cells"]} mappings verified; '
              f'{applicable - status["unevaluated"]} of {applicable} applicable cells evaluated.', '',
              f'Guards: {guards}. Residual: {len(unread)} unread files; '
              f'{len(status["inventory_missing"])} inventory and {len(status["obligations_missing"])} other obligations.', '',
              'Conformance: ' + status['conformance'], '',
              '| Band | Findings |', '| --- | --- |']
    report += [f'| {key} | {value} |' for key, value in status['bands'].items()]
    report += ['', '[Complete coverage ledger](audit-coverage.md)', '', '## Change Surface', '',
               '| Path | How It Joined |', '| --- | --- |']
    report += ['| ' + safe(path) + ' | ' + origin + ' |' for path, origin in sorted(source_origins.items())]
    report += ['', '## Findings', '',
               '| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |',
               '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for item in sorted(status['findings'], key=lambda item: ('Critical', 'High', 'Medium', 'Low').index(item['severity'])):
        citations = '; '.join('[' + safe(cite['source']) + '](sources/' + state['sources'][cite['source']]['hash']
                             + '.txt), lines ' + str(cite['start']) + '–' + str(cite['end'])
                             for cite in item['evidence'])
        entry = item['entry']
        for unit in state['criteria'].values():
            if unit['title'] in entry:
                entry = entry.replace(unit['title'], '[' + safe(unit['title']) + '](sources/'
                                      + state['sources'][unit['source']]['hash'] + '.txt)')
        item = {**item, 'entry': entry, 'evidence_text': item['summary'] + ' ' + citations}
        report.append('| ' + ' | '.join(safe(item[field]) for field in
                                        ('id', 'band', 'severity', 'entry', 'location', 'evidence_text', 'origin', 'fix')) + ' |')
    report += ['', '## File Coverage', '', f'Read {len(source_origins) - len(unread)} · unread {len(unread)}.', '',
               *['- ' + safe(path) for path in unread], '', '## Finding Confirmations', '']
    for key, result in state['obligation_results'].items():
        if key.startswith('finding:'):
            report += ['- ' + key + ': ' + result['status'] + ' — ' + safe(result['reason'])]
    (folder / 'audit-report.md').write_text('\n'.join(report) + '\n')
    for name in ('audit-evidence.md', 'audit-coverage.md', 'audit-report.md'):
        artifact_hashes[name] = digest((folder / name).read_bytes())
    return {'state': view_fingerprint(state), 'files': artifact_hashes}
