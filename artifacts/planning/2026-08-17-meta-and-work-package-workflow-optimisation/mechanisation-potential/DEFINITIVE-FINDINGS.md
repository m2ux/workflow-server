---
Subject: Mechanisation potential of agent-executed technique prose in the workflow-server meta and work-package workflow definitions
Evaluation Date: 2026-08-17
Scope: Every protocol step in workflows/meta (150 technique files, ~34,900 words) and workflows/work-package (112 files, ~66,300 words) that states a deterministic procedure, judged against the available surface — 16 registered MCP tools all session control-plane, 12,343 LOC in src/, 44 scripts and 26 check-*.ts guards in scripts/. GitNexus is not indexed for this target, so call-site counts are measured by corpus search rather than graph query.
---

# Mechanisation Potential of Workflow Technique Prose — Definitive Findings

## Core Finding

The corpus renders "a procedure nobody has scripted" and "a procedure that cannot be scripted" as identical protocol prose. A step reading `Run npx tsx scripts/check-all-refs.ts` and one reading `Apply Anchor Integrity across the folder` share shape, mood and numbering, while one delegates to 151 lines of tested TypeScript and the other asks an agent to re-derive it unaided. Mechanisation adoption therefore tracks what a workflow is about rather than what its steps do: `workflows/workflow-design`, whose subject is the repository's own tooling, invokes repo guards from protocol prose in three techniques; `workflows/meta` and `workflows/work-package`, whose subject is sessions and work packages, invoke none — including for steps whose subject is also the repository, such as git state, submodule layout, markdown link integrity and artifact file naming.

Testable prediction: across the remaining workflows, script invocation correlates with subject matter and not with the count of mechanical steps. `prism`, `work-packages`, `requirements-refinement` and `codebase-wiki` are the test set — any workflow whose subject is repository tooling shows invocations, any whose subject is domain work shows none.

## Findings

### MECH-01 — Two largest workflows do not invoke repo scripts a sibling workflow already invokes

- **Severity:** High
- **Classification:** Fixable
- **Description:** `workflows/workflow-design/techniques/audit-schema-validation.md` steps 1–3 run `scripts/validate-workflow-yaml.ts`, `scripts/check-all-refs.ts` and `scripts/check-binding-fidelity.ts` from protocol prose, landing results in declared outputs `{pass_count}` and `{fail_count}`; `yaml-authoring.md` step 6 does the same. Across 262 technique files in `meta` and `work-package`, no protocol step invokes any repo script.
- **Impact:** Every other mechanisation opportunity is priced as new infrastructure when it is in fact an editing task. The 26 guards are treated as unreachable from a run when four are demonstrably reachable, so the corpus re-derives in prose what it already computes in tested code.
- **Location:** corpus-wide; exemplar `workflows/workflow-design/techniques/audit-schema-validation.md:22-34`, `workflows/workflow-design/techniques/yaml-authoring.md:52`
- **Recommendation:** State one convention in `TECHNIQUE.md` — a protocol step whose procedure exists in `scripts/` invokes it rather than restating it — and enforce it with a guard in the style of the existing 26.
- **Blast radius:** 262 technique files, ~101,200 words; 26 guards reachable but unreached by these two workflows
- **Adversarial confirmation:** Underclaim promoted and reclassified. The finding was originally recorded as a schema gap requiring four new pieces of machinery — a determinism declaration, a guard for it, a `compute` MCP tool and a `kind: compute` step. The adversarial pass produced the counter-example and the remedy collapsed to a convention.

### MECH-02 — Progress item-link repointing cannot execute; its input has no producer

