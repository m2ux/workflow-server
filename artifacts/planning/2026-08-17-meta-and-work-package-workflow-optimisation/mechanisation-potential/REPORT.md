---
Subject: Mechanisation potential of agent-executed technique prose in the workflow-server meta and work-package workflow definitions
Evaluation Date: 2026-08-17
Scope: Every protocol step in workflows/meta (150 technique files, ~34,900 words) and workflows/work-package (112 files, ~66,300 words) that states a deterministic procedure, judged against the available surface — 16 registered MCP tools all session control-plane, 12,343 LOC in src/, 44 scripts and 26 check-*.ts guards in scripts/.
---

# Mechanisation Potential of Workflow Technique Prose — Evaluation Report

## Executive Summary

Twelve mechanisation opportunities are confirmed across the two largest workflow definitions, sized against a surveyed candidate set of 10,005 words of technique prose. The capability needed to act on most of them is already shipped and in use by a sibling workflow, so the enabling change is a convention rather than new machinery. Two previously unrecorded defects surfaced during the evaluation: a documented Progress-table behaviour that cannot execute because its input has no producer, and a branch-naming table that omits one member of its own closed enum.

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 3     |
| Medium   | 6     |
| Low      | 3     |
| Total    | 12    |

Core finding: The corpus renders "a procedure nobody has scripted" and "a procedure that cannot be scripted" as identical protocol prose, so mechanisation adoption tracks what a workflow is about rather than what its steps do.

## Core Finding

A protocol step reading `Run npx tsx scripts/check-all-refs.ts` and one reading `Apply Anchor Integrity across the folder` carry the same shape, mood and numbering, while one delegates to 151 lines of tested TypeScript and the other asks an agent to re-derive that TypeScript unaided. Nothing in the technique file format distinguishes them. The consequence is that mechanisation adoption follows authorial framing: `workflows/workflow-design`, whose subject matter is the repository's own tooling, invokes repo guards from protocol prose in three techniques; `workflows/meta` and `workflows/work-package`, whose subject matter is sessions and work packages, invoke none — including for steps whose subject matter is also the repository, such as git state, submodule layout, markdown link integrity and artifact file naming.

Testable prediction: across the remaining workflows, script invocation correlates with subject matter and not with the number of mechanical steps a workflow contains. `prism`, `work-packages`, `requirements-refinement` and `codebase-wiki` are the test set — any workflow whose subject is repository tooling shows invocations, any workflow whose subject is domain work shows none.

## High Findings

### MECH-01 — Two largest workflows do not invoke repo scripts a sibling workflow already invokes

- **Severity:** High
- **Description:** `workflows/workflow-design/techniques/audit-schema-validation.md` steps 1–3 run `scripts/validate-workflow-yaml.ts`, `scripts/check-all-refs.ts` and `scripts/check-binding-fidelity.ts` from protocol prose, landing results in declared outputs `{pass_count}` and `{fail_count}`; `yaml-authoring.md` step 6 does the same. Across 262 technique files in `meta` and `work-package`, no protocol step invokes any repo script.
- **Classification:** Fixable
- **Location:** corpus-wide; exemplar `workflows/workflow-design/techniques/audit-schema-validation.md:22-34`
- **Blast radius:** 262 technique files, ~101,200 words; 26 guards reachable but unreached

### MECH-02 — Progress item-link repointing cannot execute; its input has no producer

- **Severity:** High
- **Description:** `sync-progress-status` declares input `delivered_artifact` and branches on it at Protocol step 7, but a corpus-wide search returns two references, both inside the declaring file. No call site binds it, and `commit-and-persist` passes only `activity_id`, `planning_folder_path` and `target_status`. The Status transition policy row "complete, deliverable landed elsewhere → repointed at the artifact that actually holds it" is therefore unreachable, and Progress item links always resolve to the seeded target.
- **Classification:** Fixable
- **Location:** `workflows/meta/techniques/workflow-engine/sync-progress-status.md:32,54`; policy at `workflows/meta/resources/planning-readme.md#status-transition-policy`
- **Blast radius:** every planning-folder README; one unreachable branch of a 10-step protocol

### MECH-03 — Branch-name prefix table omits one member of its own enum

