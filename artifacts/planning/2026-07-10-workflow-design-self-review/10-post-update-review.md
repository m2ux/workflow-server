# Post-Update Review: workflow-design (v1.6.0 → 1.7.0)

**Date:** 2026-07-12
**Session:** RPKOLJ · activity `post-update-review` (prefix 10)
**Target:** `workflow-design` v1.7.0
**Committed state audited:** worktree `/home/mike1/projects/work/workflows/2026-07-10-workflow-design-self-review/workflow-design/`, branch `workflow/workflow-design-self-review`, commit `6417b3a0`
**PR:** https://github.com/m2ux/workflow-server/pull/220 (#220, against the `workflows` branch)
**Change spec:** [08-compliance-review.md](08-compliance-review.md) — 30 findings, all fixed
**Baseline for the diff:** merge-base `05d1f812` → `6417b3a0` (47 files changed, +511 / −408)

This is the **post-commit** compliance audit — it re-audits the committed state fresh (not cached pre-update state) to confirm the shipped change is coherent as a whole and to surface anything for the retrospective.

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 2 (scope-manifest imprecision; both benign) |
| Cross-repo coherence gap | 1 (server-side binding-fidelity baseline — see §4) |

**Verdict: the committed workflow content is clean.** All 30 findings are resolved; the five audit passes surface no new anti-pattern, no schema break, and no new binding drift introduced by the update. The workflow-design *content* carries no new compliance debt.

The one item that needs action lives **outside the workflow repo**: the server-side `check:binding` baseline was not updated to match the shipped change, so CI will report drift until it is folded (§4). This is a cross-repo coordination gap, not a defect in the committed workflow.

## Audit Passes (over the committed state)

### 1. Expressiveness — clean
- Activity descriptions de-sequenced (AP-38): `scope-and-draft` reads as purpose ("A complete file manifest… drafted and reviewed file by file"), not step order. Same across `intake-and-context`, `requirements-refinement`, `validate-and-commit`.
- Every checkpoint count interpolation is backed by a declared technique output — `{expressiveness_finding_count}` (audit-expressiveness), `{conformance_finding_count}` (audit-conformance), `{rule_hygiene_finding_count}` (audit-rule-hygiene), `{enforcement_finding_count}` (audit-rule-enforcement), `{pass_count}`/`{fail_count}` (audit-schema-validation), `{addressed_count}`/`{total_count}` (scope-verification), `{file_count}` (scope-definition), `{review_findings_count}` (compile-report + summarize-findings). H4 fully closed.

### 2. Conformance — clean
- **H6** — zero `rules:` blocks remain across all 9 activity files (grep-confirmed).
- **M11** — static `assumption-decision` checkpoint id (no templated `#{...}` id).
- **M3** — `content-drafting` monolith split into `present-file-approach` + `present-for-review`, both loop bindings re-pointed.
- **M12** — per-mode dimension mapping now a `derive-design-dimensions` technique output, not a loose `set` message.
- **RR-7** — minor bump 1.6.0 → 1.7.0, consistent with library convention for behavior-changing-but-schema-compatible updates.

### 3. Rule-to-structure enforcement — clean
- **H8** — the 4 worker-facing rules (one-question, present-approach, corrections-persist, validate-before-commit) re-bucketed `rules.workflow` → `rules.activity` (workflow.yaml:33-36), so they now reach the agent they govern.
- **H2** — `scope_manifest_confirmed` is now a real `condition` gate on the `file-drafting-loop` (produced by the preceding `scope-and-structure-confirmed` checkpoint — producer precedes consumer); the inverted leading validate is gone. `design-principles` P2 claim repaired.
- **H3** — `has_unflagged_removals` is now produced by `present-for-review` (declared output); `preservation-check` gate reachable.
- **H1** — the drafting loop is rebuilt: single `file-drafting-loop`, body = approach → `file-approach-confirmed` → yaml-authoring → present-for-review → `file-review` → `preservation-check`, all inside the loop; `batch-review` after the loop; no duplicate top-level steps; `advance-to-next-file` marker deleted.
- **M9** — `stage-and-commit` gated `is_review_mode != true`; `commit-report` gated review — review-mode double-commit closed.
- **M10** — `verify-high-findings-review` runs on the review path (gated `is_review_mode == true`), distinct from the update-path `verify-high-findings`.
- **M13** — the whole update-mode audit chain is gated `is_review_mode != true AND scope_manifest_confirmed == true`; a review run never sets `scope_manifest_confirmed`, so the review→update mode-flip cannot make the update chain formally due. Gate-flip hazard defused.

