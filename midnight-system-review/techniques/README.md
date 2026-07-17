# Midnight System Review Techniques

> Part of the [Midnight System Review Workflow](../README.md)

The technique library for the midnight-system-review workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in each operation's `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](TECHNIQUE.md) holds shared Inputs for every technique here: `planning_folder_path` and `target_repo_path`. Groups are named after their owning activity, so steps bind their own group's operations by bare id; every foreign reference is fully qualified.

---

## Operation Groups

| Group | Operations |
|-------|------------|
| [`scope-intake`](scope-intake/TECHNIQUE.md) | [`resolve-change-surface`](scope-intake/resolve-change-surface.md) — authoritative changed-file surface with PR metadata · [`detect-toolchain`](scope-intake/detect-toolchain.md) — probe the three toolchain gates |
| [`area-derivation`](area-derivation/TECHNIQUE.md) | [`derive-areas`](area-derivation/derive-areas.md) — change surface × subsystem map → bounded areas and plan · [`amend-plan`](area-derivation/amend-plan.md) — apply user amendment direction inside the approval loop |
| [`evidence-probes`](evidence-probes/TECHNIQUE.md) | [`probe-area`](evidence-probes/probe-area.md) — one area's budgeted probes with graceful degradation · [`consolidate-evidence`](evidence-probes/consolidate-evidence.md) — ordered combine with per-area accounting |
| [`finding-adjudication`](finding-adjudication/TECHNIQUE.md) | [`grade-findings`](finding-adjudication/grade-findings.md) — full grade tuple per candidate, from the rubric · [`register-findings`](finding-adjudication/register-findings.md) — threshold disposition into the register |
| [`verdict-and-report`](verdict-and-report/TECHNIQUE.md) | [`compute-verdict`](verdict-and-report/compute-verdict.md) — 1-5 verdict from accepted findings, with `review_type` · [`render-review`](verdict-and-report/render-review.md) — canonical-format report and verbatim `review_summary` |
| [`publish-review`](publish-review/TECHNIQUE.md) | [`record-publication`](publish-review/record-publication.md) — publication close-out record |

## Reused Operations

| Reference | Used for |
|-----------|----------|
| `meta::variable-binding` | Workflow-level binding strategy for every bound step |
| `meta::scatter-gather` | The sequential per-area scatter/gather contract on `evidence-probes` |
| `meta::gitnexus-operations` (`query`, `context`, `impact`, `diff-coverage-map`) | Code-graph probes when `gitnexus_available` is true |
| `work-package::update-pr::post-review-comment` | Posts `review_summary` to PR `pr_number` verbatim with the explicit `review_type` |
