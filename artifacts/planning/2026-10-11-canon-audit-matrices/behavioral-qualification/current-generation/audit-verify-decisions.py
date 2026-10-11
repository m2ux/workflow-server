"""Explicit current-source judgments authored by the independent Audit verifier.

The reader has exposed every current reason, disposition and evidence list.
This table records the verifier's scope derivation; no receipt or expected file
is an input. The formatter refuses unknown rows or a different disposition.
"""

import collections
import datetime
import hashlib
import json
from pathlib import Path


SOURCE = {
    'S1': 'corpus/qualification/activities/run.yaml',
    'S2': 'corpus/qualification/routines/deliver.yaml',
    'S3': 'corpus/qualification/techniques/TECHNIQUE.md',
    'S4': 'corpus/qualification/techniques/produce.md',
    'S5': 'corpus/qualification/workflow.yaml',
}
FACTS = {
    'audit-a': {'arg': 'envelope', 'output': 'report', 'destination': 'archive', 'exit': 'null',
                'protocol': 'Validate the report, then emit it', 'clause': 'validate the report before each emission'},
    'audit-b': {'arg': 'packet', 'output': 'summary', 'destination': 'public', 'exit': 'run',
                'protocol': 'Emit the report without validation', 'clause': 'emit the report without validation'},
}

