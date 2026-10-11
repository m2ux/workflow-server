import datetime
import hashlib
import json
import pathlib
import sys

BASE = pathlib.Path(__file__).resolve().parent
WORKTREE = pathlib.Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices')
LOG = pathlib.Path('/tmp/qualify-current-audit-band-evaluate-transcript.txt')
STATE = pathlib.Path('/tmp/qualify-current-audit-band-evaluate-state.json')
PROJECTION = pathlib.Path('/tmp/qualify-current-audit-band-evaluate-projection.json')
ACTOR = '/root/qualify_author_one'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(value if isinstance(value, bytes) else encoded(value).encode()).hexdigest()


def log(value):
    with LOG.open('a') as handle:
        handle.write(now() + '\n' + encoded(value) + '\n')


def emit(value):
    output = encoded(value)
    assert len(output) < 7900
    log(value)
    print(output)


def prepare():
    assert not STATE.exists()
    started = now()
    log({'task': 'Independent evaluation of 22 reopened Audit DP1 cells', 'actor': ACTOR, 'prior_fixture_exposure': True, 'authority': 'Only fresh receipts and local reading/formatting artifacts; no canonical state, Git, fixture or core edits.', 'scope': 'Original captured sources, current Reporting Bands and exact bound evaluation packets; no reference manifest or other finding receipts.'})
    for name, start, end in [('reporting.md', 1, 76), ('audit-dispatch.md', 27, 48), ('audit-mode.md', 35, 44)]:
        path = WORKTREE / 'skills/workflow-canon/references' / name
        blob = path.read_bytes()
        log({'prerequisite': str(path), 'sha256': digest(blob), 'range': [start, end], 'complete_content': '\n'.join(blob.decode().splitlines()[start - 1:end]), 'read_provenance': 'Received from bounded direct tool read before logger start; captured here for complete transcript.'})
    verified_reads = json.loads(pathlib.Path('/tmp/qualify-current-audit-band-verify-state.json').read_text())
    events, reads = [], []
    for number in (1, 2):
        prior_read = next(item for item in verified_reads['packet_reads'] if item['round'] == number)
        prior_blob = pathlib.Path(prior_read['entry']['packet']).read_bytes()
        assert digest(prior_blob) == prior_read['sha256']
        prior_packet = json.loads(prior_blob)
        log({'reuse_verification_packet_context': prior_read['entry']['packet'], 'sha256': digest(prior_blob), 'basis': 'Exact bytes already fully received in the prior verification task; no receipt or evaluation result read.'})
        queue_path = BASE / ('round-' + str(number)) / 'audit-evaluate-queue.json'
        queue_blob = queue_path.read_bytes()
        entries = json.loads(queue_blob)
        assert len(entries) == 2
        log({'queue': str(queue_path), 'bytes': len(queue_blob), 'sha256': digest(queue_blob), 'complete_content': queue_blob.decode()})
        for index, entry in enumerate(entries):
            assert entry['actor'] == ACTOR and entry['phase'] == 'evaluate'
            path = pathlib.Path(entry['packet'])
            blob = path.read_bytes()
            data = json.loads(blob)
            log({'packet': str(path), 'bytes': len(blob), 'sha256': digest(blob), 'complete_content': blob.decode()})
            assert data['assignment']['id'] == entry['assignment']
            assert data['assignment']['actor'] == ACTOR and data['assignment']['phase'] == 'evaluate'
            assert set(data['cells']) == set(data['assignment']['items']) == set(data['mappings'])
            for key in ('authority', 'captured_sources', 'corpus_manifest', 'diagnostics', 'obligations', 'required_checks', 'scope', 'supplemental'):
                assert data[key] == prior_packet[key]
            source_index = {}
            for excerpt in data['source_excerpts']:
                source_path = pathlib.Path(data['captured_sources']) / (excerpt['hash'] + '.txt')
                original = source_path.read_bytes()
                assert digest(original) == excerpt['hash']
                lines = original.decode().splitlines()
                assert '\n'.join(lines[excerpt['start'] - 1:excerpt['end']]) == excerpt['text']
                assert excerpt in prior_packet['source_excerpts']
                source_index[excerpt['source']] = {'hash': excerpt['hash'], 'bytes': len(original), 'lines': len(lines)}
            comparisons = []
            for cell, (row_id, criterion_id) in data['cells'].items():
                assert criterion_id == 'dp:1'
                assert data['cells'][cell] == prior_packet['cells'][cell]
                assert data['rows'][row_id] == prior_packet['rows'][row_id]
                assert data['criteria'][criterion_id] == prior_packet['criteria'][criterion_id]
                assert data['mappings'][cell] == prior_packet['mappings'][cell]
                assert data['mappings'][cell]['status'] == 'A'
                assert data['assignment']['mappings'][cell] == digest(data['mappings'][cell])
                comparisons.append({'cell': cell, 'row': row_id, 'row_sha256': digest(data['rows'][row_id]), 'criterion': criterion_id, 'criterion_sha256': digest(data['criteria'][criterion_id]), 'mapping_sha256': digest(data['mappings'][cell]), 'exact_prior_received_mapping_and_context': True})
            events.append({'round': number, 'index': index, 'entry': entry, 'packet_bytes': len(blob), 'packet_sha256': digest(blob), 'assignment': data['assignment'], 'remaining_metadata_matches_prior_received_packet': True})
            events.append({'round': number, 'index': index, 'actual_sources_rehashed': source_index, 'excerpts_exactly_match_prior_complete_received_context': True})
            for comparison in comparisons:
                events.append(comparison)
            reads.append({'round': number, 'index': index, 'entry': entry, 'packet_bytes': len(blob), 'packet_sha256': digest(blob), 'items': len(comparisons), 'sources': source_index})
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
    STATE.write_text(encoded({'started_at': started, 'reads': reads, 'chunks': len(chunks), 'read_chunks': []}))
    emit({'started_at': started, 'packets': len(reads), 'items': sum(item['items'] for item in reads), 'packet_bytes': sum(item['packet_bytes'] for item in reads), 'chunks': len(chunks)})


