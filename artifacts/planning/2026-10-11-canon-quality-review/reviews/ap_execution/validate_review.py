"""Validate this review's identifiers, source quotations and artifact bounds."""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time

started = time.monotonic()
here = Path(__file__).resolve().parent
record = here.parents[1]
inventory = json.loads((record / "inventory.json").read_text())
units = {entry["id"]: entry for entry in inventory["entries"]}
revision = "e70b44778f71d9d699f746f78a16b892531c82d3"
assert inventory["revision"] == revision


def find_owner(node):
    if isinstance(node, dict):
        if "ap_execution" in node:
            return node["ap_execution"]
        for value in node.values():
            match = find_owner(value)
            if match is not None:
                return match
    return None


owner = find_owner(inventory)
assert owner is not None
expected = owner["entries"]
assert expected == [f"AP-{number}" for number in range(69, 124)]
source_texts = {}
source_checks = []
for source in inventory["sources"]:
    raw = (record / source["capture"]).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == source["sha256"]
    assert len(raw) == source["bytes"]
    source_texts[source["capture"]] = raw.decode().splitlines()
    source_checks.append(dict(source=source["capture"], bytes=len(raw), sha256=digest))

file_checks = []
ledgers = []
findings = []
for pattern, key, destination in (("ledger-*.json", "entries", ledgers), ("findings-*.json", "findings", findings)):
    for path in sorted(here.glob(pattern)):
        raw = path.read_bytes()
        assert len(raw) <= 16000, path.name
        document = json.loads(raw)
        assert document["revision"] == revision
        if key == "entries":
            assert len(document[key]) <= 8
        destination.extend(document[key])
        file_checks.append(dict(file=path.name, bytes=len(raw), records=len(document[key])))
assert [entry["id"] for entry in ledgers] == expected
finding_ids = [finding["id"] for finding in findings]
assert len(finding_ids) == len(set(finding_ids))
for entry in ledgers:
    assert entry["disposition"] in ("clear", "finding", "improvement")
    assert set(entry["checks"]) == {"scope", "observable", "consistency", "exceptions", "fix", "expression"}
    assert all(isinstance(value, str) and value.strip() for value in entry["checks"].values())
    assert entry["rationale"].strip()
    assert all(ident in finding_ids for ident in entry["finding_ids"])
    assert all(ident in units for ident in entry["related_ids"])
    if entry["disposition"] != "clear":
        assert entry["finding_ids"], entry["id"]

quote_count = 0
for finding in findings:
    assert set(finding) == {"id", "kind", "priority", "entries", "evidence", "problem", "witness", "proposed_fix", "observing_check"}
    assert any(ident in expected for ident in finding["entries"])
    assert all(ident in units for ident in finding["entries"])
    assert finding["observing_check"]["positive"].strip()
    assert finding["observing_check"]["negative"].strip()
    for evidence in finding["evidence"]:
        unit = units[evidence["entry"]]
        assert unit["start"] <= evidence["start"] <= evidence["end"] <= unit["end"], evidence
        text = "\n".join(source_texts[unit["source"]][evidence["start"] - 1:evidence["end"]])
        assert evidence["quote"] in text, evidence
        quote_count += 1

reads = [json.loads(line) for line in (here / "read-log.jsonl").read_text().splitlines()]
latest = {(read["source"], tuple(read["range"])): read for read in reads}
coverage = {}
for source, lines in source_texts.items():
    reached = set()
    for (name, bounds), read in latest.items():
        if name == source:
            reached.update(range(bounds[0], bounds[1] + 1))
    assert reached == set(range(1, len(lines) + 1)), source
    coverage[source] = dict(lines=len(lines), unique_lines_read=len(reached))

finished = datetime.now(timezone.utc)
first_read = min(datetime.fromisoformat(read["started_at"]) for read in reads)
last_read = max(datetime.fromisoformat(read["started_at"]) for read in reads)
report = dict(
    command="python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_execution/validate_review.py",
    cwd="/home/mike1/projects/dev/workflow-server",
    revision=revision,
    completed_at=finished.isoformat(),
    outcome="passed",
    primary_entries=len(ledgers),
    dispositions=dict(Counter(entry["disposition"] for entry in ledgers)),
    finding_records=len(findings),
    priorities=dict(Counter(finding["priority"] for finding in findings)),
    evidence_quotes_verified=quote_count,
    sources=source_checks,
    file_bounds=file_checks,
    source_coverage=coverage,
    unique_source_bytes=sum(item["bytes"] for item in source_checks),
    logged_source_read_bytes=sum(read["read_bytes"] for read in reads),
    source_read_execution_seconds=sum(read["elapsed_seconds"] for read in reads),
    first_logged_read=first_read.isoformat(),
    last_logged_read=last_read.isoformat(),
    logged_read_window_seconds=(last_read - first_read).total_seconds(),
    elapsed_from_first_logged_read_seconds=(finished - first_read).total_seconds(),
    validation_seconds=time.monotonic() - started,
)
(here / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
