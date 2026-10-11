import datetime
import hashlib
import json
import pathlib
import sys

BASE = pathlib.Path(__file__).resolve().parent
WORKTREE = pathlib.Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices')
LOG = pathlib.Path('/tmp/qualify-current-audit-band-verify-transcript.txt')
STATE = pathlib.Path('/tmp/qualify-current-audit-band-verify-state.json')
PROJECTION = pathlib.Path('/tmp/qualify-current-audit-band-verify-projection.json')
ACTOR = '/root/qualify_author_one'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else encoded(value).encode()).hexdigest()


def log(value):
    with LOG.open('a') as handle:
        handle.write(now() + '\n' + (value if isinstance(value, str) else encoded(value)) + '\n')


def emit(value):
    output = encoded(value)
    assert len(output) < 7900, len(output)
    log(output)
    print(output)


def packet(number):
    queue_path = BASE / ('round-' + str(number)) / 'audit-verify-queue.json'
    queue_bytes = queue_path.read_bytes()
    entries = json.loads(queue_bytes)
    assert len(entries) == 1
    entry = entries[0]
    assert entry['actor'] == ACTOR and entry['phase'] == 'verify'
    packet_path = pathlib.Path(entry['packet'])
    assert packet_path.is_relative_to(BASE)
    blob = packet_path.read_bytes()
    return entry, json.loads(blob), blob, queue_bytes


def prepare():
    assert not STATE.exists()
    started = now()
    log({'scope': 'Independent verification of 22 reopened Audit DP1 cells only', 'actor': ACTOR, 'prior_fixture_exposure': True, 'fresh_context_detection_claim': False, 'mapper': '/root/qualify_audit_two', 'limitations': ['Initial instruction, queue and helper reads preceded this measured start.', 'One inspection of the older local helper was truncated by the tool output token limit. No packet or criterion was in that output. Its receipt/evidence implementation was retrieved in a later bounded read; no old decisions or receipts are used here.', 'The memory registry keyword search returned an unrelated integration-review reference; no memory-derived claim is used.', 'No ledger, Git, fixture, expected outcome, baseline or other findings access.']})
    prior_reads = [('skills/workflow-canon/SKILL.md', 1, 78), ('skills/workflow-canon/references/audit-mode.md', 1, 52), ('skills/workflow-canon/references/planning.md', 1, 19), ('skills/workflow-canon/references/audit-dispatch.md', 1, 48), ('skills/workflow-canon/references/canon-context.md', 1, 28), ('skills/workflow-canon/references/change-surface.md', 1, 40), ('skills/workflow-canon/templates/audit-receipt.json', 1, 14)]
    for name, start, end in prior_reads:
        blob = (WORKTREE / name).read_bytes()
        log({'read': str(WORKTREE / name), 'range': [start, end], 'sha256': digest(blob), 'content': '\n'.join(blob.decode().splitlines()[start - 1:end]), 'provenance': 'Same range already received from direct bounded read before logger; captured here for complete instruction transcript.'})
    events, references, sources_read, packet_reads = [], {}, [], []

    def reference(kind, value):
        key = kind + digest(value)
        if key not in references:
            label = kind + str(sum(old.startswith(kind) for old in references) + 1)
            references[key] = label
            events.append({'define': label, 'sha256': digest(value), 'value': value})
        return references[key]

    read_hashes = set()
    for number in (1, 2):
        entry, data, blob, queue_blob = packet(number)
        log({'read_queue': number, 'bytes': len(queue_blob), 'sha256': digest(queue_blob), 'complete_content': queue_blob.decode()})
        log({'read_packet': str(entry['packet']), 'bytes': len(blob), 'sha256': digest(blob), 'complete_content': blob.decode()})
        assert data['assignment']['actor'] == ACTOR
        assert data['assignment']['id'] == entry['assignment']
        assert data['assignment']['phase'] == 'verify'
        assert set(data['cells']) == set(data['assignment']['items']) == set(data['mappings'])
        assert len(data['cells']) == 11
        events.append({'begin_round': number, 'entry': entry, 'packet_bytes': len(blob), 'packet_sha256': digest(blob)})
        for key, value in data.items():
            if key not in ('assignment', 'rows', 'criteria', 'cells', 'mappings', 'source_excerpts'):
                events.append({'packet_field': key, 'reference': reference('P', value)})
        for key, value in data['assignment'].items():
            events.append({'assignment_field': key, 'reference': reference('A', value)})
        source_index = {}
        for excerpt in data['source_excerpts']:
            path = pathlib.Path(data['captured_sources']) / (excerpt['hash'] + '.txt')
            assert path.is_relative_to(BASE)
            original = path.read_bytes()
            assert digest(original) == excerpt['hash']
            lines = original.decode().splitlines()
            assert '\n'.join(lines[excerpt['start'] - 1:excerpt['end']]) == excerpt['text']
            source_index[excerpt['source']] = {'hash': digest(original), 'bytes': len(original), 'line_count': len(lines)}
            log({'captured_read': str(path), 'logical_source': excerpt['source'], 'bytes': len(original), 'sha256': digest(original), 'complete_content': original.decode()})
            if excerpt['hash'] not in read_hashes:
                events.append({'original': excerpt['source'], 'hash': digest(original), 'bytes': len(original), 'lines': list(enumerate(lines, 1))})
                read_hashes.add(excerpt['hash'])
            events.append({'excerpt': reference('X', excerpt)})
        events.append({'checked_actual_source_bytes': source_index})
        sources_read.append({'round': number, 'sources': source_index})
        row_refs = {key: reference('R', value) for key, value in data['rows'].items()}
        criterion_refs = {key: reference('C', value) for key, value in data['criteria'].items()}
        for cell, (row_id, criterion_id) in data['cells'].items():
            mapping = data['mappings'][cell]
            row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
            assert mapping['actor'] == '/root/qualify_audit_two'
            assert data['assignment']['mappings'][cell] == digest(mapping)
            assert mapping['fingerprint'] == digest([row, criterion, {source: source_index[source]['hash'] for source in row['sources']}])
            assert set(row['sources']) | {criterion['source']} <= {span['source'] for span in mapping['evidence']}
            for span in mapping['evidence']:
                assert 1 <= span['start'] <= span['end'] <= source_index[span['source']]['line_count']
                assert all(any(excerpt['source'] == span['source'] and excerpt['start'] <= line <= excerpt['end'] for excerpt in data['source_excerpts']) for line in range(span['start'], span['end'] + 1))
            for item in (row, criterion):
                assert any(span['source'] == item['source'] and span['start'] <= item['end'] and span['end'] >= item['start'] for span in mapping['evidence'])
            events.append({'cell': cell, 'row': row_refs[row_id], 'criterion': criterion_refs[criterion_id], 'mapping': reference('M', mapping), 'bound_mapping_sha256': data['assignment']['mappings'][cell], 'source_cell_fingerprint_verified': True})
        packet_reads.append({'round': number, 'entry': entry, 'bytes': len(blob), 'sha256': digest(blob), 'items': len(data['cells'])})
    chunks, chunk = [], []
    for event in events:
        assert len(encoded(event)) < 7400
        if len(encoded(chunk + [event])) > 7550:
            chunks.append(chunk)
            chunk = []
        chunk.append(event)
    if chunk:
        chunks.append(chunk)
    PROJECTION.write_text(encoded(chunks))
    STATE.write_text(encoded({'started': started, 'packet_reads': packet_reads, 'source_reads': sources_read, 'chunks': len(chunks), 'read_chunks': []}))
    emit({'prepared_chunks': len(chunks), 'packet_bytes': sum(item['bytes'] for item in packet_reads), 'items': sum(item['items'] for item in packet_reads), 'unique_source_hashes': len(read_hashes), 'started_at': started})


