---
name: debt-ledger
description: Creation guide for bare filename `debt-ledger.json` — one entry per ponytail marker with its ceiling and upgrade trigger, grouped by file, carrying the marker and no-trigger counts and the gain scoreboard the report appends.
---

# Debt Ledger Guide

Creation guide for bare filename `debt-ledger.json`. Every deliberate simplification, with the limit it sets and the trigger that would justify passing it. A marker whose trigger is missing is the interesting entry, so the ledger flags it rather than leaving it to be noticed.

## Template

One entry per marker, grouped under the file it sits in, with the counts the gain report totals against and the scoreboard it adds.

```json
{
  "target": "midnight-node",
  "markers": 12,
  "no_trigger": 3,
  "files": [
    {
      "path": "pallets/session/src/lib.rs",
      "entries": [
        {
          "line": 412,
          "simplified": "single-validator assumption in the rotation path",
          "ceiling": "one validator set per era",
          "upgrade": "a second set is introduced"
        },
        {
          "line": 511,
          "simplified": "in-memory index instead of a persisted map",
          "ceiling": "index fits in a block's memory budget",
          "upgrade": "no-trigger"
        }
      ]
    }
  ],
  "gain": null
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `target` | string | The repository or component harvested |
| `markers` | number | Total marker entries across every file |
| `no_trigger` | number | Entries whose `upgrade` is `no-trigger` |
| `files` | object[] | One entry per file carrying at least one marker, in path order |
| `files[].path` | string | Path of the file the markers sit in |
| `files[].entries` | object[] | The markers in that file, in line order |
| `files[].entries[].line` | number | Line the marker sits on |
| `files[].entries[].simplified` | string | What was deliberately simplified |
| `files[].entries[].ceiling` | string | The limit the simplification sets |
| `files[].entries[].upgrade` | string | The trigger that would justify passing the ceiling, or `no-trigger` |
| `gain` | object \| null | The gain scoreboard, null until the gain report writes it |
| `gain.ledger_rows` | number | The marker count, which is the only genuine per-repo figure |
| `gain.benchmark_medians` | object | Published aggregate medians — `lines_of_code`, `cost`, `speed` — labelled as medians over the benchmark suite |

## Rules

- **One entry per marker, carrying all four fields.** Line, what was simplified, the ceiling, the upgrade trigger. The fields are what make the ledger totalable by the gain report.
- **Grouped by file.** Entries sit under the file they came from, so a reader working on one file sees its debt together.
- **A missing trigger is flagged, not omitted.** `upgrade` set to `no-trigger` marks a ceiling nobody can tell when to lift, which is the entry most worth revisiting.
- **The counts are fields, not a closing line.** `markers` and `no_trigger` sum the entries. A harvest that found none writes both as `0` and `files` as an empty array.
- **The gain scoreboard is a field of this file.** The gain report fills `gain` rather than appending to the end, so the ledger stays one parseable document with one writer per field.
- **The ledger records, it does not judge.** A marker is debt with a stated ceiling, not a defect; whether to upgrade is decided when the trigger fires.
- **Line budget:** one object per marker, each field held to one line.
