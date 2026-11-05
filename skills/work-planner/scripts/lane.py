"""Lane assignments, joined-unit consistency and request admission.

Indices are opaque decimal strings; an empty cell supplies None.
"""
import argparse
import json
import re
from pathlib import Path

LINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')
WID = re.compile(r'W\d\d')
WID_SHAPED = re.compile(r'W\d+')


def is_index(value: str) -> bool:
    """Whether the complete value is a decimal index, preserving its spelling."""
    return isinstance(value, str) and re.fullmatch(r'[0-9]+', value) is not None


def read_lanes(body: str) -> tuple[dict[str, str | None], list[str]]:
    """Raw task-table Lane values keyed by Wnn; only valid empty cells yield None.

    Malformed cells yield a row-specific problem and no value. Tables without a Lane column
    supply no lane data; issue-format validation checks the table's required columns.
    """
    lanes: dict[str, str | None] = {}
    problems = []
    header: list[str] = []
    for line in body.splitlines():
        if not line.startswith('|'):
            header = []
            continue
        raw = [cell.strip() for cell in line.strip().removeprefix('|').removesuffix('|').split('|')]
        if not header and 'Task' in raw:
            header = raw
            continue
        if not header or 'Lane' not in header:
            continue
        row = dict(zip(header, raw))
        task = LINK.sub(r'\1', row.get('Task', ''))
        ids = WID_SHAPED.findall(task)
        if not ids or not task.startswith(ids[0]) or not WID.fullmatch(ids[0]):
            continue
        wid = ids[0]
        if 'Lane' not in row:
            problems.append(f'{wid}: missing Lane cell')
            continue
        lane = row['Lane']
        if lane and not is_index(lane):
            problems.append(f'{wid}: Lane must be a bare decimal index or empty; got {lane!r}')
            continue
        lanes[wid] = lane or None
    return lanes, problems


def check_unit(members, assignments):
    """Return the common lane and a finding for missing or differing assignments."""
    members = sorted(members)
    missing = [row for row in members if row not in assignments]
    if missing:
        return None, 'missing Lane data: ' + ', '.join(missing)
    if len({assignments[row] for row in members}) > 1:
        values = '; '.join(f'{row} = {assignments[row] if assignments[row] is not None else "empty"}'
                           for row in members)
        return None, f'joined unit has different Lane cells: {values}; move a lane or unjoin the rows'
    return assignments[members[0]] if members else None, None


def admits(lane: str | None, requested: str | None) -> bool:
    """Whether a valid unit lane is admitted by the supplied request."""
    if requested is not None and not is_index(requested):
        raise ValueError('requested lane must be a bare decimal index')
    return lane is None or lane == requested


def label(lane: str | None) -> str:
    """The lane's report representation."""
    return f'lane {lane}' if lane is not None else 'unlaned'


def assign_lanes(body: str, assignments: dict[str, str | None]) -> str:
    """Apply a confirmed row map, preserving all other cells and body bytes.

    Refuse unknown rows, malformed values and malformed resulting tables before returning.
    Joined-unit membership is supplied separately to check_unit.
    """
    header = []
    found = set()
    result = []
    for row, lane in assignments.items():
        if lane is not None and not is_index(lane):
            raise ValueError(f'{row}: Lane must be a bare decimal index or null')
    for line in body.splitlines(keepends=True):
        if not line.startswith('|'):
            header = []
        else:
            cells = line.split('|')
            trailing = line.rstrip('\r\n').endswith('|')
            raw = [cell.strip() for cell in (cells[1:-1] if trailing else cells[1:])]
            if not header and 'Task' in raw:
                header = raw
            elif header and 'Lane' in header:
                task = LINK.sub(r'\1', raw[header.index('Task')]) if len(raw) > header.index('Task') else ''
                ids = WID_SHAPED.findall(task)
                wid = ids[0] if ids and task.startswith(ids[0]) and WID.fullmatch(ids[0]) else ''
                if wid in assignments:
                    index = header.index('Lane') + 1
                    if index >= len(cells) - int(trailing):
                        raise ValueError(f'{wid}: missing Lane cell')
                    ending = cells[index][len(cells[index].rstrip('\r\n')):]
                    cells[index] = ' ' + (assignments[wid] or '') + ' ' + ending
                    line = '|'.join(cells)
                    found.add(wid)
        result.append(line)
    unknown = sorted(assignments.keys() - found)
    if unknown:
        raise ValueError('unknown task rows: ' + ', '.join(unknown))
    updated = ''.join(result)
    _, problems = read_lanes(updated)
    if problems:
        raise ValueError('; '.join(problems))
    return updated


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=('read', 'assign', 'check', 'admit'))
    parser.add_argument('body', type=Path)
    parser.add_argument('--map', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--unit', help='comma-separated task ids')
    parser.add_argument('--lane')
    args = parser.parse_args(argv)
    try:
        with args.body.open(newline='') as source:
            body = source.read()
        if args.operation == 'assign':
            if args.map is None or args.out is None:
                parser.error('assign requires --map and --out')
            assignments = json.loads(args.map.read_text())
            if not isinstance(assignments, dict):
                raise ValueError('lane map must be a JSON object')
            updated = assign_lanes(body, assignments)
            args.out.write_text(updated, newline='')
            return 0
        assignments, problems = read_lanes(body)
        result = {'assignments': assignments, 'problems': problems}
        if args.operation in ('check', 'admit'):
            if not args.unit:
                parser.error('check and admit require --unit')
            lane, finding = check_unit(args.unit.split(','), assignments)
            if finding:
                problems.append(finding)
            result['lane'] = lane
            if args.operation == 'admit':
                malformed = {problem.partition(':')[0] for problem in problems}
                valid = finding is None and not malformed.intersection(args.unit.split(','))
                result['admitted'] = admits(lane, args.lane) and valid
        print(json.dumps(result))
        return int(bool(problems))
    except (OSError, ValueError) as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    raise SystemExit(main())