def read_chunk(index):
    chunks = json.loads(PROJECTION.read_text())
    emit({'chunk': index, 'count': len(chunks), 'events': chunks[index]})
    state = json.loads(STATE.read_text())
    state['read_chunks'] = sorted(set(state['read_chunks'] + [index]))
    STATE.write_text(encoded(state))


FINDING = {
    'band': 'Contract',
    'severity': 'High',
    'origin': 'diff',
    'entry': "1. Honor the executing workflow's inherited destination",
    'location': 'corpus/qualification/techniques/produce.md#/rules/line-12',
    'summary': 'The leaf declares public while its executing workflow ancestor requires archive.',
    'fix': 'Set the leaf Destination to the inherited archive requirement.',
}
REASON = 'DP1 compares this executing leaf with its ancestor: public contradicts required archive. This is a propagated declaration conflict; effective routing is unspecified.'


def write_receipts():
    state = json.loads(STATE.read_text())
    assert state['read_chunks'] == list(range(state['chunks']))
    rationale = {
        'finding': FINDING,
        'source_derivation': 'The controlled DP1 explicitly identifies qualification -> run -> deliver -> produce and requires comparing the executing leaf Destination with qualification/techniques/TECHNIQUE.md. Workflow lines 1-5, activity lines 1-6 and routine lines 1-6 carry that declared chain. The ancestor line 5 requires archive and leaf line 12 declares public. These unequal values prove the DP1 violation. All 22 owned cells expose this same declaration directly or through the explicit execution/inheritance relationships; no second DP1 defect is present.',
        'band_derivation': 'Reporting Bands describes Live as actual definition misbehavior and Contract as a propagated defect such as a constraint lacking structural backing. Here the structural evidence resolves the executing leaf and its inherited obligation. It proves inconsistent destination declarations, but the controlled canon and complete definitions do not bind the Protocol emission target to Destination or specify precedence or execution failure for contradictory declarations. Therefore this evidence establishes a propagated contract constraint defect. An absent runtime trace alone would not rule out Live: an explicit source rule connecting the value to runtime behavior would suffice. That rule is absent from the captured dialect. The classification does not claim the complete fixture, including unrelated defects, runs successfully, nor does it assume the destination conflict necessarily breaks execution.',
        'severity_derivation': 'High: the touched leaf ships a destination declaration that conflicts with the constraint imported through the explicit execution/inheritance chain; the consequence crosses the owning ancestor and leaf contract. It is not confined prose hygiene. No schema rule or measured guard establishes Critical for this destination declaration.',
        'origin_derivation': 'Diff: scope.paths includes the leaf technique whose line 12 owns the defect. This is declared change-surface attribution; no historical base equality or prior accepted finding status is claimed.',
        'classification_scope': 'Only DP1 evaluated. No prior accepted evaluation or other worker finding receipt read. Current source hashes, rows, criteria, map dispositions/reasons/evidence and bound packet identities checked before fresh judgment.'
    }
    log(rationale)
    pending = []
    seen = {1: set(), 2: set()}
    for read in state['reads']:
        entry = read['entry']
        blob = pathlib.Path(entry['packet']).read_bytes()
        assert digest(blob) == read['packet_sha256']
        data = json.loads(blob)
        evidence = [{'source': source, 'start': 1, 'end': 8 if source == 'corpus/canon/resources/design-principles.md' else item['lines']} for source, item in sorted(read['sources'].items())]
        for source, item in read['sources'].items():
            source_path = pathlib.Path(data['captured_sources']) / (item['hash'] + '.txt')
            assert digest(source_path.read_bytes()) == item['hash']
        cells = list(data['assignment']['items'])
        for cell in cells:
            assert cell not in seen[read['round']]
            seen[read['round']].add(cell)
            row_id, criterion_id = data['cells'][cell]
            assert criterion_id == 'dp:1' and data['mappings'][cell]['status'] == 'A'
            assert data['assignment']['mappings'][cell] == digest(data['mappings'][cell])
            row, criterion = data['rows'][row_id], data['criteria'][criterion_id]
            assert set(row['sources']) | {criterion['source']} <= {span['source'] for span in evidence}
            for item in (row, criterion):
                assert any(span['source'] == item['source'] and span['start'] <= item['end'] and span['end'] >= item['start'] for span in evidence)
        assert len(cells) == len(set(cells)) and set(cells) == set(data['cells'])
        record = {'items': cells, 'status': 'finding', 'reason': REASON, 'evidence': evidence, 'findings': [FINDING]}
        wrapper = {'run': entry['run'], 'assignment': entry['assignment'], 'snapshot': data['assignment']['snapshot'], 'actor': ACTOR, 'attempt': 'audit-dp1-evaluate-1', 'records': [record]}
        output = (encoded(wrapper) + '\n').encode()
        assert len(output) <= data['assignment']['estimate']['output_tokens_estimate'], (entry['assignment'], len(output), data['assignment']['estimate']['output_tokens_estimate'])
        directory = BASE / ('round-' + str(read['round'])) / 'audit-band-evaluate-receipts'
        path = directory / (entry['assignment'] + '-audit-dp1-evaluate-1.json')
        assert not path.exists()
        pending.append((path, output, wrapper, read))
    assert len(seen[1]) == len(seen[2]) == 11
    metrics = []
    for path, output, wrapper, read in pending:
        path.parent.mkdir(exist_ok=True)
        path.write_bytes(output)
        assert json.loads(path.read_bytes()) == wrapper
        log({'receipt': str(path), 'bytes': len(output), 'complete_content': output.decode()})
        metrics.append({'round': read['round'], 'path': str(path), 'packet_bytes': read['packet_bytes'], 'receipt_bytes': len(output), 'items': read['items'], 'finding_cells': read['items'], 'pass': 0, 'blocked': 0})
    finished = now()
    sources = {item['hash']: item['bytes'] for read in state['reads'] for item in read['sources'].values()}
    measured = {'started_at': state['started_at'], 'finished_at': finished, 'tracked_elapsed_seconds': (datetime.datetime.fromisoformat(finished) - datetime.datetime.fromisoformat(state['started_at'])).total_seconds(), 'receipts': metrics, 'packet_bytes': sum(item['packet_bytes'] for item in metrics), 'receipt_bytes': sum(item['receipt_bytes'] for item in metrics), 'items': 22, 'finding_cells': 22, 'distinct_findings_per_run': 1, 'band': 'Contract', 'severity': 'High', 'pass': 0, 'blocked': 0, 'projection_chunks_received': len(state['read_chunks']), 'unique_original_source_bytes': sum(sources.values()), 'unique_original_source_hashes': len(sources), 'limitations': ['Tracked interval starts with current packet preparation; initial reporting/queue reads and helper setup are excluded.', 'Original complete source bytes and semantic fields reused only after actual hash/exact-field equality checks against the immediately preceding verification reads.', 'No evaluation tool output truncation or permission pause. No prior accepted evaluations, reference manifest, hidden outcomes or other findings read.', 'No ledger/Git/fixture/core modifications. Root owns ingestion and independent confirmation.']}
    state['results'] = measured
    STATE.write_text(encoded(state))
    emit(measured)


if __name__ == '__main__':
    if sys.argv[1] == 'prepare':
        prepare()
    elif sys.argv[1] == 'chunk':
        read_chunk(int(sys.argv[2]))
    elif sys.argv[1] == 'write':
        write_receipts()
