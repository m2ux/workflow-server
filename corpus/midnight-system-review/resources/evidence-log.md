---
name: evidence-log
description: Creation guide for bare filename `evidence-log.json` — the consolidated evidence base carrying per-area probe accounting, every evidence item with its anchor, the failure-class discharge records, and the blocked validations.
metadata:
  order: 10
---

# Evidence Log Guide

Creation guide for bare filename `evidence-log.json`. The evidence every finding later rests on, plus the accounting the final report reconciles against. Adjudication reads entries by ID, so an entry without one is evidence nothing can cite.

## Template

One object per planned area, in plan order, each carrying its accounting, its evidence items, its failure-class discharges, and the validations that could not run.

```json
{
  "target": "midnight-node @ 3f2a1c4",
  "areas": [
    {
      "area_id": "storage-lifecycle",
      "probes_planned": 3,
      "probes_executed": 3,
      "probes_blocked": 0,
      "candidates": 2,
      "evidence": [
        {
          "id": "E1",
          "probe": "P7",
          "observation": "close path leaves the storage record in place",
          "anchor": "pallets/session/src/lib.rs#L412"
        }
      ],
      "failure_class_discharge": [
        {
          "class": "correlation-contract",
          "verdict": "refuted",
          "proof": "pallets/session/src/tests.rs#L88"
        }
      ],
      "blocked_validations": [
        {
          "validation": "runtime benchmark for the close path",
          "gate": "benchmarking feature unavailable in the pinned toolchain",
          "anchor": "Cargo.toml#L61"
        }
      ]
    }
  ]
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `target` | string | The target identity the run investigated |
| `areas` | object[] | One entry per planned investigation area, in plan order |
| `areas[].area_id` | string | The area's id as the investigation plan declares it |
| `areas[].probes_planned` | number | Probes the plan allocated to this area |
| `areas[].probes_executed` | number | Probes actually run |
| `areas[].probes_blocked` | number | Probes that could not run |
| `areas[].candidates` | number | Candidate findings this area raised |
| `areas[].evidence` | object[] | Every evidence item the area produced |
| `areas[].evidence[].id` | string | Evidence id adjudication cites (`E1`, `E2`, …), unique across the log |
| `areas[].evidence[].probe` | string | The probe class that produced it (`P7`, `P8a`, …) |
| `areas[].evidence[].observation` | string | One line on what was observed |
| `areas[].evidence[].anchor` | string | Locus the observation rests on |
| `areas[].failure_class_discharge` | object[] | One entry per failure-class obligation the area carried |
| `areas[].failure_class_discharge[].class` | string | The obligation discharged |
| `areas[].failure_class_discharge[].verdict` | string | `confirmed`, `refuted`, `inconclusive`, or `blocked` |
| `areas[].failure_class_discharge[].proof` | string | Join-key discharge or per-caller path anchor; required when the verdict is `refuted` |
| `areas[].blocked_validations` | object[] | Validations nobody could run |
| `areas[].blocked_validations[].validation` | string | What could not be validated |
| `areas[].blocked_validations[].gate` | string | The gate that was false |
| `areas[].blocked_validations[].anchor` | string | Where the gate is observable |

## Rules

- **One record per planned area, in order.** A missing or duplicated area is a hard stop, not a gap to note — those probes re-run before consolidating.
- **Every evidence item carries an ID and an anchor.** Adjudication cites the ID and follows the anchor; an item with neither cannot support a finding.
- **A probe overage is recorded, not absorbed.** Exceeding the per-area budget signals a plan or discipline defect rather than extra rigour, so it appears in the accounting.
- **Inconclusive is its own verdict.** A refuted discharge carries its proof — a join-key discharge table for a correlation class, a per-caller path anchor for a propagation or caller-accounting class. An inconclusive result is marked as such and never relabelled refuted.
- **Blocked validations are listed with the gate that failed.** A validation nobody could run is evidence about the toolchain, and the report reconciles against it.
- **Line budget:** one object per evidence item and per blocked validation, and no field carrying prose beyond its one line.
