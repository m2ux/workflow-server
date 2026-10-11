"""Read captured canon text with a bounded output and an append-only read log."""
import datetime
import hashlib
import json
from pathlib import Path
import sys
import time

started = time.monotonic()
started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
record = Path(__file__).resolve().parents[2]
name, start_text, end_text = sys.argv[1:]
start, end = int(start_text), int(end_text)
source = record / "sources" / name
raw = source.read_bytes()
lines = raw.decode("utf-8").splitlines(keepends=True)
assert 1 <= start <= end <= len(lines)
body = "".join(lines[start - 1:end])
assert len(body.encode("utf-8")) <= 24000
print(f"SOURCE {name} L{start}-L{end}; {len(body.encode('utf-8'))} source bytes")
print("".join(f"{number}: {line}" for number, line in enumerate(lines[start - 1:end], start)), end="")
log = {
    "started_at": started_at,
    "command": "python3 "
    ".engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_execution/read_source.py "
    f"{name} {start} {end}",
    "cwd": "/home/mike1/projects/dev/workflow-server",
    "revision": "e70b44778f71d9d699f746f78a16b892531c82d3",
    "source": "sources/" + name,
    "sha256": hashlib.sha256(raw).hexdigest(),
    "range": [start, end],
    "source_bytes": len(raw),
    "read_bytes": len(body.encode("utf-8")),
    "elapsed_seconds": time.monotonic() - started,
    "outcome": "read_complete",
}
with Path(__file__).with_name("read-log.jsonl").open("a", encoding="utf-8") as handle:
    handle.write(json.dumps(log) + "\n")
