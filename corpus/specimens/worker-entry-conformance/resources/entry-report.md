---
name: entry-report
description: Template and rules for the worker entry report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Entry Report

The shape of the document the run leaves behind: one roll of the entries the walk took, then
the comparison no branch could make for itself.

Persisted as `worker-entry-report.md` in the session's planning folder.

## Template

```markdown
# Worker Entry Report

Session `{session_index}` · workflow `worker-entry-conformance` · `{written_at}`

## Entries taken

| Entry | Activity | Identity | Recorded |
|---|---|---|---|
| Cold dispatch | `record-entry` | `{cold_entry.agent_id}` | `{cold_entry.recorded_at}` |
| Batch continuation | `carry-batch` | `{batch_entry.agent_id}` | `{batch_entry.recorded_at}` |
| Fan branch | `note-left` | `{left_entry.agent_id}` | `{left_entry.recorded_at}` |
| Fan branch | `note-right` | `{right_entry.agent_id}` | `{right_entry.recorded_at}` |

## Identities

- The two branches held <distinct|the same> identities.
- The continuation arrived under <the same|a fresh> identity as the cold dispatch.
```

## Rules

### one-row-per-record

The roll carries one row per record the run wrote, and no row for an entry the run did not
take. A row for an entry the walk skipped claims a path ran.

### state-the-comparison-either-way
 
Both comparisons are stated whichever way they came out. A report that names only the
agreeing case leaves a reader unable to tell a run that disagreed from a run that was never
compared.
