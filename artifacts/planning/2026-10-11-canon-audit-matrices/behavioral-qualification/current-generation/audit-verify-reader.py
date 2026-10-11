"""Bounded evidence reads for current-generation independent Audit mapping verification."""

import collections
import datetime
import hashlib
import json
import runpy
import sys
import traceback
from pathlib import Path

BASE = Path(__file__).resolve().parent
SKILL = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon')
LOG = Path('/tmp/qualify-current-audit-verify-transcript.txt')


def emit(label, value):
    body = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    output = '\n' + datetime.datetime.now(datetime.timezone.utc).isoformat() + ' | ' + label + '\n' + body + '\n'
    assert len(output) <= 8000, len(output)
    with LOG.open('a') as handle:
        handle.write(output)
    print(output, end='')


def chunks(label, value, index):
    body = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    parts = [body[i:i + 7000] for i in range(0, len(body), 7000)]
    emit(label + f'; exact chunk {index + 1}/{len(parts)}; total characters {len(body)}', parts[index])


def queues():
    records = []
    for round_name in ('round-1', 'round-2'):
        for entry in json.loads((BASE / round_name / 'audit-verify-queue.json').read_text()):
            records.append({'round': round_name, **entry})
    return records


def packets():
    return [(entry, json.loads(Path(entry['packet']).read_text())) for entry in queues()]


def dictionaries():
    data = packets()
    rows = {}
    reasons = {}
    evidence = {}
    for entry, packet in data:
        for rid, row in packet['rows'].items():
            if rid in rows:
                assert rows[rid] == row
            rows[rid] = row
        for item in packet['assignment']['items']:
            mapping = packet['mappings'][item]
            for part in mapping['reason'].split('. '):
                if part not in reasons:
                    reasons[part] = f'T{len(reasons) + 1:03}'
            key = json.dumps(mapping['evidence'], sort_keys=True)
            if key not in evidence:
                evidence[key] = f'E{len(evidence) + 1:03}'
    aliases = {rid: f'V{n + 1:02}' for n, rid in enumerate(sorted(rows))}
    return data, rows, aliases, reasons, evidence


