# Compliance Review: workflow-design

**Date:** 2026-07-11
**Workflow:** workflow-design v1.6.0 (self-audit)
**Files audited:** 49 (workflow.yaml, 9 activities, 34 techniques + TECHNIQUE.md, 11 resources, 4 READMEs)
**Baseline:** current library conventions — work-package v3.28.0, meta layer, AP-1..AP-85 catalog, deterministic guard suite

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 8 |
| Medium   | 13 |
| Low      | 9 |
| Pass     | 6 principles fully compliant; all deterministic guards green |

The workflow loads, validates, and resolves cleanly (schema validation 10/10, refs 0 unresolved, 0 new binding drift). The drift is **semantic**: workflow-design predates the step-binding/AP-60..85 era on several axes it now audits others against — activity-level prose `rules:` blocks (AP-62), unproduced checkpoint interpolations (10 baselined binding violations), a structurally scrambled drafting loop, dead enforcement guards, and doc counts frozen at "64 anti-patterns" (actual: 82).

## Principle Compliance Findings

| # | Principle | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Internalize before producing | Pass | `format-literacy` / `constructs-confirmed` gates, update-mode auto-confirm |
| 2 | Complete scope before execution | **Partial (H2)** | `verify-preconditions` validates `scope_manifest_confirmed` as scope-and-draft's FIRST step — before `scope-definition` and the checkpoint that sets it (default false on first entry). No transition/step gate reads it. `06-scope-and-draft.yaml:18-23` |
| 3 | One question at a time | Pass | forEach dimension loop + per-dimension checkpoint; per-assumption checkpoints |
| 4 | Maximize schema expressiveness | **Partial (H4, M1, M2)** | see Expressiveness findings |
| 5 | Convention over invention | **Partial (H6, M11)** | activity `rules:` blocks (baseline has none); templated checkpoint id invention |
| 6 | Never modify upward | Pass | no schema edits; validation steps present |
| 7 | Confirm before irreversible | Pass | update-mode `impact-confirmed` + `preservation-confirmed` |
| 8 | Corrections must persist | Partial (L) | text-only, acknowledged cross-cutting; no structural backing |
| 9 | Modular over inline | Pass | clean file modularity |
| 10 | Constraints as structure | **Partial (H3, H5, M1)** | dead guards, unsanctioned mode mutation, unread gate variables |
| 11 | Plan before acting | **Partial (H1)** | per-file checkpoints sit outside the drafting loop; `batch-review` precedes the loop |
| 12 | Non-destructive updates | **Partial (H3)** | `preservation-check` unreachable — `has_unflagged_removals` has no producer |
| 13 | Format literacy before content | Pass | gate + per-file and pre-commit validation |
| 14 | Documentation structure | **Partial (M4, M5)** | READMEs exist everywhere but carry stale counts/claims |
| 15 | Output economy | Partial (L1, L6, M7) | single close-out ✓; vestigial marker steps; two-table assumptions log |

## High Findings

