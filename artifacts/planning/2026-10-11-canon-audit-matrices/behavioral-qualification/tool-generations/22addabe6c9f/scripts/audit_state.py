"""Evidence ingestion and gates for the complete current audit surface."""

from copy import deepcopy

from pathlib import Path

from audit_common import (cell_fingerprint, cell_index, cells, digest, evidence_valid,
                          mapping_fingerprint, require, view_fingerprint)
from audit_inventory import freshness, inventory


PHASES = ('map', 'verify', 'evaluate', 'inventory', 'obligations')


def verified(state, key):
    mapping = state['mappings'].get(key)
    receipt = state['verifications'].get(key)
    return bool(mapping and mapping['status'] in ('A', 'N') and receipt
                and receipt['status'] == 'verified'
                and receipt['mapping'] == mapping_fingerprint(mapping)
                and receipt['actor'] != mapping['actor'])


def gate(state, check_fresh=True, check_views=True):
    unknown, unverified, unevaluated = [], [], []
    for key, row, criterion in cells(state):
        mapping = state['mappings'].get(key)
        if not mapping or mapping['status'] == 'U':
            unknown.append(key)
        elif not verified(state, key):
            unverified.append(key)
        if mapping and mapping['status'] == 'A':
            result = state['evaluations'].get(key)
            if not result or result['status'] not in ('pass', 'finding') or (
                    result['mapping'] != mapping_fingerprint(mapping)):
                unevaluated.append(key)
    inventory_missing, obligations_missing = [], []
    accepted = {'inventory': ('verified',), 'read': ('read',),
                'unit': ('walked', 'not-applicable', 'finding'),
                'check': ('pass', 'finding'),
                'finding': ('confirmed', 'downgraded', 'withdrawn')}
    for key, obligation in state['obligations'].items():
        result = state['obligation_results'].get(key)
        if not result or result['status'] not in accepted[obligation['kind']]:
            (inventory_missing if obligation['kind'] == 'inventory' else obligations_missing).append(key)
    stale = freshness(state) if check_fresh else []
    if check_views and state.get('run'):
        views = state.get('rendered', {})
        if views.get('state') != view_fingerprint(state):
            stale.append('Rendered matrix evidence is stale; render the current state')
        for name, expected in views.get('files', {}).items():
            path = Path(state['run']) / name
            if not path.is_file() or digest(path.read_bytes()) != expected:
                stale.append('Rendered artifact changed: ' + name)
    mapping_ready = not (unknown or unverified or inventory_missing or stale)
    complete = mapping_ready and not (unevaluated or obligations_missing)
    findings = {}
    for group in ('evaluations', 'obligation_results'):
        for key, result in state[group].items():
            for finding in result.get('findings', []):
                confirmation = state['obligation_results'].get('finding:' + finding['id'], {})
                if confirmation.get('status') != 'withdrawn':
                    finding = dict(finding)
                    if confirmation.get('status') == 'downgraded':
                        finding.update(confirmation['disposition'])
                    findings[finding['id']] = finding
    bands = {band: sum(item['band'] == band for item in findings.values())
             for band in ('Live', 'Contract', 'Hygiene')}
    return {'mapping_ready': mapping_ready, 'complete': complete, 'stale': stale,
            'rows': len(state['rows']), 'criteria': len(state['criteria']),
            'cells': len(state['rows']) * len(state['criteria']),
            'unknown': len(unknown), 'unverified': len(unverified),
            'unevaluated': len(unevaluated), 'inventory_missing': inventory_missing,
            'obligations_missing': obligations_missing, 'findings': list(findings.values()),
            'bands': bands, 'conformance': 'unmeasured' if not complete else (
                'findings' if bands['Live'] or bands['Contract'] else 'clean-live-and-contract')}