# Each listed row has a reviewed decision; there is deliberately no default.
# Extra sources support comparisons beyond the row's mandatory source list.
GROUPS = {
    'ap:emission-without-validation': [
        ('V01 V02 V03 V04 V05 V06 V07 V08 V09 V10 V11', 'N',
         'Run invokes deliver with {arg}; these YAML identifiers/call fields do not issue technique emission instructions. AP1 excludes calls and bindings.', 'S1'),
        ('V12 V13 V14 V15 V16 V17 V18 V19 V20 V21 V22 V23', 'N',
         'Deliver declares envelope, binds emit.report and calls produce. AP1 excludes these declarations and calls from Protocol/Rules emission instructions.', 'S2'),
        ('V24 V25 V26 V27 V28', 'N',
         'The ancestor contains descriptive Capability text and Destination must be archive; neither instructs artifact emission under AP1.', 'S3'),
        ('V29 V30', 'N',
         'Produce a report is the Capability description. AP1 explicitly excludes Capability descriptions from imperative emission instructions.', 'S4'),
        ('V31 V32 V33', 'N',
         'Outputs declares {output}; AP1 explicitly excludes output declarations, which do not direct emission.', 'S4'),
        ('V34 V35', 'A',
         'Protocol directs: {protocol}. AP1 covers each emitting instruction; requiring validation affects its result, not its applicability.', 'S4'),
        ('V36 V37 V39', 'A',
         'The second Rules clause directs: {clause}. AP1 requires examining this emitting clause independently of the retention clause.', 'S4'),
        ('V38', 'N',
         'This first semicolon clause only says Retain the report ID. AP1 excludes retention; the separate emitting clause cannot change this clause scope.', 'S4'),
        ('V40', 'N',
         'Destination is {destination} declares a destination without directing emission; AP1 explicitly excludes this construct.', 'S4'),
        ('V41', 'A',
         'The whole technique contains the Protocol emission instruction and the separate emitting Rules clause. AP1 covers both independently.', 'S4'),
        ('V42', 'N',
         'This relation carries the ancestor archive constraint to the leaf destination {destination}; inheritance itself is not an emitting instruction.', 'S3 S4'),
        ('V43 V44 V45 V46 V47 V48 V49 V50 V51 V52', 'N',
         'Qualification starts at run and its done edge targets {exit}. Workflow identifiers/graph references are outside AP1 technique instruction scope.', 'S5'),
    ],
    'ap:broken-binding': [
        ('V01 V04', 'N',
         'This names run or activity step delivery; neither identifier is a routine argument key or a producer step referenced by a routine export.', 'S1'),
        ('V02 V03 V05 V06 V07 V08 V10', 'A',
         'The delivery invocation supplies key {arg} to deliver, whose Inputs is [envelope]. AP2 requires checking this concrete key-set contract.', 'S1 S2'),
        ('V09 V11', 'A',
         'The deliver reference resolves the concrete call with key {arg} to Inputs [envelope]. AP2 requires each invocation to resolve and compare keys.', 'S1 S2'),
        ('V12', 'N',
         'The routine id deliver identifies the definition; AP2 binding responsibilities reside in its Inputs, exports and referenced producer steps.', 'S2'),
        ('V13 V14', 'A',
         'Inputs declares envelope, the contract for delivery arguments [{arg}]. This declaration participates in the exact-key comparison required by AP2.', 'S1 S2'),
        ('V15 V16', 'A',
         'The report export is emit.report; emit calls produce, whose declared output is {output}. AP2 requires comparing the referenced producer name.', 'S2 S4'),
        ('V17 V18 V19 V20 V22', 'A',
         'Step emit resolves export emit.report to produce and its output {output}. AP2 explicitly requires step/technique resolution before comparison.', 'S2 S4'),
        ('V21 V23', 'A',
         'Delivery supplies {arg} against envelope; emit.report resolves through emit to produce output {output}. This surface carries both AP2 contracts.', 'S1 S2 S4'),
        ('V24 V25 V26 V27 V28', 'N',
         'The ancestor only describes a service and requires destination archive; it has no Inputs, Outputs, invocation arguments or exported output binding.', 'S3'),
        ('V29 V30 V34 V35 V36 V37 V38 V39 V40', 'N',
         'This technique prose describes capability, emission, retention or destination. AP2 excludes Markdown artifact mentions; Outputs is separate.', 'S4'),
        ('V31 V32 V33 V41', 'A',
         'Produce declares output {output}; deliver exports emit.report through step emit calling produce. This producer declaration participates in AP2.', 'S2 S4'),
        ('V42', 'N',
         'Leaf-to-ancestor inheritance carries a destination constraint, neither of AP2 routine argument or producer-output binding contracts.', 'S3 S4'),
        ('V43 V44 V45 V46 V47 V48 V49 V50 V51 V52', 'N',
         'The workflow selects run and an exit to {exit}; these graph references carry neither routine argument keys nor step.output export names.', 'S5'),
    ],
    'dp:1': [
        ('V01 V02 V03 V04 V05 V06 V07 V08 V09 V10', 'N',
         'The activity file has no leaf Destination declaration. DP1 exempts independent file rows; its explicit call relationship carries inheritance.', 'S1'),
        ('V12 V13 V14 V15 V16 V17 V18 V19 V20 V21', 'N',
         'The routine file has no leaf Destination declaration. DP1 exempts independent file rows; explicit producer/execution relationships carry inheritance.', 'S2'),
        ('V11 V22 V23', 'A',
         'This call lies on qualification/run to deliver/emit to produce. DP1 explicitly carries the ancestor archive rule to leaf destination {destination}.', 'S1 S2 S3 S4 S5'),
        ('V24 V25 V26 V27 V28', 'N',
         'TECHNIQUE.md declares the inherited archive constraint. DP1 explicitly distinguishes that ancestor declaration from a leaf destination.', 'S3'),
        ('V29 V30 V31 V32 V33 V34 V35 V37 V38 V39', 'N',
         'This Capability/Outputs/Protocol or retention/emission row contains no Destination declaration; DP1 assigns the leaf destination separately.', 'S4'),
        ('V36 V40 V41', 'A',
         'This leaf surface contains Destination {destination}. Qualification/run calls deliver then produce, inheriting archive; DP1 requires that comparison.', 'S1 S2 S3 S4 S5'),
        ('V42', 'A',
         'This explicit ancestor relation connects produce destination {destination} to the archive rule in its executing qualification workflow. DP1 covers it.', 'S1 S2 S3 S4 S5'),
        ('V43 V44 V45 V46 V47 V48', 'N',
         'The workflow file has no leaf Destination declaration. DP1 exempts independent file rows while explicit execution relationships carry the rule.', 'S5'),
        ('V49 V50 V51 V52', 'A',
         'This graph relation selects or locates run in qualification, which calls deliver then produce. DP1 carries archive to that leaf destination {destination}.', 'S1 S2 S3 S4 S5'),
    ],
    'dp:2': [
        ('V01 V02 V03 V04 V05 V06 V07 V08 V09 V10 V11', 'N',
         'Run contains a delivery routine step/call, not a workflow graph exit. DP2 expressly says activity steps add no graph exits.', 'S1'),
        ('V12 V13 V14 V15 V16 V17 V18 V19 V20 V21 V22 V23', 'N',
         'Deliver owns local inputs, an export and a produce call. DP2 says routine steps add no graph exits; execution context does not change that role.', 'S2'),
        ('V24 V25 V26 V27 V28 V29 V30 V31 V32 V33 V34 V35 V36 V37 V38 V39 V40 V41 V42', 'N',
         'Technique content/inheritance supplies artifact or destination rules, no initialActivity or graph exit. It has no DP2 whole-workflow path role.', ''),
        ('V43 V44 V45', 'A',
         'This graph surface owns done to {exit}; the complete workflow starts at run with no other edge. DP2 requires its whole-workflow finite-path check.', 'S5'),
        ('V46', 'N',
         'The id qualification only names the workflow; it does not select the start or an exit. DP2 reachability belongs to graph/start and whole-element rows.', 'S5'),
        ('V47', 'A',
         'InitialActivity selects run, the start of DP2 reachability. The complete graph has only done to {exit}; matching run alone cannot prove termination.', 'S5'),
        ('V48', 'A',
         'Qualification starts at run and has only done to {exit}. DP2 explicitly makes a finite path to null a whole-workflow invariant.', 'S5'),
        ('V49 V50 V51 V52', 'A',
         'This workflow-to-run relationship participates in start/graph reachability. With sole done edge to {exit}, DP2 requires the complete graph check.', 'S1 S5'),
    ],
}


def decision_table():
    result = {}
    for criterion, groups in GROUPS.items():
        rows = {}
        for names, disposition, reason, extras in groups:
            for name in names.split():
                assert name not in rows, (criterion, name)
                rows[name] = (disposition, reason, extras.split())
        assert set(rows) == {f'V{i:02}' for i in range(1, 53)}, (criterion, set(rows))
        result[criterion] = rows
    return result


