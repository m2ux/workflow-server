---
name: entry-report
description: Template and rules for the worker entry report, the one document a run leaves behind.
metadata:
  version: 1.2.0
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
| Fan branch | `note-left` | one row per slot of `{note_left_outputs}` | |
| Fan branch | `note-right` | one row per slot of `{note_right_outputs}` | |

## Identities

- The two branches held <distinct|the same> identities.
- The continuation arrived under <the same|a fresh> identity as the cold dispatch.
- The session minted `{count}` identities against `{expected}` this graph requires.

## Completions

| Activity | Completed | Expected |
|---|---|---|
| `record-entry` | `{count}` | 1 |
| `carry-batch` | `{count}` | 1 |
| `note-left` | `{count}` | 1 |
| `note-right` | `{count}` | 1 |
| `converge-entries` | `{count}` | 1 |

## Advances

- The trace holds `{count}` advances against `{expected}` this graph requires.

## Usage

| Activity | Entry recorded | Attributed to |
|---|---|---|
| `record-entry` | <yes|no> | `{agent_id}` |
| `carry-batch` | <yes|no> | `{agent_id}` |
| `note-left` | <yes|no> | `{agent_id}` |
| `note-right` | <yes|no> | `{agent_id}` |
| `converge-entries` | <yes|no> | `{agent_id}` |

## Delivery

- Applied and not served: <none|one row per technique id>.
```

## Rules

### one-row-per-record

The roll carries one row per record the run wrote, and no row for an entry the run did not
take. A row for an entry the walk skipped claims a path ran.

### state-the-comparison-either-way
 
Both comparisons are stated whichever way they came out. A report that names only the
agreeing case leaves a reader unable to tell a run that disagreed from a run that was never
compared.

### count-rather-than-conclude

Each ledger carries the number it found beside the number the graph requires, and both are
written even where they agree. A walk that reached its terminal is not evidence that every
activity ran once, that every advance was traced, or that every technique applied had been
served — only the counts separate those from a walk that succeeded around them.
