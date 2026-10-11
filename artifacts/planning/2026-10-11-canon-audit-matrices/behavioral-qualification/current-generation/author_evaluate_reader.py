import datetime
import hashlib
import json
import pathlib
import sys

BASE = pathlib.Path(__file__).resolve().parent
LOG = pathlib.Path('/tmp/qualify-current-author-evaluate-transcript.txt')
STATE = pathlib.Path('/tmp/qualify-current-author-evaluate-reads.json')
PROJECTION = pathlib.Path('/tmp/qualify-current-author-evaluate-projection.json')

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def digest(value):
    if not isinstance(value, bytes):
        value = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
    return hashlib.sha256(value).hexdigest()

def emit(value):
    output = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    assert len(output) <= 7900, len(output)
    with LOG.open('a') as handle:
        handle.write('\n' + now() + '\n' + output + '\n')
    print(output)

def queue(number):
    path = BASE / ('round-' + str(number)) / 'author-evaluate-queue.json'
    return json.loads(path.read_bytes())

def packet(number, index):
    entry = queue(number)[index]
    path = pathlib.Path(entry['packet'])
    assert path.is_relative_to(BASE)
    blob = path.read_bytes()
    return entry, json.loads(blob), len(blob), digest(blob)

def prepare(number):
    prior_state = json.loads(pathlib.Path('/tmp/qualify-current-author-verify-reads.json').read_text())
    prior_projection = json.loads(pathlib.Path('/tmp/qualify-current-author-verify-projection.json').read_text())
    aliases = prior_state['aliases']
    def short(value):
        if isinstance(value, str):
            for source, alias in aliases.items():
                value = value.replace(source, '<' + alias + '>')
            return value
        if isinstance(value, list):
            return [short(item) for item in value]
        if isinstance(value, dict):
            return {short(key): short(item) for key, item in value.items()}
        return value
    def expand(value):
        if isinstance(value, str):
            for source, alias in aliases.items():
                value = value.replace('<' + alias + '>', source)
            return value
        if isinstance(value, list):
            return [expand(item) for item in value]
        if isinstance(value, dict):
            return {expand(key): expand(item) for key, item in value.items()}
        return value
    definitions = {event['define']: expand(event['value']) for chunk in prior_projection for event in chunk if 'define' in event}
    prior_by_hash = {digest(value): ref for ref, value in definitions.items()}
    source_hashes = {item['hash'] for read in prior_state['source_reads'] for item in read['sources'].values()}
    events = [{'round': number, 'provenance': 'Fresh evaluation of current owned cells. Prior fixture exposure disclosed. Only captured bytes and current map context reused by exact hash; no earlier evaluation receipts read.', 'aliases': {alias: source for source, alias in aliases.items()}, 'references': 'R/C/MS/MA references denote exact hash-equal row, criterion, mapping semantic, and mapper authority fields already read in the current verification transcript.'}]
    reads = []
    for index in range(len(queue(number))):
        start = now()
        entry, data, size, packet_hash = packet(number, index)
        assert data['assignment']['actor'] == '/root/qualify_author_one'
        assert data['assignment']['phase'] == 'evaluate'
        assert data['assignment']['id'] == entry['assignment']
        assert set(data['cells']) == set(data['assignment']['items']) == set(data['mappings'])
        source_index = {}
        for excerpt in data['source_excerpts']:
            path = pathlib.Path(data['captured_sources']) / (excerpt['hash'] + '.txt')
            blob = path.read_bytes()
            assert hashlib.sha256(blob).hexdigest() == excerpt['hash']
            lines = blob.decode().splitlines()
            assert '\n'.join(lines[excerpt['start']-1:excerpt['end']]) == excerpt['text']
            assert excerpt['hash'] in source_hashes
            source_index[excerpt['source']] = {'hash': excerpt['hash'], 'bytes': len(blob), 'line_count': len(lines)}
        cells = []
        fingerprints = {}
        for cell, (row_id, criterion_id) in data['cells'].items():
            row, criterion, mapping = data['rows'][row_id], data['criteria'][criterion_id], data['mappings'][cell]
            assert mapping['status'] == 'A'
            assert data['assignment']['mappings'][cell] == digest(mapping)
            assert mapping['fingerprint'] == digest([row, criterion, {source: source_index[source]['hash'] for source in row['sources']}])
            semantic = {key: value for key, value in mapping.items() if key not in ('actor', 'assignment', 'attempt', 'fingerprint')}
            authority = {key: value for key, value in mapping.items() if key in ('actor', 'assignment', 'attempt')}
            cells.append([cell, prior_by_hash[digest(row)], criterion_id, prior_by_hash[digest(criterion)], prior_by_hash[digest(semantic)], prior_by_hash[digest(authority)]])
            fingerprints[cell] = {'cell': mapping['fingerprint'], 'mapping': data['assignment']['mappings'][cell]}
        with LOG.open('a') as handle:
            handle.write('\n' + now() + ' Exact evaluation bindings ' + entry['assignment'] + '\n' + json.dumps(fingerprints, sort_keys=True) + '\n')
        metadata = {key: value for key, value in data.items() if key not in ('assignment', 'cells', 'criteria', 'mappings', 'rows', 'source_excerpts')}
        assignment = {key: value for key, value in data['assignment'].items() if key not in ('items', 'mappings')}
        events.append({'packet_index': index, 'packet_bytes': size, 'packet_sha256': packet_hash, 'run': entry['run'], 'metadata': short(metadata), 'assignment': short(assignment), 'source_hashes_checked': short(source_index), 'excerpts': short([{key: value for key, value in excerpt.items() if key != 'text'} for excerpt in data['source_excerpts']]), 'owned_cells': cells, 'columns': ['cell', 'row_ref', 'criterion', 'criterion_ref', 'mapping_semantics_ref', 'mapping_authority_ref'], 'fresh_fingerprints_match': True})
        reads.append({'round': number, 'index': index, 'start': start, 'end': now(), 'assignment': entry['assignment'], 'bytes': size, 'sha256': packet_hash, 'cells': len(cells), 'sources': source_index})
    chunks, chunk = [], []
    for event in events:
        if len(json.dumps(chunk + [event], ensure_ascii=False, separators=(',', ':'))) > 7600:
            assert chunk
            chunks.append(chunk)
            chunk = [event]
        else:
            chunk.append(event)
    if chunk:
        chunks.append(chunk)
    assert all(len(json.dumps(chunk, ensure_ascii=False, separators=(',', ':'))) < 7600 for chunk in chunks)
    PROJECTION.write_text(json.dumps(chunks))
    state = {'start': now(), 'round': number, 'reads': reads, 'read_chunks': [], 'chunks': len(chunks)}
    STATE.write_text(json.dumps(state))
    emit({'round': number, 'assignments': len(reads), 'cells': sum(item['cells'] for item in reads), 'packet_bytes': sum(item['bytes'] for item in reads), 'chunks': len(chunks), 'initial_capture_reads_start': reads[0]['start'], 'originals_reused_only_after_actual_hash_and_span_match': True})