- **Severity:** High
- **Classification:** Fixable
- **Description:** `sync-progress-status` declares input `delivered_artifact` and branches on it at Protocol step 7, but a corpus-wide search returns two references, both inside the declaring file. No call site binds it; `commit-and-persist` passes only `activity_id`, `planning_folder_path` and `target_status`. Under the corpus's own `signature-is-the-contract` rule this is an unsatisfied binding gap.
- **Impact:** The Status transition policy row "complete, deliverable landed elsewhere → repointed at the artifact that actually holds it" never fires. Progress item links always resolve to the seeded target, so a deliverable that landed elsewhere is marked complete with a link to a file that does not hold it — the exact case the Status vocabulary section says the model exists to handle.
- **Location:** `workflows/meta/techniques/workflow-engine/sync-progress-status.md:32,54`; policy at `workflows/meta/resources/planning-readme.md#status-transition-policy`
- **Recommendation:** Bind `write-artifact`'s `{written_artifact}` into the `sync-progress-status` Apply as `delivered_artifact` through a single `step.technique.inputs` rename.
- **Blast radius:** every planning-folder README; one unreachable branch of a ten-step protocol
- **Adversarial confirmation:** New finding, introduced by the adversarial pass. The structural pass graded the technique on hand-execution volume and did not test its input bindings.

### MECH-03 — Branch-name prefix table omits one member of its own enum

- **Severity:** High
- **Classification:** Fixable
- **Description:** `issue-type-detection` declares the category enum as feature, bug, task, enhancement, epic. `naming-conventions` step 2 maps four of the five — feature to `feat`, bug to `fix`, task and enhancement to `chore`/`refactor` with no rule for choosing between them — and provides no mapping for epic.
- **Impact:** An epic-typed work package reaches step 4 with `{type}` undefined in `{type}/{issue_number}-{slugified-title}` and the agent invents a prefix. Two runs on the same epic produce different branch names, on a value `issue-type-detection` itself describes as expensive to change once a PR is open.
- **Location:** `workflows/work-package/techniques/naming-conventions.md:45`; enum at `workflows/work-package/techniques/issue-type-detection.md:20`
- **Recommendation:** Complete the table to a total function over the five-member enum, including epic and a rule separating task from enhancement.
- **Blast radius:** branch and PR identity for every work package
- **Adversarial confirmation:** Severity retained, scope widened. The structural pass identified only the task/enhancement ambiguity; the adversarial pass found the absent epic row, which is the harder defect because it yields no prefix rather than an ambiguous one.

### MECH-04 — Progress status decision table applied by hand about thirty times per run

- **Severity:** Medium
- **Classification:** Fixable
- **Description:** A 5x5 legal-write matrix, a three-row item-link reconciliation table and a per-target-status `allow_overwrite_na` default are executed by an agent at every dispatch and every activity completion. A 15-activity work-package run applies the same closed table roughly 30 times.
- **Impact:** The output `rows_updated` is a count rather than a diff, so a cell written against policy is indistinguishable from a correct one. Progress cells are the artifact a reader consults first and nothing in the run re-reads them, so an error ships to the reader unchallenged.
- **Location:** `workflows/meta/techniques/workflow-engine/sync-progress-status.md`; `workflows/meta/resources/planning-readme.md#status-transition-policy`
- **Recommendation:** Implement the policy as a script taking `{artifact_prefix}`, `{target_status}`, `{item_match}` and `{delivered_artifact}`, returning `rows_updated`.
- **Blast radius:** ~30 applications per 15-activity run; the highest-volume closed table in the corpus
- **Adversarial confirmation:** Confirmed. Named by the adversarial pass as the strongest pure-mechanisation case to survive its attack.

### MECH-05 — Artifact mint race cannot be won by an agent

- **Severity:** Medium
- **Classification:** Fixable
- **Description:** `write-artifact` step 4 instructs a re-scan for an existing numbered instance before creating one, falling through to update if one appeared. Scan-then-create spans two tool calls and is not atomic for an agent.
- **Impact:** A lost race mints a second numbered instance of one logical artifact. Step 1 detects the duplicate only on the next write and then logs it to the assumptions-log rather than resolving it. Once MECH-02 is fixed the consequence compounds: the wrong instance path lands in a Progress item link.
- **Location:** `workflows/work-package/techniques/manage-artifacts/write-artifact.md:46`
- **Recommendation:** Implement find-or-update as one atomic operation so the scan and the create cannot interleave.
- **Blast radius:** 87 corpus references — the most-cited technique surveyed
- **Adversarial confirmation:** Confirmed and sharpened to "fixable only in code" — the race is closable by an atomic operation and not by more careful prose.

