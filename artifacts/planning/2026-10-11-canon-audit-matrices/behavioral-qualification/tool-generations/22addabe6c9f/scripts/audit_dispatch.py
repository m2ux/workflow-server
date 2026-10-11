"""Budgeted, disjoint work assignments and source packets for host agents."""

import math
import json
from collections import defaultdict
from functools import lru_cache

from audit_common import cell_index, digest, mapping_fingerprint, require
from audit_inventory import freshness
from audit_state import remaining


@lru_cache(maxsize=256)
def source_lines(text):
    return tuple(text.splitlines())


@lru_cache(maxsize=512)
def canon_spans(text, start, end):
    lines = source_lines(text)
    first = next((i for i, line in enumerate(lines, 1) if line.startswith('## ')), 1)
    spans = [(start, end), (1, first)]
    family = next((i for i in range(start - 1, -1, -1) if lines[i].startswith('## ')), None)
    if family is not None and family + 1 < start:
        boundary = next((i for i in range(family + 1, len(lines)) if lines[i].startswith('### ')), start - 1)
        spans.append((family + 1, max(family + 1, boundary)))
    return tuple(spans)


def context_spans(state, phase, items, index):
    spans = defaultdict(list)
    for key in items:
        if key in index:
            row, criterion = index[key]
            for source in state['rows'][row]['sources']:
                spans[source].append((1, len(source_lines(state['sources'][source]['text'])) or 1))
            unit = state['criteria'][criterion]
            spans[unit['source']].extend(canon_spans(state['sources'][unit['source']]['text'], unit['start'], unit['end']))
        else:
            obligation = state['obligations'][key]
            if obligation.get('context_mode') == 'manifest':
                continue
            unit = obligation.get('criterion')
            for source in obligation['sources']:
                spans[source].append((unit['start'], unit['end']) if unit else (
                    1, len(source_lines(state['sources'][source]['text'])) or 1))
    merged = {}
    for source, ranges in spans.items():
        result = []
        for start, end in sorted(ranges):
            if result and start <= result[-1][1] + 1:
                result[-1][1] = max(result[-1][1], end)
            else:
                result.append([start, end])
        merged[source] = result
    return merged


def estimate(state, phase, items, budgets, index):
    context = context_spans(state, phase, items, index)
    assignment = {'id': 'x' * 20, 'phase': phase, 'snapshot': state['snapshot'],
                  'items': items, 'budgets': budgets, 'status': 'partial', 'returned': items,
                  'actor': 'x' * 128,
                  'mappings': {key: 'x' * 64 for key in items if phase in ('verify', 'evaluate')},
                  'estimate': {'context': context}}
    # Count the serialized packet: rows, criterion metadata, mapping reasons,
    # ownership and excerpts all consume the worker's context window.
    size = len(json.dumps(packet_content(state, assignment, index), indent=2,
                          ensure_ascii=False, sort_keys=True).encode()) + 512
    calibration = budgets['calibration'][phase]
    input_tokens = math.ceil(size / budgets['bytes_per_token'])
    output_tokens = math.ceil(len(items) * calibration['output_tokens_per_item'])
    seconds = len(items) * calibration['seconds_per_item']
    return {'input_tokens_estimate': input_tokens, 'output_tokens_estimate': output_tokens,
            'work_seconds_estimate': seconds, 'context': context}


def fits(cost, budgets):
    return (cost['input_tokens_estimate'] + cost['output_tokens_estimate']
            <= budgets['context_tokens'] - budgets['reserve_tokens'] - budgets['safety_tokens']
            and cost['output_tokens_estimate'] <= budgets['output_tokens']
            and cost['work_seconds_estimate'] <= budgets['work_seconds'])


