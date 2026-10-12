"""Project a subagent transcript into an ordered retrieval trace.

A dispatch writes a JSONL transcript holding the worker's tool calls, so a
coordinator observes what a worker retrieved without asking the worker. Shell
commands that read files are normalised into the same path-and-range shape as
the read tool; a shape this does not recognise is reported unparsed rather than
counted as no read.
"""

import json
import re
import sys
from pathlib import Path

PATH = r'([^\s;|&><\'"]*[^\s;|&><\'"/][^\s;|&><\'"]*)'
FLAGS = r'(?:-[A-Za-z]+\s+)*'
SHELL = [
    (re.compile(r"\bsed\s+-n\s+'?(\d+),(\d+)p'?\s+" + FLAGS + PATH), lambda m: (m.group(3), int(m.group(1)), int(m.group(2)))),
    (re.compile(r"\bsed\s+-n\s+'?(\d+)p'?\s+" + FLAGS + PATH), lambda m: (m.group(2), int(m.group(1)), int(m.group(1)))),
    (re.compile(r'\bhead\s+-n?\s*(\d+)\s+' + FLAGS + PATH), lambda m: (m.group(2), 1, int(m.group(1)))),
    (re.compile(r'\btail\s+-n\s*\+(\d+)\s+' + FLAGS + PATH), lambda m: (m.group(2), int(m.group(1)), None)),
    (re.compile(r'\bcat\s+' + FLAGS + PATH), lambda m: (m.group(1), 1, None)),
]
CD = re.compile(r'\bcd\s+(/[^\s;|&><\'"]+)')
NAVIGATE = re.compile(r'\b(grep|rg|ls|wc|find|glob|git|rev-parse|awk)\b')


def shell_reads(command):
    """Every file range a shell command delivers, in command order.

    A relative target resolves against the nearest preceding cd, since the
    worker's own shell resolved it that way.
    """
    directories = [(m.start(), m.group(1)) for m in CD.finditer(command)]
    found = []
    for pattern, build in SHELL:
        for match in pattern.finditer(command):
            target, start, end = build(match)
            if not target.startswith('/'):
                prior = [path for at, path in directories if at < match.start()]
                if not prior:
                    continue
                target = str(Path(prior[-1]) / target)
            found.append((match.start(), (target, start, end)))
    return [item for _, item in sorted(found)]


def calls(path):
    for line in Path(path).read_text(errors='replace').splitlines():
        try:
            row = json.loads(line)
        except ValueError:
            continue
        if row.get('type') != 'assistant':
            continue
        content = row.get('message', {}).get('content')
        if not isinstance(content, list):
            continue
        for block in content:
            if block.get('type') == 'tool_use':
                yield block.get('name'), block.get('input') or {}


def trace(path):
    """One entry per delivered range: (kind, file, start, end, detail)."""
    out = []
    for name, data in calls(path):
        if name == 'Read':
            start = data.get('offset') or 1
            limit = data.get('limit')
            out.append(('read', data.get('file_path', '?'), start, (start + limit - 1) if limit else None, 'Read tool'))
        elif name == 'Bash':
            command = (data.get('command') or '').replace('\n', ' ')
            ranges = shell_reads(command)
            for target, start, end in ranges:
                out.append(('read', target, start, end, 'shell'))
            if not ranges:
                kind = 'navigate' if NAVIGATE.search(command) else 'unparsed'
                out.append((kind, None, None, None, command[:150]))
        elif name in ('Grep', 'Glob'):
            out.append(('navigate', None, None, None, f"{name} {data.get('pattern', '')} in {data.get('path', '.')}"))
        elif name != 'SubagentHandback':
            out.append(('other', None, None, None, name))
    return out


def covers(entry, line):
    _, _, start, end = entry[0:4][1:]
    return start is not None and start <= line and (end is None or line >= start and end >= line)


if __name__ == '__main__':
    for path in sys.argv[1:]:
        entries = trace(path)
        reads = [item for item in entries if item[0] == 'read']
        unparsed = [item for item in entries if item[0] == 'unparsed']
        print(f'=== {Path(path).name}: {len(entries)} calls, {len(reads)} delivered ranges, {len(unparsed)} unparsed')
        for index, (kind, target, start, end, detail) in enumerate(entries, 1):
            if kind == 'read':
                where = f'{start}-{end}' if end else f'{start}-end'
                print(f'{index:3d}. read      {Path(target).name:<28} {where:>12}  {target}')
            else:
                print(f'{index:3d}. {kind:<9} {detail}')
        print()