def remaining(state, phase):
    require(phase in PHASES, 'Unknown assignment phase')
    index = cell_index(state)
    if phase == 'map':
        return [key for key in index if state['mappings'].get(key, {}).get('status') not in ('A', 'N')]
    if phase == 'verify':
        require(all(state['mappings'].get(key, {}).get('status') in ('A', 'N') for key in index),
                'Every mapping decision must be settled before map verification')
        return [key for key in index if not verified(state, key)]
    if phase == 'evaluate':
        require(gate(state)['mapping_ready'], 'The entire independently verified map is required')
        return [key for key in index if state['mappings'][key]['status'] == 'A'
                and state['evaluations'].get(key, {}).get('status') not in ('pass', 'finding')]
    eligible = {key for key, item in state['obligations'].items()
                if (item['kind'] == 'inventory') == (phase == 'inventory')}
    status = gate(state, check_fresh=False)
    if phase == 'obligations':
        require(status['mapping_ready'], 'Verify the map before audit obligations')
        return [key for key in status['obligations_missing'] if key in eligible]
    return [key for key in status['inventory_missing'] if key in eligible]


def bind(state, assignment_id, actor):
    require(isinstance(actor, str) and 0 < len(actor) <= 128, 'A host agent identity of at most 128 characters is required')
    assignment = state['assignments'][assignment_id]
    require(assignment['status'] in ('pending', 'partial'), 'Assignment is closed')
    require(not assignment.get('actor') or assignment['actor'] == actor,
            'An owned assignment needs a new attempt to change its actor')
    if assignment['phase'] == 'verify':
        require(all(state['mappings'][key]['actor'] != actor for key in assignment['items']),
                'A mapper cannot verify its own cells')
    if assignment['phase'] == 'inventory':
        require(actor != state['inputs']['author'], 'Inventory verification must be independent')
    assignment['actor'] = actor


def finding_record(state, value, actor, items, evidence):
    finding = deepcopy(value)
    require(isinstance(finding, dict), 'A finding needs structured attribution')
    require(finding.get('band') in ('Live', 'Contract', 'Hygiene'), 'Invalid finding band')
    require(finding.get('severity') in ('Critical', 'High', 'Medium', 'Low'), 'Invalid severity')
    require(finding.get('origin') in ('diff', 'pre-existing', 'known', 'fix'), 'Invalid origin')
    require(finding.get('summary') and finding.get('fix'), 'A finding needs its construct and fix')
    index = cell_index(state)
    finding.setdefault('entry', '; '.join(sorted({state['criteria'][index[key][1]]['title']
                                                  for key in items if key in index})) or '; '.join(items))
    finding.setdefault('location', '; '.join(sorted({index[key][0] for key in items if key in index}))
                        or '; '.join(cite['source'] for cite in evidence))
    finding['id'] = digest([finding['entry'], finding['location'], finding['summary']])[:20]
    finding['items'], finding['actor'], finding['evidence'] = items, actor, evidence
    for group in ('evaluations', 'obligation_results'):
        for result in state[group].values():
            for existing in result.get('findings', []):
                if existing['id'] == finding['id']:
                    require(all(existing[field] == finding[field] for field in ('band', 'severity', 'origin')),
                            'Duplicate finding classification conflicts; reconcile through independent confirmation')
    if finding['severity'] in ('Critical', 'High', 'Medium'):
        key = 'finding:' + finding['id']
        previous = state['obligations'].get(key, {})
        actors = sorted({actor, *previous.get('actors', [])})
        sources = sorted({cite['source'] for cite in evidence} | set(previous.get('sources', [])))
        if previous and (actors != previous['actors'] or sources != previous['sources']):
            state['obligation_results'].pop(key, None)
        state['obligations'][key] = {
            'kind': 'finding', 'sources': sources, 'actors': actors, 'finding': finding}
    return finding


