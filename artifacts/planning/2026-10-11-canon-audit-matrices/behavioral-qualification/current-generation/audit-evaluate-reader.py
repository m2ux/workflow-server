"""Bounded reads and measurements for current-generation Audit evaluation."""

import datetime
import hashlib
import json
import runpy
import sys
import traceback
from pathlib import Path

BASE = Path(__file__).resolve().parent
SKILL = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon')
LOG = Path('/tmp/qualify-current-audit-evaluate-transcript.txt')
KNOWN = {
    '21a952302624f808b1450bb9910245607741471ed3e8401a4cd53b74932d267a',
    'e53c6d5d9ae4db6015872c0df77b1a2111f7736f2e0c7712f058940ed08f4813',
    'ee37bfa52b91453754fed501b94fc62d03177e68f02a5b38e76b5339f1e059f1',
    'dd68739fd074be026cbe01f93d2509e9d0c65fa0aa4a19eb1b2f60b4d3441c8b',
    '53367edcf890fd3d39b34e55f325affa64db1663fe33b1aeefb8796519bf8f77',
    '27aec38a4461c1024c390cf4601ccb17ae6f07a40a3c0d5c43dc6b0c7a6b0729',
    '02fd7e717221514e930f4417209eb5d3b7ff9fd0a8809f4aab65ddd558912771',
    'be38d65675bed55315fdb8dcb8b2ebe468cbf5a9ba63ac9a281ecd0549e63fc1',
    '0c5b2c9f9813d5f4545fc938f1a0e41b167b3ad6e450db95f35a0f3ef6084025',
    '6c205b2ef7f2ef9498ffe1d801a42438a5350bddac684702a58ea9a525bf2121',
}


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


def packets(round_name):
    queue = json.loads((BASE / round_name / 'audit-evaluate-queue.json').read_text())
    return [(entry, json.loads(Path(entry['packet']).read_text())) for entry in queue]


def dictionaries(round_name):
    data = packets(round_name)
    rows = {}
    criteria = {}
    for entry, packet in data:
        for key, row in packet['rows'].items():
            assert key not in rows or rows[key] == row
            rows[key] = row
        for key, unit in packet['criteria'].items():
            assert key not in criteria or criteria[key] == unit
            criteria[key] = unit
    aliases = {key: 'R' + str(i + 1).zfill(2) for i, key in enumerate(sorted(rows))}
    return data, rows, criteria, aliases


