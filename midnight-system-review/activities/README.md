# Midnight System Review Activities

> Part of the [Midnight System Review Workflow](../README.md)

The activities that carry a review from a resolved change surface through plan-approved evidence probing, rubric adjudication, and a signed-off merge-readiness verdict, with an optional publication tail. The spine runs `01`–`07` with one point where it opens several branches at once: `03` fans to one probe per investigation area, and those branches converge on `05`. The `verdict-review` checkpoint can route back to `02` for plan-level rework, and `08` is entered only when a PR surface exists and publication is approved.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, loops, validations, and transitions — lives in the per-activity YAML linked below and is served by `get_activity`. Cross-cutting invariants live in the workflow-root [`workflow.yaml`](../workflow.yaml) `rules`.

---

## Main Flow

| # | Activity | Role |
|---|----------|------|
| 01 | [`scope-intake`](01-scope-intake.yaml) | Classify target, bind transport leaves (PR files or three-dot), assemble inventory, probe toolchain, confirm scope (non-blocking, 30s auto-advance) |
| 02 | [`area-derivation`](02-area-derivation.yaml) | Derive investigation areas from the change surface and subsystem map; approve the plan through a blocking amendment loop |
| 03 | [`evidence-probes`](03-evidence-probes.yaml) | Confirm the plan is approved and open one probe per approved area |
| 04 | [`probe-area`](04-probe-area.yaml) | One branch per area: bounded catalog probes with graceful toolchain degradation, in a context that saw only that area |
| 05 | [`consolidate-evidence`](05-consolidate-evidence.yaml) | Where the probes converge: their records read whole, in plan order, into the evidence log |
| 06 | [`finding-adjudication`](06-finding-adjudication.yaml) | Grade every candidate with the complete tuple, disposition against the accepted-issue threshold, enforce tuple completeness structurally |
| 07 | [`verdict-and-report`](07-verdict-and-report.yaml) | Compute the verdict from accepted findings, render the report, reconcile accounting, sign off (with rework routing), decide publication |
| 08 | [`publish-review`](08-publish-review.yaml) *(conditional)* | Post the review via the reused work-package operation and record the publication |