### MECH-06 — Review-mode ambiguity is self-assessed, so the confirm gate cannot catch confident error

- **Severity:** Medium
- **Classification:** Structural at its core; the guard is fixable
- **Description:** `review-mode-detection` step 1 inspects the request for review signals through an open enumeration ending "and similar". Step 2 sets `review_mode_ambiguous` when intent is unclear, and the activity carries a confirm checkpoint conditioned on that flag whose options set `is_review_mode` by effect. The gate therefore fires on declared uncertainty only.
- **Impact:** A confident misclassification never reaches the gate, and then drives 52 `when:` gates and 29 checkpoint conditions across 11 of 15 activities. The run partitions on a wrong boolean with no further checkpoint and no artifact recording the decision's basis.
- **Location:** `workflows/work-package/techniques/review-mode-detection.md:53-54`; gate at `workflows/work-package/activities/01-start-work-package.yaml:44`, effects at lines 54, 61, 110
- **Recommendation:** Assert the contradiction `is_review_mode == true && review_pr_missing == true`, which no correct review-mode classification can satisfy; or make the confirm unconditional.
- **Blast radius:** 85 references to `is_review_mode` across 11 of 15 work-package activities — 52 `when:` gates, 29 checkpoint conditions, 4 checkpoint effects
- **Adversarial confirmation:** Severity lowered from High to Medium and the mechanism corrected. The structural pass recorded that nothing downstream could detect the divergence, having missed the confirm gate entirely. The residual defect is narrower and more precise: a self-assessed confidence flag cannot detect confident error.

### MECH-07 — Planning-folder link checking is partly wired and partly unwritten

- **Severity:** Medium
- **Classification:** Partly fixable, partly unwritten
- **Description:** Links carrying no `#anchor` are validated by nothing, since `scripts/check-resource-anchors.ts` walks only anchored links and ignores pure file links. Resolution against `{artifact_publish_ref}` is specified in the technique and implemented nowhere; `scripts/check-site-links.ts` is scoped to `site/**/*.html` with a hardcoded blob prefix and cannot serve. The five slug edge cases the guard documents — fenced-code skip, duplicate-heading suffixes, non-collapsing space-to-hyphen so "Plan & Prepare" renders `plan--prepare`, unclosed-fence direction inversion, non-markdown targets — appear in no technique prose.
- **Impact:** A link check passes on the working tree and the published folder 404s for the reader, with a clean report on file. An agent and CI disagree on the first heading containing an ampersand.
- **Location:** `workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md:30,35`; `scripts/check-resource-anchors.ts`; `scripts/check-site-links.ts`
- **Recommendation:** Point the existing anchor guard at the planning folder with `--root`, then write the missing capability — non-anchored link resolution against a git ref via `git cat-file -e {ref}:{path}`.
- **Blast radius:** every published planning folder
- **Adversarial confirmation:** Corrected in both directions. The structural pass's two internal experts contradicted each other on guard coverage, one understating it at one class of four and the other implying the implementation essentially existed. The adversarial pass established the true position — the guard's reason type covers missing files as well as missing anchors, but only for links that carry an anchor — and separated the cheap part (reachability) from the unwritten part (ref-relative and non-anchored resolution).

### MECH-08 — Change-surface technique specifies an unspecified join

- **Severity:** Medium
- **Classification:** Fixable
- **Description:** `three-dot-name-status` step 2 pairs `git diff --name-status` with `git diff --numstat` and builds one row per path with renames keeping git's rename status form. The two commands disagree on rename row shape and the join key is not given. For binary files `--numstat` emits a dash rather than integers.
- **Impact:** Rename rows join incorrectly or are dropped, and binary files have no representable value for the declared `additions` and `deletions` fields. Downstream review activities read a change surface that silently omits or misattributes renamed and binary paths.
- **Location:** `workflows/meta/techniques/version-control/three-dot-name-status.md:47-48`
- **Recommendation:** Script the join with an explicit rename-aware key and a null representation for binary files.
- **Blast radius:** every review and diff-reading activity consuming the change surface
- **Adversarial confirmation:** Severity raised from Low to Medium. The structural pass treated the step as a transcription of four git invocations; the adversarial pass showed it is a transcription plus an unspecified join over two divergent output formats.

