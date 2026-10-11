"""Read-only bounded projections of three completed procedural disclosure traces."""

import hashlib
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
TRACES = {
    'audit-final': BASE / 'fresh-audit-final/read-transcript.json',
    'author-repeat': BASE / 'fresh-author-repeat/trace.json',
    'audit-repeat': BASE / 'fresh-audit-repeat/read-evidence.json',
}


def records(name):
    data = json.loads(TRACES[name].read_text())
    result = []
    if name == 'audit-final':
        for n, record in enumerate(data['bootstrap_reads'], 1):
            result.append({'ref': 'bootstrap.' + str(n), 'command': record['command'], 'result': {'exit_code': record['exit_code']}, 'observation': record['observation']})
        for batch in data['batches']:
            results = batch.get('results', [batch.get('result')])
            assert len(batch['commands']) == len(results)
            for n, (command, outcome) in enumerate(zip(batch['commands'], results), 1):
                if isinstance(command, dict):
                    command = command['command']
                result.append({'ref': 'batch.' + str(batch['id']) + '.' + str(n), 'command': command, 'result': outcome.get('value', outcome)})
    elif name == 'author-repeat':
        result = [{'ref': 'step.' + str(record['step']), 'command': record['command'], 'result': record['result'], 'label': record['purpose']} for record in data['trace']]
    else:
        result = [{'ref': 'read.' + str(record['sequence']), 'command': record['cmd'], 'result': record['result'], 'label': record['label'], 'execution': record['execution'], 'truncation': record['truncation']} for record in data['records']]
    return result


def out(value, index=0):
    body = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    parts = [body[n:n + 7000] for n in range(0, len(body), 7000)]
    print(f'Exact chunk {index + 1}/{len(parts)}; {len(body)} characters total')
    print(parts[index])


def main():
    mode = sys.argv[1]
    if mode == 'structure':
        values = []
        for name, path in TRACES.items():
            data = json.loads(path.read_text())
            if isinstance(data, dict):
                shape = {key: {'type': type(value).__name__, 'length': len(value) if hasattr(value, '__len__') else None, 'first_keys': list(value[0]) if isinstance(value, list) and value and isinstance(value[0], dict) else None} for key, value in data.items()}
            else:
                shape = {'length': len(data), 'first_keys': list(data[0])}
            values.append({'name': name, 'bytes': path.stat().st_size, 'type': type(data).__name__, 'shape': shape})
        out(values)
    elif mode == 'result':
        out((TRACES[sys.argv[2]].parent / 'result.md').read_text(), int(sys.argv[3]))
    elif mode == 'raw':
        out(TRACES[sys.argv[2]].read_text(), int(sys.argv[3]))
    elif mode == 'skeleton':
        def compact(value, key=''):
            if isinstance(value, dict):
                return {k: compact(v, k) for k, v in value.items()}
            if isinstance(value, list):
                return [compact(v, key) for v in value]
            if isinstance(value, str) and len(value) > 350 and key not in ('cmd', 'command', 'commands'):
                return {'characters': len(value), 'sha256': hashlib.sha256(value.encode()).hexdigest(), 'first120': value[:120]}
            return value
        out(compact(json.loads(TRACES[sys.argv[2]].read_text())), int(sys.argv[3]))
    elif mode == 'commands':
        result = []
        prefixes = {
            '/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices': '<SKILL_TREE>',
            '/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices': '<RECORD>',
            '/home/mike1/projects/dev/workflow-server': '<WORKSPACE>',
        }
        for record in records(sys.argv[2]):
            command = record['command']
            for original, short in prefixes.items():
                command = command.replace(original, short)
            body = record['result'].get('output')
            result.append({'ref': record['ref'], 'command': command, 'exit': record['result'].get('exit_code'), 'output_chars': len(body) if body is not None else None, 'headings': [line for line in (body or '').splitlines() if re.match(r'^(\s*\d+\t)?#{1,6} ', line)], 'truncation': record.get('truncation'), 'observation': record.get('observation')})
        out({'prefixes': prefixes, 'count': len(result), 'commands': result}, int(sys.argv[3]))
    elif mode == 'record':
        record = next(r for r in records(sys.argv[2]) if r['ref'] == sys.argv[3])
        out(record, int(sys.argv[4]))
    elif mode == 'output-lines':
        record = next(r for r in records(sys.argv[2]) if r['ref'] == sys.argv[3])
        out('\n'.join(str(n) + ': ' + line for n, line in enumerate(record['result']['output'].splitlines(), 1)), int(sys.argv[4]))
    elif mode == 'duplicates':
        values = []
        for name in TRACES:
            groups = {}
            for record in records(name):
                body = record['result'].get('output', '')
                body = '\n'.join(line for line in body.splitlines() if line != 'Failed to create stream fd: Operation not permitted')
                if body:
                    groups.setdefault(body, []).append(record['ref'])
            values.append({'trace': name, 'duplicate_returns': [{'refs': refs, 'characters': len(body)} for body, refs in groups.items() if len(refs) > 1]})
        out(values)
    elif mode == 'stats':
        values = []
        for name in TRACES:
            rr = records(name)
            outputs = [r['result'].get('output') for r in rr]
            values.append({'trace': name, 'commands': len(rr), 'raw_output_records': sum(o is not None for o in outputs), 'raw_output_characters': sum(len(o) for o in outputs if o is not None), 'nonzero': [[r['ref'], r['result'].get('exit_code')] for r in rr if r['result'].get('exit_code') != 0], 'shell_noise': [r['ref'] for r in rr if 'Failed to create stream fd' in r['result'].get('output', '')], 'reported_truncations': [r['ref'] for r in rr if r.get('truncation', {}).get('returned_truncation_marker') or 'Warning: truncated output' in r['result'].get('output', '')], 'metadata': {k: v for k, v in json.loads(TRACES[name].read_text()).items() if k in ('truncation', 'read_only_measurements', 'observations')}})
        out(values)
    else:
        raise ValueError(mode)


if __name__ == '__main__':
    main()