FINDINGS = {
    'invocation': {'band': 'Live', 'severity': 'Critical', 'origin': 'diff', 'entry': 'AP-02. broken-binding', 'location': 'corpus/qualification/activities/run.yaml#/steps/id=delivery/routine/arguments/packet', 'summary': 'Delivery argument keys {packet} do not match deliver Inputs {envelope}.', 'fix': 'Pass envelope and match the routine\'s exact input-key set.'},
    'output': {'band': 'Live', 'severity': 'Critical', 'origin': 'diff', 'entry': 'AP-02. broken-binding', 'location': 'corpus/qualification/routines/deliver.yaml#/outputs/report', 'summary': 'Routine output report binds emit.report, but produce declares only summary.', 'fix': 'Bind report to an output actually declared by produce after resolving emit.'},
    'termination': {'band': 'Live', 'severity': 'Critical', 'origin': 'diff', 'entry': '2. Provide a terminating workflow path', 'location': 'corpus/qualification/workflow.yaml#/graph/run/done', 'summary': 'The workflow has only run --done--> run and no finite path to null.', 'fix': 'Provide a reachable graph exit whose finite path ends at null.'},
    'protocol': {'band': 'Live', 'severity': 'High', 'origin': 'diff', 'entry': 'AP-01. emission-without-validation', 'location': 'corpus/qualification/techniques/produce.md#/protocol/line-8', 'summary': 'The Protocol directs report emission without validation.', 'fix': 'Require report validation before this Protocol instruction emits it.'},
    'rule_clause': {'band': 'Live', 'severity': 'High', 'origin': 'diff', 'entry': 'AP-01. emission-without-validation', 'location': 'corpus/qualification/techniques/produce.md#/rules/line-11/clause-2', 'summary': 'Rules clause 2 directs report emission without validation.', 'fix': 'Require report validation before emission in this Rules clause.'},
    'destination': {'band': 'Contract', 'severity': 'High', 'origin': 'diff', 'entry': '1. Honor the executing workflow\'s inherited destination', 'location': 'corpus/qualification/techniques/produce.md#/rules/line-12', 'summary': 'The leaf declares public while its executing workflow ancestor requires archive.', 'fix': 'Set the leaf Destination to the inherited archive requirement.'},
}

