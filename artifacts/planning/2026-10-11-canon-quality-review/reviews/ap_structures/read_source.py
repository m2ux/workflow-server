"""Print a bounded captured source range and record its exact read evidence."""
from pathlib import Path
import hashlib
import json
import sys
import time
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[2]
output = Path(__file__).resolve().parent
name, first, last = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
started = time.monotonic()
at = datetime.now(timezone.utc).isoformat()
source = root / "sources" / name
raw = source.read_bytes()
lines = raw.splitlines(keepends=True)
selected = b"".join(lines[first - 1:last])
record = {
    "utc": at,
    "command": "python3 " + str(Path(__file__).relative_to(Path.cwd())) + " " + " ".join(sys.argv[1:]),
    "cwd": str(Path.cwd()),
    "source": str(source.relative_to(root)),
    "revision": "e70b44778f71d9d699f746f78a16b892531c82d3",
    "source_sha256": hashlib.sha256(raw).hexdigest(),
    "source_bytes": len(raw),
    "range": [first, last],
    "selected_bytes": len(selected),
    "selected_sha256": hashlib.sha256(selected).hexdigest(),
    "outcome": "complete bounded range emitted; tool truncation recorded separately if any",
    "read_elapsed_seconds": time.monotonic() - started,
}
with (output / "read-log.jsonl").open("a") as handle:
    handle.write(json.dumps(record) + "\n")
print(json.dumps(record))
for number, line in enumerate(selected.decode().splitlines(), first):
    print(f"{number:4d} {line}")
