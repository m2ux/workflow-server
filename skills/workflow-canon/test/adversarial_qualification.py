"""Prepare deliberately inaccurate candidates for an independent live verifier.

These negative test candidates do not author or settle real audit judgments.
The verifier receives only captured packets, never this fault manifest.
"""

import argparse
from copy import deepcopy
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from audit_common import cell_index, digest, read_json, write_json
from audit_dispatch import packet, plan_assignments
from audit_inventory import inventory
from audit_state import bind, ingest, reset
from audit_surface import save


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True)
    parser.add_argument('--actor', required=True)
    args = parser.parse_args()
    base = Path(args.out).resolve()
    source = read_json(base / 'round-1/author-b/audit-state.json')
    out = base / 'adversarial'
    assert not out.exists(), 'Preserve existing adversarial candidates and receipts'
    budgets = {'context_tokens': 258400, 'reserve_tokens': 20000,
               'safety_tokens': 30000, 'output_tokens': 16000,
               'work_seconds': 600, 'slots': 1, 'bytes_per_token': 1,
               'calibration': read_json(base / 'calibration.json')}

    candidate = inventory(source['inputs']['root'], source['inputs']['engine'],
                          source['inputs']['spec'], '/root')
    leaf = 'corpus/qualification/techniques/produce.md'
    routine = 'corpus/qualification/routines/deliver.yaml'
    clause = next(key for key, row in candidate['rows'].items()
                  if row['source'] == leaf and row['start'] == 11
                  and row['address'].endswith('/clause-2'))
    removed_rows = [key for key, row in candidate['rows'].items()
                    if key == clause or row['source'] == routine]
    for key in removed_rows:
        del candidate['rows'][key]
    candidate['corpus_manifest'][routine]['selected'] = False
    criterion = next(key for key, value in candidate['criteria'].items()
                     if 'terminating' in value['title'])
    del candidate['criteria'][criterion]
    candidate['snapshot'] = digest([candidate['identity'], candidate['rows'],
                                    candidate['criteria'], candidate['obligations']])
    candidate_run = out / 'candidate-inventory'
    save(candidate, candidate_run)

    exclusion = deepcopy(source)
    exclusion.pop('run', None)
    exclusion.pop('rendered', None)
    exclusion_run = out / 'candidate-exclusion'
    save(exclusion, exclusion_run)
    cell = next(key for key, (row, criterion_id) in cell_index(exclusion).items()
                if exclusion['rows'][row]['source'] == leaf
                and exclusion['rows'][row]['start'] == 8
                and exclusion['rows'][row]['kind'] == 'item'
                and criterion_id == 'ap:emission-without-validation')
    reset(exclusion, [cell], 'Controlled negative test of an incorrect exclusion')
    save(exclusion, exclusion_run)
    job = plan_assignments(exclusion, 'map', budgets)['assignments'][0]
    bind(exclusion, job, '/root')
    save(exclusion, exclusion_run)
    proposed = packet(exclusion, job)
    evidence = [{'source': item['source'], 'start': item['start'], 'end': item['end']}
                for item in proposed['source_excerpts']]
    receipt = {'assignment': job, 'snapshot': exclusion['snapshot'], 'actor': '/root',
               'attempt': 'deliberate-negative-candidate', 'records': [{
                   'items': [cell], 'status': 'N', 'evidence': evidence,
                   'reason': 'Protocol instructions are operational context; emission validation is assigned only to Rules clauses.'}]}
    exclusion = ingest(exclusion, receipt)
    save(exclusion, exclusion_run)
    write_json(out / 'negative-mapper-receipt.json', receipt)

    queue = []
    for state, run, phase in ((candidate, candidate_run, 'inventory'),
                              (exclusion, exclusion_run, 'verify')):
        jobs = plan_assignments(state, phase, budgets)['assignments']
        for job in jobs:
            bind(state, job, args.actor)
        save(state, run)
        for job in jobs:
            destination = run / 'packets' / (job + '.json')
            write_json(destination, packet(state, job))
            queue.append({'run': str(run), 'packet': str(destination),
                          'phase': phase, 'assignment': job, 'actor': args.actor})
    write_json(out / 'queue.json', queue)
    write_json(out / 'fault-manifest.json', {
        'removed_clause': clause, 'removed_consumer_rows': removed_rows,
        'omitted_criterion': criterion, 'incorrect_exclusion': cell,
        'scope': 'Deliberately inaccurate candidates; no production judgment is synthesized.'})
    print(len(queue), 'bounded negative-test assignments')


if __name__ == '__main__':
    main()