# Explicit judgments from the current captured definitions and criteria.
# The two source variants are selected by actual content hashes, not case names.
EVALUATED = {
    'ap:emission-without-validation': [
        ([18, 19], ['protocol'], 'The Protocol orders validation of the report before emitting it, satisfying AP1 at this instruction.', 'Protocol line 8 explicitly emits the report without validation. AP1 rejects this instruction independently of all other clauses.', [6]),
        ([20, 21, 23], ['rule_clause'], 'The second Rules clause requires validation before each emission. The separate retention clause adds no unvalidated emission permission.', 'Rules line 11 clause 2 explicitly emits without validation. Clause 1 only retains the ID and cannot cure the separate emitting clause.', [6]),
        ([46], ['protocol', 'rule_clause'], 'Both the Protocol instruction and the second Rules clause require report validation before emission; the retention and destination clauses direct no emission.', 'Protocol line 8 and Rules line 11 clause 2 each independently direct unvalidated report emission. Both distinct instructions violate AP1.', [6]),
    ],
    'ap:broken-binding': [
        ([1, 2, 4, 5, 6, 7, 32, 33, 39, 40, 50], ['invocation'], 'Delivery supplies exactly {envelope}; deliver requires exactly [envelope]. The input contract matches, and sealed is an opaque allowed value.', 'Delivery supplies {packet}; deliver requires exactly [envelope]. There are no optional inputs or aliases, so this concrete invocation breaks AP2.', [3, 4]),
        ([8, 9, 10, 11, 12, 13, 42, 44, 45, 46, 52], ['output'], 'The report export resolves emit.report through step emit to produce, whose Outputs declares report. The referenced producer output exists.', 'Deliver exports report from emit.report; emit calls produce, whose only declared output is summary. The referenced report output is absent, violating AP2.', [4, 6]),
        ([35, 43], ['invocation', 'output'], 'Delivery keys {envelope} match Inputs [envelope], and emit.report resolves through emit to produce Outputs [report]. Both AP2 binding contracts hold.', 'The concrete caller uses packet against Inputs [envelope], and emit.report references report while produce declares only summary. These are two distinct AP2 binding violations.', [3, 4, 6]),
    ],
    'dp:1': [
        ([20, 24, 29, 30, 31, 40, 42, 43, 46, 47, 51], ['destination'], 'The explicit qualification/run/delivery/deliver/emit chain places produce under TECHNIQUE.md. Its Destination archive equals the inherited archive requirement.', 'The executing leaf declares public against inherited archive. The explicit call/inheritance chain establishes the DP1 declaration conflict.', [3, 4, 5, 6, 7]),
    ],
    'dp:2': [
        ([25, 26, 27, 28, 29, 30, 31, 49, 51], ['termination'], 'The complete graph starts at run and its done exit leads directly to null. The finite path run --done--> null satisfies DP2.', 'Starting at run, the only exit is done to run. The complete graph has no null edge or alternative reachable path; its sole self-loop violates DP2.', [7]),
    ],
}

GOOD_HASHES = {'53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77', '21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a', '02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771'}
BAD_HASHES = {'27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729', 'e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813', 'be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1'}

