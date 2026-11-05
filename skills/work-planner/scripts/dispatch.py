"""Select a dispatch batch from an admitted delivery plan and validate each start.

Usage:
  python3 dispatch.py batch --authorization run.json --plan available.json
      --sessions sessions.json --capacity 2 --board users/o/projectsV2/7 [--lane 2]
      [--preparations preparations.json]
  python3 dispatch.py start --batch batch.json --unit 'o/r#I07:E00:W01'
      --evidence start.json --sessions sessions.json --capacity 1

The delivery survey supplies eligibility and order. Authorization, observed sessions and
currently free harness slots constrain the batch. Start evidence identifies the published
record and the reservation read back from the tracker. No command contacts the tracker or
starts a worker. The owning procedure performs those effects and supplies their evidence.
"""
import argparse
import json
import re
import sys
from pathlib import Path

IDENTITY = re.compile(r'[^/#\s]+/[^/#\s]+#(?:I\d\d(?::E\d\d(?::W\d\d(?:\+W\d\d)*)?)?|F\d\d)')
STATES = {'preparing', 'running', 'review', 'blocked', 'completed'}


def members(identity: str) -> set[str]:
    """Repository-qualified rows of one selector or joined unit."""
    if not isinstance(identity, str) or not IDENTITY.fullmatch(identity):
        raise ValueError(f'invalid dispatch identity: {identity}')
    repo, tag = identity.split('#')
    prefix, _, tasks = tag.rpartition(':')
    if tasks.startswith('W'):
        return {f'{repo.lower()}#{prefix}:{task}' for task in tasks.split('+')}
    return {f'{repo.lower()}#{tag}'}


def within(identity: str, scope: list[str]) -> bool:
    """Every member of a joined unit must be authorized."""
    if scope == ['*']:
        return True
    allowed = {member for selector in scope for member in members(selector)}
    return all(any(member == selector or member.startswith(selector + ':')
                   for selector in allowed) for member in members(identity))


def unit_members(identity: str) -> set[str]:
    """A worker or admitted offer names concrete task rows or one hot-fix."""
    rows = members(identity)
    if any('#I' in row and ':W' not in row for row in rows):
        raise ValueError('a dispatch unit must name task rows or a hot-fix')
    return rows


def inventory(sessions: list[dict]) -> set[str]:
    """Rows held by observed sessions, including workers awaiting input or review."""
    occupied = set()
    seen = set()
    for session in sessions:
        rows = unit_members(session['unit'])
        if session['state'] not in STATES or not session.get('session'):
            raise ValueError('each session needs an observed identity and valid state')
        if session['session'] in seen:
            raise ValueError('session inventory repeats a worker')
        seen.add(session['session'])
        if session['state'] != 'completed':
            occupied.update(rows)
    return occupied


def batch(authorization: dict, plan: list[dict], sessions: list[dict], capacity: int,
          board: str, lane: str | None = None, preparations: list[dict] | None = None) -> dict:
    """An ordered batch bounded by one authorization and actual free worker capacity."""
    if capacity < 0:
        raise ValueError('capacity must be a nonnegative count of currently free harness slots')
    if lane is not None and not re.fullmatch(r'[0-9]+', lane):
        raise ValueError('lane must be a bare decimal index')
    if board != authorization['board'] or lane != authorization['lane']:
        raise ValueError('survey board and requested lane must match the authorization')
    scope = authorization['scope']
    if not isinstance(scope, list) or not scope:
        raise ValueError('authorization needs a nonempty scope')
    # Validate the whole scope even when the survey offers no work.
    if scope != ['*']:
        for selector in scope:
            members(selector)
    occupied = inventory(sessions)
    preparing = False
    for preparation in preparations or []:
        occupied.update(unit_members(preparation['id']))
        if not preparation.get('record'):
            raise ValueError('a preparation needs its selected planning record')
        preparing = preparing or within(preparation['id'], scope)
    selected = []
    pending = 0
    for unit in plan:
        rows = unit_members(unit['id'])
        if not unit.get('record') or not unit.get('report'):
            raise ValueError('an admitted unit needs its planning record and survey report')
        if not within(unit['id'], scope) or rows & occupied:
            continue
        pending += 1
        occupied.update(rows)
        if len(selected) < capacity:
            selected.append(unit)
    running = any(session['state'] in {'running', 'preparing'}
                  and within(session['unit'], scope) for session in sessions)
    action = 'dispatch' if selected else 'wait' if running or pending or preparing else 'stop'
    return {'action': action, 'units': selected, 'pending': pending - len(selected)}


def check_start(selected: dict, identity: str, evidence: dict,
                sessions: list[dict], capacity: int) -> dict:
    """Confirm one selected unit's publication, reservation and current execution capacity."""
    unit = next((unit for unit in selected['units'] if unit['id'] == identity), None)
    if unit is None:
        raise ValueError('start must name a unit in the selected batch')
    if capacity <= 0:
        raise ValueError('start needs a currently free harness slot')
    if unit_members(identity) & inventory(sessions):
        raise ValueError('start would duplicate a held or running session')
    if evidence.get('unit') != identity:
        raise ValueError('start evidence must name the selected unit')
    if evidence.get('published_record') != unit['record']:
        raise ValueError('planning record publication is unverified')
    if evidence.get('reserved_record') != unit['record']:
        raise ValueError('reservation must hold the published planning record')
    if evidence.get('reservation_verified') is not True:
        raise ValueError('reservation readback is unverified')
    return unit


def read(path: str):
    return json.loads(Path(path).read_text())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    select = commands.add_parser('batch')
    select.add_argument('--authorization', required=True)
    select.add_argument('--plan', required=True)
    select.add_argument('--board', required=True)
    select.add_argument('--lane')
    select.add_argument('--preparations', help='this run\'s admitted preparations awaiting capacity')
    start = commands.add_parser('start')
    start.add_argument('--batch', required=True)
    start.add_argument('--unit', required=True)
    start.add_argument('--evidence', required=True)
    for command in (select, start):
        command.add_argument('--sessions', required=True)
        command.add_argument('--capacity', type=int, required=True)
    args = parser.parse_args()
    try:
        if args.command == 'batch':
            result = batch(read(args.authorization), read(args.plan), read(args.sessions),
                           args.capacity, args.board, args.lane,
                           read(args.preparations) if args.preparations else None)
        else:
            result = check_start(read(args.batch), args.unit, read(args.evidence),
                                 read(args.sessions), args.capacity)
    except (ValueError, KeyError, TypeError, OSError) as exc:
        parser.exit(1, f'dispatch: {exc}\n')
    print(json.dumps(result, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
