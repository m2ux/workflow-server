# Workflow Design: midnight-system-review — Complete

> Create · 2026-07-14

## Summary

Created `midnight-system-review`, a new 6-activity workflow that natively encodes the Jina simulation bot's system-level review methodology for midnight-node change-sets: change-surface area derivation, bounded per-area evidence probes with structural toolchain degradation, evidence-graded finding adjudication, and a rubric-computed 1–5 merge-readiness verdict with a conditional PR-publish tail. The design is grounded in the review evidence from midnight-node PR #1849 and delivered as 34 new files, committed (`d15fc578`) and opened as [PR #231](https://github.com/m2ux/workflow-server/pull/231) against `workflows`.

## What Was Delivered

- **Activities (7 files):** `workflow.yaml` (12 variables, 9 sectioned rules, workflow-level `variable-binding`) + 6 activity files — `01-scope-intake`, `02-area-derivation`, `03-evidence-probes` (sequential scatter-gather bounded by `probe_budget_per_area`), `04-finding-adjudication`, `05-verdict-and-report`, conditional `06-publish-review`.
- **Techniques (18 files):** workflow base contract + 6 activity-named group contracts holding 11 operations (`resolve-change-surface`, `detect-toolchain`, `derive-areas`, `amend-plan`, `probe-area`, `consolidate-evidence`, `grade-findings`, `register-findings`, `compute-verdict`, `render-review`, `record-publication`).
- **Resources (5 files):** `subsystem-map`, `probe-catalog`, `grading-rubric`, `verdict-rubric`, `review-format` — probe classes and rubric calibration grounded in the PR #1849 Jina runs.
- **READMEs (4 files):** prism-style root README + activity/technique/resource indexes.
- **Structural backing:** 2 `validate` gates (grade-tuple completeness, accounting reconciliation + the EN-1 consolidation-budget gate), 4 checkpoints, `revise-investigation` rework transition, fragment reuse of `substrate-node-security-audit::planning-artifacts-gitignored`, cross-workflow reuse of `work-package::update-pr::post-review-comment`.

## Design Decisions

Decisions are canonically recorded in the [assumptions log](03-assumptions-log.md) (15 assumptions, all resolved), the planning [README's Design Decisions](README.md#design-decisions) section, and the divergence dispositions in [04-pattern-analysis.md](04-pattern-analysis.md) (26 conventions, 5 justified divergences D1–D5). Recorded nowhere else, made during validate-and-commit:

- **`area_evidence_collection` accumulator binding** — Context: binding-fidelity check flagged the per-area evidence accumulator as unresolved. Decision: declare it as an explicit accumulator with initialisation in the prepare-gather step. Rationale: keeps the scatter-gather contract complete rather than relying on implicit first-write creation. Alternative rejected: per-iteration output remap (obscures the accumulation pattern).
- **`amendment_direction` de-declared** — Context: declared as a variable but produced/consumed only inside the plan-amendment doWhile loop. Decision: remove the workflow-level declaration; the checkpoint effect carries it. Alternative rejected: keeping the declaration (dead variable, binding-fidelity violation).

## Scope Outcome

All 34 manifest items delivered ([Scope Manifest](README.md#scope-manifest)); scope check 34/34, schema validation 7/7, no drift.

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **Unexercised workflow** — no live run against a real midnight-node change-set yet; probe budget (`probe_budget_per_area = 4`) and rubric anchors are calibrated from a single evidence set (PR #1849, 3 Jina runs). First real run should validate calibration.
- **Stale server-repo binding-fidelity baseline** — 3 pre-existing NEW flags from `work-package`/`workflow-design` drift surfaced during validation; unrelated to this workflow. Follow-up: regenerate the baseline in a separate server PR.
- **Uncommitted rsync copy** — the server `workflows` worktree holds an rsync copy of the new workflow for local validation until PR #231 merges; discard or refresh after merge.
- **Cross-workflow dependency** — `publish-review` binds `work-package::update-pr::post-review-comment`; signature fit was verified at pattern-analysis but the coupling means work-package signature changes can break the publish tail.

## Workflow Retrospective

[messages: checkpoint gates only — 1 user-resolved (commit/PR approval), the rest orchestrator-resolved under standing delegated authority; 0 non-checkpoint · session quality: Smooth, minor process friction] Activities completed: 7/7 (create path; interview loop skipped as unneeded).

### Observations

- [process] Worker could not read MCP resources directly at intake-and-context (harness gap) — fell back to the authoritative schema files in the server repo — [intake-and-context / format-literacy] — bootstrap assumes resource fetch works in every worker harness.
- [checkpoint anomaly] 7 of 8 requirements dimensions were replay-resolved on the `dimension-confirmed` default (1 genuinely yielded) — [requirements-refinement] — AP-81/82 demote/merge candidates when the recommended option is presented with the dimension.
- [checkpoint anomaly] `file-approach-confirmed` and `file-review` each yielded exactly once across the 34-file drafting loop, then replayed for the remaining 33 files — [scope-and-draft / drafting loop] — the replay-after-first-file design worked exactly as intended and kept the loop autonomous; no change needed.
- [late detection] 3 binding-fidelity violations (accumulator init, dead variable) were first caught at validate-and-commit, after 34/34 per-file reviews and a clean quality-review — [validate-and-commit] — the binding-fidelity checker runs only in the commit tail, so binding-level defects survive both review gates.
- [environment] An org spend limit interrupted the session mid-quality-review; it resumed cleanly from the transcript — no workflow defect. Pre-existing baseline drift (3 NEW flags from work-package/workflow-design) added noise to the validation surface; already tracked as a follow-up.

### Recommendations

1. **Medium:** binding-fidelity defects detected only in the commit tail → run the binding-fidelity check against the draft at draft-attestation (scope-and-draft), so binding gaps surface while the drafting loop is still open (scope-and-draft / validate-and-commit).
2. **Medium:** MCP-resource reads can fail in a worker harness → codify the fallback (read the schema/reference files from the server repo) in intake-and-context's format-literacy technique instead of leaving it to worker improvisation (intake-and-context).
3. **Low:** near-universal default-replay on dimension confirmations → review the 8 dimension checkpoints against AP-81/82; dimensions that are only ever ratified could present as one consolidated confirmation while keeping genuinely open dimensions atomic (requirements-refinement).

**Key takeaway:** the create path scaled cleanly to a 34-file workflow — the drafting-loop replay design and delegated internal gates did their job — but binding-level validation belongs at attestation, not first in the commit tail.
**Action required:** no — the baseline regeneration is already tracked as a separate follow-up.
