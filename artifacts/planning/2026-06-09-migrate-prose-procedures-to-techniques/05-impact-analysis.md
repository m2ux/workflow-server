# Impact Analysis — Migrate Prose Procedures to Techniques (work-package)

**Session:** 6GRWGT · **Workflow under design:** `work-package` (update mode) · **Date:** 2026-06-09

> ## Direction-change note (2026-06-10) — supersedes the "no schema change" framing below
>
> Two decisions taken at the `impact-confirmed` checkpoint (scope accepted) revise how this inventory feeds the next phase. The inventory below stands unchanged as the authoritative file/content audit; only its disposition changes.
>
> 1. **Schema extension is now AUTHORIZED.** The earlier "no schema change / technique-ID granularity" constraint is reversed. The per-step technique binding will be extended to carry a structured **argument binding and operation selection** — i.e. a `{technique, operation, args}` binding. The schema and the server will be extended to support this.
> 2. **The 16 HARD cases are re-classified.** They are no longer "keep inline op-invocation" / lossy-under-model. Under the extended schema they become **structurally migratable**: each `group::op(args)` step migrates to a structured `{technique, operation, args}` binding (operation name + argument list preserved structurally, no prose loss). The HARD label below now means "requires the extended-schema binding," not "cannot be migrated."
> 3. **Spec the schema work item FIRST; defer all file edits.** No `.toon` or technique files are edited this pass. The immediate deliverables are PLANNING artifacts only, produced next in **scope-and-structure**:
>    - **Work item (A)** — a precise **schema + server extension spec** (the prerequisite that introduces the `{technique, operation, args}` binding).
>    - **Work item (B)** — the **work-package migration plan**, sequenced AFTER A (B consumes A's extended schema).
> 4. **Content-removal execution is DEFERRED to work item B.** The content-removal set below (the ~135 `description` removals, the 14 `supporting[]` arrays, the at-risk assumption-category lists and resource hyperlinks) is fully CATALOGUED here but **nothing is removed now**. The workflow rule "content-reducing updates require explicit user approval" is honored by deferring the actual removals to B's execution gate; this audit is the inventory, not the edit.

## Scope recap

- **In scope (modify):** every file under `workflows/work-package/` — `workflow.toon`, `activities/01..14`, `techniques/**` (new or fidelity-preserving merges).
- **In scope (governance, ONE edit outside the dir):** add anti-pattern rules to `workflows/workflow-design/workflow.toon` `rules[]` (currently `rules[14]`).
- **Read-only:** `meta/techniques/**` (match candidates only) and `prism/techniques/**` (referenced by post-impl-review / codebase-comprehension; not ours to edit).
- **Migration model per step:** prose procedure in `step.description` → migrate into a technique (NEW or fidelity-preserving merge into EXISTING work-package|meta technique) → REMOVE `description` → bind via structural `step.technique` (technique-ID granularity, no schema change).
- **End state:** EVERY step bound to a technique; each activity declares `techniques.primary` ONLY — eliminate all `techniques.supporting[]` (push supporting techniques down to step level).

## Migration-action legend

- **(A)** prose → NEW technique
- **(B)** prose → merge into EXISTING technique (candidate + location)
- **(C)** already bound / compliant (no change)
- **(D)** trivial step needing a technique it doesn't yet have (flag how to bind)
- **(HARD)** step embeds an inline op invocation with operation name + args (`group::op(args)`); `step.technique` is technique-ID granularity and CANNOT carry the op name or args — flagged as a hard case below.

---

## Global findings (apply across all 14 activities)

1. **Zero activities currently use `techniques.primary`.** All 14 declare `techniques.supporting[]` only (or, for 09-post-impl-review, a `supporting[]` plus inline `step.technique` on a few steps). Every one of these `supporting[]` arrays must be eliminated → **14 `supporting[] arrays` to remove** (content-reducing; needs approval).
2. **Most steps carry a `description`.** Across the 14 activities there are ~135 steps (top-level + loop sub-steps). The overwhelming majority have prose `description` fields embedding ordered procedure. Each `description` removal is a content-reducing change requiring explicit user approval (per `workflow-design.rules` "Non-destructive updates" and "Content-reducing updates require explicit user approval").
3. **Only 5 steps today carry a `step.technique` binding** (all bare group-IDs, not op-IDs): `01:detect-merge-strategy → manage-git`, `04:declare-context-scope → dco-provenance`, `08(loop):log-provenance → dco-provenance`, `12:dco-sign-off → dco-provenance`, `12:instruct-merge-strategy → manage-git`. These are class (C)-ish but each still carries a prose `description` that must migrate before removal, and the binding is group-granular while the prose names a specific op (see HARD cases).
4. **Cross-workflow technique references already in use** (these resolve to meta/prism, READ-ONLY — usable as class-B/-C bind targets but NOT editable): `github-cli-protocol`, `atlassian-operations`, `knowledge-base-search`, `version-control::commit-regular-files`, `gitnexus-operations::analyze`, `prism/structural-analysis`, `prism/portfolio-analysis`. Binding a step to a read-only meta/prism technique is allowed (it is a match candidate); the prose must still be migrated INTO our own technique when the procedure is work-package-specific, or subsumed by the meta technique when it is generic.
5. **Hard cases — inline op invocations with args.** The following steps embed `group::op(args)` in their `description`. Binding `step.technique` to the *group* loses the op name and the argument list. These cannot be losslessly migrated under the stated model without either (a) the technique's protocol making the op+args unambiguous from the binding alone, or (b) a model extension. All flagged for explicit user decision:
   - `01:update-reference-submodules` → `manage-git::update-reference-submodules(reference_path)`
   - `01:analyze-reference-with-gitnexus` → `gitnexus-operations::analyze(repo_path)` (meta, read-only)
   - `01:create-component-worktree` / `01:create-review-worktree` → `manage-git::create-worktree(reference_path, component_name, target_path, branch_name)`
   - `08(loop):run-tests` → `cargo-operations::test(scope: '-p {current_task.crate}')`
   - `10:preflight` → `cargo-operations::preflight()`
   - `10:run-suite` → `cargo-operations::run-suite(scope: '--workspace')`
   - `10(loop):analyze-failure` → `validate-build::analyze-failure(check_id, diagnostics, target_path)`
   - `10(loop):apply-fix` → `validate-build::apply-fix(check_id, fix_strategy)`
   - `10(loop):revalidate` → `cargo-operations::run-suite(scope: '--workspace')`
   - `11:verify-readme` → `manage-artifacts::verify-readme-conforms(planning_folder_path)`
   - `12(loop):rerender-and-verify` → `update-pr::render(template: final, pr_number)` + `update-pr::verify-body`
   - `13:remove-worktree` → `manage-git::remove-worktree(reference_path, component_name, target_path)`
   - `02..08:reconcile-iteration` (loop) — prose says "Execute one iteration of the reconcile-assumptions protocol" — binds cleanly to `reconcile-assumptions` (technique-ID), no args lost → NOT a hard case, but the recurring duplicated prose (see finding 6) should be subsumed.
6. **Massive duplicated `reconcile-assumptions` prose.** The identical "Reconcile assumptions" description and the identical `reconcile-iteration` loop-step description appear in **02, 03, 04, 05, 06, 08** (6 activities). The same `present-resolved-assumptions` / `interview-open-assumptions` / `record-response` prose recurs in 04, 05, 08. All of this prose should be subsumed by the existing `reconcile-assumptions` and `review-assumptions` techniques (class B), with `description` removed and `step.technique` set. This is the single largest content-reduction cluster.
7. **`collect-assumptions` / `update-assumptions-log` / `create-assumptions-log`** steps recur in 02–08 with per-activity category lists in the prose. The category lists are real content (not pure restatement) — migrating them needs a home (likely the `reconcile-assumptions` or a new `collect-assumptions` technique) or per-step preservation. Flag the category lists explicitly as content-at-risk.

---

## Per-activity inventory

### 01 — start-work-package (`techniques.supporting[9]`, 27 steps, 10 checkpoints)
- **supporting[9]:** `create-issue`, `github-cli-protocol` (meta), `atlassian-operations` (meta), `gitnexus-operations::analyze` (meta), `manage-git::update-reference-submodules`, `manage-git::detect-merge-strategy`, `manage-git::create-worktree`, `manage-artifacts::create-readme`, `manage-artifacts::write-artifact`. → ELIMINATE; push to step level.
- **Steps:** all 27 have prose `description`s embedding procedure; only `detect-merge-strategy` has a `step.technique` (= `manage-git`, group-granular).
- Action classes:
  - `detect-review-mode`, `capture-pr-reference` — (A) review-mode detection prose → NEW or merge into a review-mode technique (no work-package technique owns this today).
  - `resolve-reference` — (A) NEW (reference/monorepo resolution prose; not owned).
  - `update-reference-submodules` — (B→HARD) `manage-git::update-reference-submodules` + args.
  - `analyze-reference-with-gitnexus` — (B→HARD) `gitnexus-operations::analyze` (meta, read-only) + args.
  - `verify-signing-precondition` — (D) validate-action only; needs a technique to bind (candidate: NEW signing-precondition or fold into a manage-git op).
  - `detect-merge-strategy` — (C/HARD) bound to `manage-git`; prose names `detect-merge-strategy` op specifically.
  - `detect-project-type` — (A) NEW (project-type detection; not owned).
  - `check-issue`, `verify-jira-issue`, `verify-github-issue`, `search-github-issue`, `check-github-issue`, `create-github-issue-for-jira`, `create-issue`, `activate-issue`, `link-pr-to-ticket` — (B) merge into `create-issue` (+ meta `github-cli-protocol`/`atlassian-operations` for raw-tool sequences). Heavy procedural prose (Jira/GitHub tool sequences) — high content-at-risk.
  - `initialize-planning-folder` — (B) `manage-artifacts::create-readme` (+ artifact-location rule). Long prose; content-at-risk.
  - `present-problem-overview` — (A) NEW (two-paragraph stakeholder-overview authoring procedure; not owned).
  - `derive-branch-name`, `compute-canonical-target-path` — (A) NEW (naming-convention procedures; not owned).
  - `create-component-worktree`, `create-review-worktree` — (B→HARD) `manage-git::create-worktree` + 4 args each.
  - `check-branch`, `check-pr`, `create-pr` — (B) `github-cli-protocol`/`manage-git` + `create-pr`; `create-pr` references `pr-description` resource template (preserve link).
  - `determine-next-activity` — (D) trivial routing step; needs a technique (candidate: a routing/decision technique, or fold into transitions).
- **Content removals to flag:** 27 `description` removals + 1 `supporting[9]` array.

### 02 — design-philosophy (`techniques.supporting[3]`, 9 steps + 1 loop step, 3 checkpoints)
- **supporting[3]:** `classify-problem`, `reconcile-assumptions`, `review-assumptions`. → ELIMINATE.
- **Steps:** all have prose; none bound.
  - `define-problem`, `classify-problem`, `determine-path`, `document-philosophy` — (B) `classify-problem`.
  - `collect-assumptions`, `create-assumptions-log`, `reconcile-assumptions` + loop `reconcile-iteration` — (B) `reconcile-assumptions` (duplicated prose, finding 6/7).
  - `assess-ticket-completeness` — (A/B) ticket-completeness prose; candidate NEW or merge into `review-assumptions`/a review-mode technique.
  - `set-review-mode-path` — (D) trivial variable-set; needs technique.
- **Note:** also has its own `rules[4]` and `artifacts[2]` — out of step-migration scope but the `rules[4]` should be checked against AP-29 (single-step) during the actual edit.
- **Removals:** 9+1 `description` removals + 1 `supporting[3]`.

### 03 — requirements-elicitation (`techniques.supporting[4]`, 6 steps + 3 loop sub-steps, 2 checkpoints)
- **supporting[4]:** `elicit-requirements`, `manage-artifacts::write-artifact`, `reconcile-assumptions`, `review-assumptions`. → ELIMINATE.
  - `stakeholder-discussion`, `elicit-requirements` + loop `ask-question`/`record-response` — (B) `elicit-requirements`.
  - `collect-assumptions`, `create-document`, `update-assumptions-log` — (B) `elicit-requirements` / `manage-artifacts::write-artifact` (write step) / `reconcile-assumptions`.
  - `reconcile-assumptions` + loop `reconcile-iteration` — (B) `reconcile-assumptions` (finding 6).
- **Removals:** ~9 `description` removals + 1 `supporting[4]`.

### 04 — research (`techniques.supporting[6]`, 10 steps + 4 loop sub-steps, 4 checkpoints)
- **supporting[6]:** `dco-provenance::append-task-row`, `knowledge-base-search` (meta), `manage-artifacts::write-artifact`, `reconcile-assumptions`, `research-knowledge-base`, `review-assumptions`. → ELIMINATE.
  - `kb-research`, `web-research`, `synthesize`, `document` — (B) `research-knowledge-base` (+ meta `knowledge-base-search`). `kb-research` prose names `get_guidance` tool sequence (content-at-risk; AP-47/48 territory).
  - `collect-assumptions`, `update-assumptions-log`, `reconcile-assumptions`, `present-resolved-assumptions`, `interview-open-assumptions` + loop steps — (B) `reconcile-assumptions` / `review-assumptions` (finding 6).
  - `declare-context-scope` — (C-ish) already bound to `dco-provenance`; prose names `context_scope` set + provenance semantics; keep bind, migrate prose.
- **Removals:** ~14 `description` removals + 1 `supporting[6]`.

### 05 — implementation-analysis (`techniques.supporting[4]`, 12 steps + 4 loop sub-steps, 2 checkpoints)
- **supporting[4]:** `analyze-implementation`, `manage-artifacts::write-artifact`, `reconcile-assumptions`, `review-assumptions`. → ELIMINATE.
  - `checkout-baseline`, `document-expected-changes`, `return-to-pr-branch` (review-mode) — (A/B) review-mode baseline prose; candidate NEW review-mode technique or merge into `analyze-implementation`.
  - `review-implementation`, `evaluate-effectiveness`, `establish-baselines`, `document` — (B) `analyze-implementation`.
  - `collect-assumptions`, `update-assumptions-log`, `reconcile-assumptions`, `present-resolved-assumptions`, `interview-open-assumptions` + loop steps — (B) `reconcile-assumptions`/`review-assumptions` (finding 6).
- **Removals:** ~16 `description` removals + 1 `supporting[4]`.

### 06 — plan-prepare (`techniques.supporting[7]`, 11 steps + 1 loop step, 1 checkpoint)
- **supporting[7]:** `classify-problem`, `create-plan`, `create-test-plan`, `manage-git::sync-branch`, `reconcile-assumptions`, `review-assumptions`, `update-pr`. → ELIMINATE.
  - `env-prerequisites` — (D) 6 validate-actions only, no procedure; needs a technique to bind (candidate: NEW preflight/prerequisites technique).
  - `apply-design` — (B) prose "Use design framework technique" → references `design-framework.md` resource (AP-51 unanchored ref noted); candidate `create-plan` or NEW.
  - `create-plan`, `create-todos` — (B) `create-plan`.
  - `create-test-plan` — (B) `create-test-plan`.
  - `present-solution-overview` — (A) NEW (stakeholder solution-overview authoring; mirror of 01:present-problem-overview — could be ONE shared NEW technique).
  - `collect-assumptions`, `update-assumptions-log`, `reconcile-assumptions` + loop — (B) `reconcile-assumptions` (finding 6).
  - `sync-branch` — (B) `manage-git::sync-branch`.
  - `update-pr` — (B) `update-pr` (references `pr-description` resource; preserve link).
- **Removals:** ~12 `description` removals + 1 `supporting[7]`.

### 07 — assumptions-review (`techniques.supporting[3]`, 4 steps + 2 loop sub-steps, 2 checkpoints)
- **supporting[3]:** `atlassian-operations::comment-jira-issue` (meta), `manage-artifacts::write-artifact`, `review-assumptions`. → ELIMINATE.
  - `evaluate-open-assumptions`, `interview-assumptions`, `update-assumptions-log` + loop `present-assumption`/`record-decision` — (B) `review-assumptions`.
  - `post-summary` — (B) `review-assumptions` (+ meta `atlassian-operations` / `github-cli-protocol` for the post). Prose names platform-conditional posting (content-at-risk).
- **Removals:** ~6 `description` removals + 1 `supporting[3]`.

### 08 — implement (`techniques.supporting[9]`, 4 top-level steps + 3 loops with 9 sub-steps, 4 checkpoints)
- **supporting[9]:** `cargo-operations::test`, `cargo-operations::check`, `cargo-operations::clippy`, `dco-provenance::append-task-row`, `implement-task`, `manage-git::artifact-commits`, `reconcile-assumptions`, `review-assumptions`, `validate-build`. → ELIMINATE.
  - loop `task-cycle`: `implement-task` (no description, has checkpoint) — (D/B) bind `implement-task`; `run-tests` — (B→HARD) `cargo-operations::test(scope)`; `commit` (no description) — (D/B) bind `manage-git::artifact-commits`; `log-provenance` — (C/HARD) bound `dco-provenance`, prose names `append-task-row` op; `self-review` — (B) `implement-task` (or NEW task-completion-review; references `task-completion-review` resource — preserve link; sets `has_uncertain_symbols`/`uncertain_symbols`); `collect-assumptions` — (B) `reconcile-assumptions`.
  - top-level `reconcile-assumptions`, `present-resolved-assumptions`, `interview-open-assumptions`, `update-assumptions-log` + interview loop — (B) `reconcile-assumptions`/`review-assumptions` (finding 6).
- **Risks:** `implement-task` and `commit` steps have NO `description` today (only `checkpoint`/`name`) — these are class (D): need a technique binding minted. `run-tests` is HARD (op+scope arg).
- **Removals:** ~13 `description` removals (some steps have none) + 1 `supporting[9]`.

### 09 — post-impl-review (`techniques.supporting[6]`, 8 steps + 1 loop with 6 sub-steps, 3 checkpoints, 1 decision)
- **supporting[6]:** `prism/structural-analysis` (prism, read-only), `review-code`, `review-diff`, `review-test-suite`, `summarize-architecture`, `version-control::commit-regular-files` (meta, read-only). → ELIMINATE.
- **Note:** the only activity referencing PRISM techniques directly; also the only one referencing `version-control::commit-regular-files` (meta).
  - `gitnexus-detect-changes-preflight` — (B→HARD) names `gitnexus_detect_changes()` raw tool (AP-48) + references `gitnexus-reference` resource; bind `gitnexus-operations` (meta) — but raw-tool/op mismatch is a hard case.
  - `manual-diff-review` — (B) `review-diff` (references `manual-diff-review` resource — preserve link).
  - `code-review` — (B) `review-code`.
  - `structural-analysis-inline` — (B) `prism/structural-analysis` (prism, read-only) — prose loads "prism resource l12"; binding to a read-only prism technique is allowed but the lens-load prose is content-at-risk (AP-47).
  - `dispatch-prism` — (C-ish) uses `triggers[]` (structural) + prose; the trigger is already structural — prose is descriptive. Candidate (D): bind a technique or leave trigger-only.
  - `test-suite-review` — (B) `review-test-suite`.
  - `architecture-summary` — (B) `summarize-architecture`.
  - `classify-and-route-findings` — (A/B) severity-classification procedure (sets `needs_code_fixes`/`needs_test_improvements`); candidate NEW or merge into `review-code`.
  - loop `review-fix-cycle` sub-steps (`apply-fixes`, `reset-fix-flags`, `regenerate-index`, `re-manual-diff-review`, `re-code-review`, `re-test-suite-review`) — (B) re-bind to the same review techniques; `reset-fix-flags`/`regenerate-index` may be (D).
- **Removals:** ~14 `description` removals + 1 `supporting[6]`.

### 10 — validate (`techniques.supporting[7]`, 6 steps + 1 loop with 3 sub-steps, 0 checkpoints)
- **supporting[7]:** `cargo-operations::preflight`, `cargo-operations::run-suite`, `cargo-operations::build-release`, `validate-build::analyze-failure`, `validate-build::apply-fix`, `validate-build::aggregate-results`, `manage-artifacts::verify-readme-conforms`. → ELIMINATE.
  - `preflight` — (B→HARD) `cargo-operations::preflight()`.
  - `run-suite` — (B→HARD) `cargo-operations::run-suite(scope: '--workspace')`.
  - `evaluate-results` — (D/B) sets `has_failures`/`validation_passed`; bind `validate-build::aggregate-results`.
  - `document-failures`, `assess-test-coverage` (review-mode) — (A/B) review-mode finding prose; NEW or merge.
  - `fix-failures` + loop `analyze-failure`/`apply-fix`/`revalidate` — (B→HARD) `validate-build::analyze-failure(args)`, `validate-build::apply-fix(args)`, `cargo-operations::run-suite(scope)`.
- **Removals:** ~9 `description` removals + 1 `supporting[7]`.

### 11 — strategic-review (`techniques.supporting[2]`, 10 steps, 1 checkpoint)
- **supporting[2]:** `manage-git::artifact-commits`, `review-strategy`. → ELIMINATE.
  - `diff-review`, `identify-artifacts`, `document-findings`, `apply-cleanup`, `analyze-strategic-findings` — (B) `review-strategy`.
  - `verify-readme` — (B→HARD) `manage-artifacts::verify-readme-conforms(planning_folder_path)`.
  - `ensure-changes-folder-entry`, `verify-change-fragment` — (A) NEW (Towncrier/changes-fragment procedure; long prose, heavy content-at-risk; `verify-change-fragment` has a validate-action; references `issue_number`/`issue_url`).
  - `document-cleanup-recommendations` (review-mode) — (B) `review-strategy`.
  - `create-architecture-summary` — (B) `summarize-architecture` (references `architecture-summary` resource — preserve link).
- **Removals:** 10 `description` removals + 1 `supporting[2]`.

### 12 — submit-for-review (`techniques.supporting[8]`, 13 steps + 1 loop step, 6 checkpoints)
- **supporting[8]:** `dco-provenance::record-attestation`, `github-cli-protocol` (meta), `manage-git::push-commits`, `manage-git::squash-merge`, `manage-git::detect-merge-strategy`, `respond-to-pr-review`, `review-code`, `update-pr`. → ELIMINATE.
  - `consolidate-review-findings`, `generate-review-summary`, `present-summary-to-user`, `post-pr-review` (review-mode) — (B) `respond-to-pr-review`/`review-code` (+ meta `github-cli-protocol`); `generate-review-summary` references `review-mode` resource (preserve link).
  - `dco-sign-off` — (C/HARD) bound `dco-provenance`; prose names `record-attestation` op.
  - `push-commits` — (B) `manage-git::push-commits`.
  - `update-description` — (B) `update-pr`.
  - `instruct-merge-strategy` — (C/HARD) bound `manage-git`; prose names `squash-merge`/`detect-merge-strategy` ops.
  - `mark-ready`, `await-review`, `process-review-comments`, `determine-review-outcome`, `analyze-review-outcome` — (B) `github-cli-protocol`/`respond-to-pr-review`; some (D).
  - loop `rerender-and-verify` — (B→HARD) `update-pr::render(template, pr_number)` + `update-pr::verify-body`.
- **Removals:** ~14 `description` removals + 1 `supporting[8]`.

### 13 — complete (`techniques.supporting[5]`, 10 steps, 0 checkpoints)
- **supporting[5]:** `cargo-operations::doc`, `conduct-retrospective`, `create-adr`, `finalize-documentation`, `manage-git::remove-worktree`. → ELIMINATE.
  - `create-adr`, `update-adr-status` — (B) `create-adr`.
  - `finalize-test-plan`, `create-complete-doc` — (B) `finalize-documentation`.
  - `ensure-docs` — (B→HARD) prose implies `cargo-operations::doc`; bind `finalize-documentation` or `cargo-operations`.
  - `capture-history`, `update-status`, `select-next` — (D) trivial; need technique bindings.
  - `retrospective` — (B) `conduct-retrospective`.
  - `remove-worktree` — (B→HARD) `manage-git::remove-worktree(reference_path, component_name, target_path)`.
- **Removals:** 10 `description` removals + 1 `supporting[5]`.

### 14 — codebase-comprehension (`techniques.supporting[3]`, 12 steps + 1 loop with 5 sub-steps, 1 checkpoint)
- **supporting[3]:** `build-comprehension`, `manage-artifacts::write-artifact`, `prism/portfolio-analysis` (prism, read-only). → ELIMINATE.
- **Note:** has its own `rules[3]` (check AP-29 during edit).
  - `check-existing-artifacts`, `review-existing`, `architecture-survey`, `key-abstractions`, `design-rationale`, `domain-concept-mapping`, `create-comprehension-artifact`, `initial-deep-dive`, `update-artifact-initial`, `revise-initial-questions`, `deep-dive-loop` — (B) `build-comprehension` (+ `manage-artifacts::write-artifact` for the write).
  - `initial-lens-pass`, loop `portfolio-lens-pass` — (B) `prism/portfolio-analysis` (prism, read-only); prose loads "prism resource pedagogy / rejected-paths" (content-at-risk, AP-47).
  - loop `select-area`/`targeted-analysis`/`update-artifact`/`revise-open-questions` — (B) `build-comprehension`.
- **Removals:** ~17 `description` removals + 1 `supporting[3]`.

---

## Transition & reference integrity

- **Transitions:** no transition `to:` targets change under this migration (the migration touches steps/techniques, not the activity graph). All `to:` references across the 14 activities resolve to existing activity IDs. **No broken transitions introduced.** (Verified targets: design-philosophy, codebase-comprehension, research, implementation-analysis, plan-prepare, assumptions-review, implement, post-impl-review, validate, strategic-review, submit-for-review, complete, requirements-elicitation — all present.)
- **Technique references after migration:** binding steps to **meta** (`github-cli-protocol`, `atlassian-operations`, `knowledge-base-search`, `version-control::*`, `gitnexus-operations::*`) and **prism** (`prism/structural-analysis`, `prism/portfolio-analysis`) techniques is a cross-workflow reference. These are READ-ONLY and confirmed to exist. Risk: the migration must ensure each `step.technique` ID resolves; new work-package techniques (class A) do not exist yet and MUST be authored before their bindings validate (otherwise dangling reference).
- **Resource references to preserve** (steps that hyperlink a `resources/` file in prose — must survive the description removal by moving into the bound technique's protocol, else orphaned): `pr-description` (01, 06), `readme` (01), `manual-diff-review` (09), `gitnexus-reference` (09), `task-completion-review` (08), `review-mode` (12), `architecture-summary` (11), `design-framework` (06), prism `l12`/`pedagogy`/`rejected-paths` lenses (09, 14). **Orphan risk:** removing a `description` that is the sole referent of a `resources/` file without moving the link into a technique would orphan that resource.

## Content-removal summary (ALL require explicit user approval)

- **`techniques.supporting[]` arrays removed:** 14 (one per activity).
- **`step.description` fields removed:** ~135 across all activities (every step listed above that carries prose).
- **Per-activity assumption category lists** (02–08 `collect-assumptions`/`reconcile`) are real content embedded in prose — at risk of loss unless migrated into a technique; flagged for preservation.
- **Resource hyperlinks** embedded in 9+ step descriptions — at risk of orphaning; flagged for migration into bound techniques.

## Governance edit (outside work-package)

- `workflows/workflow-design/workflow.toon` `rules[14]` → ADD anti-pattern rule(s) codifying "prose procedure in `step.description` is an anti-pattern; bind via `step.technique`" and "activities declare `techniques.primary` only; no `supporting[]`". This is an ADDITIVE edit (rules[14] → rules[15+]); no content removed. Sole approved edit outside `work-package/`.

## Counts (headline)

| Metric | Count |
|---|---|
| Activities affected | 14 / 14 |
| `supporting[]` arrays to eliminate | 14 |
| Steps total (top-level + loop sub-steps) | ~135 |
| Steps currently bound (`step.technique`) | 5 (all group-granular) |
| `description` fields to remove | ~135 |
| Class A (prose → NEW technique) | ~15 steps (review-mode detection, reference/project-type/branch/target-path resolution, stakeholder overviews ×2, changes-fragment, findings-classification) |
| Class B (merge into EXISTING) | ~90 steps (bulk: assumptions cluster, create-issue, review techniques, manage-git/cargo/validate-build ops) |
| Class C (already compliant) | 0 fully (5 partial: bound but prose still present) |
| Class D (trivial, needs new binding) | ~12 steps (env-prerequisites, set-review-mode-path, determine-next-activity, implement-task/commit, reset-fix-flags, capture-history/update-status/select-next, evaluate-results, dispatch-prism) |
| HARD cases (inline op + args, lossy under model) | 16 step invocations (see global finding 5) |
| Cross-workflow read-only bind targets | meta ×5 groups, prism ×2 techniques |
| Governance edits outside work-package | 1 (additive rules in workflow-design) |
