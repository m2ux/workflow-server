# Midnight System Review Resources

> Part of the [Midnight System Review Workflow](../README.md)

Reference content loaded on demand by the workflow's techniques. The authoritative content lives in each `.md` file and is served by `get_resource` addressed by bare slug (e.g. `resource_id: probe-catalog`). This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns |
|----------|------|
| [`subsystem-map.md`](subsystem-map.md) | The midnight-node subsystem topology snapshot — per-subsystem paths, responsibilities, failure classes, coupled subsystems, and probe affinities; the map [`derive-areas`](../techniques/area-derivation/derive-areas.md) projects the change surface onto |
| [`probe-catalog.md`](probe-catalog.md) | The six bounded probe classes (P1–P6) executed by [`probe-area`](../techniques/evidence-probes/probe-area.md): validation targets, instruments, toolchain gates, bounding rules, and the blocked-validation record |
| [`grading-rubric.md`](grading-rubric.md) | The six-dimension grade tuple applied by [`grade-findings`](../techniques/finding-adjudication/grade-findings.md), the accepted-issue threshold applied by [`register-findings`](../techniques/finding-adjudication/register-findings.md), and calibration anchors from the PR #1849 findings |
| [`verdict-rubric.md`](verdict-rubric.md) | The 1-5 merge-readiness scale computed by [`compute-verdict`](../techniques/verdict-and-report/compute-verdict.md), its calibration anchors, the run status vocabulary, and the verdict-to-`review_type` mapping |
| [`review-format.md`](review-format.md) | The canonical review structure rendered by [`render-review`](../techniques/verdict-and-report/render-review.md) and the Review Details accounting rules the reconciliation gate checks |
