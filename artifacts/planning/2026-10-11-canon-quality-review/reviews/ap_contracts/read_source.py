import datetime
import hashlib
import json
import pathlib
import shlex
import sys
import time

started = time.perf_counter()
timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
output = pathlib.Path(__file__).resolve().parent
record = output.parent.parent
source_name, start_arg, end_arg = sys.argv[1:]
start, end = int(start_arg), int(end_arg)
source = record / source_name
raw = source.read_bytes()
lines = raw.decode('utf-8').splitlines(keepends=True)
assert 1 <= start <= end <= len(lines)
fragment = ''.join(lines[start - 1:end])
rendered = ''.join(f'{number}: {line}' for number, line in enumerate(lines[start - 1:end], start))
identity = hashlib.sha256(raw).hexdigest()
log = {
    'timestamp_utc': timestamp,
    'command': 'python3 ' + shlex.join(sys.argv),
    'cwd': str(pathlib.Path.cwd()),
    'source': source_name,
    'source_bytes': len(raw),
    'source_lines': len(lines),
    'source_sha256': identity,
    'range_start': start,
    'range_end': end,
    'fragment_utf8_bytes': len(fragment.encode('utf-8')),
    'rendered_utf8_bytes': len(rendered.encode('utf-8')),
    'read_elapsed_seconds': time.perf_counter() - started,
    'outcome': 'printed requested complete range; model must note any tool-output truncation separately',
}
print(json.dumps(log, ensure_ascii=False))
print(rendered, end='')
with (output / 'read-log.jsonl').open('a', encoding='utf-8') as handle:
    handle.write(json.dumps(log, ensure_ascii=False) + '\n')
