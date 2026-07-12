# Impact Analysis: workflow-design remediation (update pass)

**Date:** 2026-07-11
**Session:** RPKOLJ · activity `impact-analysis` (prefix 05)
**Target:** `workflows/workflow-design/` (v1.6.0 → 1.7.0)
**Change spec:** [08-compliance-review.md](08-compliance-review.md) — 30 findings, fix-issues (ALL)
**Bounding assumptions:** [03-assumptions-log.md](03-assumptions-log.md) — RR-1 (9-activity structure unchanged), RR-6 (no checkpoint add/remove), RR-7 (minor bump)

This is an **update to an existing green-validating workflow**. Every fix is an in-place edit; no file is created or deleted. Analysis only — no modifications this activity.

---

## 1. File Inventory (49 files)

| Class | Count | Files |
|-------|-------|-------|
| Root | 1 | `workflow.yaml` |
| Activities | 9 | `01-intake-and-context`, `03-requirements-refinement`, `04-pattern-analysis`, `05-impact-analysis`, `06-scope-and-draft`, `08-quality-review`, `09-validate-and-commit`, `10-post-update-review`, `11-retrospective` (`.yaml`) |
| Techniques | 34 | `TECHNIQUE.md` + 33 technique files (see §2) |
| Resources | 11 | `anti-patterns`, `completion-artifact`, `design-assumption-reconciliation`, `design-assumptions`, `design-context-readme`, `design-principles`, `elicitation-guide`, `review-mode-guide`, `schema-construct-inventory`, `update-mode-guide` (`.md`) + `resources/README.md` |
| READMEs | 4 | root `README.md`, `activities/README.md`, `techniques/README.md`, `resources/README.md` |

---

## 2. Impact Classification

Legend: **DM** = directly modified · **IA** = indirectly affected (must be re-checked for consistency once a producer/consumer changes) · **U** = unaffected · **R** = content removed (see §4).

### Root

| File | Class | Findings | What changes |
|------|-------|----------|--------------|
| `workflow.yaml` | DM + R | H8, M1, M2(var), RR-7 | Re-bucket 4 worker rules out of `rules.workflow` → `rules.activity`/`universal` (H8); dissolve `rules.activity` block per H6 disposition **and** absorb migrated worker rules there — net rules rework; wire or **delete** orphaned variables + prose claims (M1: `all_files_validated`, `approach_confirmed`, `has_open_assumptions`, `user_wants_fixes`, `has_design_context`, `requirements_confirmed`, `has_deferred_assumptions`); add `operation_type` variable (M2); version 1.6.0 → 1.7.0 |

### Activities (all 9 DM — H6 dissolves every activity `rules:` block)

| File | Class | Findings | What changes |
|------|-------|----------|--------------|
| `01-intake-and-context` | DM + R | H6, H5(consumes), M2, AP-38 desc | Dissolve `rules:` block; description de-sequenced (AP-38); intake-classification now produces mode flags + `operation_type` |
| `03-requirements-refinement` | DM + R | H6, M11, M12, AP-38, M1 | Dissolve `rules:`; templated checkpoint id `assumption-decision#{current_assumption.id}` → static id (M11); `set-design-dimensions` set-message mapping → technique output (M12); de-sequence description; `has_open_assumptions` gate wired onto interview loop (M1/RR-5) |
| `04-pattern-analysis` | DM + R | H6 (AP-24) | Dissolve `rules:` block (restates bound-technique protocol) |
| `05-impact-analysis` | DM + R | H6 (AP-24) | Dissolve `rules:` block (restates impact-analysis technique protocol) |
| `06-scope-and-draft` | DM + R | H1, H2, H3, M3, H6, L1, M1, AP-38 | **Largest structural change** — see §2a |
| `08-quality-review` | DM + R | H4, H6, M10, M13, L1 | Dissolve `rules:`; ungate `verify-high-findings` for review path (M10); defuse review→update gate-flip by gating update-chain on `scope_manifest_confirmed` (M13/RR-2); delete `offer-fixes` vestigial marker (L1); checkpoint interpolations now backed by declared outputs (H4) |
| `09-validate-and-commit` | DM + R | H4, M9, H6, L2 | Dissolve `rules:`; gate `stage-and-commit` `is_review_mode != true` (M9); count interpolations backed by outputs (H4) |
| `10-post-update-review` | DM + R | H6 (AP-24) | Dissolve `rules:` block |
| `11-retrospective` | DM + R | H6 (AP-27) | Dissolve `rules:` (two rules duplicate `conduct-retrospective` rules verbatim) |

#### 2a. `06-scope-and-draft` — structural rebuild (H1)

