---
name: run-manifest
description: Creation guide for bare filename `RUN-MANIFEST.json` — the contract a triggering workflow reads to locate a run's artifacts and confirm it completed, without re-scanning the output directory.
metadata:
  order: 67
  type: template
---

# Run Manifest Guide

Creation guide for bare filename `RUN-MANIFEST.json`. One file that answers two questions for whoever triggered the run: did it finish, and where is everything it produced. A consumer reads this instead of walking the output directory, so what it records is a contract rather than a convenience.

## Template

The run's status and the two report paths, then one object per analysis unit, then the flat list of every artifact path the run produced.

```json
{
  "status": "complete",
  "pipeline_mode": "full-prism",
  "report_path": "REPORT.md",
  "definitive_findings_path": "DEFINITIVE-FINDINGS.md",
  "units": [
    {
      "unit": "pallets/session",
      "output_subdir": "session",
      "pipeline_mode": "full-prism",
      "status": "complete",
      "artifacts": [
        "session/structural-analysis.md",
        "session/adversarial-analysis.md",
        "session/synthesis.md"
      ]
    }
  ],
  "artifacts": [
    "REPORT.md",
    "DEFINITIVE-FINDINGS.md",
    "session/structural-analysis.md",
    "session/adversarial-analysis.md",
    "session/synthesis.md"
  ]
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `status` | string | `complete`, `partial`, or `error` — the run's own verdict on its completeness |
| `pipeline_mode` | string | The pipeline mode the run executed |
| `report_path` | string | Path to the run's report, relative to the output directory |
| `definitive_findings_path` | string | Path to the run's definitive findings, relative to the output directory |
| `units` | object[] | One entry per analysis unit, in execution order |
| `units[].unit` | string | The unit's name as the analysis plan declares it |
| `units[].output_subdir` | string | The unit's output subdirectory, or `.` when the run has one unit |
| `units[].pipeline_mode` | string | The pipeline mode this unit ran |
| `units[].status` | string | `complete` or `partial` for this unit |
| `units[].artifacts` | string[] | The artifacts this unit's pipeline mode was expected to produce |
| `artifacts` | string[] | Every path the run produced, flat, so a consumer enumerates them from one field |

## Rules

- **Every unit is an entry.** One object per analysis unit, carrying the artifacts its pipeline mode was expected to produce. A unit absent from `units` is a unit whose completion nobody recorded.
- **The flat artifact list is complete.** Every path the run produced appears in `artifacts`, so a consumer needs no second source to enumerate them.
- **Status reflects the filesystem, not the intent.** `complete` when the report, the definitive findings and every unit's expected artifacts are present; `partial` when the reports exist and a unit is missing artifacts; `error` when either report is missing or empty. A missing artifact is never reported as success — the caller decides what to do about an incomplete run.
- **Paths are values a consumer resolves.** They are recorded relative to the output directory, so a consumer joins them to the run's location rather than parsing a link.
- **Line budget:** one object per unit and one string per artifact, with no field carrying prose.
