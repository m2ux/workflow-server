# Compliance Review — remediate-vuln vs work-package 3.27.0

**Target:** `remediate-vuln` 1.1.0
**Baseline:** `work-package` 3.27.0
**Date:** 2026-07-10
**Review axes:** (1) fidelity of remediate-vuln's work-package reuse against the current work-package version; (2) functional equivalence outside privacy-assurance deviations.

## Method

- Loaded remediate-vuln fresh via `loadWorkflowWithDiagnostics` — workflow loads cleanly: 15 activities stitch (3 own + 12 borrowed), zero activity load errors, `work-package::interaction-discipline` rule fragment and `assumption-interview` checkpoint fragment resolve (per #166 B10 source-workflow fragment scoping).
- Empirically probed step-technique resolution under both workflow scopes via `composeActivityTechnique` (loader code path used by `get_technique`/`get_activity`).
- Diffed the declared variable bag against every variable read by the borrowed activities (conditions, `when` gates, loops, templates, setVariable effects).
- Verified transition-graph closure of the stitched graph.
- Diffed the three own activities (start / strategic-review / submit) and forked techniques against their wp counterparts (01-start-work-package v–, 12-strategic-review v2.7.0, 13-submit-for-review) and classified each deviation privacy vs drift.
- Ran repo guards: `check:binding` (263 baselined, 0 new — remediate-vuln's 8 baselined entries are benign dead-outputs), `check:variable-model` (OK).

## Findings

### Critical

**F1 — Borrowed activities' technique refs do not resolve (≈65 of ~80 step bindings broken).**
Technique resolution is borrower-scoped: `get_technique` composes against `state.workflowId` (remediate-vuln) with meta fallback ([resource-tools.ts:568](../../../../src/tools/resource-tools.ts#L568), [technique-loader.ts:142](../../../../src/loaders/technique-loader.ts#L142)); work-package is never searched for a borrowed activity's unqualified refs. Empirically verified FAIL under remediate-vuln / OK under work-package: `review-assumptions::collect`, bare `define` (activity-group shorthand `design-philosophy::define`), `implement-task`, `manage-git::sync-branch`. Only meta groups (`cargo-operations`, `atlassian-operations`, `gitnexus-operations`, `github-cli-protocol`) and explicit-prefix refs (`prism/…`, `ponytail/…`) survive. Fragments received exactly this fix in #166 B10 (`sourceWorkflowId` scoping in [workflow-loader.ts:162](../../../../src/loaders/workflow-loader.ts#L162)); techniques did not.
*Recommended fix:* server-side — resolve a borrowed activity's step techniques against its source workflow first (mirror B10), threading `sourceWorkflowId` through `composeActivityTechnique`, get_activity bundling, and binding-provenance. Content-side alternatives (qualifying every wp ref as `work-package::…`, or forking 12 activities into remediate-vuln) violate generic-not-overfit / mass-duplicate.

**F2 — `project_type` is never set → validation suite silently skipped.**
remediate-vuln declares `project_type` "Set by detect-project-type step", but the only binding of `project-type-detection` lives in wp `start-work-package`, which remediate-vuln replaces. `11-validate`'s `run-suite` step is gated `project_type == 'rust-substrate'` — never true, so `cargo-operations::run-suite` never runs and `validation_results` is never produced.
*Fix:* bind `project-type-detection` in remediate-vuln's own start activity.

### High

**F3 — plan-prepare `env-prerequisites` hard-blocks: `reference_path` is never set.**
wp start-work-package's `resolve-reference` step (reference-resolution) sets `reference_path`/`component_name`; remediate-vuln's start has no counterpart, and `06-plan-prepare` validates `reference_path != null`. The workflow blocks at plan-prepare. Same step also validates `gh.auth.status == 0` (PR-flow-oriented; benign but questionable in the isolation context).
*Fix:* add reference resolution to remediate-vuln start (and declare `reference_path`/`component_name`).

**F4 — Variable-bag drift: ~25+ variables read by borrowed activities are undeclared in remediate-vuln.**
Missing (grouped): `validation_results` (validate fix-loop + transition read `validation_results.validation_passed`); assumption machinery — `has_resolvable_assumptions`, `has_open_assumptions`, `open_assumptions`, `current_assumption`, `assumption_resolved_inline`, `assumption_deferred`, `has_deferred_assumptions`, `task_assumptions`; research loop (#188) — `research_candidates`, `has_reconcilable_research`; comprehension — `has_open_questions`, `comprehension_artifact`, `artifact_name`; elicitation — `elicitation_complete`, `question_domains`, `current_domain`; implement — `implementation_plan`, `current_task`, `has_uncertain_symbols`, `uncertain_symbols`, `provenance_log_path`; post-impl — `gitnexus_indexed`, `skip_architecture_summary`, `prism_artifact_paths`, `block_path`, `block_line_range`, `change_block_index`, `flagged_block_indices`, `current_block_index`; routing — `needs_plan_revision`, `worktree_created`; design-philosophy — `problem_type`, `path_gating_complexity`, `context_scope`. Ungated `exists`/defaulted gates mis-evaluate or are unevaluable without declarations.
Conversely stale in remediate-vuln: `has_failures` (wp dropped it for `validation_results`), and `validation_passed`'s role moved into the envelope.
*Fix:* mirror the wp declarations (with defaults) for every variable the borrowed activities read; drop/replace stale ones.

### Medium — equivalence drift (not privacy-motivated; should mirror wp)

**E1 — 02-strategic-review is a stale fork of wp 12-strategic-review v2.7.0.**
Missing: `verify-readme` (manage-artifacts::verify-readme-conforms), `changes-folder` step (wp split ensure-entry from verify-fragment). `review-findings` checkpoint has the pre-#192 shape: unconditional, `blocking: false` + 30s auto-advance, no `selective-fixes` option, no `strategic_findings_deferred`/`strategic_fixes_selective` effects, no `{strategic_findings_summary}` interpolation (findings-gated `condition` on wp). `analyze-strategic-findings` binds rv's own `analyze-findings`, which lacks the `strategic_findings_summary` output the wp checkpoint message needs. Privacy-legitimate deviations to KEEP: `unsigned-commits-prompt` checkpoint + `resign-commits`, private-remote scoping, and the issue-URL fragment validate-action omission.

**E2 — Forked `strategic-review::review-scope` technique is stale (v1.0.0 vs wp v1.2.0).**
Missing the #203 authored-surface fix (three-dot diff against the PR-target/base branch, canonical `{changed_files}`, per-file-necessity anchor). The wp version's `pr_number`-based base-branch discovery and PR-body conformance need a private adaptation (branch-range diff against the private fork's base), but the diff-scope correction itself is not privacy-related.

**E3 — 03-submit lacks the DCO/provenance attestation wp 13-submit-for-review gained.**
Borrowed `08-implement` appends to the provenance log (`dco-provenance::append-task-row`), but remediate-vuln submit never runs `dco-provenance::record-attestation` or the `dco-sign-off-confirmation` checkpoint. Provenance/DCO is commit-level, not disclosure-level — applies to the private fork too. Remaining wp-13 machinery (PR render/verify-body/mark-ready/review-comments/merge-strategy) is public-PR bound — privacy-excluded, correctly absent.

**E4 — 01-start lacks non-privacy wp start steps.**
`verify-signing-precondition` (GPG check — remediate-vuln verifies signatures later but never preflights them), `detect-project-type` (→F2), reference resolution (→F3), `stakeholder-overview` problem summary, optional worktree infrastructure (`compute-canonical-target-path`/`create-worktree` — adoption decision; if skipped, declare `worktree_created: false` default so 14-complete's gate stays false), `gitnexus-operations::analyze` (if skipped, declare `gitnexus_indexed: false` default). Review-mode detection and issue/PR machinery are correctly absent (privacy / fixed-mode).

### Medium — privacy hardening

**P1 — Disclosure-capable steps in borrowed activities are held off only by unset variables and prose rules.**
`07-assumptions-review` `post-summary-jira`/`post-summary-github` auto-post to the issue tracker after 30s whenever `issue_platform` is set + assumptions deferred; today they're skipped only because remediate-vuln never sets `issue_platform`. `06-plan-prepare` `update-pr` (update-pr::render, gated only `is_review_mode != true`) runs and renders a PR description that must never be posted. The STRICT-ISOLATION rule is text-only enforcement.
*Fix (design decision):* structural gate — either an explicit rv-declared absence contract for `issue_platform`, or restore a mode gate in wp (see P2).

**P2 — `is_sec_vuln_mode` is dead.**
Declared "Used to bypass specific logic in shared activities", but zero references exist outside remediate-vuln — wp dropped all its gates in the recent refactors. Either remove it, or (preferred, pairs with P1) reintroduce it in wp as the structural disclosure gate on `update-pr`/issue-posting steps (`is_sec_vuln_mode != true`), restoring the original bypass contract.

### Low

- **L1** — `announce-completion` README-progress log step in 02-strategic-review duplicates the activity-level progress rule wp now carries (wp dropped the step).
- **L2** — 8 baselined dead-output findings on rv techniques (known, benign).
- **L3** — README shallow relative to current conventions (no mermaid activity-flow diagram; referenced work-package activities not tabulated with versions).
- **L4** — Stale variable descriptions (`project_type` names a step that doesn't exist in this workflow; `skip_optional_activities`/`needs_*` descriptions predate wp's path-gating rework).

## Totals

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 2 |
| Medium | 4 (E1–E4) + 2 (P1–P2) |
| Low | 4 |
| **Total** | **14** |

## Verdict on the two review questions

1. **Fidelity vs current work-package: BROKEN.** The stitched graph and fragments load, but step-technique resolution fails for ~65 borrowed step bindings (F1), validation is silently skipped (F2), plan-prepare hard-blocks (F3), and the variable model has drifted badly (F4). remediate-vuln cannot complete an end-to-end run against work-package 3.27.0.
2. **Deviations privacy-only: NO.** Beyond the legitimate privacy deviations (private remote, no PR/issue tools, GPG signing additions, isolation checkpoints), there is non-privacy functional drift in strategic-review (E1/E2), submit (E3 — DCO attestation), and start (E4). Additionally, two privacy gaps run the other direction: disclosure paths in borrowed activities are only textually suppressed (P1) and the intended structural bypass variable is dead (P2).