The drafting loop is scrambled: `present-file-approach` / `yaml-authoring` / `present-for-review` exist **twice** (top-level lines 44/62/65 AND loop body 142/145/148, sharing step ids); the per-file checkpoints sit **outside** `file-drafting-loop`; `batch-review` runs **before** the loop; `advance-to-next-file` is empty.

- **Removed** (R): the duplicated top-level technique-step run (lines 44–67); the `advance-to-next-file` empty marker (110–112, L1).
- **Restructured**: `file-drafting-loop` body becomes approach → `file-approach-confirmed` → draft → `present-for-review` → `file-review` → `preservation-check`; `batch-review` moves **after** the loop.
- **Moved / rewired**: the three per-file checkpoints (`file-approach-confirmed`, `file-review`, `preservation-check`) move *into* the loop body (no add/remove — RR-6 holds).
- H2: leading `validate scope_manifest_confirmed` (18–23) either moves below its producer checkpoint or the loop gets a `when` gate.
- H3: `preservation-check` gate `has_unflagged_removals` gets a producer (declared as `content-drafting`/`review-draft-yaml` output).
- M3: `content-drafting` monolith split into two ops (approach vs review halves), each declaring `current_file` input.
- AP-38: description de-sequenced.

### Techniques

| File | Class | Findings | What changes |
|------|-------|----------|--------------|
| `intake-classification` | DM | H5, H7, L9, L8 | Declare `## Outputs`: mode flags (`is_review_mode`, `is_update_mode`), `workflow_id`, `target_workflow_id`, `operation_type` (H5/M2); re-home `list_workflows`/`get_workflow` onto wrapped ops (H7); fix AP-34 return-value claim (L9) |
| `reload-workflow` | DM | H7 | Reference wrapped `workflow-engine::list-workflows`-style op |
| `context-loading` | DM | H7, L8 | Wrapped op ref; declare mode input if it branches on mode |
| `content-drafting` | DM + R | H3, M3, L8 | Split into two ops (M3); declare `has_unflagged_removals` output (H3); declare `current_file` input; declare mode input (L8) |
| `review-draft-yaml` | DM | H3(alt), M8, L8 | Candidate `has_unflagged_removals` producer (H3); output prose "before the audit passes run" removed (M8); mode input (L8) |
| `audit-expressiveness` | DM | H4 | Declare `## Outputs` findings + `expressiveness_finding_count` |
| `audit-conformance` | DM | H4 | Declare outputs + `conformance_finding_count` |
| `audit-rule-hygiene` | DM | H4 | Declare outputs + `rule_hygiene_finding_count` |
| `audit-rule-enforcement` | DM | H4 | Declare outputs + `enforcement_finding_count` |
| `compile-report` | DM | H4 | Declare outputs: `pass_count`, `fail_count`, `review_findings_count`, etc. |
| `summarize-findings` | DM | H4 | Declare outputs (`addressed_count`, `total_count`) |
| `run-audit-passes` | IA | H4 | May aggregate declared per-pass counts once producers exist |
| `verify-high-findings` | DM | M10, M8 | Ungate for review path (activity edit); output/rule references to fix-cycle timing removed (M8) |
| `apply-audit-fixes` | DM + R | L3, M8 | Rule `no-collateral-removal` prose → addressable rule name/content (L3); input naming the four producing passes de-coupled (M8) |
| `reconcile-design-assumptions` | DM + R | M6, M8 | Audit-mapping table (dup of protocol) subsumed (M6); outputs naming "the interview step" de-coupled (M8) |
| `scope-verification` | DM | L2 | "the scope manifest" bare ×2 → `{scope_manifest}` |
| `conduct-retrospective` | DM | L2 | Protocol repeated literal `COMPLETE.md` removed (declared in `#### artifact`) |
| `readme-authoring` | DM | L2, L8 | Repeated literal `README.md` removed; mode input (L8) |
| `create-completion-doc` | DM | L8 | Declare mode input |
| `persist-report` | DM | L8 | Declare mode input |
| `TECHNIQUE.md` | DM | L5 | `tool-usage` rule "no session token" → `session_index` |
| `scope-definition`, `pattern-analysis`, `impact-analysis`, `audit-anti-patterns`, `audit-principles`, `audit-schema-validation`, `audit-consistency`, `commit-verification`, `prepare-workflow-branch`, `publish-workflow-pr`, `elicitation`, `yaml-authoring` | U | — | No finding targets these (verify no stale interpolation once counts land) |

### Resources

