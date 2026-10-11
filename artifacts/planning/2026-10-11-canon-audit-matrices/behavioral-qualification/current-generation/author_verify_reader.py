import datetime
import hashlib
import json
import pathlib
import sys

BASE = pathlib.Path(__file__).resolve().parent
LOG = pathlib.Path('/tmp/qualify-current-author-verify-transcript.txt')
STATE = pathlib.Path('/tmp/qualify-current-author-verify-reads.json')
PROJECTION = pathlib.Path('/tmp/qualify-current-author-verify-projection.json')

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def digest(value):
    if not isinstance(value, bytes):
        value = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
    return hashlib.sha256(value).hexdigest()

def emit(value):
    output = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    assert len(output) <= 7900, ('bounded output exceeded', len(output))
    with LOG.open('a') as handle:
        handle.write('\n' + now() + '\n' + output + '\n')
    print(output)

def queue(round_number):
    path = BASE / ('round-' + str(round_number)) / 'author-verify-queue.json'
    data = path.read_bytes()
    return json.loads(data), len(data), digest(data)

def packet(round_number, index):
    entry = queue(round_number)[0][index]
    path = pathlib.Path(entry['packet'])
    assert path.is_relative_to(BASE)
    data = path.read_bytes()
    return entry, json.loads(data), len(data), digest(data)

def describe(value):
    if isinstance(value, dict):
        return {key: describe(item) for key, item in value.items()}
    if isinstance(value, list):
        return {'length': len(value), 'first': describe(value[0]) if value else None}
    if isinstance(value, str) and len(value) > 220:
        return {'type': 'str', 'characters': len(value), 'initial': value[:180]}
    return value

