# Workflow Design: workflow-design — Complete

> Update (via Review — fix-issues) · 2026-07-12

## Summary

Self-audit of the `workflow-design` workflow (v1.6.0) against current library conventions surfaced 30 compliance findings (0 Critical / 8 High / 13 Medium / 9 Low). The user chose fix-issues — fix all of them — flipping the session to update mode and turning the compliance report into the change spec. All 30 were remediated into v1.7.0, validated green, committed (`6417b3a0`), opened as [PR #220](https://github.com/m2ux/workflow-server/pull/220) against the `workflows` branch, and re-audited fresh post-commit: the shipped content is clean. It matters because the workflow that *defines* workflow-design conventions had itself drifted from those conventions over weeks of library evolution — this closes that gap.

## What Was Delivered

47 files changed across the workflow (`+511 / −408`, merge-base `05d1f812` → `6417b3a0`). Framed against v1.6.0:

- **Activities (9 modified, 0 added/removed/renamed):**
  - `06-scope-and-draft` — **structural rebuild** of the drafting loop (H1): single `file-drafting-loop` with checkpoints inside the `forEach` body (approach → `file-approach-confirmed` → yaml-authoring → present-for-review → `file-review` → `preservation-check`), `batch-review` moved after the loop, duplicated top-level steps and the `advance-to-next-file` marker removed; `scope_manifest_confirmed` now a real `condition` gate (H2); `has_unflagged_removals` given a producer (H3).
  - `08-quality-review` — H4 count interpolations now backed by declared outputs; `verify-high-findings` review path ungated (M10); update chain re-gated on `scope_manifest_confirmed` to defuse the mode-flip hazard (M13); `offer-fixes` marker removed (L1).
  - `09-validate-and-commit` — `stage-and-commit` gated `is_review_mode != true` (M9), closing review-mode double-commit; H4 counts backed.
  - All 9 activities — `rules:` blocks dissolved (H6, end state zero); descriptions de-sequenced (AP-38).
- **Techniques (20 modified of 34, net 1 delete + 3 creates):**
  - `content-drafting.md` **deleted**, split into **`present-file-approach.md`** + **`present-for-review.md`** (M3), both loop bindings re-pointed; `has_unflagged_removals` declared as an output (H3).
  - **`derive-design-dimensions.md`** created — per-mode dimension mapping moved from a loose `set` message to a technique output (M12).
  - `intake-classification.md` v2.0.0 — declares `## Outputs` (mode flags, `workflow_id`, `target_workflow_id`, `operation_type`) so mode is a sanctioned structural producer, not resource-recognition mutation (H5); the three loader techniques (`intake-classification`, `reload-workflow`, `context-loading`) re-homed onto wrapped `meta::workflow-engine::list-workflows` (H7).
  - Five audit/report techniques declare their count outputs (H4): `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `compile-report`, `summarize-findings`, plus `scope-definition` (`file_count`) and `audit-schema-validation` (`pass_count`/`fail_count`).
  - `impact-analysis` and `reconcile-design-assumptions` absorbed resource-borne procedures (M6, AP-85); the variable-integrity 5th step preserved into `impact-analysis`.
- **Resources (10 modified of 11):** caller-coupling attributions removed (M5, AP-44); `design-assumptions` two-table log → single-row lifecycle log (M7, AP-84); `design-principles` P2 gate claim repaired (H2); pointers left where procedures were subsumed into techniques.
- **Variables / rules:** 6 orphan variables deleted after zero-reader confirmation, `has_open_assumptions` wired as the interview-loop gate (M1); `operation_type` variable added with its producer (M2); 4 misfiled worker rules re-bucketed `rules.workflow` → `rules.activity` so they reach the agent they govern (H8, AP-71); version → 1.7.0 (RR-7).
- **READMEs (3):** root README to v1.7.0, "82" pattern count, Output Economy category, P15 principle, planning-folder output path, "Used By" column removed.

## Design Decisions

Canonically recorded in the [assumptions log](03-assumptions-log.md) (RR-1..RR-7, all Validated through audit reconciliation) and the [planning README](README.md#design-decisions). Load them there. The load-bearing pivot — the user's fix-issues selection converting a review into a full remediation update — and the seven design assumptions are all recorded in those two documents; no drafting-time decision was made that is recorded nowhere else.

## Scope Outcome

44 of 47 files matched the confirmed [scope manifest](06-scope-manifest.md) exactly. Two Low, benign drifts (manifest imprecision, not scope creep — RR-1/RR-6 held, no activity/checkpoint added or removed):

| # | Sev | Drift | Disposition |
|---|-----|-------|-------------|
| SD-1 | Low | Manifest stated "all modify, no file created/removed" but the M3 op-split and M12 mapping→technique fixes are cleanest as **1 delete + 3 creates** (`−content-drafting.md`, `+present-file-approach.md`, `+present-for-review.md`, `+derive-design-dimensions.md`). | Accept — the file-level delta is the cleanest expression of the fix intent the manifest itself named; wording was over-strict. |
| SD-2 | Low | `scope-definition.md` and `audit-schema-validation.md` were edited to add H4 count producers though impact analysis marked them unaffected. | Accept — the count producer must live where the value is naturally derived; impact analysis under-predicted producer placement. |

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **REQUIRED post-merge follow-up (cross-repo, server side)** — the server-side `scripts/binding-fidelity-baseline.json` is **not** updated by this workflows-repo commit (correct — a workflows commit cannot carry a server file). It still holds the 30 old workflow-design entries, including 9 read-resolution violations that H4's new output declarations **retired**, and lacks the 1 new expected `derive-design-dimensions`→`design_dimensions` forEach-`over:` dead-output the guard doesn't scan. **Until folded, CI `check:binding` will report 9 stale + 1 new entry (262 → 254, net −8) against otherwise-clean content.** Action: after PR #220 merges and the workflows submodule pointer bumps, run `check:binding --update-baseline` in the **server** repo and commit the refreshed baseline as a **separate server-side PR**.
- **Baseline change is not gate-clean until that fold lands** — the red `check:binding` guard on the merged content is expected and is resolved only by the server-side PR above; do not treat it as a workflow-design defect.

## Lessons Learned

- The self-review found real, shippable structural defects in the workflow that defines the audit passes — H1 scrambled loop, H2 inverted gate, H3 dead guard, H5 unsanctioned mode mutation, M13 gate-flip hazard. The audit passes have teeth even against their own author.
- A workflow drifts from its own conventions across weeks of library evolution (step-binding, AP-60..85, fragments, bundling accrued after workflow-design was last touched). Periodic self-audit is worth scheduling, not just reacting to.

## Workflow Retrospective

[messages: ~3 substantive user interactions across the design session · session quality: Smooth]

### Observations

<!-- Server session.json records only bootstrap-engine events (1 resume checkpoint, answered "fresh"); the substantive design conversation is private history. Signals below are the categories that carried content. -->
- [feature request / decision] fix-issues selection at the review disposition gate — [intake-and-context → requirements-refinement] — the single load-bearing user decision; it flipped a review into a full 30-finding remediation update. Clean, unambiguous, no follow-up needed.
- [no clarification interview] all 7 design assumptions (RR-1..RR-7) resolved autonomously via the audit techniques against the corpus — none were stakeholder-dependent, so the interview loop correctly short-circuited via the `has_open_assumptions` gate. This is the intended headless path working as designed.
- [checkpoint anomaly — none material] the only server-recorded checkpoint (`resume-session`) was answered `fresh`; no checkpoint was answered against a default in a way that suggests a merge/demote candidate (AP-81/82).

### Recommendations

<!-- Prioritized, specific, actionable. -->
1. **High:** cross-repo baseline folds have no explicit owner and span two repos → add a named **post-merge step** (or merge-checklist item) for the server-side `check:binding --update-baseline` fold, replacing the inline "owned by validate-and-commit" note that a workflows-repo commit cannot honor (`validate-and-commit` activity / completion-artifact deferrals). This was the single largest coherence gap of the session.
2. **Medium:** scope manifests understate file-level deltas when a fix is "split one op into two" or "extract to a technique" → have `scope-and-draft` classify each manifest row as create / delete / modify rather than defaulting to "all modify" (`scope-manifest` template / scope-definition technique).
3. **Medium:** impact analysis under-predicts where a count/output producer lands → when a checkpoint interpolation needs a value, trace it to the technique that naturally *derives* it, not just to the report-compiling technique (`impact-analysis` activity / output-producer tracing).

**Key takeaway:** the workflow-design audit passes surfaced genuine structural bugs in workflow-design itself — the process is sound; the only real friction was a cross-repo baseline fold that the schema cannot express within a single-repo commit.
**Action required:** yes — the post-merge server-side `binding-fidelity-baseline.json` fold is REQUIRED (tracked in Known Limitations & Deferrals above); the two Medium process recommendations are candidates for a future workflow-design touch, no issue required now.

---
*Close-out artifact — session RPKOLJ, retrospective activity (prefix 11). v1.7.0 delivered clean; one REQUIRED cross-repo baseline follow-up recorded for post-merge.*