def ingest(state, receipt):
    """Validate a complete receipt transaction before accepting any of its records."""
    updated = deepcopy(state)
    require(not gate(updated)['stale'], 'Inputs or rendered evidence changed; refresh before ingesting results')
    assignment_id = receipt.get('assignment')
    require(assignment_id in updated['assignments'], 'Unknown assignment')
    assignment = updated['assignments'][assignment_id]
    require(assignment['status'] in ('pending', 'partial'), 'Assignment is closed; plan its residual')
    require(assignment.get('actor') and receipt.get('actor') == assignment['actor'],
            'Return identity differs from the host-bound agent')
    require(receipt.get('snapshot') == updated['snapshot'] == assignment['snapshot'],
            'Stale assignment snapshot')
    attempt = receipt.get('attempt')
    require(isinstance(attempt, str) and attempt and '/' not in attempt and '..' not in attempt,
            'A safe unique attempt ID is required')
    require(not any(item.get('assignment') == assignment_id and item.get('attempt') == attempt
                    for item in updated['history']), 'Duplicate attempt')
    actor, phase = receipt['actor'], assignment['phase']
    if phase in ('evaluate', 'obligations'):
        require(gate(updated)['mapping_ready'], 'Evaluation requires the current verified map')
    index, seen = cell_index(updated), set()
    records = receipt.get('records')
    require(isinstance(records, list) and records, 'A return must account for assigned work')
    for record in records:
        items = record.get('items', [])
        require(isinstance(items, list) and items and len(items) == len(set(items)), 'Invalid item list')
        require(set(items) <= set(assignment['items']), 'Return contains unassigned items')
        require(not set(items).intersection(assignment['returned']), 'Item already returned by this assignment')
        require(not seen.intersection(items), 'Duplicate result within a return')
        seen.update(items)
        require(isinstance(record.get('reason'), str) and record['reason'].strip(), 'A reason is required')
        status = record.get('status')
        needed = set()
        for key in items:
            if phase in ('map', 'verify', 'evaluate'):
                row, criterion = index[key]
                needed.update(updated['rows'][row]['sources'])
                needed.add(updated['criteria'][criterion]['source'])
            else:
                if updated['obligations'][key]['kind'] != 'check':
                    needed.update(updated['obligations'][key]['sources'])
        evidence = record.get('evidence')
        evidence_valid(updated, evidence, needed)
        if phase in ('map', 'verify', 'evaluate'):
            for key in items:
                row, criterion = index[key]
                for subject in (updated['rows'][row], updated['criteria'][criterion]):
                    require(any(cite['source'] == subject['source'] and
                                cite['start'] <= subject['end'] and cite['end'] >= subject['start']
                                for cite in evidence), 'Evidence does not overlap the row or criterion')
        findings = []
        if status == 'finding':
            require(isinstance(record.get('findings'), list) and record['findings'], 'A finding result needs all its findings')
            findings = [finding_record(updated, value, actor, items, evidence) for value in record['findings']]
            require(len({finding['id'] for finding in findings}) == len(findings),
                    'Duplicate finding within one result')
        for key in items:
            result = {'status': status, 'actor': actor, 'reason': record['reason'],
                      'evidence': evidence, 'assignment': assignment_id, 'attempt': attempt}
            if findings:
                result['findings'] = findings
            if phase == 'map':
                require(status in ('A', 'N', 'U'), 'Mapping status must be A, N or U')
                require(key not in updated['mappings'] or updated['mappings'][key]['status'] == 'U',
                        'Reset an existing decision before replacing it')
                result['fingerprint'] = cell_fingerprint(updated, *index[key])
                updated['mappings'][key] = result
                updated['verifications'].pop(key, None)
                updated['evaluations'].pop(key, None)
            elif phase in ('verify', 'evaluate'):
                mapping = updated['mappings'][key]
                fingerprint = mapping_fingerprint(mapping)
                require(assignment['mappings'].get(key) == fingerprint,
                        'The mapping changed after this assignment was planned')
                result['mapping'] = fingerprint
                if phase == 'verify':
                    require(status in ('verified', 'disputed'), 'Invalid verification status')
                    require(actor != mapping['actor'], 'A mapper cannot verify its own work')
                    updated['verifications'][key] = result
                else:
                    require(status in ('pass', 'finding', 'blocked'), 'Invalid evaluation status')
                    require(mapping['status'] == 'A', 'Only applicable cells are evaluated')
                    updated['evaluations'][key] = result
            else:
                obligation = updated['obligations'][key]
                kind = obligation['kind']
                allowed = {'inventory': ('verified', 'disputed'),
                           'read': ('read', 'blocked'),
                           'unit': ('walked', 'not-applicable', 'finding', 'blocked'),
                           'check': ('pass', 'finding', 'blocked'),
                           'finding': ('confirmed', 'downgraded', 'withdrawn', 'blocked')}
                require(status in allowed[kind], f'Invalid {kind} disposition')
                if kind == 'inventory':
                    require(actor != updated['inputs']['author'], 'Independent inventory verification required')
                if kind == 'check' and status != 'blocked':
                    observation = record.get('check', {})
                    require(isinstance(observation.get('command'), list) and observation['command']
                            and observation.get('cwd'), 'Check evidence needs its command and working directory')
                    require(type(observation.get('exit_code')) is int and observation['exit_code'] ==
                            (0 if status == 'pass' else 1), 'Check is unmeasured or its exit status conflicts')
                    artifact = Path(observation.get('output', ''))
                    require(artifact.is_file(), 'Check output must be a captured file')
                    result['check'] = {**observation, 'output': str(artifact.resolve()),
                                       'hash': digest(artifact.read_bytes()), 'text': artifact.read_text()}
                if kind == 'finding':
                    require(actor not in obligation['actors'], 'A finding needs independent confirmation')
                    if status == 'downgraded':
                        ranks = ('Critical', 'High', 'Medium', 'Low')
                        severity, band = record.get('severity'), record.get('band')
                        require(severity in ranks and ranks.index(severity) >
                                ranks.index(obligation['finding']['severity']), 'A downgrade needs a lower severity')
                        require(band in ('Live', 'Contract', 'Hygiene'), 'A downgrade needs its resulting band')
                        result['disposition'] = {'severity': severity, 'band': band}
                if kind == 'read' and status == 'read':
                    for source in needed:
                        count = len(updated['sources'][source]['text'].splitlines()) or 1
                        spans = sorted((cite['start'], cite['end']) for cite in evidence if cite['source'] == source)
                        through = 0
                        for start, end in spans:
                            require(start <= through + 1, 'Whole-file read evidence has a gap')
                            through = max(through, end)
                        require(through == count, 'Whole-file read evidence is incomplete')
                updated['obligation_results'][key] = result
    assignment['returned'] = sorted(set(assignment.get('returned', [])) | seen)
    assignment['status'] = 'returned' if set(assignment['returned']) == set(assignment['items']) else 'partial'
    updated['history'].append({'assignment': assignment_id, 'attempt': attempt,
                               'actor': actor, 'phase': phase, 'receipt': digest(receipt)})
    return updated


def reset(state, items, reason):
    require(reason and items, 'Reset needs cells and a reason')
    index = cell_index(state)
    require(set(items) <= set(index), 'Unknown reset cells')
    for key in items:
        for name in ('mappings', 'verifications', 'evaluations'):
            state[name].pop(key, None)
    for assignment in state['assignments'].values():
        if set(items).intersection(assignment['items']):
            assignment['status'] = 'invalidated'
    active_findings = {finding['id'] for group in ('evaluations', 'obligation_results')
                       for result in state[group].values() for finding in result.get('findings', [])}
    for key in list(state['obligations']):
        if key.startswith('finding:') and key[8:] not in active_findings:
            state['obligations'].pop(key)
            state['obligation_results'].pop(key, None)
    state['history'].append({'reset': items, 'reason': reason})


def refresh(state, spec=None):
    args = state['inputs']
    updated = inventory(args['root'], args['engine'], spec or args['spec'], args['author'])
    # Applicability can depend on a workflow-wide invariant or an omitted caller.
    # Only an identical inventory generation establishes all those dependencies.
    if state['snapshot'] == updated['snapshot']:
        return state
    updated['history'] = state['history'] + [{'refresh': state['snapshot'], 'to': updated['snapshot']}]
    return updated