def plan_assignments(state, phase, budgets):
    require(not freshness(state), 'Inputs changed; refresh before dispatch')
    for key in ('context_tokens', 'output_tokens', 'work_seconds', 'slots', 'bytes_per_token'):
        require(isinstance(budgets.get(key), (float, int)) and budgets[key] > 0, f'Positive {key} required')
    for key in ('reserve_tokens', 'safety_tokens'):
        require(isinstance(budgets.get(key), (float, int)) and budgets[key] >= 0, f'Nonnegative {key} required')
    require(type(budgets['slots']) is int, 'Slots must be the actual free child-slot count')
    require(budgets['context_tokens'] > budgets['reserve_tokens'] + budgets['safety_tokens'],
            'Context reserves consume the whole budget')
    calibration = budgets.get('calibration', {}).get(phase, {})
    require(calibration.get('evidence'), 'Record a phase-specific calibration or bounded pilot basis')
    require(calibration.get('output_tokens_per_item', 0) > 0 and calibration.get('seconds_per_item', 0) > 0,
            'Phase calibration needs positive output and work estimates')
    items = remaining(state, phase)
    index = cell_index(state)
    active = {key for assignment in state['assignments'].values()
              if assignment['phase'] == phase and assignment['status'] not in ('invalidated', 'failed')
              and assignment['snapshot'] == state['snapshot'] for key in assignment['items']}
    items = [key for key in items if key not in active]
    # Criterion-major source bundles preserve semantic locality. Oversized bundles
    # split into cells, each retaining its full source and relationship context.
    groups = defaultdict(list)
    for key in items:
        if key in index:
            row, criterion = index[key]
            item = state['rows'][row]
            group = (criterion, item['source'], 'relationship' if item['kind'] == 'relationship' else item['section'])
        else:
            group = (key,)
        groups[group].append(key)
    bundles = []
    for group, members in sorted(groups.items()):
        cost = estimate(state, phase, members, budgets, index)
        if fits(cost, budgets):
            bundles.append(members)
        else:
            chunk = []
            for key in members:
                require(fits(estimate(state, phase, [key], budgets, index), budgets),
                        'Indivisible context exceeds declared budgets: ' + key)
                candidate = chunk + [key]
                if chunk and not fits(estimate(state, phase, candidate, budgets, index), budgets):
                    bundles.append(chunk)
                    chunk = []
                chunk.append(key)
            if chunk:
                bundles.append(chunk)
    bundles.sort(key=lambda group: (-len(group), group[0]))
    packed, packed_costs = [], []
    seam_bins = defaultdict(list)
    capacity = min(math.floor(budgets['output_tokens'] / calibration['output_tokens_per_item']),
                   math.floor(budgets['work_seconds'] / calibration['seconds_per_item']))
    for bundle in bundles:
        bundle_cost = estimate(state, phase, bundle, budgets, index)
        source_set = set(bundle_cost['context'])
        seam = index[bundle[0]][1] if bundle[0] in index else state['obligations'][bundle[0]]['kind']
        candidates = sorted((i for i in seam_bins[seam] if len(packed[i]) + len(bundle) <= capacity),
                            key=lambda i: -len(source_set.intersection(packed_costs[i]['context'])))
        destination, combined_cost = None, None
        for candidate in candidates:
            combined_cost = estimate(state, phase, packed[candidate] + bundle, budgets, index)
            if fits(combined_cost, budgets):
                destination = candidate
                break
        if destination is None:
            seam_bins[seam].append(len(packed))
            packed.append(bundle)
            packed_costs.append(bundle_cost)
        else:
            packed[destination].extend(bundle)
            packed_costs[destination] = combined_cost
    flattened = [key for group in packed for key in group]
    require(len(flattened) == len(set(flattened)) and set(flattened) == set(items),
            'Assignments must exactly cover the required residual')
    created = []
    for group, cost in zip(packed, packed_costs):
        identity = digest([state['snapshot'], phase, group, len(state['assignments'])])[:20]
        assignment = {'id': identity, 'phase': phase, 'snapshot': state['snapshot'],
                      'items': group, 'budgets': budgets, 'estimate': cost,
                      'status': 'pending', 'returned': [], 'actor': None,
                      'mappings': {key: mapping_fingerprint(state['mappings'][key]) for key in group
                                   if phase in ('verify', 'evaluate')}}
        state['assignments'][identity] = assignment
        created.append(identity)
    return {'phase': phase, 'required_residual': len(items), 'assignments': created,
            'assignment_count': len(created), 'concurrent_workers': min(budgets['slots'], len(created)),
            'minimum_waves': math.ceil(len(created) / budgets['slots'])}


def packet_content(state, assignment, index):
    rows, criteria, obligations = {}, {}, {}
    for key in assignment['items']:
        if key in index:
            row, criterion = index[key]
            rows[row], criteria[criterion] = state['rows'][row], state['criteria'][criterion]
        else:
            obligations[key] = state['obligations'][key]
    inventory_sources = {source for item in obligations.values() if item['kind'] == 'inventory'
                         for source in item['sources']}
    manifest_sources = {source for item in obligations.values() for source in item['sources']}
    if inventory_sources:
        rows.update({key: value for key, value in state['rows'].items()
                     if value['source'] in inventory_sources})
        criteria.update({key: value for key, value in state['criteria'].items()
                         if value['source'] in inventory_sources})
    excerpts = []
    for source, spans in assignment['estimate']['context'].items():
        lines = source_lines(state['sources'][source]['text'])
        for start, end in spans:
            excerpts.append({'source': source, 'start': start, 'end': end,
                             'hash': state['sources'][source]['hash'],
                             'text': '\n'.join(lines[start - 1:end])})
    return {'assignment': assignment, 'scope': state['inputs']['spec'],
            'rows': rows, 'criteria': criteria, 'obligations': obligations,
            'supplemental': {key: value for key, value in state['supplemental'].items()
                             if value['source'] in inventory_sources},
            'required_checks': sorted(key for key, value in state['obligations'].items()
                                      if inventory_sources and value['kind'] == 'check'),
            'cells': {key: index[key] for key in assignment['items'] if key in index},
            'mappings': {key: state['mappings'][key] for key in assignment['items']
                         if assignment['phase'] in ('verify', 'evaluate') and key in state['mappings']},
            'corpus_manifest': {key: state['corpus_manifest'][key] for key in sorted(manifest_sources)},
            'diagnostics': [item for item in state['diagnostics'] if item['source'] in inventory_sources],
            'captured_sources': str(state.get('run', '')) + '/sources',
            'source_excerpts': excerpts,
            'authority': 'Read captured sources and return evidence; the coordinator owns state and edits.'}


def packet(state, assignment_id):
    require(not freshness(state), 'Inputs changed; refresh before dispatch')
    assignment = state['assignments'][assignment_id]
    require(assignment['status'] in ('pending', 'partial'), 'Assignment is closed')
    content = packet_content(state, assignment, cell_index(state))
    size = len(json.dumps(content, indent=2, ensure_ascii=False, sort_keys=True).encode())
    require(math.ceil(size / assignment['budgets']['bytes_per_token']) <=
            assignment['estimate']['input_tokens_estimate'], 'Packet exceeds its planned input estimate; replan')
    return content