def prepare():
    events = []
    packets = [(number, index, *packet(number, index)) for number in (1, 2) for index in range(len(queue(number)[0]))]
    sources = sorted({row['source'] for _, _, _, data, _, _ in packets for row in data['rows'].values()} | {excerpt['source'] for _, _, _, data, _, _ in packets for excerpt in data['source_excerpts']})
    aliases = {name: 'S' + str(index + 1) for index, name in enumerate(sources)}
    events.append({'aliases': {short: name for name, short in aliases.items()}, 'notation': 'Every occurrence of a source key is replaced by its S-number in every displayed key and string; reverse this substitution to recover exact original fields. References are lossless shared current-packet fields, never old receipts.'})
    def short(value):
        if isinstance(value, str):
            for name, alias in aliases.items():
                value = value.replace(name, '<' + alias + '>')
            return value
        if isinstance(value, list):
            return [short(item) for item in value]
        if isinstance(value, dict):
            return {short(key): short(item) for key, item in value.items()}
        return value
    unique = {}
    def reference(kind, value):
        key = kind + ':' + digest(value)
        if key not in unique:
            name = kind + str(sum(old.startswith(kind + ':') for old in unique) + 1)
            unique[key] = name
            events.append({'define': name, 'sha256': digest(value), 'value': short(value)})
        return unique[key]
    captured_hashes = set()
    source_reads = []
    packet_reads = []
    for number, index, entry, data, size, hash_value in packets:
        events.append({'begin_packet': [number, index], 'assignment': entry['assignment'], 'run': entry['run'], 'packet_bytes': size, 'packet_sha256': hash_value})
        assert data['assignment']['actor'] == '/root/qualify_author_one'
        assert data['assignment']['id'] == entry['assignment']
        assert set(data['cells']) == set(data['assignment']['items']) == set(data['mappings'])
        assert data['assignment']['phase'] == 'verify'
        source_index = {}
        for excerpt in data['source_excerpts']:
            source = pathlib.Path(data['captured_sources']) / (excerpt['hash'] + '.txt')
            assert source.is_relative_to(BASE)
            blob = source.read_bytes()
            assert hashlib.sha256(blob).hexdigest() == excerpt['hash'], source
            lines = blob.decode().splitlines()
            assert '\n'.join(lines[excerpt['start']-1:excerpt['end']]) == excerpt['text']
            if excerpt['hash'] not in captured_hashes:
                events.append({'captured_original': aliases[excerpt['source']], 'sha256': excerpt['hash'], 'bytes': len(blob), 'line_count': len(lines), 'lines': list(enumerate(lines, 1))})
                captured_hashes.add(excerpt['hash'])
            source_index[excerpt['source']] = {'hash': excerpt['hash'], 'bytes': len(blob), 'line_count': len(lines)}
        source_reads.append({'round': number, 'packet_index': index, 'sources': source_index})
        events.append({'hash_checked_originals': short(source_index), 'source_excerpts': reference('X', [{key: value for key, value in item.items() if key != 'text'} for item in data['source_excerpts']]), 'text_verified_exact': True})
        metadata = {key: value for key, value in data.items() if key not in ('assignment', 'cells', 'criteria', 'mappings', 'rows', 'source_excerpts')}
        metadata['captured_sources'] = '{run}/sources'
        assignment = {key: value for key, value in data['assignment'].items() if key not in ('items', 'mappings', 'budgets', 'estimate')}
        events.append({'metadata': reference('P', metadata), 'assignment': assignment, 'budgets': reference('B', data['assignment']['budgets']), 'estimate': reference('E', data['assignment']['estimate'])})
        for criterion in data['criteria'].values():
            reference('C', criterion)
        row_refs = {key: reference('R', value) for key, value in data['rows'].items()}
        map_refs = {key: [reference('MA', {field: item for field, item in value.items() if field in ('actor', 'assignment', 'attempt')}), reference('MS', {field: item for field, item in value.items() if field not in ('actor', 'assignment', 'attempt', 'fingerprint')})] for key, value in data['mappings'].items()}
        cells = []
        for cell, (row, criterion) in data['cells'].items():
            assert data['mappings'][cell]['actor'] == '/root/qualify_audit_two'
            assert data['assignment']['mappings'][cell] == digest(data['mappings'][cell])
            assert data['mappings'][cell]['fingerprint'] == digest([data['rows'][row], data['criteria'][criterion], {source: source_index[source]['hash'] for source in data['rows'][row]['sources']}])
            cells.append([cell, row_refs[row], criterion, *map_refs[cell]])
        fingerprints = {cell: {'cell': data['mappings'][cell]['fingerprint'], 'mapping': data['assignment']['mappings'][cell]} for cell in data['cells']}
        with LOG.open('a') as handle:
            handle.write('\n' + now() + ' Exact current mapping fingerprints for ' + entry['assignment'] + '\n' + json.dumps(fingerprints, sort_keys=True) + '\n')
        events.append({'owned_cells': cells, 'columns': ['cell', 'row_reference', 'criterion', 'mapper_authority_reference', 'mapping_semantic_reference'], 'every_bound_fingerprint_matches_exact_current_mapping': True, 'fingerprint_dictionary_sha256': digest(fingerprints), 'fingerprint_literals_recorded_in_transcript': True})
        packet_reads.append({'round': number, 'index': index, 'assignment': entry['assignment'], 'bytes': size, 'sha256': hash_value, 'cells': len(cells)})
    chunks, chunk = [], []
    for event in events:
        candidate = chunk + [event]
        if len(json.dumps(candidate, ensure_ascii=False, separators=(',', ':'))) > 7600:
            assert chunk, len(json.dumps(event))
            chunks.append(chunk)
            chunk = [event]
        else:
            chunk = candidate
    if chunk:
        chunks.append(chunk)
    PROJECTION.write_text(json.dumps(chunks, ensure_ascii=False))
    state = json.loads(STATE.read_text())
    state.update({'packet_reads': packet_reads, 'source_reads': source_reads, 'projection_chunks': len(chunks), 'projection_read': [], 'aliases': aliases})
    STATE.write_text(json.dumps(state))
    emit({'prepared_chunks': len(chunks), 'packet_bytes': sum(item['bytes'] for item in packet_reads), 'cells': sum(item['cells'] for item in packet_reads), 'unique_original_hashes': len(captured_hashes), 'unique_object_count': len(unique), 'observations': ['A schema-summary output attempt exceeded the character precheck and returned no packet content. The lossless projection now chunks complete events below the bound.', 'Initial login shell emitted stream-fd diagnostics outside source output; subsequent calls use login false.']})

