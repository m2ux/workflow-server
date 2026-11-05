"""Emit original document bytes within a heading boundary from the shared lexer."""
import argparse
import json
from pathlib import Path
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent / 'source/skills/scripts'))
from check_skill_files import parse

parser = argparse.ArgumentParser()
parser.add_argument('--log', required=True)
parser.add_argument('path')
parser.add_argument('--heading')
args = parser.parse_args()
path = Path(args.path).resolve()
raw = path.read_bytes()
text = raw.decode('utf-8')
lines = text.splitlines(keepends=True)
_, _, headings = parse(text)
start, end = 0, len(lines)
if args.heading:
    found = [(index, depth) for index, depth, title in headings if title == args.heading]
    if len(found) != 1:
        raise SystemExit(f'expected one heading {args.heading!r}: {found}')
    start, depth = found[0]
    end = next((index for index, level, _ in headings if index > start and level <= depth), end)
content = ''.join(lines[start:end])
emitted = content.encode('utf-8')
log = Path(args.log)
log.mkdir(parents=True, exist_ok=True)
with tempfile.NamedTemporaryFile(prefix='read-', suffix='.txt', dir=log, delete=False) as output:
    output.write(emitted)
    target = Path(output.name)
with (log / 'reads.jsonl').open('a', encoding='utf-8', newline='') as output:
    output.write(json.dumps({'source': str(path), 'heading': args.heading,
                            'start_line': start + 1, 'end_line': end,
                            'returned_file': str(target), 'characters': len(content),
                            'bytes': len(emitted), 'lines': end - start}) + '\n')
sys.stdout.buffer.write(emitted)