def main():
    mode = sys.argv[1]
    if mode == 'start':
        emit('TASK START: current Audit evaluation after parent opened round-1 verified map gate', {'actor': '/root/qualify_audit_one', 'prior_exposure': 'Controlled source bytes were completely read for current inventory and exact hashes checked for current mapping verification. No historical accepted evaluation or other evaluator findings imported.', 'authority': 'Read bound assignment sources/criteria; write own receipts. Root alone ingests and confirms. Declared scope.paths are the changed surface supplied directly by the harness; no Git base is supplied.', 'header_discovery': 'Read-only rg located Reporting Report Context line 5, Bands line 9, Severity line 19, Finding Rows line 32, Coverage Ledger line 48; Audit Attribution line 35 and Rules line 45. Shell emitted three harmless stream fd permission diagnostics.'})
    elif mode == 'reporting':
        lines = (SKILL / 'references/reporting.md').read_text().splitlines()
        chunks('Current Reporting Report Context, Bands, Severity and Finding Rows, lines 5-47', ''.join(f'{i + 1}: {lines[i]}\n' for i in range(4, 47)), int(sys.argv[2]))
    elif mode == 'attribution':
        lines = (SKILL / 'references/audit-mode.md').read_text().splitlines()
        chunks('Current Audit Attribution lines 35-44', ''.join(f'{i + 1}: {lines[i]}\n' for i in range(34, 44)), int(sys.argv[2]))
    elif mode == 'returns':
        lines = (SKILL / 'references/audit-dispatch.md').read_text().splitlines()
        chunks('Current Audit Dispatch Returns', ''.join(f'{i + 1}: {lines[i]}\n' for i in range(32, len(lines))), int(sys.argv[2]))
    elif mode == 'queue':
        chunks('Complete current evaluation queue ' + sys.argv[2], json.loads((BASE / sys.argv[2] / 'audit-evaluate-queue.json').read_text()), int(sys.argv[3]))
    elif mode == 'metadata':
        values = []
        common = None
        for n, (entry, packet) in enumerate(packets(sys.argv[2]), 1):
            assignment = packet['assignment']
            if common is None:
                common = assignment['budgets']
            assert assignment['budgets'] == common
            values.append({'number': n, 'run': entry['run'], 'packet_bytes': Path(entry['packet']).stat().st_size, 'assignment': {key: value for key, value in assignment.items() if key not in ('budgets', 'items')}, 'item_count': len(assignment['items']), 'packet_keys': sorted(packet), 'scope': packet.get('scope')})
        chunks('Current evaluation assignment metadata with common budgets', {'budgets': common, 'assignments': values}, int(sys.argv[3]))
    elif mode == 'compact-metadata':
        data = packets(sys.argv[2])
        budgets = data[0][1]['assignment']['budgets']
        scope = data[0][1]['scope']
        authority = data[0][1]['authority']
        contexts = {}
        snapshots = {}
        values = []
        for n, (entry, packet) in enumerate(data, 1):
            a = packet['assignment']
            assert a['budgets'] == budgets
            assert packet['scope'] == scope
            assert packet['authority'] == authority
            assert a['actor'] == entry['actor'] == '/root/qualify_audit_one'
            assert a['id'] == entry['assignment']
            assert a['phase'] == 'evaluate' and a['status'] == 'pending' and not a['returned']
            case = Path(entry['run']).name
            snapshots[case] = a['snapshot']
            context = json.dumps(a['estimate']['context'], sort_keys=True)
            if context not in contexts:
                contexts[context] = 'X' + str(len(contexts) + 1)
            values.append([n, case, a['id'], len(a['items']), Path(entry['packet']).stat().st_size, contexts[context], {k: v for k, v in a['estimate'].items() if k != 'context'}])
        chunks('Current assignment metadata; per-cell operational mapping fingerprints omitted; records=[number,case,id,items,packet bytes,context ID,other estimates]', {'actor': '/root/qualify_audit_one', 'phase': 'evaluate', 'status': 'pending', 'returned': [], 'budgets': budgets, 'scope': scope, 'authority': authority, 'snapshots': snapshots, 'contexts': {v: json.loads(k) for k, v in contexts.items()}, 'records': values}, int(sys.argv[3]))
    elif mode == 'entry-identity':
        hits = []
        for path in sorted((SKILL / 'references').glob('*.md')):
            lines = path.read_text().splitlines()
            for n, line in enumerate(lines, 1):
                if 'entry identity' in line.lower() or 'entry-identity' in line.lower():
                    hits.append([str(path), n, line])
        chunks('Instruction lookup for catalog entry identity', hits, int(sys.argv[2]))
    elif mode == 'sources':
        values = {}
        for n, (entry, packet) in enumerate(packets(sys.argv[2]), 1):
            for excerpt in packet['source_excerpts']:
                digest = excerpt['hash']
                raw = (Path(packet['captured_sources']) / (digest + '.txt')).read_bytes()
                assert hashlib.sha256(raw).hexdigest() == digest
                assert digest in KNOWN
                key = (excerpt['source'], digest)
                if key not in values:
                    values[key] = {'source': excerpt['source'], 'hash': digest, 'bytes': len(raw), 'packets': []}
                if n not in values[key]['packets']:
                    values[key]['packets'].append(n)
        chunks('Current evaluation full-original byte hashes; all agree with complete originals already read', list(values.values()), int(sys.argv[3]))
    elif mode == 'criteria':
        data, rows, criteria, aliases = dictionaries(sys.argv[2])
        chunks('Every exact current evaluation criterion', criteria, int(sys.argv[3]))
    elif mode == 'rows':
        data, rows, criteria, aliases = dictionaries(sys.argv[2])
        values = [[aliases[key], row] for key, row in sorted(rows.items())]
        chunks('Every current evaluation row and full relationship metadata', values, int(sys.argv[3]))
    elif mode == 'cells':
        data, rows, criteria, aliases = dictionaries(sys.argv[2])
        values = []
        for n, (entry, packet) in enumerate(data, 1):
            values.append({'number': n, 'run': Path(entry['run']).name, 'assignment': packet['assignment']['id'], 'cells': [[item, aliases[packet['cells'][item][0]], packet['cells'][item][1]] for item in packet['assignment']['items']]})
        chunks('Every owned current evaluation cell', values, int(sys.argv[3]))
    elif mode == 'context-reuse':
        old_data, old_rows, old_criteria, old_aliases = dictionaries('round-1')
        data, rows, criteria, aliases = dictionaries(sys.argv[2])
        def digest(value):
            return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        assert digest(rows) == digest(old_rows)
        assert digest(criteria) == digest(old_criteria)
        assert aliases == old_aliases
        emit('Exact context reuse after byte agreement; current assigned row/criterion objects compared with complete round-1 objects already read, no receipts read', {'round': sys.argv[2], 'rows': len(rows), 'row_metadata_sha256': digest(rows), 'criteria': len(criteria), 'criterion_objects_sha256': digest(criteria), 'row_aliases': aliases, 'reuse': 'Every row/relationship field and complete criterion wording is identical. Full original source bytes are checked separately by the sources mode. Current queue, assignment snapshots and owned cells are read independently.'})
    elif mode == 'write-round':
        decisions = runpy.run_path(str(BASE / 'audit-evaluate-decisions.py'))
        decisions['write_round'](sys.modules[__name__], sys.argv[2])
    elif mode == 'finish':
        log = LOG.read_text()
        sequence = [line for line in log.splitlines() if ' | ' in line and line[4:5] == '-' and line[10:11] == 'T']
        first_read = min(datetime.datetime.fromisoformat(line.split(' | ')[0]) for line in sequence)
        data = packets('round-1') + packets('round-2')
        receipts = [Path(entry['run']).parent / 'audit-evaluate-receipts' / (entry['assignment'] + '.json') for entry, packet in data]
        assert len(receipts) == 26 and all(path.exists() for path in receipts)
        emit('FINAL current Audit evaluation handoff', {'assignments': 26, 'cells': 188, 'per_round': {'pass': 46, 'finding_cells': 48, 'blocked': 0, 'finding_occurrences': 51, 'distinct_findings': 6}, 'packet_bytes': sum(Path(entry['packet']).stat().st_size for entry, packet in data), 'receipt_bytes': sum(path.stat().st_size for path in receipts), 'largest_receipt_bytes': max(path.stat().st_size for path in receipts), 'transcript_bytes_before_final_record': LOG.stat().st_size, 'elapsed_seconds_from_first_instrumented_read': round((datetime.datetime.now(datetime.timezone.utc) - first_read).total_seconds(), 3), 'timing_limit': 'Initial header discovery and helper setup preceded the first instrumented semantic read and are excluded from this measured interval.', 'observed_read_sequence': sequence, 'authority': 'Only own typed receipts and permitted helper/transcript artifacts written. No ledger, definition, hidden expected, baseline or other evaluator finding access. Root owns ingestion and independent finding confirmation.'})
    else:
        raise ValueError(mode)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        with LOG.open('a') as handle:
            handle.write('\n' + datetime.datetime.now(datetime.timezone.utc).isoformat() + ' | Reader failure\n' + traceback.format_exc())
        raise
