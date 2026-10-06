---
name: entry-report
description: Template and rules for the worker entry report, the one document a run leaves behind.
metadata:
  version: 1.5.0
  order: 1
---

# Entry Report

## Template

One roll of the entries the walk took, the comparison no branch could make for itself, and the
ledgers counting what the session record holds against what the graph requires.

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

- The two branches held identities that were: distinct / the same.
- The continuation arrived under an identity that was: the same as the cold dispatch / a fresh one.
- The session carries `{count}` identities against `{expected}` this graph requires, one of them
  holding `{count}` completed steps where a continuation holds two.

## Exits

| Activity | Exited | Expected |
|---|---|---|
| `record-entry` | `{count}` | 1 |
| `carry-batch` | `{count}` | 1 |
| `note-left` | `{count}` | 1 |
| `note-right` | `{count}` | 1 |
| `converge-entries` | `{count}` | 1 |

## Arrivals

- The history holds `{count}` activity entries against `{expected}` this graph requires.

## Delivery

- Bound as a step of this activity and not served: none / one row per technique id.
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
activity exited once, that every advance was traced, or that every technique bound had been
served — only the counts separate those from a walk that succeeded around them.