def chunk(index):
    state = json.loads(STATE.read_text())
    chunks = json.loads(PROJECTION.read_text())
    emit({'chunk': index, 'count': len(chunks), 'events': chunks[index]})
    state['read_chunks'] = sorted(set(state['read_chunks'] + [index]))
    STATE.write_text(encoded(state))


# Explicit judgments derived from the current nine projection chunks.
GROUPS = [
    ([1], 'Verified A. This relationship invokes deliver from run step delivery. Deliver resolves emit to produce in the declared qualification execution chain. DP1 requires call relationships to carry the inherited destination constraint to that leaf; absence of a destination on the activity does not exclude its call relationship.'),
    ([2, 3], 'Verified A. Each relationship resolves deliver step emit to the produce leaf in the declared qualification/run/delivery execution chain. DP1 explicitly assigns call relationships the responsibility to carry the inherited destination comparison to that leaf instance.'),
    ([4, 5, 6], 'Verified A. Each assigned leaf surface contains Destination is public at line 12. DP1 governs a leaf destination declaration in its executing workflow context. Qualification/run/deliver identifies that context and its ancestor requires archive, so the comparison belongs on each of these surfaces.'),
    ([7], 'Verified A. This relationship connects produce to the qualification ancestor that declares required archive. The leaf declares public and the captured execution chain establishes the ancestor. DP1 explicitly governs inheritance relationships carrying the constraint to the leaf, without treating the ancestor as a second leaf.'),
    ([8, 9, 10, 11], 'Verified A. These initial-activity and graph-entry/target relationships select run within qualification. Run invokes deliver, whose emit step calls produce. DP1 names this executing chain and requires its call relationships to carry the inherited destination constraint to the leaf; the workflow need not declare a leaf destination itself.'),
]