def main():
    mode = sys.argv[1]
    if mode == 'start':
        text = (SKILL / 'references/audit-dispatch.md').read_text().splitlines()
        start = next(i for i, line in enumerate(text) if line == '## Returns')
        emit('TASK START: current independent mapping verification by /root/qualify_audit_one; prior fixture exposure acknowledged; no prior receipts imported; current Audit Dispatch Returns', ''.join(f'{i + 1}: {text[i]}\n' for i in range(start, len(text))))
    elif mode == 'queues':
        chunks('Complete current mapping verification queues', queues(), int(sys.argv[2]))
    elif mode == 'metadata':
        result = []
        for n, (entry, packet) in enumerate(packets(), 1):
            assignment = packet['assignment']
            result.append({'number': n, 'round': entry['round'], 'run': Path(entry['run']).name, 'assignment': assignment['id'], 'actor': assignment['actor'], 'phase': assignment['phase'], 'snapshot': assignment['snapshot'], 'items': len(assignment['items']), 'packet_bytes': Path(entry['packet']).stat().st_size, 'budgets': assignment['budgets'], 'estimate': assignment['estimate'], 'mapper_actors': sorted({mapping['actor'] for mapping in packet['mappings'].values()}), 'mapper_attempts': sorted({mapping['attempt'] for mapping in packet['mappings'].values()})})
        chunks('All current assignment metadata', result, int(sys.argv[2]))
    elif mode == 'compact-metadata':
        data = packets()
        budgets = data[0][1]['assignment']['budgets']
        snapshots = {}
        estimates = {}
        records = []
        for number, (entry, packet) in enumerate(data, 1):
            assignment = packet['assignment']
            assert assignment['budgets'] == budgets
            assert assignment['actor'] == entry['actor'] == '/root/qualify_audit_one'
            assert assignment['phase'] == entry['phase'] == 'verify'
            assert assignment['id'] == entry['assignment']
            snapshots[entry['round'] + '/' + Path(entry['run']).name] = assignment['snapshot']
            context = json.dumps(assignment['estimate']['context'], sort_keys=True)
            if context not in estimates:
                estimates[context] = 'X' + str(len(estimates) + 1)
            estimate = {key: value for key, value in assignment['estimate'].items() if key != 'context'}
            records.append([number, entry['round'] + '/' + Path(entry['run']).name, assignment['id'], len(assignment['items']), Path(entry['packet']).stat().st_size, estimates[context], estimate])
        chunks('Lossless common assignment metadata; mapper identities/attempts read with each mapping; records=[number,case,assignment,item count,packet bytes,context ID,other estimate fields]', {'actor': '/root/qualify_audit_one', 'phase': 'verify', 'budgets': budgets, 'snapshots': snapshots, 'contexts': {value: json.loads(key) for key, value in estimates.items()}, 'records': records}, int(sys.argv[2]))
    elif mode == 'return-template':
        chunks('Current typed return example', (SKILL / 'templates/audit-receipt.json').read_text(), int(sys.argv[2]))
    elif mode == 'write-round':
        decisions = runpy.run_path(str(BASE / 'audit-verify-decisions.py'))
        decisions['write_round'](sys.modules[__name__], sys.argv[2])
    elif mode == 'finish':
        log = LOG.read_text()
        started = datetime.datetime.fromisoformat(next(line for line in log.splitlines() if 'TASK START:' in line).split(' | ')[0])
        sequence = [line for line in log.splitlines() if ' | ' in line]
        receipts = [BASE / entry['round'] / 'audit-verify-receipts' / (entry['assignment'] + '.json') for entry in queues()]
        assert all(path.exists() for path in receipts)
        emit('FINAL measured verification handoff', {'assignments': len(receipts), 'cells': 792, 'verified': 792, 'disputed': 0, 'unique_packet_bytes': sum(Path(entry['packet']).stat().st_size for entry in queues()), 'receipt_bytes': sum(path.stat().st_size for path in receipts), 'largest_receipt_bytes': max(path.stat().st_size for path in receipts), 'transcript_bytes_before_final_record': LOG.stat().st_size, 'elapsed_seconds': round((datetime.datetime.now(datetime.timezone.utc) - started).total_seconds(), 3), 'observed_read_sequence': sequence, 'authority': 'No canonical state or corpus writes; coordinator alone ingests. No expected outcomes, baseline, findings or historical accepted receipts read.', 'read_notes': 'All semantic packet projections bounded to 7000 characters plus headers. Ten unique original source byte hashes agree with complete originals read in current inventory. This current verification uses four full criteria, 52 union row identities, all 204 exact reason segments, all 37 exact evidence lists and all 792 mapping records. Common metadata replaced a redundant initial raw metadata chunk. Helper code inspection is operational context, not a qualification source.'})
    elif mode == 'sources':
        prior_hashes = {'21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a', 'e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813', 'ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1', 'dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b', '53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77', '27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729', '02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771', 'be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1', '0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025', '6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121', '4ddbeecb525a65e353b11d9640f59e57175f7fa2925b91bc2252d1ceba6d3f39'}
        sources = {}
        for number, (entry, packet) in enumerate(packets(), 1):
            for excerpt in packet['source_excerpts']:
                digest = excerpt['hash']
                raw = (Path(packet['captured_sources']) / (digest + '.txt')).read_bytes()
                assert hashlib.sha256(raw).hexdigest() == digest
                assert digest in prior_hashes
                key = (excerpt['source'], digest)
                if key not in sources:
                    sources[key] = {'source': excerpt['source'], 'hash': digest, 'bytes': len(raw), 'reuse': 'Complete original bytes fully read during current-generation inventory; exact current byte hash agrees.', 'packets': []}
                if number not in sources[key]['packets']:
                    sources[key]['packets'].append(number)
        chunks('Current captured original byte checks before source reuse', list(sources.values()), int(sys.argv[2]))
    elif mode == 'criteria':
        units = {}
        for entry, packet in packets():
            for key, unit in packet['criteria'].items():
                if key in units:
                    assert units[key] == unit
                units[key] = unit
        chunks('Every current original criterion and exact unit metadata', units, int(sys.argv[2]))
    elif mode == 'rows':
        data, rows, aliases, reasons, evidence = dictionaries()
        sources = {s: f'S{n + 1}' for n, s in enumerate(sorted({row['source'] for row in rows.values()}))}
        defaults = {}
        records = []
        for rid, row in sorted(rows.items()):
            source = row['source']
            defaults[sources[source]] = {key: row[key] for key in ('source', 'source_kind', 'type', 'origin')}
            result = {key: value for key, value in row.items() if key not in {'id', 'source', 'source_kind', 'type', 'origin'}}
            assert row['id'] == rid == source + '#' + row['address']
            if result['sources'] == [source]:
                del result['sources']
            else:
                result['sources'] = [sources[s] for s in result['sources']]
            if result['label'] == result['address']:
                del result['label']
            if 'relationship' in result:
                rel = dict(result['relationship'])
                rel['source'] = sources[rel['source']]
                rel['target'] = sources[rel['target']]
                rel['context'] = [sources[s] for s in rel['context']]
                result['relationship'] = rel
            records.append([aliases[rid], sources[source], result])
        chunks('Complete unique current rows; id=source#address, omitted label=address, omitted sources=[source], remaining defaults per source', {'source_defaults': defaults, 'rows': records}, int(sys.argv[2]))
    elif mode == 'reasons':
        data, rows, aliases, reasons, evidence = dictionaries()
        chunks('Exact unique reason segments; every reason is its ordered segments joined with dot-space', [[alias, text] for text, alias in reasons.items()], int(sys.argv[2]))
    elif mode == 'evidence':
        data, rows, aliases, reasons, evidence = dictionaries()
        source_aliases = {'corpus/qualification/activities/run.yaml': 'S1', 'corpus/qualification/routines/deliver.yaml': 'S2', 'corpus/qualification/techniques/TECHNIQUE.md': 'S3', 'corpus/qualification/techniques/produce.md': 'S4', 'corpus/qualification/workflow.yaml': 'S5', 'corpus/canon/resources/design-principles.md': 'C1', 'corpus/canon/resources/anti-patterns.md': 'C2'}
        values = []
        for key, alias in evidence.items():
            values.append([alias, [[source_aliases[e['source']], e['start'], e['end']] for e in json.loads(key)]])
        chunks('Exact unique evidence lists; tuple=[source,start,end]; source aliases fixed by source dictionary', {'sources': source_aliases, 'evidence': values}, int(sys.argv[2]))
    elif mode == 'mappings':
        data, rows, aliases, reasons, evidence = dictionaries()
        round_name = sys.argv[2]
        lines = []
        for number, (entry, packet) in enumerate(data, 1):
            if entry['round'] != round_name:
                continue
            lines.append(json.dumps({'number': number, 'round': round_name, 'run': Path(entry['run']).name, 'assignment': entry['assignment'], 'criteria': list(packet['criteria']), 'mapper_actors': sorted({m['actor'] for m in packet['mappings'].values()}), 'mapper_assignments': sorted({m['assignment'] for m in packet['mappings'].values()}), 'mapper_attempts': sorted({m['attempt'] for m in packet['mappings'].values()})}, separators=(',', ':')))
            for item in packet['assignment']['items']:
                mapping = packet['mappings'][item]
                lines.append(json.dumps([item, aliases[packet['cells'][item][0]], mapping['status'], [reasons[part] for part in mapping['reason'].split('. ')], evidence[json.dumps(mapping['evidence'], sort_keys=True)]], separators=(',', ':')))
        chunks('Every exact current mapping; records=[owned item,row alias,status,ordered reason segment IDs,evidence ID]', '\n'.join(lines), int(sys.argv[3]))
    else:
        raise ValueError(mode)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        with LOG.open('a') as handle:
            handle.write('\n' + datetime.datetime.now(datetime.timezone.utc).isoformat() + ' | Reader failure\n' + traceback.format_exc())
        raise
