# Midnight System Review Resources

> Part of the [Midnight System Review Workflow](../README.md)

Reference content loaded on demand by the workflow's techniques. The authoritative content lives in each `.md` file and is served by `get_resource` addressed by bare slug (e.g. `resource_id: probe-catalog`). This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns |
|----------|------|
| [`subsystem-map.md`](subsystem-map.md) | The midnight-node subsystem topology snapshot — per-subsystem paths, responsibilities, failure classes, coupled subsystems, and probe affinities; the map a change surface is projected onto |
| [`probe-catalog.md`](probe-catalog.md) | The nine bounded probe classes (P1–P9): validation targets, instruments, toolchain gates, three-way failure-class discharge, and the blocked-validation record |
| [`grading-rubric.md`](grading-rubric.md) | The six-dimension grade tuple, the accepted-issue threshold, and calibration anchors from representative findings |
| [`verdict-rubric.md`](verdict-rubric.md) | The 1-5 merge-readiness scale, its calibration anchors, the run status vocabulary, and the verdict-to-`review_type` mapping |
| [`review-format.md`](review-format.md) | The canonical review structure and the Review Details accounting rules a reconciliation is checked against |
| [`findings-register.md`](findings-register.md) | Creation guide: `findings-register.md` — the disposition table, the per-finding detail sections, and the completeness bar on the grade tuple |
| [`publication-record.md`](publication-record.md) | Creation guide: `publication-record.md` — the post outcome, the verdict it carried, and the artifacts it traces back to |

---

## Planning artifact to guide map

| Bare filename | Guide |
|---------------|-------|
| `change-surface.md` | [change-surface](change-surface.md) |
| `investigation-plan.md` | [investigation-plan](investigation-plan.md) |
| `evidence-log.json` | [evidence-log](evidence-log.md) |
| `findings-register.md` | [findings-register](findings-register.md) |
| `publication-record.md` | [publication-record](publication-record.md) |
| `review-report.md` | [review-format](review-format.md) |
