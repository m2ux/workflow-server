import datetime
import hashlib
import json
import pathlib
import time

started = time.perf_counter()
out = pathlib.Path(__file__).resolve().parent
record = out.parent.parent
inventory = json.loads((record / 'inventory.json').read_text())
revision = inventory['revision']
units = {entry['id']: entry for entry in inventory['entries']}
expected = set(inventory['assignments']['ap_contracts']['entries'])
logs = [json.loads(line) for line in (out / 'read-log.jsonl').read_text().splitlines()]
source_results = []
for source in inventory['sources']:
    raw = (record / source['capture']).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == source['sha256']
    assert len(raw) == source['bytes']
    records = sorted((log for log in logs if log['source'] == source['capture']), key=lambda log: log['range_start'])
    next_line = 1
    for log in records:
        assert log['source_sha256'] == digest
        assert log['range_start'] == next_line
        next_line = log['range_end'] + 1
    assert next_line == source['lines'] + 1
    assert sum(log['fragment_utf8_bytes'] for log in records) == len(raw)
    source_results.append({'source': source['capture'], 'bytes': len(raw), 'lines': source['lines'],
                           'sha256': digest, 'read_commands': len(records), 'coverage': 'complete, contiguous, no overlap',
                           'ranges': [[log['range_start'], log['range_end']] for log in records]})

ledger = []
findings = []
files = []
finding_homes = {}
for pattern, key in [('ledger-*.json', 'entries'), ('findings-*.json', 'findings')]:
    for path in sorted(out.glob(pattern)):
        raw = path.read_bytes()
        assert len(raw) <= 16000
        data = json.loads(raw)
        assert data['revision'] == revision
        assert data['reviewer'] == 'ap_contracts'
        if key == 'entries':
            assert len(data[key]) <= 8
            ledger.extend(data[key])
        else:
            findings.extend(data[key])
            for finding in data[key]:
                finding_homes[finding['id']] = path.name
        files.append({'path': path.name, 'bytes': len(raw), 'count': len(data[key])})
assert len(ledger) == len(expected) == len({entry['id'] for entry in ledger})
assert {entry['id'] for entry in ledger} == expected
finding_ids = {finding['id'] for finding in findings}
assert len(finding_ids) == len(findings)
all_references = set()
for entry in ledger:
    assert entry['disposition'] in ('clear', 'finding', 'improvement')
    assert set(entry['checks']) == {'scope', 'observable', 'consistency', 'exceptions', 'fix', 'expression'}
    assert all(isinstance(value, str) and len(value) >= 20 for value in entry['checks'].values())
    assert set(entry['finding_ids']) <= finding_ids
    assert all(related in units for related in entry['related_ids'])
    if entry['disposition'] != 'clear':
        assert entry['finding_ids']
    all_references.update(entry['finding_ids'])
assert all_references == finding_ids
evidence_count = 0
for finding in findings:
    assert set(finding['entries']) <= expected
    assert finding['kind'] in {'repair-conflict', 'missing-exception', 'unsound-exemption', 'improvement', 'detection-gap', 'repair-gap'}
    assert finding['priority'] in {'low', 'medium', 'high'}
    assert all(finding[key] for key in ['problem', 'witness', 'proposed_fix', 'observing_check'])
    for item in finding['evidence']:
        unit = units[item['entry']]
        assert unit['source'] == item['source']
        assert unit['start'] <= item['start'] <= item['end'] <= unit['end']
        lines = (record / item['source']).read_text().splitlines()
        assert item['quote'] == '\n'.join(lines[item['start'] - 1:item['end']])
        evidence_count += 1

now = datetime.datetime.now(datetime.timezone.utc)
first_read = min(datetime.datetime.fromisoformat(log['timestamp_utc']) for log in logs)
last_read = max(datetime.datetime.fromisoformat(log['timestamp_utc']) for log in logs)
totals = {'primary_entries': len(ledger), 'candidate_records': len(findings), 'evidence_quotes': evidence_count,
          'dispositions': {kind: sum(entry['disposition'] == kind for entry in ledger) for kind in ('clear', 'finding', 'improvement')},
          'measured_source_utf8_bytes': sum(log['fragment_utf8_bytes'] for log in logs),
          'rendered_source_utf8_bytes': sum(log['rendered_utf8_bytes'] for log in logs),
          'source_read_commands': len(logs), 'first_measured_read_utc': first_read.isoformat(),
          'last_measured_read_utc': last_read.isoformat(),
          'bounded_read_span_seconds': (last_read - first_read).total_seconds(),
          'measured_review_span_seconds': (now - first_read).total_seconds(),
          'source_read_seconds_in_python': sum(log['read_elapsed_seconds'] for log in logs),
          'validation_elapsed_seconds': time.perf_counter() - started,
          'validated_utc': now.isoformat(), 'revision': revision, 'sources': source_results, 'files': files,
          'result': 'PASS: primary coverage, six checks, referenced records, byte/count limits, exact quote ranges, complete source reads, source identities'}
(out / 'validation.json').write_text(json.dumps(totals, indent=2) + '\n')

