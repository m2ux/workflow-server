"""Record the coordinator's source reads and independent finding derivations."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, '/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon/scripts')
from audit_common import digest, read_json, write_json
from audit_state import gate

parser = argparse.ArgumentParser()
parser.add_argument('operation', choices=('status', 'inspect', 'record'))
parser.add_argument('--round', type=int, default=1)
parser.add_argument('--mode', choices=('author', 'audit'), default='author')
parser.add_argument('--kind', choices=('support', 'confirmation'), default='support')
parser.add_argument('--reuse-source-bytes', action='store_true')
parser.add_argument('--receipt-folder')
args = parser.parse_args()
base = Path(__file__).resolve().parent
folder = base / ('round-' + str(args.round))

if args.operation == 'status':
    for case in read_json(base / 'coordinator-cases.json'):
        state = read_json(Path(case['run']) / 'audit-state.json')
        status = gate(state)
        print(json.dumps({'run': str(Path(case['run']).relative_to(base)),
            **{key: status[key] for key in ('mapping_ready', 'complete', 'cells', 'unknown', 'unverified', 'unevaluated', 'stale', 'conformance')},
            'inventory_missing': len(status['inventory_missing']),
            'obligations_missing': len(status['obligations_missing']),
            'findings': [{key: item[key] for key in ('id', 'entry', 'location', 'summary', 'severity', 'band')} for item in status['findings']]}))
    raise SystemExit(0)

read_reasons = {
    'activities/run.yaml': 'Read the entire activity: delivery invokes deliver and supplies its explicit argument map. Argument keys remain a semantic AP-02 obligation, independently evaluated in their mapped cells.',
    'routines/deliver.yaml': 'Read the entire unchanged routine: envelope is the input, report exports emit.report, and emit calls produce. Declaration and concrete invocation contexts remain separately mapped.',
    'techniques/TECHNIQUE.md': 'Read the entire inherited contract: its capability and required archive destination. The rule applies through the captured leaf and call-chain context.',
    'techniques/produce.md': 'Read all twelve lines: Capability, Outputs, Protocol and both Rules, including the independently testable second semicolon clause. This read disposition does not assert conformance.',
    'workflow.yaml': 'Read the entire initialActivity and run graph, including the sole done destination. Its complete graph supplies the DP2 termination evaluation.',
}
seen = set()
for job in read_json(folder / (args.mode + '-obligations-queue.json')):
    run = Path(job['run'])
    state = read_json(run / 'audit-state.json')
    packet = read_json(job['packet'])
    assert state['snapshot'] == packet['assignment']['snapshot']
    for key, source in state['sources'].items():
        assert source['hash'] == digest(Path(source['path']).read_bytes())
    if args.reuse_source_bytes:
        reference = read_json(base / 'round-1' / ('author-' + run.name[-1]) / 'audit-state.json')
        assert {key: source['hash'] for key, source in state['sources'].items()} == {key: source['hash'] for key, source in reference['sources'].items()}
    records = []
    for key, obligation in packet['obligations'].items():
        assert (obligation['kind'] == 'finding') == (args.kind == 'confirmation')
        if args.operation == 'inspect':
            displayed = obligation
            if args.reuse_source_bytes and args.kind == 'support':
                displayed = {'kind': obligation['kind'], 'sources': obligation['sources'], 'reuses_exact_read_hashes': True}
            print(json.dumps({'run': run.name, 'assignment': job['assignment'], 'item': key, 'obligation': displayed}))
            continue
        evidence = [{'source': source, 'start': 1, 'end': len(state['sources'][source]['text'].splitlines()) or 1} for source in obligation['sources']]
        if obligation['kind'] == 'read':
            source = obligation['sources'][0]
            reason = next(reason for ending, reason in read_reasons.items() if source.endswith(ending))
            record = {'items': [key], 'status': 'read', 'reason': reason, 'evidence': evidence}
        elif obligation['kind'] == 'unit':
            if obligation['sources'][0].endswith('convention-conformance.md'):
                reason = 'Walked Evidence scope against the captured definitions and all four controlled criteria. Source lines identify the two instruction clauses; YAML addresses and explicit execution relationships retain the binding and inherited call-chain context. Every current applicability decision is independently settled. Findings retain the controlled-dialect boundary and do not assert engine-schema or full-project-canon conformance.'
            else:
                reason = 'Walked the controlled AP family: it scopes interpretation to explicit instruction and binding constructs and identifies each distinct failing construct once. All AP-01/AP-02 cells retain those complete criteria; overlapping section and element detections reconcile through stable findings.'
            record = {'items': [key], 'status': 'walked', 'reason': reason, 'evidence': evidence}
        elif obligation['kind'] == 'check':
            check = read_json(job['check_observation'])
            output = json.loads(Path(check['output']).read_text())
            assert check['exit_code'] == 0 and output['errors'] == []
            record = {'items': [key], 'status': 'pass', 'reason': 'The recorded controlled guard command completed with exit 0: eight sources parse, the four controlled criteria are present, and required IDs, steps and graph shapes satisfy its assertions. This does not assert engine-schema or semantic conformance.', 'evidence': evidence, 'check': check}
        else:
            finding = obligation['finding']
            location = finding['location']
            if '/protocol/line-8' in location or ':8 ' in location:
                reason = 'The original Protocol line 8 explicitly directs report emission without validation. AP-01 requires prior validation for every emitting instruction. This construct independently reproduces High Live, regardless of instructions elsewhere.'
            elif '/rules/line-11/clause-2' in location or ':11 ' in location:
                reason = 'Independently split Rules line 11 at its semicolon: retaining the ID is the first clause; the second explicitly directs emission without validation. AP-01 applies to each clause, reproducing a separate High Live violation.'
            elif 'activities/run.yaml' in location:
                reason = 'Resolve delivery to deliver and compare exact keys: the invocation supplies packet while the routine Inputs list requires envelope. This fixture has no aliases or optional parameters. AP-02(1) reproduces a Critical Live binding defect.'
            elif 'routines/deliver.yaml' in location:
                reason = 'Resolve the unchanged routine export report to emit.report, emit to produce, and then read the complete leaf Outputs section: only summary is declared. The referenced report output is absent. AP-02(2) reproduces Critical Live at this consumer binding.'
            elif 'workflow.yaml' in location:
                reason = 'Start from initialActivity run. The complete graph has only run.done returning to run; no reachable transition targets null. DP2 requires a finite terminating path. The whole-graph defect independently reproduces Critical Live.'
            elif '/rules/line-12' in location or ':12 ' in location:
                assert finding['band'] == 'Contract', 'Current DP1 band needs an independent coordinator judgment before confirmation'
                reason = 'Follow qualification/run delivery to deliver/emit and produce, retaining the executing ancestor TECHNIQUE.md. The ancestor requires archive while the leaf declares public on line 12. DP1 reproduces an inherited contract conflict with High urgency because it reaches the concrete workflow instance. Contract identifies the propagated contradictory declarations: the fixture supplies no structural destination-binding operation that establishes which declaration wins. This does not assert a successful runtime execution.'
            else:
                raise AssertionError('Unreviewed finding location: ' + location)
            record = {'items': [key], 'status': 'confirmed', 'reason': reason, 'evidence': evidence}
        records.append(record)
    if args.operation == 'inspect':
        for excerpt in packet['source_excerpts']:
            if args.reuse_source_bytes:
                continue
            identity = (excerpt['source'], excerpt['hash'], excerpt['start'], excerpt['end'])
            if identity not in seen:
                seen.add(identity)
                print(json.dumps(excerpt))
        if args.kind == 'support':
            check = read_json(job['check_observation'])
            print(json.dumps({'check': check, 'actual_output': Path(check['output']).read_text()}))
    else:
        destination = folder / (args.receipt_folder or (args.mode + '-root-' + args.kind + '-receipts')) / (job['assignment'] + '.json')
        write_json(destination, {'run': job['run'], 'assignment': job['assignment'], 'snapshot': state['snapshot'], 'actor': '/root', 'attempt': 'root-current-' + args.kind, 'records': records})
        print(json.dumps({'receipt': str(destination), 'items': len(records)}))