| File | Class | Findings | What changes |
|------|-------|----------|--------------|
| `update-mode-guide` | DM + R | M6, L5 | "Impact Analysis Procedure" (Steps 1–5) + "Content Preservation Rules" subsumed into `impact-analysis`/`content-drafting` techniques, left as pointers (M6); "resource index references" stale vocab (L5); the extra 5th step (variable integrity) either lands in the technique or is dropped |
| `review-mode-guide` | DM | H5(prose→structural), L4 | Mode "recognition patterns" prose ceases to be the mutation source (structural producer added in intake-classification); severity vocab align (L4) |
| `design-assumption-reconciliation` | DM + R | M6 | Audit-mapping table (dup of `reconcile-design-assumptions` protocol) subsumed |
| `design-assumptions` | DM + R | M7 | Two-table log ("Surfaced" + "Outcome") → single-row lifecycle log (AP-84) |
| `design-context-readme` | DM + R | M5, L4, L6 | Resource→caller coupling attribution removed (M5); "Nit" vocab align (L4); add Retrospective (11) row to Activity Progress template (L6) |
| `completion-artifact` | DM + R | M5 | "written into this document by conduct-retrospective" coupling removed |
| `elicitation-guide` | DM + R | M5 | "The `elicitation` technique poses questions…" coupling removed |
| `design-principles` | DM + R | H2 | Remove/repair P2 claim that `scope_manifest_confirmed` "gates the transition to content drafting" (align to the real gate H2 introduces) |
| `anti-patterns` | IA | M4 | Referenced by count-drift docs; content itself likely unchanged (82 entries authoritative) — verify count references elsewhere point here correctly |
| `schema-construct-inventory` | U | — | No finding |
| `resources/README.md` | DM + R | M5, M4 | Per-resource producer/consumer attributions removed (M5); "Used By"/count drift (M4) |

### READMEs

| File | Class | Findings | What changes |
|------|-------|----------|--------------|
| root `README.md` | DM + R | M4, M5 | Header v1.5.0 → 1.7.0; "64 anti-patterns" → 82 (×3 places); category table add Output Economy (AP-77–85); Design Principles table add P15; Review Mode output path corrected to planning folder; retrospective-reuse claim corrected to workflow-local `conduct-retrospective`; Resources "Used By" column removed (M5) |
| `activities/README.md` | IA | M4-adj | Verify no stale counts/claims once activities change |
| `techniques/README.md` | IA | M4-adj | Verify technique roster/claims still accurate after M3 split |
| `resources/README.md` | (counted under Resources above) | | |

---

## 3. Integrity Checks

### 3a. Transition-chain integrity — INTACT

No activity is added, removed, or reordered (RR-1). The transition chain is untouched:
`intake-and-context → requirements-refinement → pattern-analysis → impact-analysis → scope-and-draft → quality-review → validate-and-commit → post-update-review → retrospective`, with mode-gated branches. **No `to:` reference changes; no chain break introduced.**

Two *gate* edits alter branch reachability (not the chain topology):
- M9: `stage-and-commit` gains `is_review_mode != true` — closes the review-mode double-commit path.
- M10: `verify-high-findings` un-gated on the review path — opens a previously-dead branch.
- M13: update-mode chain re-gated on `scope_manifest_confirmed` — defuses the review→update gate-flip. **Verify** the re-gate leaves the legitimate update path fully reachable (it does: update sets `scope_manifest_confirmed=true` before quality-review).

### 3b. Reference integrity

- **Technique refs:** M3 splits `content-drafting` into two ops. Every `step.technique: content-drafting` binding (currently `present-file-approach`, `present-for-review` in scope-and-draft) must be re-pointed to the new op ids, or the split must be a same-file group so refs resolve. **This is the one ref-integrity risk in the change set** — mis-execution orphans two bindings. H1's loop rebuild touches exactly these two steps, so the rebind is co-located.
- **Resource refs:** M6 subsumes resource *content* into techniques but the resources remain (as pointers), so no resource ref is orphaned. H5 stops treating `review-mode-guide` prose as the mutation source but does not delete the resource.
- **Wrapped-op refs (H7):** three loader techniques switch to referencing `workflow-engine::list-workflows` (and siblings). **Verify** those wrapped ops exist in the meta layer before rebinding (RR-3 confirms `workflows/meta/techniques/workflow-engine/list-workflows.md` exists).
- **Variable refs:** M1 deletes several orphaned variables. **Verify** each deleted variable has zero readers corpus-wide before removal (report lists them as set-but-never-read; deletion is safe only if no `when`/`condition`/`transition`/interpolation reads them). New variable `operation_type` (M2) needs its producer (`intake-classification`, H5) landed in the same pass or the `mode-confirmation` interpolation stays broken.

**No orphaned references detected in the current file set.** All risks above are *introduced-by-the-fix* risks to guard during scope-and-draft, not pre-existing breaks.

---

## 4. Content Removal Inventory (non-destructive-update gate)