read_md = f'''# Read and validation record

The assigned review output is confined to `{out}`. No corpus, source, shared inventory, or other review ledger was edited.

The complete captured sources were emitted in {len(logs)} bounded reads. Every requested source range reached the model without tool-output truncation. The [command log](read-log.jsonl) records actual commands, ranges, UTC timestamps, complete-source hashes, emitted UTF-8 byte counts and Python read elapsed time. [Validation](validation.json) independently recomputes continuity, exact evidence quotes, coverage and batch bounds.

- Revision: `{revision}`.
- Source bytes emitted, excluding line-number decoration: **{totals['measured_source_utf8_bytes']:,}**.
- Decorated bytes emitted: **{totals['rendered_source_utf8_bytes']:,}**.
- First measured source read: `{first_read.isoformat()}`.
- Last source read: `{last_read.isoformat()}`; source-read command span **{totals['bounded_read_span_seconds']:.3f} s**.
- This validation: `{now.isoformat()}`; elapsed since first measured source read **{totals['measured_review_span_seconds']:.3f} s**.
- Summed measured Python read/format durations: **{totals['source_read_seconds_in_python']:.6f} s**. This is I/O preparation time, not a claim about reasoning time.
- Validation runtime to the measurement point: **{totals['validation_elapsed_seconds']:.6f} s**.

Preparation time before the first source-read timestamp was not separately measured. The review interval includes analysis, artifact construction and validation, rather than summing shell runtimes.

| Source | UTF-8 bytes | Lines | SHA-256 |
| --- | ---: | ---: | --- |
'''
for source in source_results:
    read_md += f"| {source['source']} | {source['bytes']} | {source['lines']} | `{source['sha256']}` |\n"
read_md += '''
Preparation and exceptional outcomes:

- `rg -n 'workflow-canon|integration-review|canon' /home/mike1/.codex/memories/MEMORY.md`: one relevant registry hit; read the first 48 registry lines with the current skill. Historical integration practices informed evidence discipline only; no historical behavior claim is used as current evidence. Current review authority and method were re-read locally.
- Read workspace `AGENTS.md`, `.project/main/AGENTS.md`, `.engineering/AGENTS.md`, Workflow Canon `SKILL.md`, `audit-mode.md`, `planning.md`, command conventions, and canon-context prerequisites/terms. These were instruction reads, not definition-conformance review.
- The first `cat README.md; cat inventory.json` preparation command exceeded its output limit. Its inventory output was truncated and was not used as complete coverage. The README was re-read alone; the inventory was then loaded by the artifact writers and validator, which check all 42 assigned IDs. The actual source coverage comes solely from the bounded read log.
- The first sandbox-prefixed source-reader invocation failed with `bwrap: No permissions to create a new namespace`; it emitted no source text and contributed zero source bytes. The same project-local Python reader was run in the default shell, which is permitted for project scripts. The failed attempt had reported tool wall time 0.000004710 s; this is preserved as reported, not interpreted as human analysis time.
- Source reads in `read-log.jsonl` all exited successfully. No output from those source-read commands was truncated. The build command `python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_contracts/write_review.py` exited 0 and produced the bounded batches. The validation command is `python3 .engineering/artifacts/planning/2026-10-11-canon-quality-review/reviews/ap_contracts/validate_review.py`.
- No Git, remote, workflow session, engine test, or corpus mutation was performed. Synthetic witnesses test the wording of criteria; they do not assert actual corpus defects or current runtime conformance.
'''
(out / 'read-log.md').write_text(read_md)

summary = '''# Contract canon quality review

All **42 assigned entries** have a primary disposition: **16 clear, 17 finding, 9 improvement**. The review proposes **23 bounded candidate records**, including optional refinements. The coordinator owns independent confirmation. These are suggestions about criterion quality, not findings that workflow definitions violate the canon.

The strongest changes are:

- **Repair destinations:** keep executable alternatives out of Rules (AC-01); resolve Protocol Apply guidance against the binding-site rule (AC-02); align cross-technique phase/provenance pointers with delivery reach (AC-03).
- **Semantic evidence:** prove producer availability across state changes (AC-05), count declarative input consumers (AC-12), and verify preserved paths/audiences on relocation (AC-19).
- **Useful abstraction:** extract shared interpretation rather than repeated primitive calls (AC-10). Preserve shared-contract substitutability when overriding optional inputs (AC-15).
- **Delivery and shape:** remove the bare-introduction delivery loophole (AC-08), assess framing by operative content rather than character count (AC-23), and recognize admitted map keys in tool signatures (AC-18).

No record claims the whole canon is logically unsatisfiable. Repair conflicts show a concrete prescribed remediation that produces or retains a pattern another entry rejects. Missing exceptions, weak evidence and optional wording improvements are identified separately. Every record includes exact source text, a constructed witness, replacement wording or a precise structural change, and flag/do-not-flag observations.

| Record | Primary entries | Kind | Evidence and suggested wording |
| --- | --- | --- | --- |
'''
for finding in findings:
    summary += f"| {finding['id']} | {', '.join(finding['entries'])} | {finding['kind']} | [{finding_homes[finding['id']]}]({finding_homes[finding['id']]}) |\n"
summary += '''
Use the [batch manifest](batch-manifest.json) for file identities and the six `ledger-*.json` batches for the complete per-entry checks. [Read evidence](read-log.md) records both complete source reads and the failed/truncated preparation attempts. [Validation](validation.json) checks all primary IDs, every evidence quote and every byte/count limit.

Useful general additions are an explicit review boundary for missing external contracts (AC-17), semantic consumer inventories (AC-11), and repair checks that preserve the intended output distinctions before deleting an unreachable enum member (AC-20). AP-142 and AP-152 already demonstrate concrete qualitative criteria without arbitrary numeric budgets.

Source identity: `e70b44778f71d9d699f746f78a16b892531c82d3`; hashes and byte counts are in the read record. The corpus is unchanged.
'''
(out / 'summary.md').write_text(summary)
print(json.dumps({key: totals[key] for key in ['result', 'primary_entries', 'candidate_records', 'evidence_quotes', 'dispositions', 'measured_source_utf8_bytes', 'source_read_commands', 'measured_review_span_seconds', 'validation_elapsed_seconds']}, indent=2))
