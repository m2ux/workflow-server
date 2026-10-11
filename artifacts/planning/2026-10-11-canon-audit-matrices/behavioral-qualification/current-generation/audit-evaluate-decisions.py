"""Explicit findings and source-derived judgments for the controlled Audit cases."""

import collections
import datetime
import hashlib
import json
from pathlib import Path

S1 = 'corpus/qualification/activities/run.yaml'
S2 = 'corpus/qualification/routines/deliver.yaml'
S3 = 'corpus/qualification/techniques/TECHNIQUE.md'
S4 = 'corpus/qualification/techniques/produce.md'
S5 = 'corpus/qualification/workflow.yaml'

FINDINGS = {
    'invocation': {
        'band': 'Live', 'severity': 'Critical', 'origin': 'diff',
        'entry': 'broken-binding',
        'location': S1 + '#/steps/id=delivery/routine/arguments',
        'summary': 'Delivery passes packet to deliver, whose only input is envelope.',
        'fix': 'Pass the argument under the exact declared input key envelope.',
    },
    'output': {
        'band': 'Live', 'severity': 'Critical', 'origin': 'diff',
        'entry': 'broken-binding',
        'location': S2 + '#/outputs/report',
        'summary': 'Deliver exports emit.report, but emit calls produce, which declares only summary.',
        'fix': 'Bind the exported report to emit.summary, the output declared by the called technique.',
    },
    'protocol': {
        'band': 'Live', 'severity': 'High', 'origin': 'diff',
        'entry': 'emission-without-validation',
        'location': S4 + '#/protocol/line-8',
        'summary': 'Protocol directs report emission without prior report validation.',
        'fix': 'Require validation of the report before emitting it in this Protocol instruction.',
    },
    'rules': {
        'band': 'Live', 'severity': 'High', 'origin': 'diff',
        'entry': 'emission-without-validation',
        'location': S4 + '#/rules/line-11/clause-2',
        'summary': 'Rules clause 2 directs report emission without prior report validation.',
        'fix': 'Require validation of the report before every emission in the second Rules clause.',
    },
    'destination': {
        'band': 'Live', 'severity': 'High', 'origin': 'diff',
        'entry': "Honor the executing workflow's inherited destination",
        'location': S4 + '#/rules/line-12',
        'summary': "Produce declares public while its executing workflow's ancestor requires archive.",
        'fix': 'Set the leaf Destination to archive to satisfy its executing ancestor constraint.',
    },
    'termination': {
        'band': 'Live', 'severity': 'Critical', 'origin': 'diff',
        'entry': 'Provide a terminating workflow path',
        'location': S5 + '#/graph/run/done',
        'summary': "Qualification's sole reachable exit loops from run to run, with no path to null.",
        'fix': 'Provide a reachable workflow exit whose destination is null.',
    },
}

# Every owned row/criterion is explicitly assigned a comparison. No unlisted
# cell receives a default pass. The output only formats these derived judgments.
GROUPS = {
    'ap:broken-binding': [
        ('R01 R02 R03 R04 R05 R06 R07 R08 R09 R10 R11',
         'The concrete delivery argument-key set {envelope} exactly matches deliver Inputs [envelope]; sealed is an opaque value.',
         'Delivery supplies {packet}, but deliver requires exactly {envelope}; there are no optional keys or aliases. The invocation is structurally broken (Live/Critical).',
         ['invocation'], [S1, S2]),
        ('R12 R13 R14 R15 R16 R17 R19 R21 R22 R23 R30',
         'Export emit.report resolves step emit to produce, whose Outputs declares report. The referenced output exists; export and producer names need not otherwise match.',
         'Export emit.report resolves emit to produce, whose only declared output is summary. This unresolved output bind is Live/Critical; diff follows the supplied touched producer contract.',
         ['output'], [S2, S4]),
        ('R18 R20',
         'Delivery arguments {envelope} match Inputs [envelope]; export emit.report resolves emit to produce Outputs [report]. Both concrete AP2 contracts hold.',
         'Two AP2 contracts fail: delivery supplies packet against required envelope, and emit.report names no output in produce Outputs [summary]. Both bindings are structurally broken (Live/Critical).',
         ['invocation', 'output'], [S1, S2, S4]),
    ],
    'ap:emission-without-validation': [
        ('R24 R25',
         'Protocol requires Validate the report, then emit it: validation precedes emission of the same report, satisfying AP1 for this instruction.',
         'Protocol explicitly says Emit the report without validation. This independently permits unvalidated report emission (Live/High), propagating beyond the instruction.',
         ['protocol'], [S4]),
        ('R26 R27 R28',
         'The second Rules clause requires validating the report before each emission. The first clause only retains its ID; each clause satisfies its own AP1 scope.',
         'The second Rules clause says emit the report without validation. Retaining its ID in clause 1 supplies no validation; this separate directive is Live/High.',
         ['rules'], [S4]),
        ('R30',
         'Protocol validates the report before emitting it, and Rules independently requires validation before each emission. Capability, Outputs, retention and destination add no unvalidated directive.',
         'Two separate directives permit unvalidated report emission: Protocol line 8 and Rules line 11 clause 2. AP1 requires both violations independently (Live/High).',
         ['protocol', 'rules'], [S4]),
    ],
    'dp:1': [
        ('R09 R19 R20 R26 R29 R30 R31 R37 R38 R39 R40',
         'Qualification selects run, whose delivery calls deliver; emit calls produce. The executing ancestor requires archive and the leaf declares archive, satisfying this inheritance relationship.',
         'Qualification/run invokes deliver/emit then produce. The executing TECHNIQUE.md requires archive, but the leaf Destination is public. This incorrect destination propagates to delivery (Live/High).',
         ['destination'], [S1, S2, S3, S4, S5]),
    ],
    'dp:2': [
        ('R32 R33 R34 R35 R36 R37 R38 R39 R40',
         'The complete workflow starts at run and its sole done edge reaches null in one transition. That finite path satisfies DP2; activity steps need add no exits.',
         'The complete workflow starts at run; its only edge is done to run, with no null destination or alternative path. This structurally nonterminating graph is Live/Critical.',
         ['termination'], [S5]),
    ],
}