### 4. Anti-patterns — clean
- **H5/H7** — `intake-classification` v2.0.0 declares `## Outputs` (operation_type, is_update_mode, is_review_mode, workflow_id, target_workflow_id); the three loader techniques (`intake-classification`, `reload-workflow`, `context-loading`) re-homed onto the wrapped `meta::workflow-engine::list-workflows` op. Every remaining `get_workflow` mention in techniques is a *prohibition* clause ("the executing worker does not call `get_workflow` directly") — no instruction to call it.
- **M5** (AP-44) — caller-coupling attributions removed from `design-context-readme`, `completion-artifact`, `elicitation-guide`, both READMEs; no "Used By" column.
- **M6** (AP-85) — impact procedure + content-preservation rules subsumed into `impact-analysis`, the audit-mapping table into `reconcile-design-assumptions`; pointers left in the resources. The variable-integrity 5th step preserved into `impact-analysis` (integrity check #5 honored — not dropped).
- **M7** (AP-84) — `design-assumptions` two-table log → single-row lifecycle log.
- **M8** (AP-41/61) — no residual "the interview step" / "before the audit passes run" / "four passes" cross-construct references in technique I/O.
- **M1** — orphaned variables deleted; `has_open_assumptions` wired as the interview-loop gate; `operation_type` added with its producer (intake-classification) landed alongside its consumer (mode-confirmation interpolation, M2).
- **M4** — README at v1.7.0, "82" patterns (×3), Output Economy category, P15 principle, planning-folder output path, workflow-local retrospective claim.

### 5. Schema validation — clean (verified at quality-review against this exact committed state)
The committed content is byte-identical to what the update-mode verification pass validated: `validate-workflow-yaml` PASS (v1.7.0, 9/9 activities, 37 technique files, no unanchored refs), `check-all-refs` 0 unresolved, `check:variable-model` PASS, and the `check:*` suite green. One expected NEW `check:binding` violation (`derive-design-dimensions`→`design_dimensions`, a forEach `over:` the guard doesn't scan) was identified there and flagged for baselining — see §4.

## Scope Audit (committed diff vs 06-scope-manifest.md)

47 files changed. Two Low scope-drift items, both benign — the drift is **manifest imprecision, not scope creep**:

| # | Sev | Drift | Disposition |
|---|-----|-------|-------------|
| SD-1 | Low | The manifest header states "no file is created, removed, or renamed" and lists `content-drafting.md` + the M12 mapping as in-place `modify`s. The commit actually **deleted `content-drafting.md` and created `present-file-approach.md` + `present-for-review.md`** (M3 split) and **created `derive-design-dimensions.md`** (M12). 1 delete + 3 creates vs the manifest's "all modify". | Accept. The file-level delta is the cleanest expression of the fix intent the manifest itself named (split content-drafting into two ops; mapping → technique output). RR-1/RR-6 (no *activity*/*checkpoint* add/remove) still hold — the delta is at technique-file granularity. Manifest wording was over-strict, not the change. |
| SD-2 | Low | `techniques/scope-definition.md` and `techniques/audit-schema-validation.md` were changed to add H4 count producers (`file_count`; `pass_count`/`fail_count`) but were listed **U/unaffected** in the impact analysis. | Accept. Correct H4 completions — the producer had to live where the count is naturally derived. Impact analysis under-predicted the producer placement; the change is right. |

Manifest items with no corresponding change: `resources/anti-patterns.md` (manifest anticipated "likely no content change" — confirmed unchanged) and `activities/README.md` (manifest said "verify no stale claims" — verified: no stale counts/versions, so no-change-needed). Neither is unaddressed scope.

## Cross-Repo Coherence Gap (for the retrospective / merge checklist)

**The server-side `scripts/binding-fidelity-baseline.json` was not updated.** The workflow-design commit `6417b3a0` is workflows-repo-only (correct — it carries no baseline file). But the baseline lives in the **server** repo, and the update-mode verification pass explicitly deferred the `--update-baseline` fold to validate-and-commit. It was not performed:

- The baseline still holds the **old 30 workflow-design entries** — including the 9 read-resolution violations that H4's output declarations **retired**, and it **lacks** the 1 new expected `design_dimensions` forEach-`over:` violation.
- When `check:binding` next runs against the merged workflow-design, it will report **9 stale baselined entries that no longer occur** and **1 new unbaselined violation** — a red guard on otherwise-clean content.

**Action (post-merge, server repo):** run `check:binding --update-baseline` (or the equivalent) against the merged workflow-design and commit the refreshed `scripts/binding-fidelity-baseline.json` in the server repo. This is a coordination follow-up, not a defect in PR #220.

## Retrospective Seeds

1. **Scope manifests should express file-level deltas at technique-file granularity.** SD-1 arose because the manifest asserted "no file created/removed" while naming fixes (op split, mapping→technique) that are most cleanly realized as new files + a delete. State the file-level create/delete explicitly when a "split into two ops" or "extract to technique" fix is planned.
2. **Impact analysis under-predicted H4 producer placement (SD-2).** When a checkpoint interpolation needs a count, the producer lands in the technique that naturally derives the value — trace each interpolation to its natural producer during impact analysis, not just to the report-compiling technique.
3. **Cross-repo baseline folds need an explicit owner + checklist item.** The single biggest coherence gap is entirely outside the workflow repo (§4). A workflows-repo commit cannot carry a server-repo baseline; the fold must be a named post-merge step, not an inline "owned by validate-and-commit" note that spans two repos.
4. **The self-review found real, shippable structural defects** (H1 scrambled loop, H2 inverted gate, H3 dead guard, H5 unsanctioned mode mutation, M13 gate-flip) — evidence the workflow-design audit passes have teeth even against the workflow that defines them.

---
*Post-update review artifact — session RPKOLJ, post-update-review activity (prefix 10). Committed state 6417b3a0 audited clean; one cross-repo baseline follow-up recorded for merge.*