def write():
    state = json.loads(STATE.read_text())
    observed = []
    for line in LOG.read_text().splitlines():
        if line.startswith('{"chunk":'):
            observed.append(json.loads(line)['chunk'])
    assert set(observed) == set(range(state['chunks']))
    if state['read_chunks'] != sorted(set(observed)):
        log({'reader_bookkeeping': 'The first three read calls ran concurrently. Reconciled chunk markers against their complete logged tool outputs before receipt creation.', 'previous_markers': state['read_chunks'], 'complete_received_markers': sorted(set(observed))})
    state['read_chunks'] = sorted(set(observed))
    definitions = {event['define']: event['value'] for part in json.loads(PROJECTION.read_text()) for event in part if 'define' in event}
    metrics = []
    for number in (1, 2):
        entry, data, blob, _ = packet(number)
        prior = next(item for item in state['packet_reads'] if item['round'] == number)
        assert digest(blob) == prior['sha256']
        sources = next(item['sources'] for item in state['source_reads'] if item['round'] == number)
        for source, identity in sources.items():
            path = pathlib.Path(data['captured_sources']) / (identity['hash'] + '.txt')
            assert digest(path.read_bytes()) == identity['hash']
        evidence = [{'source': source, 'start': 1, 'end': 8 if source == 'corpus/canon/resources/design-principles.md' else identity['line_count']} for source, identity in sorted(sources.items())]
        records = []
        for refs, reason in GROUPS:
            row_ids = {definitions['R' + str(ref)]['id'] for ref in refs}
            cells = [cell for cell, (row_id, criterion_id) in data['cells'].items() if row_id in row_ids]
            assert len(cells) == len(refs)
            for cell in cells:
                row_id, criterion_id = data['cells'][cell]
                assert criterion_id == 'dp:1' and data['mappings'][cell]['status'] == 'A'
                assert data['assignment']['mappings'][cell] == digest(data['mappings'][cell])
                row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
                assert set(row['sources']) | {criterion['source']} <= {span['source'] for span in evidence}
                for item in (row, criterion):
                    assert any(span['source'] == item['source'] and span['start'] <= item['end'] and span['end'] >= item['start'] for span in evidence)
            records.append({'items': cells, 'status': 'verified', 'reason': reason, 'evidence': evidence})
        returned = [cell for record in records for cell in record['items']]
        assert len(returned) == len(set(returned)) == 11 and set(returned) == set(data['cells'])
        wrapper = {'run': entry['run'], 'assignment': entry['assignment'], 'snapshot': data['assignment']['snapshot'], 'actor': ACTOR, 'attempt': 'current-audit-dp1-verify-round-' + str(number) + '-1', 'records': records}
        output = (encoded(wrapper) + '\n').encode()
        assert len(output) <= data['assignment']['estimate']['output_tokens_estimate']
        directory = BASE / ('round-' + str(number)) / 'audit-band-verify-receipts'
        directory.mkdir(exist_ok=True)
        path = directory / (entry['assignment'] + '-audit-dp1-verify-1.json')
        assert not path.exists()
        path.write_bytes(output)
        assert json.loads(path.read_bytes()) == wrapper
        log({'receipt': str(path), 'bytes': len(output), 'complete_content': output.decode()})
        metrics.append({'round': number, 'path': str(path), 'packet_bytes': len(blob), 'receipt_bytes': len(output), 'items': len(returned), 'records': len(records), 'verified': len(returned), 'disputed': 0})
    finished = now()
    unique = {identity['hash']: identity['bytes'] for item in state['source_reads'] for identity in item['sources'].values()}
    measured = {'started_at': state['started'], 'finished_at': finished, 'tracked_elapsed_seconds': (datetime.datetime.fromisoformat(finished) - datetime.datetime.fromisoformat(state['started'])).total_seconds(), 'packet_bytes': sum(item['packet_bytes'] for item in metrics), 'receipt_bytes': sum(item['receipt_bytes'] for item in metrics), 'items': sum(item['items'] for item in metrics), 'verified': 22, 'disputed': 0, 'unique_original_source_bytes': sum(unique.values()), 'unique_source_hashes': len(unique), 'complete_projection_chunks': len(state['read_chunks']), 'receipts': metrics, 'limits': ['Tracked interval begins at captured read preparation; initial guide/helper reads and helper setup are outside it.', 'Prior fixture exposure retained; independent of current mapper, not a fresh-context detection claim.', 'No evaluation, finding classification, canonical state edits or source edits. All original source hashes, exact mapping digests, identities, evidence coverage and row/criterion overlap checked.', 'Current source/packet projection outputs were all below 7900 characters and untruncated. An earlier helper inspection was truncated and its relevant receipt-formatting section re-read; no semantic evidence was lost.']}
    state['results'] = measured
    STATE.write_text(encoded(state))
    emit(measured)


if __name__ == '__main__':
    if sys.argv[1] == 'prepare':
        prepare()
    elif sys.argv[1] == 'chunk':
        chunk(int(sys.argv[2]))
    elif sys.argv[1] == 'write':
        write()