def decision_table():
    table = {}
    for criterion, groups in GROUPS.items():
        table[criterion] = {}
        for aliases, pass_reason, finding_reason, findings, sources in groups:
            for alias in aliases.split():
                assert alias not in table[criterion]
                table[criterion][alias] = (pass_reason, finding_reason, findings, sources)
    return table


def write_round(reader, round_name):
    table = decision_table()
    data, rows, criteria, aliases = reader.dictionaries(round_name)
    assert len(data) == 13
    assert sum(len(packet['assignment']['items']) for entry, packet in data) == 94
    task_start = next(line for line in reader.LOG.read_text().splitlines() if 'TASK START:' in line)
    started = datetime.datetime.fromisoformat(task_start.split(' | ')[0])
    metrics = []
    status_counts = collections.Counter()
    finding_counts = collections.Counter()
    seen = set()
    for entry, packet in data:
        assignment = packet['assignment']
        assert assignment['actor'] == entry['actor'] == '/root/qualify_audit_one'
        assert assignment['phase'] == entry['phase'] == 'evaluate'
        case = Path(entry['run']).name
        assert case in ('audit-a', 'audit-b')
        source_bytes = {}
        for excerpt in packet['source_excerpts']:
            digest = excerpt['hash']
            raw = (Path(packet['captured_sources']) / (digest + '.txt')).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == digest and digest in reader.KNOWN
            source_bytes[excerpt['source']] = raw
        records = []
        for item in assignment['items']:
            assert (case, item) not in seen
            seen.add((case, item))
            row_id, criterion_id = packet['cells'][item]
            row = packet['rows'][row_id]
            criterion = packet['criteria'][criterion_id]
            assert packet['mappings'][item]['status'] == 'A'
            pass_reason, finding_reason, defect_keys, extras = table[criterion_id][aliases[row_id]]
            source_keys = set(row['sources']) | set(extras)
            spans = [{'source': source, 'start': 1, 'end': len(source_bytes[source].splitlines())} for source in sorted(source_keys)]
            spans.append({'source': criterion['source'], 'start': criterion['start'], 'end': criterion['end']})
            assert set(row['sources']) | {criterion['source']} <= {span['source'] for span in spans}
            assert any(span['source'] == row['source'] and span['start'] <= row['end'] and span['end'] >= row['start'] for span in spans)
            assert any(span['source'] == criterion['source'] and span['start'] <= criterion['end'] and span['end'] >= criterion['start'] for span in spans)
            address = row.get('relationship', {}).get('address', row['address'])
            if case == 'audit-a':
                record = {'items': [item], 'status': 'pass', 'reason': address + ': ' + pass_reason, 'evidence': spans}
            else:
                record = {'items': [item], 'status': 'finding', 'reason': address + ': ' + finding_reason, 'evidence': spans, 'findings': [FINDINGS[key] for key in defect_keys]}
                finding_counts.update(defect_keys)
            status_counts[(case, record['status'])] += 1
            records.append(record)
        assert len(records) == len(assignment['items'])
        receipt = {'run': entry['run'], 'assignment': assignment['id'], 'snapshot': assignment['snapshot'], 'actor': assignment['actor'], 'attempt': 'current-evaluation-' + round_name + '-' + assignment['id'], 'records': records}
        encoded = (json.dumps(receipt, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
        assert len(encoded) <= assignment['budgets']['output_tokens'], (assignment['id'], len(encoded))
        folder = reader.BASE / round_name / 'audit-evaluate-receipts'
        folder.mkdir(exist_ok=True)
        path = folder / (assignment['id'] + '.json')
        assert not path.exists(), path
        path.write_bytes(encoded)
        assert json.loads(path.read_bytes()) == receipt
        metrics.append({'assignment': assignment['id'], 'case': case, 'items': len(records), 'packet_bytes': Path(entry['packet']).stat().st_size, 'receipt_bytes': len(encoded), 'findings': sum(len(record.get('findings', [])) for record in records)})
    reader.emit('Current independent evaluation complete; explicit source-derived judgments formatted', {'round': round_name, 'results': metrics, 'status_counts': [[*key, count] for key, count in sorted(status_counts.items())], 'unique_findings': len(finding_counts), 'finding_occurrences': dict(finding_counts), 'packet_bytes': sum(v['packet_bytes'] for v in metrics), 'receipt_bytes': sum(v['receipt_bytes'] for v in metrics), 'largest_receipt_bytes': max(v['receipt_bytes'] for v in metrics), 'elapsed_seconds_from_task_start': round((datetime.datetime.now(datetime.timezone.utc) - started).total_seconds(), 3), 'end_timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'receipt_directory': str(reader.BASE / round_name / 'audit-evaluate-receipts'), 'attribution_limit': 'diff uses the declared changed paths, including the consumer export broken against the touched producer contract. No base comparison or pre-existing attribution is claimed.', 'classification': 'All six distinct defects are Live. The two unresolved bindings and nonterminating graph are Critical structural failures; the two unvalidated emission directives and incorrect inherited destination are High because behavior propagates beyond their declaring construct. Guard execution is not claimed here.', 'reading_notes': 'Reporting prerequisites and full criteria were read before findings. Original bytes reused only after current exact hashes agreed; current row metadata and every owned cell were read. Initial verbose metadata chunk was redundant; compact operational metadata completed identity/budget/scope reads.'})