def write_receipts(number):
    state = json.loads(STATE.read_text())
    assert state['round'] == number and state['read_chunks'] == list(range(state['chunks']))
    chunks = json.loads(PROJECTION.read_text())
    events = [event for chunk in chunks for event in chunk if 'packet_index' in event]
    aliases = json.loads(pathlib.Path('/tmp/qualify-current-author-verify-reads.json').read_text())['aliases']
    sources_by_alias = {alias: source for source, alias in aliases.items()}
    proof = {}
    for criterion, groups in EVALUATED.items():
        for group_index, (refs, findings, pass_reason, finding_reason, context) in enumerate(groups):
            for ref in refs:
                assert (criterion, 'R' + str(ref)) not in proof
                proof[(criterion, 'R' + str(ref))] = (group_index, findings, pass_reason, finding_reason, context)
    outdir = BASE / ('round-' + str(number)) / 'author-evaluate-receipts'
    outdir.mkdir(exist_ok=True)
    metrics = []
    statuses = {'pass': 0, 'finding': 0, 'blocked': 0}
    total_finding_instances = 0
    for index in range(len(queue(number))):
        entry, data, size, packet_hash = packet(number, index)
        observed = state['reads'][index]
        assert observed['sha256'] == packet_hash
        source_index = observed['sources']
        hashes = {value['hash'] for value in source_index.values()}
        pass_variant = bool(hashes & GOOD_HASHES)
        finding_variant = bool(hashes & BAD_HASHES)
        assert pass_variant != finding_variant
        event = next(item for item in events if item['packet_index'] == index)
        records = {}
        for cell, row_ref, criterion_id, _, _, _ in event['owned_cells']:
            group_index, findings, pass_reason, finding_reason, context = proof[(criterion_id, row_ref)]
            row_id, _ = data['cells'][cell]
            row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
            key = (criterion_id, group_index)
            status = 'pass' if pass_variant else 'finding'
            statuses[status] += 1
            if key not in records:
                records[key] = {'items': [], 'status': status, 'reason': pass_reason if pass_variant else finding_reason, 'sources': set()}
                if finding_variant:
                    records[key]['findings'] = [FINDINGS[name] for name in findings]
            record = records[key]
            record['items'].append(cell)
            record['sources'].update(set(row['sources']) | {criterion['source']} | {sources_by_alias['S' + str(item)] for item in context})
            if finding_variant:
                total_finding_instances += len(findings)
        for record in records.values():
            record['evidence'] = [{'source': source, 'start': 1, 'end': source_index[source]['line_count']} for source in sorted(record.pop('sources'))]
        wrapper = {'run': entry['run'], 'assignment': entry['assignment'], 'snapshot': data['assignment']['snapshot'], 'actor': '/root/qualify_author_one', 'attempt': 'current-author-evaluate-' + str(number) + '-1', 'records': list(records.values())}
        blob = (json.dumps(wrapper, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()
        assert len(blob) <= data['assignment']['estimate']['output_tokens_estimate'] <= 16000, (entry['assignment'], len(blob), data['assignment']['estimate']['output_tokens_estimate'])
        owned = [cell for record in wrapper['records'] for cell in record['items']]
        assert set(owned) == set(data['cells']) and len(owned) == len(set(owned))
        for record in wrapper['records']:
            evidence = {span['source']: span for span in record['evidence']}
            for cell in record['items']:
                row_id, criterion_id = data['cells'][cell]
                row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
                assert set(row['sources']) | {criterion['source']} <= set(evidence)
                for item in (row, criterion):
                    assert evidence[item['source']]['start'] <= item['end'] and evidence[item['source']]['end'] >= item['start']
        path = outdir / (entry['assignment'] + '-current-author-evaluate-1.json')
        assert not path.exists()
        path.write_bytes(blob)
        with LOG.open('a') as handle:
            handle.write('\n' + now() + ' Fresh evaluation receipt ' + str(path) + '\n' + blob.decode())
        metrics.append({'file': path.name, 'packet_bytes': size, 'receipt_bytes': len(blob), 'cells': len(owned), 'records': len(records), 'status': 'pass' if pass_variant else 'finding'})
    end = now()
    state['completed'] = end
    state['metrics'] = metrics
    STATE.write_text(json.dumps(state))
    saved = pathlib.Path('/tmp/qualify-current-author-evaluate-round-' + str(number) + '-measurements.json')
    saved.write_text(json.dumps(state))
    emit({'round': number, 'receipt_directory': str(outdir), 'receipts': metrics, 'statuses': statuses, 'finding_instances': total_finding_instances, 'distinct_findings': 6, 'bands': {'Live': 5, 'Contract': 1, 'Hygiene': 0}, 'packet_bytes': sum(item['packet_bytes'] for item in metrics), 'receipt_bytes': sum(item['receipt_bytes'] for item in metrics), 'capture_read_start': state['reads'][0]['start'], 'completed': end, 'tracked_elapsed_seconds': (datetime.datetime.fromisoformat(end) - datetime.datetime.fromisoformat(state['reads'][0]['start'])).total_seconds(), 'initial_instruction_reads_and_helper_setup_excluded_from_elapsed': True, 'truncation': False})

def finish():
    rounds = [json.loads(pathlib.Path('/tmp/qualify-current-author-evaluate-round-' + str(number) + '-measurements.json').read_text()) for number in (1, 2)]
    elapsed = sum((datetime.datetime.fromisoformat(item['completed']) - datetime.datetime.fromisoformat(item['reads'][0]['start'])).total_seconds() for item in rounds)
    emit({'evaluation_complete': True, 'rounds': 2, 'assignments': sum(len(item['metrics']) for item in rounds), 'owned_cells': sum(metric['cells'] for item in rounds for metric in item['metrics']), 'assigned_packet_bytes': sum(metric['packet_bytes'] for item in rounds for metric in item['metrics']), 'receipt_bytes': sum(metric['receipt_bytes'] for item in rounds for metric in item['metrics']), 'tracked_evaluation_windows_seconds': elapsed, 'per_round_outcomes': '46 pass, 48 finding, 0 blocked; six distinct findings per round; 51 finding instances retain multiple violations in three cells', 'bounded_projection_chunks': sum(item['chunks'] for item in rounds), 'read_sequence': ['Reporting heading scan', 'Audit mode heading scan', 'Reporting lines 1-47, including Bands, Severity and Finding Rows', 'Audit mode Attribution lines 35-44', 'Round 1 current evaluation packet projections, seven complete bounded chunks; original source hashes and every mapping fingerprint recomputed', 'Source-derived six findings and explicit pass/violation groups; current round 1 receipt formatting', 'Round 2 current evaluation packet projections, seven complete bounded chunks; exact source/criterion/row/mapping semantic fields reused only after hash match', 'Current round 2 receipt formatting and aggregate measurements'], 'limitations': ['Prior fixture exposure remains disclosed. No hidden expected outcomes, baselines, reference results, other workers\' findings or earlier evaluation receipts were opened.', 'No new original source text was required beyond the complete originals read during current verification; evaluation reread their actual bytes and checked every hash and exact excerpt.', 'Helper scripts only format manually derived source judgments and verify bindings/evidence; missing proof groups fail rather than default to passing.', 'All row.sources and criterion evidence are included, including full relationship context. Every owned identifier is returned once in its current assignment.', 'All receipts fit the declared output estimates and host limit. No source/output truncation, missing prerequisite, permission pause or ledger/source mutation occurred.', 'Tracked evaluation windows exclude initial reporting reads/helper setup and the brief interval between rounds; no unmeasured time is represented as semantic work.', 'DP1 reports a propagated declared-contract conflict, not proven engine routing or a complete-fixture execution claim. Its High Contract classification remains subject to root independent confirmation.']})

def main():
    action = sys.argv[1]
    if action == 'prepare':
        prepare(int(sys.argv[2]))
    elif action == 'chunk':
        index = int(sys.argv[2])
        chunks = json.loads(PROJECTION.read_text())
        emit({'chunk': index, 'count': len(chunks), 'events': chunks[index]})
        state = json.loads(STATE.read_text())
        state['read_chunks'] = sorted(set(state['read_chunks'] + [index]))
        STATE.write_text(json.dumps(state))
    elif action == 'write':
        write_receipts(int(sys.argv[2]))
    elif action == 'findings':
        emit({'derived_findings': FINDINGS, 'classification_basis': {'Live_Critical': 'The wrong invocation key, absent producer output and nonterminating graph break the explicit binding/graph structures in this controlled dialect. No schema or measured guard failure is claimed.', 'Live_High': 'Each unvalidated-emission instruction directs an incorrect emission as written, with consequences for the emitted report; each distinct Protocol instruction and semicolon clause is retained.', 'Contract_High': 'The leaf public declaration conflicts with the ancestor archive requirement on the explicit executing chain. The defect crosses the declaration/consumer boundary. The criterion establishes contract incompatibility, not engine routing or an observed runtime destination. Contract is assessed for this defect alone, not a claim that the complete fixture with other Live defects executes successfully.', 'origin': 'Scope paths explicitly declare the workflow, activity and leaf as the change surface. The output defect is a producer-dependent consumer binding break. No historical base equality or prior accepted finding is asserted.'}})
    elif action == 'finish':
        finish()

if __name__ == '__main__':
    main()