- **Severity:** High
- **Description:** `issue-type-detection` declares the category enum as feature, bug, task, enhancement, epic. `naming-conventions` step 2 maps four of the five — feature to `feat`, bug to `fix`, task and enhancement to `chore`/`refactor` with no rule for choosing between them — and provides no mapping for epic. An epic-typed work package reaches step 4 with `{type}` undefined in `{type}/{issue_number}-{slugified-title}`.
- **Classification:** Fixable
- **Location:** `workflows/work-package/techniques/naming-conventions.md:45`; enum at `workflows/work-package/techniques/issue-type-detection.md:20`
- **Blast radius:** branch and PR identity for every work package; the corpus states this value is expensive to change once a PR is open

## Medium Findings

### MECH-04 — Progress status decision table applied by hand about thirty times per run

- **Severity:** Medium
- **Description:** A 5x5 legal-write matrix, a three-row item-link reconciliation table and a per-target-status `allow_overwrite_na` default are executed by an agent at every dispatch and every activity completion. A 15-activity work-package run applies the same closed table roughly 30 times. The output `rows_updated` is a count rather than a diff, so a misapplied cell is indistinguishable from a correct one.
- **Classification:** Fixable
- **Location:** `workflows/meta/techniques/workflow-engine/sync-progress-status.md`; `workflows/meta/resources/planning-readme.md#status-transition-policy`
- **Blast radius:** ~30 applications per 15-activity run; highest-volume closed table in the corpus

### MECH-05 — Artifact mint race cannot be won by an agent

- **Severity:** Medium
- **Description:** `write-artifact` step 4 instructs a re-scan for an existing numbered instance before creating one, falling through to update if one appeared. Scan-then-create spans two tool calls and is not atomic. A lost race mints a second numbered instance of one logical artifact; step 1 detects it only on the next write and logs it rather than resolving it.
- **Classification:** Fixable
- **Location:** `workflows/work-package/techniques/manage-artifacts/write-artifact.md:46`
- **Blast radius:** 87 corpus references — the most-cited technique surveyed

### MECH-06 — Review-mode ambiguity is self-assessed, so the confirm gate cannot catch confident error

- **Severity:** Medium
- **Description:** `review-mode-detection` step 1 inspects the request for review signals through an open enumeration ending "and similar", and step 2 sets `review_mode_ambiguous` when intent is unclear. The activity gates on that flag, so a declared-uncertain classification reaches the user. A confident misclassification does not, and then drives 52 `when:` gates and 29 checkpoint conditions across 11 of 15 activities.
- **Classification:** Structural at its core; the guard is fixable
- **Location:** `workflows/work-package/techniques/review-mode-detection.md:53-54`; gate at `workflows/work-package/activities/01-start-work-package.yaml:44`
- **Blast radius:** 85 references to `is_review_mode` across 11 of 15 work-package activities

### MECH-07 — Planning-folder link checking is partly wired and partly unwritten

- **Severity:** Medium
- **Description:** Three gaps. Links carrying no `#anchor` are validated by nothing, since the anchor guard walks only anchored links. Resolution against `{artifact_publish_ref}` is specified in the technique and implemented nowhere, so a target present locally but absent from the published ref passes the check and 404s for the reader. The five slug edge cases the guard documents — fenced-code skip, duplicate-heading suffixes, non-collapsing space-to-hyphen, unclosed-fence direction, non-markdown targets — appear in no technique prose.
- **Classification:** Partly fixable, partly unwritten
- **Location:** `workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md:30,35`; `scripts/check-resource-anchors.ts`
- **Blast radius:** every published planning folder

### MECH-08 — Change-surface technique specifies an unspecified join

- **Severity:** Medium
- **Description:** `three-dot-name-status` step 2 pairs `git diff --name-status` with `git diff --numstat` and builds one row per path. The two commands disagree on rename row shape and the join key is not given. For binary files `--numstat` emits a dash rather than integers, which the declared `additions` and `deletions` fields cannot represent.
- **Classification:** Fixable
- **Location:** `workflows/meta/techniques/version-control/three-dot-name-status.md:47-48`
- **Blast radius:** every review and diff-reading activity that consumes the change surface

### MECH-09 — Artifact conformance fuses computable detection with generative correction

- **Severity:** Medium
- **Description:** `verify-artifact-conforms` step 3 both detects violations and corrects them in place in already-persisted artifacts. Three of its four correction actions are mechanical — substituting a link for a fact the canonical-home map homes elsewhere, deleting a section whose content is an absence, collapsing a table whose every row passes. Two are generative: condensing prose over a line budget and rewriting a passage against the writing register.
- **Classification:** Mixed
- **Location:** `workflows/meta/techniques/verify-artifact-conforms.md:55-59`
- **Blast radius:** 25 corpus references

## Low Findings

### MECH-10 — Deterministic detection fused with judgement inside single protocol steps