### MECH-09 — Artifact conformance fuses computable detection with generative correction

- **Severity:** Medium
- **Classification:** Mixed
- **Description:** `verify-artifact-conforms` step 3 both detects violations and corrects them in place in already-persisted artifacts. Three of its four correction actions are mechanical — substituting a link for a fact the canonical-home map homes elsewhere, deleting a section whose content is an absence, collapsing a table whose every row passes. Two are generative: condensing prose over a line budget and rewriting a passage against the writing register.
- **Impact:** Grading the technique as wholly judgement-bound conceals three computable actions, and the in-place correction mutates artifacts the run has already persisted with no diff recorded.
- **Location:** `workflows/meta/techniques/verify-artifact-conforms.md:55-59`
- **Recommendation:** Split at the detect/correct seam, computing detection and the three mechanical corrections and leaving condensation and register rewriting to the agent.
- **Blast radius:** 25 corpus references
- **Adversarial confirmation:** Reclassified from Structural to Mixed. The adversarial pass enumerated the four correction actions and showed only two are irreducibly generative.

### MECH-10 — Deterministic detection fused with judgement inside single protocol steps

- **Severity:** Low
- **Classification:** Partly fixable
- **Description:** `select-target-component` step 3 ranks three tiers of which two are basename string equality and the third, "when it clearly names one", has no criterion. `create-worktree` step 2 fuses deterministic worktree-registration detection with two interactive escalations.
- **Impact:** The computable half cannot be lifted without splitting the step, and the fused step is unverifiable as a whole. The consequence is bounded because step 2 of `select-target-component` has already set `component_selection_needed`, so a poor ranking is a recommendation shown at a gate rather than a decision taken.
- **Location:** `workflows/meta/techniques/version-control/select-target-component.md:46`; `workflows/work-package/techniques/manage-git/create-worktree.md:30-33`
- **Recommendation:** Lift the mechanical ranking tiers out as computed inputs to the existing gate.
- **Adversarial confirmation:** Severity lowered from Medium to Low, on the ground that the output is a recommendation presented at a user gate rather than an autonomous decision.

### MECH-11 — Small total functions carried as full technique files

- **Severity:** Low
- **Classification:** Fixable, lowest value in the set
- **Description:** Six techniques state total functions with no fallback path: path-type identification by git mode prefix, project-type detection over a two-member output space, README section-set comparison, workflows target-path composition, repo-root resolution, and feature-branch confirmation against two literals.
- **Impact:** Cost only. Mechanising them removes no degradability because none is stated, but the saving is the difference between a procedure statement and a signature-plus-invocation statement — roughly 30 to 60 words per step — rather than the full file, because the technique is fetched and delivered either way.
- **Location:** `identify-path-type.md`, `project-type-detection.md`, `verify-readme-conforms.md`, `derive-workflows-target-path.md`, `repo-root-resolution.md`, `verify-feature-branch.md`
- **Recommendation:** Replace the procedure body with an invocation and a signature. Sequence these last.
- **Adversarial confirmation:** Saving corrected downward. The structural pass quoted technique word counts as if they were the saving; the delivery cost is paid either way.

### MECH-12 — Infrastructure-submodule predicate is total prose

- **Severity:** Low
- **Classification:** Fixable, negligible value
- **Description:** The exclusion rule reads: a submodule is infrastructure when its path equals `workflows`, equals `.engineering`, or starts with `.engineering/`. Three literal string tests over a total predicate.
- **Impact:** None on correctness. There is no boundary case and no run-to-run variance available, so `is_monorepo` cannot flip between runs on this rule.
- **Location:** `workflows/meta/techniques/version-control/TECHNIQUE.md:40-42`
- **Recommendation:** Express as data alongside the algorithm if and when `detect-repo-type` is scripted; otherwise leave.
- **Adversarial confirmation:** Severity lowered from High to Low. The structural pass claimed a submodule near the boundary could be classified either way between runs; the rule is total and the claimed failure scenario cannot occur.