# These groups encode the verifier's judgments derived after reading the current
# original criteria, rows, relationships, mapping reasons and evidence.
# Every status is explicit; missing rows fail rather than receive a default.
DERIVED = {
    'ap:emission-without-validation': [
        ('A', [18, 19], 'The Protocol contains a concrete report-emission instruction. AP1 governs that instruction whether it requires or omits validation; the mapping correctly leaves conformance to evaluation.', [6]),
        ('A', [20, 21, 23], 'The Rules surface contains the second semicolon clause governing report emission. AP1 applies independently to that clause; the first retention clause does not settle its applicability.', [6]),
        ('A', [46], 'The complete leaf contains a Protocol emission instruction and a separate Rules emission clause. Both lie within AP1, including when their validation wording satisfies it.', [6]),
        ('N', [16, 17], 'Capability describes producing a report. AP1 explicitly excludes descriptive Capability text from imperative Protocol or Rules instructions.', [6]),
        ('N', [44, 45, 52], 'The Outputs heading declares an output name. AP1 explicitly excludes output declarations because they do not themselves direct emission.', [6]),
        ('N', [22], 'The first semicolon clause only requires retention of the report ID. AP1 excludes retention, and the separately inventoried second clause cannot transfer its emission responsibility to this clause.', [6]),
        ('N', [24], 'The leaf Destination declaration sets a destination and contains no emission instruction. AP1 explicitly excludes destination declarations.', [6]),
        ('N', [14, 15, 34, 36, 37], 'The complete ancestor contains a Capability description and an archive destination constraint. Neither directs artifact emission in a Protocol instruction or Rules clause.', [5]),
        ('N', [47], 'The leaf-to-ancestor relationship carries a destination contract, not an emission instruction. Reading both complete sources confirms that the relationship itself has no AP1 responsibility.', [5, 6]),
        ('N', [1, 2, 3, 4, 5, 6, 7, 38, 39, 40, 50], 'The activity owns identifiers and a deliver routine invocation with argument bindings. AP1 excludes routine calls and bindings; the call relationship does not itself direct technique emission.', [3]),
        ('N', [8, 9, 10, 11, 12, 13, 32, 33, 35, 41, 42, 43], 'The routine owns input declarations, an emit.report export and a produce call. These bindings and call/execution relationships are not Protocol or Rules emission instructions under AP1.', [4]),
        ('N', [25, 26, 27, 28, 29, 30, 31, 48, 49, 51], 'The workflow and its activity relationships specify graph selection and exit targets. AP1 excludes graph labels; they are not technique emission instructions.', [7]),
    ],
    'ap:broken-binding': [
        ('A', [1, 2, 4, 5, 6, 7, 39, 40, 50], 'The concrete delivery invocation names deliver and supplies its argument-key set. AP2 requires resolving that routine and comparing the actual keys with Inputs [envelope], including otherwise valid calls.', [3, 4]),
        ('A', [32, 33], 'Deliver declares required input envelope, which is the contract for the captured delivery invocation. AP2 requires the caller-key comparison at this input declaration.', [3, 4]),
        ('A', [8, 9], 'The routine exports report from emit.report. Resolving emit to produce and comparing report with the declared technique Outputs is exactly the second AP2 binding responsibility.', [4, 6]),
        ('A', [10, 11, 12, 13, 42], 'These routine step/call constructs resolve the emit component of emit.report to technique produce. AP2 explicitly requires that resolution before checking the referenced producer output.', [4, 6]),
        ('A', [35, 43], 'The whole routine or explicit executing-instance relationship carries the caller-to-Inputs comparison and emit.report producer resolution. Both concrete binding checks belong to AP2.', [3, 4, 6]),
        ('A', [44, 45, 46, 52], 'Produce declares the output-name set consumed by deliver through emit.report. AP2 compares the referenced report with this producer declaration; this is more than a prose artifact mention.', [4, 6]),
        ('N', [3, 38], 'The activity or delivery-step ID only names its owner. It neither supplies an argument key nor resolves the producer step of a routine output; the separately inventoried call and arguments carry AP2.', [3]),
        ('N', [41], 'The routine ID names deliver. AP2 checks its concrete invocation keys and emit.report producer binding, not the routine name as an independent binding contract.', [4]),
        ('N', [14, 15, 34, 36, 37], 'The complete ancestor declares Capability and an inherited destination constraint. It has no routine Inputs, invocation keys, output export, or producer Outputs declaration governed by AP2.', [5]),
        ('N', [16, 17, 18, 19, 20, 21, 22, 23, 24], 'This leaf prose describes production, validation/emission, retention or destination. It contains neither of AP2\'s binding forms; Markdown artifact mentions are explicitly excluded.', [6]),
        ('N', [47], 'The inherited-destination relationship has no caller-argument or routine-output binding responsibility. AP2 covers those separate concrete binding relationships, not this inheritance declaration.', [5, 6]),
        ('N', [25, 26, 27, 28, 29, 30, 31, 48, 49, 51], 'Workflow IDs, initial selection and graph exit relationships carry neither routine argument-key sets nor step-id.output-name exports. Both AP2 binding forms are absent from this owned surface.', [7]),
    ],
    'dp:1': [
        ('A', [20, 24, 46], 'This leaf surface contains its Destination declaration. The captured qualification/run/delivery/deliver/emit chain binds produce to the ancestor archive constraint, so DP1 requires comparing their declared destinations.', [3, 4, 5, 6, 7]),
        ('A', [29, 30, 31, 40, 42, 43, 51], 'This explicit workflow/activity/routine call or execution relationship carries qualification through run and deliver to produce. DP1 requires that chain to carry the ancestor destination constraint to the leaf, even though caller files have no leaf declaration.', [3, 4, 5, 6, 7]),
        ('A', [47], 'This leaf-to-ancestor relationship attaches the archive constraint to produce in the declared executing workflow. DP1 expressly includes inheritance relationships in the leaf destination comparison.', [3, 4, 5, 6, 7]),
        ('N', [1, 2, 3, 4, 5, 6, 7, 38, 39, 50], 'The complete activity has a deliver invocation and no leaf Destination declaration. DP1 excludes independent checks of such files; its separately inventoried call relationship carries the inherited rule.', [3]),
        ('N', [8, 9, 10, 11, 12, 13, 32, 33, 35, 41], 'The complete routine has Inputs, emit.report and a produce call, without a leaf Destination declaration. DP1 applies through the separate call/execution relationships rather than these native routine rows.', [4]),
        ('N', [25, 26, 27, 28, 48, 49], 'The complete workflow specifies its ID, initialActivity and graph, without a leaf Destination declaration. DP1 assigns propagation to its explicit call relationships; this native row has no independent leaf comparison.', [7]),
        ('N', [14, 15, 34, 36, 37], 'The ancestor states the inherited archive requirement. DP1 explicitly distinguishes that declaration from a conflicting leaf destination, so the ancestor is not independently judged as the leaf instance.', [5]),
        ('N', [16, 17, 18, 19, 21, 22, 23, 44, 45, 52], 'This leaf row owns Capability, Outputs, Protocol, retention or emission wording without a Destination declaration. DP1 applies to the separate destination-containing rows and inheritance relationships.', [6]),
    ],
    'dp:2': [
        ('A', [25, 26, 27, 28, 49], 'This workflow surface owns the start or graph, or contains the whole workflow. DP2 requires a finite path from run to null using all exit targets; applicability is independent of whether the captured graph terminates.', [7]),
        ('A', [29, 30, 31, 51], 'This workflow-to-run relationship is part of start/graph reachability. DP2 applies to its role within the complete workflow graph; a resolved activity ID cannot establish a terminating path by itself.', [3, 7]),
        ('N', [48], 'The workflow ID only names qualification. It adds no start selection or graph exit, so the separately inventoried graph/start and whole-workflow rows own DP2.', [7]),
        ('N', [1, 2, 3, 4, 5, 6, 7, 38, 39, 40, 50], 'The activity contains a local routine invocation. DP2 explicitly says activity and routine steps add no workflow graph exits; neither this native surface nor its routine-call relationship owns termination.', [3]),
        ('N', [8, 9, 10, 11, 12, 13, 32, 33, 35, 41, 42, 43], 'The routine contains Inputs, an export and a technique call. These local steps and execution relationships add no workflow graph exits under DP2, even when workflow context is supplied for other criteria.', [4]),
        ('N', [14, 15, 34, 36, 37], 'The ancestor contains descriptive Capability and an archive Rule. It defines neither initialActivity nor a workflow graph exit and has no DP2 finite-path responsibility.', [5]),
        ('N', [16, 17, 18, 19, 20, 21, 22, 23, 24, 44, 45, 46, 47, 52], 'The leaf and its inheritance relationship own technique declarations and instructions, not initialActivity or graph exit targets. They have no DP2 workflow termination responsibility.', [6]),
    ],
}