- **Severity:** Low
- **Description:** `select-target-component` step 3 ranks three tiers of which two are basename string equality and the third, "when it clearly names one", has no criterion. `create-worktree` step 2 fuses deterministic worktree-registration detection with two interactive escalations. In both, the computable half cannot be lifted without splitting the step.
- **Classification:** Partly fixable
- **Location:** `workflows/meta/techniques/version-control/select-target-component.md:46`; `workflows/work-package/techniques/manage-git/create-worktree.md:30-33`

### MECH-11 — Small total functions carried as full technique files

- **Severity:** Low
- **Description:** Six techniques state total functions with no fallback path: path-type identification by git mode prefix, project-type detection over two possible values, README section-set comparison, workflows target-path composition, repo-root resolution, and feature-branch confirmation against two literals. Mechanising them costs no degradability. The saving is the difference between a procedure statement and a signature-plus-invocation statement, roughly 30 to 60 words per step, not the full file.
- **Classification:** Fixable, lowest value in the set
- **Location:** `identify-path-type.md`, `project-type-detection.md`, `verify-readme-conforms.md`, `derive-workflows-target-path.md`, `repo-root-resolution.md`, `verify-feature-branch.md`

### MECH-12 — Infrastructure-submodule predicate is total prose

- **Severity:** Low
- **Description:** The exclusion rule reads: a submodule is infrastructure when its path equals `workflows`, equals `.engineering`, or starts with `.engineering/`. Three literal string tests over a total predicate, with no boundary case and no run-to-run variance available. Expressing it as data rather than prose is a cost improvement, not a correctness one.
- **Classification:** Fixable, negligible value
- **Location:** `workflows/meta/techniques/version-control/TECHNIQUE.md:40-42`

## Corrections Required

1. MECH-01: State one convention in `TECHNIQUE.md` — a protocol step whose procedure exists in `scripts/` invokes it rather than restating it — and enforce it with a guard in the style of the existing 26. This closes MECH-04, MECH-05, MECH-07, MECH-08 and MECH-11 as a class.
2. MECH-02: Bind `write-artifact`'s `{written_artifact}` into the `sync-progress-status` Apply as `delivered_artifact` through a single `step.technique.inputs` rename.
3. MECH-03: Complete the branch-prefix table to a total function over the five-member enum, including epic and a rule separating task from enhancement.
4. MECH-04: Implement the Progress status policy as a script taking `{artifact_prefix}`, `{target_status}`, `{item_match}` and `{delivered_artifact}`, returning `rows_updated`.
5. MECH-05: Implement find-or-update as one atomic operation so the scan and the create cannot interleave.
6. MECH-06: Assert the contradiction `is_review_mode == true && review_pr_missing == true`, or make the review-mode confirm unconditional.
7. MECH-07: Point the existing anchor guard at the planning folder with `--root`, then write the missing capability — non-anchored link resolution against a git ref.
8. MECH-08: Script the name-status and numstat join with an explicit rename-aware key and a null representation for binary files.
9. MECH-09: Split the technique at the detect/correct seam, computing detection and the three mechanical corrections.
10. MECH-10: Lift the mechanical ranking tiers out as computed inputs to the existing gate.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| MECH-01 | synthesis.md (D1) | structural F15 / adversarial R13 | Medium / High |
| MECH-02 | synthesis.md (D2) | adversarial UC-1, R2 | High |
| MECH-03 | synthesis.md (D3) | structural F2 / adversarial UC-2, R1 | High |
| MECH-04 | synthesis.md (D4) | structural F7 / adversarial R8 | Medium |
| MECH-05 | synthesis.md (D5) | structural F10 / adversarial R4 | Medium |
| MECH-06 | synthesis.md (D6) | structural F1 / adversarial OC-2, R3 | High / Medium |
| MECH-07 | synthesis.md (D7) | structural F5, F6 / adversarial WP-3, UC-4, R5 | Medium |
| MECH-08 | synthesis.md (D8) | structural F9 / adversarial UC-5, R6 | Low / Medium |
| MECH-09 | synthesis.md (D9) | structural F11 / adversarial OC-3, R7 | Medium |
| MECH-10 | synthesis.md (D10) | structural F4, F14 / adversarial R10, R9 | Medium / Low |
| MECH-11 | synthesis.md (D11) | structural F8, F12, F13 / adversarial UC-6, R12 | Low |
| MECH-12 | synthesis.md (D12) | structural F3 / adversarial OC-1, R11 | High / Low |
