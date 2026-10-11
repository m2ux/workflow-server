"""Bounded projections of retained selector-cycle tool receipts."""

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def records(walk):
    for path in sorted((ROOT / walk).glob('trace-*.json')):
        data = json.loads(path.read_text())
        rows = data.get('records', []) if isinstance(data, dict) else data
        for row in rows:
            args = row.get('arguments', row.get('args', row.get('call', {}).get('args', {})))
            raw = row.get('raw_return', row.get('result', {}))
            if isinstance(raw, dict) and raw.get('status') == 'fulfilled':
                raw = raw['value']
            command = args.get('cmd') if isinstance(args, dict) else None
            command = command or row.get('cmd') or row.get('command')
            yield path.name, row.get('sequence', row.get('id')), command, raw


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['commands', 'record', 'stats'])
    parser.add_argument('walk')
    parser.add_argument('--sequence')
    parser.add_argument('--start', type=int, default=0)
    parser.add_argument('--limit', type=int, default=100)
    args = parser.parse_args()
    rr = list(records(args.walk))
    if args.mode == 'stats':
        commands = [r for r in rr if r[2]]
        print(json.dumps({
            'walk': args.walk,
            'records': len(rr),
            'commands': len(commands),
            'nonzero': [[r[1], r[3].get('exit_code')] for r in commands if r[3].get('exit_code') not in (0, None)],
            'truncation_markers': [r[1] for r in commands if re.search(r'Warning: truncated|\d+ tokens truncated|output truncated', r[3].get('output', ''), re.IGNORECASE)],
            'raw_characters': sum(len(r[3].get('output', '')) for r in commands),
            'trace_files': [{'path': p.name, 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted((ROOT / args.walk).glob('trace-*.json'))]
        }, indent=2))
    elif args.mode == 'record':
        found = [r for r in rr if str(r[1]) == args.sequence]
        for row in found:
            body = json.dumps(row, ensure_ascii=False, indent=2)
            print(body[args.start:args.start + args.limit])
            print(f'Full record characters: {len(body)}; projection starts at {args.start}.')
    else:
        prefixes = {
            '/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices': '<SKILL>',
            '/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-audit-matrices': '<RECORD>',
            '/home/mike1/projects/dev/workflow-server': '<WORKSPACE>',
        }
        for path, seq, command, raw in rr[args.start:args.start + args.limit]:
            if not command:
                continue
            for original, label in prefixes.items():
                command = command.replace(original, label)
            body = raw.get('output', '')
            headings = [line for line in body.splitlines() if re.match(r'^(?:\s*\d+\s+)?#{1,6} ', line)]
            print(json.dumps({'file': path, 'sequence': seq, 'command': command, 'exit': raw.get('exit_code'), 'chars': len(body), 'headings': headings}, ensure_ascii=False))


if __name__ == '__main__':
    main()