| ID | Finding | Location | Verification |
|----|---------|----------|--------------|
| H1 | **Scope-and-draft drafting loop structurally scrambled.** `present-file-approach` / `yaml-authoring` / `present-for-review` exist TWICE with duplicate step ids (top-level lines 45/63/66 AND loop body 143/146/149); the per-file checkpoints (`file-approach-confirmed`, `file-review`, `preservation-check`) sit OUTSIDE the `file-drafting-loop`, which contains only the three technique steps and no checkpoints; `batch-review` ("All {file_count} files modified") executes BEFORE the loop that drafts the files; `advance-to-next-file` is an empty vestigial marker. Fix: one loop whose body is approach → checkpoint → draft → review → checkpoint; delete the duplicated top-level run and the marker; move `batch-review` after the loop. | `activities/06-scope-and-draft.yaml` | Duplicate ids grep-confirmed at cited lines; schema validator tolerates them (semantic, not schema-invalid) |
| H2 | **Inverted scope gate.** Leading `validate` on `scope_manifest_confirmed` precedes its producer checkpoint; on first entry it validates a variable that is default-false. The design-principles resource claims this variable "gates the transition to content drafting" — no such gate exists. Fix: gate the drafting loop (step `when`) or move the validate below the checkpoint. | `06-scope-and-draft.yaml:18-23`; `resources/design-principles.md` P2 | Re-derived from step order + variable default |
| H3 | **Dead preservation guard.** `preservation-check` is gated `has_unflagged_removals == true`, but nothing ever sets it: `content-drafting` declares NO outputs, no `set` action targets it. The update-mode preservation enforcement (P12) is unreachable. Fix: declare `has_unflagged_removals` as a `content-drafting` (or `review-draft-yaml`) output. | `06-scope-and-draft.yaml:86-99`; `techniques/content-drafting.md` | Grep: no producer anywhere in corpus |
| H4 | **Audit/report techniques under-declare outputs (signature-is-the-contract).** `audit-expressiveness`, `audit-conformance`, `audit-rule-hygiene`, `audit-rule-enforcement`, `compile-report`, `summarize-findings`, `intake-classification` have no `## Outputs`; checkpoint messages interpolate `{expressiveness_finding_count}`, `{conformance_finding_count}`, `{rule_hygiene_finding_count}`, `{enforcement_finding_count}`, `{pass_count}`, `{fail_count}`, `{addressed_count}`, `{total_count}`, `{file_count}` with no producer, and `{review_findings_count}` is a declared variable nothing sets. Fix: declare findings + counts as technique outputs. | `08-quality-review.yaml`, `09-validate-and-commit.yaml`, 7 technique files | 10 matching read-resolution entries in the binding-fidelity baseline (deterministic) |
| H5 | **Mode activation has no sanctioned producer.** `is_review_mode` (and initial `is_update_mode`/`workflow_id`/`target_workflow_id` classification) is set only by prose "recognition patterns" (`review-mode-guide`), violating `variable-mutation-source`; `intake-classification` declares no outputs. Fix: declare the classification results as `intake-classification` outputs (mode flags land via `variables-changed`). | `techniques/intake-classification.md`; `resources/review-mode-guide.md` | No `setVariable`/output/set targets the mode flags anywhere |
| H6 | **Activity-level prose `rules:` on all 9 activities (AP-62).** Reference baseline: zero work-package activities carry rules blocks. Most entries are (a) restatements of structure or bound-technique protocol (e.g. quality-review "Flag every instance of prose…" = audit-expressiveness protocol; retrospective's two rules duplicate `conduct-retrospective` rules verbatim), several are (b) technique-behavioral, none are (c) unencodable. Includes AP-27 cross-level duplication: schema-validation-before-commit stated at workflow + activity + technique level; one-question-at-a-time at workflow + activity. Fix: classify each entry delete/migrate/mechanize; end state is no activity `rules:` blocks. | all `activities/*.yaml` | grep across work-package/meta activities confirms baseline |
| H7 | **Worker-role conflict in loader techniques (AP-48 + consistency).** `reload-workflow`, `context-loading`, `intake-classification` instruct raw `list_workflows`/`get_workflow` calls; under the meta orchestration contract the executing WORKER is prohibited from calling `get_workflow`. Encountered live during this audit (worker had to substitute the workflows-worktree checkout). A wrapped `workflow-engine::list-workflows` op exists. Fix: reference wrapped ops or reframe the load as worktree/orchestrator-context sourcing. | `techniques/reload-workflow.md`, `context-loading.md`, `intake-classification.md` | Reproduced first-hand this session |
| H8 | **Worker-facing rules misfiled in `rules.workflow` (AP-71).** "One question at a time", "Present approach before implementation", "Corrections must persist", "All YAML files must pass schema validation before commit" command the WORKER but sit in the orchestrator-only bucket — never delivered to the agent they govern (the prism defect shape). Fix: move to `rules.activity` (or `universal`), dedupe against H6. | `workflow.yaml:15-23` | Bucket semantics per AP-71 / server surfacing |

## Schema Expressiveness Findings

| ID | Sev | Finding |
|----|-----|---------|
| M1 | M | Orphaned/dead variables with gate-claiming descriptions: `all_files_validated` (set by 2 checkpoints, read by nothing — "gates commit" is untrue), `approach_confirmed` ("gates content drafting" — no gate), `has_open_assumptions` ("gates the assumption interview" — the forEach has no condition), `user_wants_fixes`, `has_design_context`, `requirements_confirmed`, `has_deferred_assumptions` (all set, never read). Fix: wire the claimed gates or delete variables + prose claims. |
| M2 | M | `mode-confirmation` message interpolates `{create/update}` — not a resolvable designator; renders literally. Fix: a real variable (e.g. `{operation_type}`) output by `intake-classification` (ties to H5). |
| M12 | M | `set-design-dimensions` control step carries the per-mode dimension-list mapping inside a `set` message — a domain derivation misexpressed as a loose activity set (AP-67 caveat). Fix: technique output. |
| — | M | AP-38 sequence prose in activity descriptions: `intake-and-context` ("…followed by…, then…"), `scope-and-draft`, `validate-and-commit`, `requirements-refinement` descriptions enumerate their own step/phase sequence. Fix: describe the activity's purpose, not its order. |

## Convention Conformance Findings

| ID | Sev | Finding |
|----|-----|---------|
| M11 | M | Templated checkpoint id `assumption-decision#{current_assumption.id}` (`03-requirements-refinement.yaml:85`) — invention absent from the corpus; AP-64 requires a stable explicit checkpoint id (replay key). work-package's per-assumption checkpoint (fragment `assumption-interview`) uses a static id. |
| M3 | M | `content-drafting` is a monolith bound by two step roles (`present-file-approach`, `present-for-review`) distinguished only by which protocol half applies — AP-73(c). Also reads the current file implicitly without declaring `current_file` as input. Fix: split into two ops (or a group). |
| — | M | `fragments` mechanism unadopted: "One question at a time / ask-don't-assume" duplicates work-package's `interaction-discipline` fragment content; the assumption-decision checkpoint parallels the `assumption-interview` fragment. Evaluate ref/fragment reuse when fixing H6/H8. |
| L5 | L | Stale vocabulary: `TECHNIQUE.md` rule `tool-usage` says "no session token" (current protocol: `session_index`); `update-mode-guide` "resource index references" (numeric-index refs deprecated); `planning_folder_path` description example lacks the server's date-prefixed folder form. |
| L4 | L | Severity vocabulary mismatch: report template ends at "Pass" (`review-mode-guide`), planning-README guide uses "Nit" (`design-context-readme`). |

## Rule Hygiene Findings

Covered by H6/H8: AP-24 (activity rules restate bound-technique protocol — quality-review, pattern-analysis, impact-analysis, post-update-review), AP-27 cross-level duplication (validation ×3, one-question ×2, non-destructive ×3, retrospective ×2 verbatim). No AP-25 contradictions, no AP-26 prefix patterns (activity rules are unnamed strings).

| ID | Sev | Finding |
|----|-----|---------|
| M10 | M | Review mode skips `verify-high-findings` (gated `is_review_mode != true`) while the activity rule mandates independent verification of Highs before they drive remediation — and review findings DO drive remediation via `fix-issues`. Fix: ungate (bind it on the review path before `compile-report`). |
| L3 | L | `apply-audit-fixes` rule `no-collateral-removal` cites "the workflow's non-destructive-update rule" as prose (AP-50) — no addressable rule name exists at the workflow level; cite content or name the rule. |

## Rule Enforcement Findings

Text-only rules lacking structural backing (beyond H2/H3 broken enforcement): "Corrections must persist" (P8, acknowledged), "Read at least two existing workflows" (intake rule — no count check), "Commit to the workflows repository, not the main repository" (validate-and-commit — no validate action), "Draft files in the confirmed order" (scope-and-draft — no ordering structure). Disposition: candidates for H6's delete/migrate/mechanize triage.

## Anti-Pattern Findings

| ID | Sev | AP | Finding |
|----|-----|----|---------|
| M5 | M | AP-44 | Resource→caller coupling: `design-context-readme` ("consumed by [work-package::manage-artifacts::create-readme]…"), `completion-artifact` ("written into this document by conduct-retrospective"), `elicitation-guide` ("The `elicitation` technique poses questions…"), root README Resources table "Used By" column, `resources/README.md` per-resource producer/consumer attributions. |
| M6 | M | AP-85 | Resource protocol content: `update-mode-guide` "Impact Analysis Procedure" (Steps 1–5, dual-homed with `impact-analysis` technique protocol — the resource even carries a 5th step the technique lacks: variable integrity) and "Content Preservation Rules" (rules list); `design-assumption-reconciliation` audit-mapping table duplicates `reconcile-design-assumptions` protocol criteria. Fix: subsume into owning techniques, leave pointers. |
| M7 | M | AP-84 | `design-assumptions` log template: "Assumptions Surfaced" table + separate "Outcome" table = two representations per item; convention is a single-row lifecycle log updated in place. |
| M8 | M | AP-41/61 | Technique I/O and rules referencing activity constructs: `reconcile-design-assumptions` outputs name "the interview step"; `apply-audit-fixes` input names the four producing passes; `verify-high-findings` rule references the fix-cycle timing; `review-draft-yaml` output references "before the audit passes run". |
| M9 | M | — | Review-mode double commit: both `commit-report` (gated review) and `stage-and-commit` (ungated) run in review mode. Gate `stage-and-commit` `is_review_mode != true`. |
| M13 | M | — | **Mid-activity gate-flip hazard (live-reproduced in this run).** The `review-disposition` `fix-issues`/`selective-fixes` effects set `is_review_mode: false` *inside* quality-review, upstream of ten steps gated `is_review_mode != true` — after the flip those gates evaluate true against current state, making the update-mode audit chain (which audits drafted content that does not exist in a review run) formally due even though the effect's `transitionTo: intake-and-context` and the documented fix-issues contract (`review-mode-guide` — restart at intake with findings pre-loaded) intend it never to run. Fix: gate the update-mode chain on drafted-content state (e.g. `scope_manifest_confirmed == true`) instead of (or in addition to) the mode flag, or move the mode-flip `setVariable` into the transition target. |
| L1 | L | AP-82-adj | `offer-fixes` empty action step is a vestigial marker (the checkpoint IS the offer); same for `advance-to-next-file` (folded into H1). Delete. |
| L2 | L | AP-49/42 | `scope-verification` "the scope manifest" bare ×2 → `{scope_manifest}`; `conduct-retrospective`/`readme-authoring` protocols repeat literal filenames (`COMPLETE.md`, `README.md`) their `#### artifact` declarations already carry. |
| L7 | L | — | Baselined binding debt (deterministic, 23 entries): 6 dead outputs (`verified_findings`, `scope_drift_findings`, `fixes_applied`, `reviewed_blocks`, `draft_attestation`, `yaml_file` — declared, unconsumed), 7 orphan inputs (`selected_findings`, `drafted_files`, `schema_type`, `assumption_decisions`; `commit-regular-files` bound without `branch`/`commit_message`/`paths` deviations). Wire consumers/producers or accept explicitly. |
| L8 | L | — | Techniques branch on create/update mode via prose ("In update mode…") without declaring any mode input: `content-drafting`, `readme-authoring`, `review-draft-yaml`, `create-completion-doc`, `persist-report`. |
| — | Pass | AP-65/69/75/26/53/54/55 | No authored `artifacts[]`; activity `techniques[]` disjoint from step bindings (scatter-gather only, correctly scoped); `variable-binding` hoisted once to `workflow.techniques.activity`; symbol ids snake_case; no brace-arg invocations; no unescaped `$`. |

## Schema Validation Results

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts workflows/workflow-design` | PASS — workflow.yaml + 9/9 activities valid; no unanchored protocol references (35 technique files) |
| `check-all-refs.ts` | PASS — all `step.technique` refs resolve (0 unresolved corpus-wide) |
| `check-binding-fidelity.ts` | PASS (0 NEW) — 23 workflow-design violations pre-baselined (see H4, L7) |
| `check:identifiers`, `check:anchors`, `check:self-input`, `check:activity-tech`, `check:technique-template`, `check:variable-model`, `check:fragments` | all PASS |

Note: the schema/loader tolerates H1's duplicate step ids — validation cannot catch that class; it is flagged here semantically.

## Tool-Technique-Doc Consistency Findings

| ID | Sev | Finding |
|----|-----|---------|
| H7 | H | (above) worker-prohibited `get_workflow` instructed by three techniques. |
| M4 | M | Doc drift cluster in `README.md` + `resources/README.md`: header "v1.5.0" (yaml 1.6.0); "64 prohibited patterns"/"64 anti-patterns" in 3 places vs 82 actual catalog entries; category table lists 8 categories, sums 64, omits Output Economy (AP-77–85); Design Principles table lists 14 of 15 (P15 missing); Review Mode section claims report saved to `.engineering/artifacts/reviews/` while `persist-report` targets the planning folder (README's own Outputs section says planning folder); Techniques paragraph claims "the retrospective reuses `work-package::conduct-retrospective::retrospective`" but `11-retrospective.yaml` binds the workflow-local `conduct-retrospective`. |
| L6 | L | `design-context-readme` Activity Progress template omits the Retrospective (11) row. |
| L9 | L | `intake-classification` implies `get_workflow` returns "per-activity detail" (AP-34 return-value fidelity). |

## Recommended Fixes

**Priority 1 — behavior-changing structural defects:** H1 (rebuild the drafting loop), H2 (fix scope gate), H3 (produce `has_unflagged_removals`), H5 (declare intake-classification outputs incl. mode flags), M9 (gate `stage-and-commit`), M10 (verify Highs in review mode), M13 (defuse the review→update gate flip).

**Priority 2 — contract completeness:** H4 (declare audit outputs/counts — retires 10 baselined violations), H7 (re-home loader techniques onto wrapped ops), M1/M2 (wire or delete orphaned variables; fix `{create/update}`), L7 (baselined debt).

**Priority 3 — convention alignment:** H6 + H8 (dissolve activity rules blocks; re-bucket workflow rules; consider `fragments`), M3, M11, M12.

**Priority 4 — docs and resources:** M4 (README counts/claims), M5 (AP-44 decoupling), M6 (AP-85 subsumption), M7 (single-row log), L-series.

---

## Update-Mode Verification Pass (quality-review, 2026-07-12)

Second-pass audit of the DRAFTED v1.7.0 in the worktree (`workflow/workflow-design-self-review`), verifying the 30 fixes landed cleanly, introduced no new anti-pattern/schema/binding issues, and genuinely resolved the 8 Highs. **Result: clean — audit-fix-cycle ran 0 iterations; no residual, no Critical.**

### Deterministic guards (against the worktree)

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts` | PASS — v1.7.0, 9/9 activities, 37 technique files, no unanchored refs |
| `check-all-refs.ts` | PASS — 0 unresolved |
| `check-binding-fidelity.ts` | **1 NEW** (`derive-design-dimensions`→`design_dimensions`, forEach `over:` the guard doesn't scan — the expected/known dead-output, to be `--update-baseline`d at validate-and-commit) + **9 baselined violations retired** by the H4 output declarations |
| `check:variable-model` | PASS — defaults, gates, setVariable effects coherent (M1 deletions, new `operation_type`, `has_open_assumptions` wiring all consistent) |
| `check:review-mode`, `check:identifiers`, `check:anchors`, `check:self-input`, `check:activity-tech`, `check:technique-template`, `check:fragments` | all PASS |

### High findings — all verified resolved

- **H1** — `06-scope-and-draft` loop rebuilt: body = approach → `file-approach-confirmed` → yaml-authoring → `present-for-review` → `file-review` → `preservation-check`, all inside `file-drafting-loop`; no duplicate top-level steps; `batch-review` moved after the loop; `advance-to-next-file` marker deleted.
- **H2** — inverted `validate scope_manifest_confirmed` removed; loop gated `scope_manifest_confirmed == true`, produced by the preceding `scope-and-structure-confirmed` checkpoint (producer precedes consumer).
- **H3** — `has_unflagged_removals` now produced by `present-for-review` (declared output); `preservation-check` gate reachable.
- **H4** — every checkpoint count interpolation backed by a declared technique output: `expressiveness/conformance/rule_hygiene/enforcement_finding_count`, `pass_count`/`fail_count` (audit-schema-validation), `addressed_count`/`total_count` (scope-verification), `review_findings_count` (compile-report + summarize-findings, canonical reuse for review- and post-update-disposition).
- **H5** — `intake-classification` v2.0.0 declares `## Outputs`: `operation_type`, `is_update_mode`, `is_review_mode`, `workflow_id`, `target_workflow_id` — mode flags land via the sanctioned `variables-changed` path.
- **H6** — all 9 activity `rules:` blocks dissolved (grep-confirmed zero remaining).
- **H7** — `reload-workflow` / `context-loading` / `intake-classification` re-homed onto wrapped `meta::workflow-engine::list-workflows` (target confirmed present); no worker-prohibited `get_workflow`.
- **H8** — the 4 worker rules re-bucketed `rules.workflow` → `rules.activity`.

### Medium/Low — spot-verified landed

M1 (orphan vars deleted, `has_open_assumptions` wired), M2 (`{operation_type}` interpolation), M3 (`content-drafting` split into `present-file-approach`/`present-for-review`, both bindings re-pointed), M6 (impact-procedure + content-preservation subsumed into `impact-analysis`, incl. the variable-integrity 5th step; pointers left in `update-mode-guide`), M8 (no residual "the interview step"/"four passes"/"before the audit passes run" references), M9 (`stage-and-commit` gated `is_review_mode != true`), M10 (`verify-high-findings-review` on the review path), M11 (static `assumption-decision` id), M12 (`derive-design-dimensions` technique), M13 (update-mode chain re-gated on `scope_manifest_confirmed`), L1/L2/L3/L5, M4 (README → v1.7.0, "82", Output Economy, planning-folder output path, workflow-local retrospective). No new anti-pattern introduced.

**Disposition:** `needs_audit_fixes=false`, `has_critical_finding=false`. Proceed to validate-and-commit (which owns the `--update-baseline` fold for the one expected dead-output).

---
*Compliance review artifact — session RPKOLJ, quality-review activity (prefix 08). Updated in place by validate-and-commit's persist-report.*