def write_round(reader, round_name):
    table = decision_table()
    data, rows, aliases, reasons, evidence_aliases = reader.dictionaries()
    selected = [(entry, packet) for entry, packet in data if entry['round'] == round_name]
    assert len(selected) == 16
    now = datetime.datetime.now(datetime.timezone.utc)
    start_line = next(line for line in reader.LOG.read_text().splitlines() if 'TASK START:' in line)
    started = datetime.datetime.fromisoformat(start_line.split(' | ')[0])
    result = []
    disposition_counts = collections.Counter()
    criterion_counts = collections.Counter()
    paths = []
    for entry, packet in selected:
        assignment = packet['assignment']
        assert entry['actor'] == assignment['actor'] == '/root/qualify_audit_one'
        assert assignment['phase'] == 'verify'
        facts = FACTS[Path(entry['run']).name]
        source_bytes = {}
        for excerpt in packet['source_excerpts']:
            raw = (Path(packet['captured_sources']) / (excerpt['hash'] + '.txt')).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == excerpt['hash']
            source_bytes[excerpt['source']] = raw
        records = []
        for item in assignment['items']:
            row_id, criterion_id = packet['cells'][item]
            row = packet['rows'][row_id]
            criterion = packet['criteria'][criterion_id]
            mapping = packet['mappings'][item]
            assert mapping['actor'] == '/root/qualify_audit_two'
            disposition, body, extras = table[criterion_id][aliases[row_id]]
            assert mapping['status'] == disposition, (item, row_id, criterion_id, mapping['status'], disposition)
            # Exact mapper wording was independently read in the reason projection.
            assert all(part in reasons for part in mapping['reason'].split('. '))
            required = set(row['sources']) | {criterion['source']}
            mapped_evidence = mapping['evidence']
            assert required <= {e['source'] for e in mapped_evidence}, item
            assert any(e['source'] == row['source'] and e['start'] <= row['end'] and e['end'] >= row['start'] for e in mapped_evidence), item
            assert any(e['source'] == criterion['source'] and e['start'] <= criterion['end'] and e['end'] >= criterion['start'] for e in mapped_evidence), item
            for span in mapped_evidence:
                assert 1 <= span['start'] <= span['end'] <= len(source_bytes[span['source']].splitlines()), (item, span)
            sources = set(row['sources']) | {SOURCE[s] for s in extras}
            spans = [{'source': source, 'start': 1, 'end': len(source_bytes[source].splitlines())} for source in sorted(sources)]
            spans.append({'source': criterion['source'], 'start': criterion['start'], 'end': criterion['end']})
            address = row.get('relationship', {}).get('address', row['address'])
            reason = disposition + ' verified for ' + address + ': ' + body.format(**facts)
            records.append({'items': [item], 'status': 'verified', 'reason': reason, 'evidence': spans})
            disposition_counts[disposition] += 1
            criterion_counts[(Path(entry['run']).name, criterion_id, disposition)] += 1
        assert len(records) == len(assignment['items']) == len({r['items'][0] for r in records})
        receipt = {'run': entry['run'], 'assignment': assignment['id'], 'snapshot': assignment['snapshot'], 'actor': assignment['actor'], 'attempt': 'current-independent-' + round_name + '-' + assignment['id'], 'records': records}
        encoded = (json.dumps(receipt, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
        # One byte per token is the supplied conservative output bound.
        assert len(encoded) <= assignment['budgets']['output_tokens'], (assignment['id'], len(encoded))
        folder = reader.BASE / round_name / 'audit-verify-receipts'
        folder.mkdir(exist_ok=True)
        destination = folder / (assignment['id'] + '.json')
        assert not destination.exists(), destination
        destination.write_bytes(encoded)
        assert json.loads(destination.read_bytes()) == receipt
        paths.append(str(destination))
        result.append({'assignment': assignment['id'], 'packet_bytes': Path(entry['packet']).stat().st_size, 'receipt_bytes': len(encoded), 'items': len(records), 'status': 'verified'})
    reader.emit('New current-source independent verification receipts; only explicit reviewed row judgments formatted', {'round': round_name, 'results': result, 'dispositions_verified': dict(disposition_counts), 'disputes': 0, 'packet_bytes': sum(v['packet_bytes'] for v in result), 'receipt_bytes': sum(v['receipt_bytes'] for v in result), 'elapsed_seconds_from_task_start': round((datetime.datetime.now(datetime.timezone.utc) - started).total_seconds(), 3), 'receipt_directory': str(reader.BASE / round_name / 'audit-verify-receipts'), 'start_timestamp': started.isoformat(), 'end_timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'criterion_counts': [[*key, value] for key, value in sorted(criterion_counts.items())], 'reading_notes': 'Every exact mapping, reason segment and evidence list was read. Full original source bytes reused only after current byte-hash agreement. Earlier fixture exposure acknowledged; no accepted receipt imported. Initial uncompressed metadata chunk was unnecessary repetition; compact projection supplied all metadata. No missing prerequisite or unresolved product decision.'})