## Conservation Laws & Design Trade-offs

### Contract Restatement Conservation

- **Constraint:** Moving a procedure's implementation from prose into code costs nothing semantically — the algorithm has one home either way. What is conserved is the number of places the procedure's contract is stated: once per call site plus once at the definition. Mechanisation does not reduce that count; it makes the relationship between the statements checkable, and only where a guard exists to check it.
- **Current operating point:** `scripts/check-binding-fidelity.ts` exists because declared signatures drift from call sites, and `scripts/binding-fidelity-triage.json` is the standing list of drift conceded rather than fixed. `write-artifact` carries 87 contract statements (MECH-05); `verify-artifact-conforms` carries 25 (MECH-09). `audit-schema-validation.md` step 3 demonstrates the low-cost form, restating a signature and an escape hatch in roughly 40 words while the algorithm stays in TypeScript (MECH-01).
- **Shift prediction:** Adopting the invocation convention raises the number of contract statements that a guard can check without changing how many exist. Drift moves from silent to reported; the triage file grows before it shrinks.

### Blast-Radius Conservation

- **Constraint:** Mechanisation pays in proportion to how far a wrong value travels before a human sees it. Tier 1 is silent divergence, where a `when:`, a checkpoint condition or an orchestrator prose gate consumes the value and the run simply takes another path. Tier 2 is a shipped defect, where an artifact a reader outside the run consumes carries the value and only a reader following it can notice. Tier 3 is immediate, where the next step of the same activity consumes it and the error surfaces at once.
- **Current operating point:** Tier 1 holds `is_review_mode` at 85 references (MECH-06), `is_monorepo` at four gates, and `readme_conformance.conforms` at an orchestrator prose gate. Tier 2 holds `written_artifact` feeding Progress item links (MECH-02, MECH-05), `rows_updated` (MECH-04) and `broken_artifact_links` (MECH-07) — none read by any expression, all shipped to readers. Tier 3 holds the small total functions (MECH-11) and the change surface (MECH-08).
- **Shift prediction:** Ranking by tier rather than by how deterministic a procedure looks inverts the obvious build order. The closed decision tables in tier 2 outrank every git one-liner in tier 3, and the tier 1 items are where a guard rather than a computation is the correct remedy.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| MECH-01 | synthesis.md (D1) | structural F15 / adversarial WP-1, WP-2, R13 | Medium / High |
| MECH-02 | synthesis.md (D2) | adversarial UC-1, R2 | High |
| MECH-03 | synthesis.md (D3) | structural F2 / adversarial UC-2, R1 | High |
| MECH-04 | synthesis.md (D4) | structural F7 / adversarial R8 | Medium |
| MECH-05 | synthesis.md (D5) | structural F10 / adversarial UC-3, R4 | Medium |
| MECH-06 | synthesis.md (D6) | structural F1 / adversarial OC-2, R3 | High / Medium |
| MECH-07 | synthesis.md (D7) | structural F5, F6 / adversarial WP-3, UC-4, R5 | Medium |
| MECH-08 | synthesis.md (D8) | structural F9 / adversarial UC-5, R6 | Low / Medium |
| MECH-09 | synthesis.md (D9) | structural F11 / adversarial OC-3, R7 | Medium |
| MECH-10 | synthesis.md (D10) | structural F4, F14 / adversarial R10, R9 | Medium / Low |
| MECH-11 | synthesis.md (D11) | structural F8, F12, F13 / adversarial UC-6, R12 | Low |
| MECH-12 | synthesis.md (D12) | structural F3 / adversarial OC-1, R11 | High / Low |

Withdrawn: the structural pass's F15 (no technique declares whether an output is derived or judged, so no guard can find a candidate) is not carried as a finding. Its remedy was reasoned from the premise MECH-01 corrects, and the declaration is a convenience once the invocation convention is in place rather than a prerequisite for it. The conservation law originally proposed — that determinism and degradability are conserved — is excluded, having been falsified by `audit-schema-validation.md` step 3, which is machine-executable, readable as its own contract, and degradable at once.
