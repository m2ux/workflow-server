# Midnight System Review Activities

> Part of the [Midnight System Review Workflow](../README.md)

The activities that carry a review from a resolved change surface through plan-approved evidence probing, rubric adjudication, and a signed-off merge-readiness verdict, with an optional publication tail. The spine (`01`–`05`) is linear; the `verdict-review` checkpoint can route back to `02` for plan-level rework, and `06` is entered only when a PR surface exists and publication is approved.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, loops, validations, and transitions — lives in the per-activity YAML linked below and is served by `get_activity`. Cross-cutting invariants live in the workflow-root [`workflow.yaml`](../workflow.yaml) `rules`.

---

## Main Flow

| # | Activity | Role |
|---|----------|------|
| 01 | [`scope-intake`](01-scope-intake.yaml) | Resolve the authoritative change surface and PR metadata, probe toolchain availability, confirm scope (non-blocking, 30s auto-advance) |
| 02 | [`area-derivation`](02-area-derivation.yaml) | Derive investigation areas from the change surface and subsystem map; approve the plan through a blocking amendment loop |
| 03 | [`evidence-probes`](03-evidence-probes.yaml) | forEach over the approved areas: bounded catalog probes with graceful toolchain degradation, then ordered consolidation into the evidence log |
| 04 | [`finding-adjudication`](04-finding-adjudication.yaml) | Grade every candidate with the complete tuple, disposition against the accepted-issue threshold, enforce tuple completeness structurally |
| 05 | [`verdict-and-report`](05-verdict-and-report.yaml) | Compute the verdict from accepted findings, render the report, reconcile accounting, sign off (with rework routing), decide publication |
| 06 | [`publish-review`](06-publish-review.yaml) *(conditional)* | Post the review via the reused work-package operation and record the publication |
