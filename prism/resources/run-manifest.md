---
name: run-manifest
description: Creation guide for bare filename `RUN-MANIFEST.md` — the contract a triggering workflow reads to locate a run's artifacts and confirm it completed, without re-scanning the output directory.
metadata:
  order: 67
  type: template
---

# Run Manifest Guide

Creation guide for bare filename `RUN-MANIFEST.md`. One file that answers two questions for whoever triggered the run: did it finish, and where is everything it produced. A consumer reads this instead of walking the output directory, so what it records is a contract rather than a convenience.

## Template

````markdown
# Prism Run Manifest

- **Status:** {complete | partial | error}
- **Pipeline mode:** {pipeline mode}
- **Report:** [REPORT.md]({report path})
- **Definitive findings:** [DEFINITIVE-FINDINGS.md]({definitive findings path})

## Units

| Unit | Output subdir | Pipeline mode | Status | Artifacts |
|------|---------------|---------------|--------|-----------|
| {unit name} | {output subdir, or "."} | {unit pipeline mode} | complete \| partial | {artifact filenames} |

## Artifacts

- [{artifact filename}]({artifact path})
````

## Rules

- **Every unit is a row.** One row per analysis unit, carrying the artifacts its pipeline mode was expected to produce. A unit absent from the table is a unit whose completion nobody recorded.
- **The flat artifact list is complete.** Every path the run produced appears under Artifacts as a link, so a consumer needs no second source to enumerate them.
- **Status reflects the filesystem, not the intent.** `complete` when the report, the definitive findings and every unit's expected artifacts are present; `partial` when the reports exist and a unit is missing artifacts; `error` when either report is missing or empty. A missing artifact is never reported as success — the caller decides what to do about an incomplete run.
- **Paths are links, not bare text.** A consumer resolves them; a reader follows them.
- **Line budget:** one row per unit and one line per artifact, with no prose beyond the header block.
