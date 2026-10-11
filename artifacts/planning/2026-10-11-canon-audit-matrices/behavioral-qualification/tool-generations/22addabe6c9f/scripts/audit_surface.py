"""Coordinate complete canon matrices and independently verified audit evidence."""

import argparse
import json
import sys
from pathlib import Path

from audit_common import AuditError, digest, read_json, require, write_json
from audit_dispatch import packet, plan_assignments
from audit_inventory import inventory
from audit_render import render
from audit_state import bind, gate, ingest, refresh, reset


def save(state, folder):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    state['run'] = str(folder.resolve())
    state['rendered'] = render(state, folder)
    write_json(folder / 'audit-state.json', state)


def status_summary(state):
    """Expose bounded navigation and counts while the ledger retains every item."""
    status = gate(state)
    result = {key: value for key, value in status.items()
              if key not in ('inventory_missing', 'obligations_missing', 'findings', 'stale')}
    result.update(snapshot=state['snapshot'],
                  inventory_missing=len(status['inventory_missing']),
                  obligations_missing=len(status['obligations_missing']),
                  findings=len(status['findings']), stale_count=len(status['stale']),
                  stale=status['stale'][:10],
                  artifacts={name: str(Path(state['run']) / name) for name in
                             ('audit-report.md', 'audit-coverage.md', 'audit-state.json')})
    result['assignments'] = {phase: {disposition: sum(job['phase'] == phase and
                           job['status'] == disposition for job in state['assignments'].values())
                           for disposition in ('pending', 'partial', 'returned', 'failed', 'invalidated')}
                           for phase in ('map', 'inventory', 'verify', 'evaluate', 'obligations')}
    return result


def parser():
    result = argparse.ArgumentParser(description=__doc__)
    commands = result.add_subparsers(dest='command', required=True)
    init = commands.add_parser('init')
    init.add_argument('--root', required=True)
    init.add_argument('--engine', required=True)
    init.add_argument('--scope', required=True)
    init.add_argument('--actor', required=True)
    for name in ('init', 'status', 'render', 'plan', 'bind', 'packet', 'submit', 'reset', 'refresh', 'retry'):
        command = init if name == 'init' else commands.add_parser(name)
        command.add_argument('--run', required=True)
        if name == 'status':
            command.add_argument('--require', choices=('map', 'complete'))
        elif name == 'plan':
            command.add_argument('--phase', choices=('map', 'verify', 'evaluate', 'inventory', 'obligations'), required=True)
            command.add_argument('--budgets', required=True)
        elif name in ('bind', 'packet', 'retry'):
            command.add_argument('--assignment', required=True)
            if name == 'bind':
                command.add_argument('--actor', required=True)
            if name == 'packet':
                command.add_argument('--out', required=True)
            if name == 'retry':
                command.add_argument('--reason', required=True)
        elif name == 'submit':
            command.add_argument('--receipt', required=True)
        elif name == 'reset':
            command.add_argument('--items', required=True, help='JSON array of cell IDs')
            command.add_argument('--reason', required=True)
        elif name == 'refresh':
            command.add_argument('--scope')
    return result


def main(argv=None):
    args = parser().parse_args(argv)
    folder = Path(args.run).resolve()
    try:
        if args.command == 'init':
            require(not (folder / 'audit-state.json').exists(), 'Run exists; refresh or choose another run')
            state = inventory(args.root, args.engine, read_json(args.scope), args.actor)
            save(state, folder)
            output = status_summary(state)
        else:
            state = read_json(folder / 'audit-state.json')
            output = None
            if args.command == 'status':
                output = status_summary(state)
                print(json.dumps(output, indent=2))
                if args.require:
                    return 0 if output['mapping_ready' if args.require == 'map' else 'complete'] else 2
                return 0
            if args.command == 'plan':
                output = plan_assignments(state, args.phase, read_json(args.budgets))
            elif args.command == 'bind':
                require(args.assignment in state['assignments'], 'Unknown assignment')
                bind(state, args.assignment, args.actor)
            elif args.command == 'packet':
                require(args.assignment in state['assignments'], 'Unknown assignment')
                write_json(args.out, packet(state, args.assignment))
                return 0
            elif args.command == 'submit':
                receipt = read_json(args.receipt)
                state = ingest(state, receipt)
                destination = folder / 'worker-results' / receipt['assignment'] / (receipt['attempt'] + '.json')
                require(not destination.exists(), 'Immutable worker result already exists')
                write_json(destination, receipt)
            elif args.command == 'reset':
                reset(state, read_json(args.items), args.reason)
            elif args.command == 'refresh':
                updated = refresh(state, read_json(args.scope) if args.scope else None)
                if updated['snapshot'] != state['snapshot']:
                    write_json(folder / 'generations' / state['snapshot'] / 'audit-state.json', state)
                state = updated
            elif args.command == 'retry':
                require(args.assignment in state['assignments'], 'Unknown assignment')
                assignment = state['assignments'][args.assignment]
                assignment['status'] = 'failed'
                state['history'].append({'retry': args.assignment, 'reason': args.reason})
            save(state, folder)
            output = output or status_summary(state)
        print(json.dumps(output, indent=2))
        return 0
    except (AuditError, OSError, KeyError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