def write_receipts(number):
    state = json.loads(STATE.read_text())
    chunks = json.loads(PROJECTION.read_text())
    assert set(range(27 if number == 1 else len(chunks))) <= set(state['projection_read'])
    definitions = {event['define']: event['value'] for chunk in chunks for event in chunk if 'define' in event}
    aliases = {short: source for source, short in state['aliases'].items()}
    def expand(value):
        for alias, source in aliases.items():
            value = value.replace('<' + alias + '>', source)
        return value
    proof = {}
    for criterion, groups in DERIVED.items():
        for group_index, (status, refs, reason, context) in enumerate(groups):
            for ref in refs:
                row = expand(definitions['R' + str(ref)]['id'])
                assert (criterion, row) not in proof
                proof[(criterion, row)] = (group_index, status, reason, context)
    outdir = BASE / ('round-' + str(number)) / 'author-verify-receipts'
    outdir.mkdir(exist_ok=True)
    metrics = []
    for index, entry in enumerate(queue(number)[0]):
        _, data, packet_bytes, packet_hash = packet(number, index)
        original_read = next(item for item in state['packet_reads'] if item['round'] == number and item['index'] == index)
        assert original_read['sha256'] == packet_hash
        source_index = next(item['sources'] for item in state['source_reads'] if item['round'] == number and item['packet_index'] == index)
        records = {}
        for cell, (row_id, criterion_id) in data['cells'].items():
            group_index, disposition, reason, context = proof[(criterion_id, row_id)]
            mapping = data['mappings'][cell]
            assert mapping['status'] == disposition, (cell, mapping['status'], disposition)
            row = data['rows'][row_id]
            criterion = data['criteria'][criterion_id]
            required = set(row['sources']) | {criterion['source']}
            mapped_sources = {span['source'] for span in mapping['evidence']}
            assert required <= mapped_sources, (cell, required - mapped_sources)
            for span in mapping['evidence']:
                assert 1 <= span['start'] <= span['end'] <= source_index[span['source']]['line_count']
                excerpt_ranges = [(item['start'], item['end']) for item in data['source_excerpts'] if item['source'] == span['source']]
                assert all(any(start <= line <= end for start, end in excerpt_ranges) for line in range(span['start'], span['end'] + 1))
            for item in (row, criterion):
                assert any(span['source'] == item['source'] and span['start'] <= item['end'] and span['end'] >= item['start'] for span in mapping['evidence'])
            key = (criterion_id, group_index)
            if key not in records:
                records[key] = {'items': [], 'status': 'verified', 'reason': 'Independently verified ' + disposition + '. ' + reason, 'evidence_sources': set()}
            record = records[key]
            record['items'].append(cell)
            record['evidence_sources'].update(required | {aliases['S' + str(item)] for item in context})
        for record in records.values():
            record['evidence'] = [{'source': source, 'start': 1, 'end': source_index[source]['line_count']} for source in sorted(record.pop('evidence_sources'))]
        wrapper = {'run': entry['run'], 'assignment': entry['assignment'], 'snapshot': data['assignment']['snapshot'], 'actor': '/root/qualify_author_one', 'attempt': 'current-author-verify-round-' + str(number) + '-1', 'records': list(records.values())}
        blob = (json.dumps(wrapper, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()
        assert len(blob) <= data['assignment']['estimate']['output_tokens_estimate'] <= 16000, (entry['assignment'], len(blob))
        filename = entry['assignment'] + '-current-author-verify-1.json'
        path = outdir / filename
        assert not path.exists(), path
        path.write_bytes(blob)
        with LOG.open('a') as handle:
            handle.write('\n' + now() + ' Fresh receipt ' + str(path) + '\n' + blob.decode())
        metrics.append({'file': filename, 'packet_bytes': packet_bytes, 'receipt_bytes': len(blob), 'items': len(data['cells']), 'records': len(records), 'disputes': 0})
    state['round_' + str(number) + '_completed'] = now()
    state['round_' + str(number) + '_metrics'] = metrics
    STATE.write_text(json.dumps(state))
    emit({'round': number, 'directory': str(outdir), 'receipts': metrics, 'items': sum(item['items'] for item in metrics), 'packet_bytes': sum(item['packet_bytes'] for item in metrics), 'receipt_bytes': sum(item['receipt_bytes'] for item in metrics), 'complete_at': state['round_' + str(number) + '_completed']})

def finish():
    state = json.loads(STATE.read_text())
    assert state['projection_read'] == list(range(state['projection_chunks']))
    counts = {}
    for number in (1, 2):
        seen = set()
        for index, entry in enumerate(queue(number)[0]):
            _, data, _, _ = packet(number, index)
            receipt = json.loads((BASE / ('round-' + str(number)) / 'author-verify-receipts' / (entry['assignment'] + '-current-author-verify-1.json')).read_text())
            assert receipt['assignment'] == entry['assignment'] and receipt['run'] == entry['run']
            assert receipt['actor'] == data['assignment']['actor'] == '/root/qualify_author_one'
            assert receipt['snapshot'] == data['assignment']['snapshot']
            owned = [item for record in receipt['records'] for item in record['items']]
            assert len(owned) == len(set(owned)) and set(owned) == set(data['cells'])
            for record in receipt['records']:
                evidence = {span['source']: span for span in record['evidence']}
                for cell in record['items']:
                    assert (entry['run'], cell) not in seen
                    seen.add((entry['run'], cell))
                    row_id, criterion_id = data['cells'][cell]
                    row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
                    assert set(row['sources']) | {criterion['source']} <= set(evidence)
                    for item in (row, criterion):
                        assert evidence[item['source']]['start'] <= item['end'] and evidence[item['source']]['end'] >= item['start']
                    key = 'round-' + str(number) + ':' + data['mappings'][cell]['status']
                    counts[key] = counts.get(key, 0) + 1
    end = now()
    elapsed = (datetime.datetime.fromisoformat(end) - datetime.datetime.fromisoformat(state['start'])).total_seconds()
    sources = {value['hash']: value['bytes'] for read in state['source_reads'] for value in read['sources'].values()}
    result = {'started_logger_at': state['start'], 'finished_at': end, 'tracked_elapsed_seconds': elapsed, 'counts': counts, 'receipts': 32, 'disputes': 0, 'assigned_packet_bytes': sum(item['bytes'] for item in state['packet_reads']), 'receipt_bytes': sum(item['receipt_bytes'] for number in (1, 2) for item in state['round_' + str(number) + '_metrics']), 'unique_captured_hashes': len(sources), 'unique_original_source_bytes': sum(sources.values()), 'bounded_projection_chunks_read': len(state['projection_read']), 'limitations': ['Prior fixture exposure explicitly disclosed; verifier is independent of the current mapper, not fixture-naive.', 'Initial guide and queue reads preceded the logger start; elapsed metric covers subsequent tracked work, including helper setup and receipt formatting. No permission pause occurred.', 'Current round-2 sources, row objects and semantic reason/evidence values hash-match their current round-1 counterparts; all new actor/assignment/attempt bindings, cells and fingerprints were still checked.', 'An overlarge schema-summary precheck stopped before content output; no source/tool output was truncated.', 'A helper initially compared the source-cell fingerprint with the complete mapping digest. Reading audit_common.py established the two distinct identities; both were recomputed and matched for every current cell. This was a helper assumption, not a packet defect.', 'Tool-name discovery and the broader audit_common.py prefix were unnecessary overhead. No expected outcomes, baselines, old receipts, other findings, ledger mutations or evaluation occurred in this verification task.']}
    state['verification_finished'] = result
    STATE.write_text(json.dumps(state))
    emit(result)

def main():
    action = sys.argv[1]
    if action == 'begin':
        if not STATE.exists():
            STATE.write_text(json.dumps({'start': now(), 'prior_exposure': True, 'sources': {}, 'packets': {}}))
        emit({'task': 'Independent current Author map verification', 'identity': '/root/qualify_author_one', 'mapper': '/root/qualify_audit_two', 'prior_fixture_exposure': True, 'basis': 'Current assigned packets; original captured bytes reused only after hash agreement; no old receipts imported', 'limits': 'Every tool output <=7900 characters; original full source/context required', 'scope': 'Verification only; no audit state/source edits or evaluation'})
    elif action == 'queue':
        number = int(sys.argv[2])
        entries, size, hash_value = queue(number)
        emit({'round': number, 'queue_bytes': size, 'queue_sha256': hash_value, 'entries': [{key: value if key != 'packet' else pathlib.Path(value).name for key, value in row.items()} for row in entries]})
    elif action == 'schema':
        entry, data, size, hash_value = packet(int(sys.argv[2]), int(sys.argv[3]))
        emit({'entry': entry, 'bytes': size, 'sha256': hash_value, 'fields': {key: {'type': type(value).__name__, 'length': len(value) if hasattr(value, '__len__') else None, 'keys': list(value)[:12] if isinstance(value, dict) else None} for key, value in data.items()}})
    elif action == 'field':
        entry, data, size, hash_value = packet(int(sys.argv[2]), int(sys.argv[3]))
        value = data[sys.argv[4]]
        if len(sys.argv) > 5:
            value = value[int(sys.argv[5])] if isinstance(value, list) else value[sys.argv[5]]
        emit({'assignment': entry['assignment'], 'field': sys.argv[4:], 'value': value})
    elif action == 'note':
        emit({'note': sys.argv[2]})
    elif action == 'prepare':
        prepare()
    elif action == 'chunk':
        index = int(sys.argv[2])
        chunks = json.loads(PROJECTION.read_text())
        emit({'chunk': index, 'count': len(chunks), 'events': chunks[index]})
        state = json.loads(STATE.read_text())
        state['projection_read'] = sorted(set(state['projection_read'] + [index]))
        STATE.write_text(json.dumps(state))
    elif action == 'write':
        write_receipts(int(sys.argv[2]))
    elif action == 'finish':
        finish()

if __name__ == '__main__':
    main()