Per the workflow's non-destructive-update discipline, every removal below must be **explicitly confirmed**. Grouped by kind:

### 4a. Structural removals (schema constructs deleted)
| Item | File | Finding | Rationale |
|------|------|---------|-----------|
| Duplicated top-level `present-file-approach`/`yaml-authoring`/`present-for-review` steps | `06-scope-and-draft` | H1 | Redundant duplicate of loop-body steps; kept version moves into loop |
| `advance-to-next-file` empty action step | `06-scope-and-draft` | H1/L1 | Vestigial marker, no effects |
| `offer-fixes` empty action step | `08-quality-review` | L1 | Vestigial marker (the checkpoint IS the offer) |
| Orphaned variables: `all_files_validated`, `approach_confirmed`, `has_open_assumptions`†, `user_wants_fixes`, `has_design_context`, `requirements_confirmed`, `has_deferred_assumptions` | `workflow.yaml` | M1 | Set-but-never-read (†`has_open_assumptions` is *wired* not deleted per RR-5; the rest deleted unless a natural gate consumer exists). **Confirm each individually.** |

### 4b. Rules removed (all 9 activity `rules:` blocks + workflow rules re-bucketed)
| Item | File | Finding | Disposition |
|------|------|---------|-------------|
| Every activity `rules:` block (9 activities) | all `activities/*.yaml` | H6 | delete / migrate-to-technique / mechanize — **end state: zero activity rules**. Behavioral rules migrate into bound techniques; structure-restating rules delete. |
| 4 worker rules in `rules.workflow` (one-question, present-approach, corrections-persist, validate-before-commit) | `workflow.yaml` | H8 | **Moved** (not deleted) to `rules.activity`/`universal` — dedupe against H6 migrations |
| Retrospective's 2 rules (verbatim dup of `conduct-retrospective`) | `11-retrospective` | H6/AP-27 | delete (content survives in the technique) |

### 4c. Resource content removed / subsumed
| Item | File | Finding | Disposition |
|------|------|---------|-------------|
| "Impact Analysis Procedure" (Steps 1–5) + "Content Preservation Rules" | `update-mode-guide` | M6 | **Subsumed** into techniques (content survives, moved), pointer left. Note the 5th step (variable integrity) the technique lacks — must be preserved into the technique, not dropped. |
| Audit-mapping table | `design-assumption-reconciliation` | M6 | Subsumed into `reconcile-design-assumptions` protocol (content survives) |
| Second per-item table ("Outcome") | `design-assumptions` | M7 | Merged into single-row log (representation change, no data loss) |
| Resource→caller "Used By"/producer-consumer attributions | `design-context-readme`, `completion-artifact`, `elicitation-guide`, `resources/README.md`, root README Resources table | M5 | **Deleted** (AP-44 decoupling — pure attribution, no procedural content) |

### 4d. Doc content corrected (replacement, not pure deletion)
Stale counts ("64"→82), version headers, category/principle table rows, path claims, retrospective-reuse claim (root README, `resources/README.md`, M4). Old values removed, correct values written — net factual correction.

**Removal-confirmation note for `preservation-confirmed` checkpoint:** the bulk of removals are either (a) *migrations* where content survives in a better home (H6 rules→techniques, M6 resource→technique, H8 rule re-bucket) or (b) deletions of *vestigial/orphaned/duplicate* material with no live reader (H1 duplicates, L1 markers, M1 orphan variables, M5 attributions). None removes live user-facing procedure. The single item needing careful preservation is M6's variable-integrity 5th step — it must land in the technique, not vanish.

---

## 5. Summary

- **Files touched:** 45 of 49 DM/R; 4 IA (`run-audit-passes`, `anti-patterns`, `activities/README.md`, `techniques/README.md`); ~3 U (`schema-construct-inventory`, ~12 untargeted techniques). *(Every file examined per activity rule.)*
- **Blast radius bounded:** no file created/deleted; no activity/checkpoint added/removed (RR-1, RR-6); transition chain topology unchanged.
- **One ref-integrity risk to guard:** M3's `content-drafting` split must re-point its two bindings (co-located with H1's loop rebuild).
- **Integrity verifications for scope-and-draft:** (1) confirm zero readers before deleting each M1 variable; (2) land `operation_type` producer with its consumer; (3) confirm meta wrapped ops exist before H7 rebind; (4) confirm M13 re-gate keeps the update path reachable; (5) preserve M6's variable-integrity step into the technique.
- **Removals are overwhelmingly migrations or vestigial-cleanup** — surfaced in §4 for the `preservation-confirmed` gate.

---
*Impact analysis artifact — session RPKOLJ, impact-analysis activity (prefix 05).*
