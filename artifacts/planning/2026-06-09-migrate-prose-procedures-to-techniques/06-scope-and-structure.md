# 06 — Scope and Structure: Migrate Prose Procedures to Techniques (work-package)

**Session:** 6GRWGT · **Workflow under design:** `work-package` (UPDATE mode) · **Activity:** `scope-and-structure` · **Date:** 2026-06-10
**Status:** DRAFT pending `scope-and-structure-confirmed` (revised).

This document carries the **complete file manifest** and the **implementation order** for the migration, plus two of the three planning deliverables:
- **Work item (B)** — the work-package migration plan (§B).
- **Work item (C)** — the governance-rules design text (§C).

**Work item (A)** — the binding & scatter-gather DESIGN — is the sibling doc [`06a-schema-server-extension-spec.md`](./06a-schema-server-extension-spec.md). It defines the canonical `variable-binding` and `scatter-gather` techniques, the hybrid binding model, the refined activity-technique model, and the (no) schema posture that B builds on.

> **Direction pivot (2026-06-10, this revision).** The design has PIVOTED from a "schema + server extension" strategy to a **technique-shaped** one that stays entirely within `workflow-design`'s remit. Consequences for this doc:
> - There is **no separate "Spec A" server work package** sequenced ahead of B. B authors the two canonical `meta` techniques as its FIRST step.
> - The per-step binding rides the **existing** `step.technique` + `step.technique_args` fields (no new `step.with`/`step.produces`/`step.note`). See A §1, §7.
> - `techniques.supporting[]` is **kept but reserved for STRATEGY** (it carries the canonical `variable-binding`/`scatter-gather` techniques). Per-step OPERATIONS move to `step.technique`. The prior draft's "eliminate `supporting[]`" is corrected to "reserve `supporting[]` for strategy" (A §6).
> - Validation is **mostly agent-side** (the `variable-binding` protocol + advisory governance rules A1–A5); no mandatory validator code.

> **Sibling-doc choice.** Spec A is a sibling, not an embedded section, because it is the reusable *design* (two universal techniques + the model) while this doc is the *migration plan* that applies that design to `workflows/work-package/**`. They are cross-linked both ways. This doc embeds B and C and references A.

---

## Overview of the three work items

| Item | What | Edits | Delivered by | Gate |
|------|------|-------|--------------|------|
| **A** | Binding & scatter-gather design: the `variable-binding` technique, the `scatter-gather` technique, the hybrid binding model, the refined activity-technique model. **No mandatory schema change.** | `workflows/meta/techniques/variable-binding.md`, `workflows/meta/techniques/scatter-gather.md` (authored as B's first step) | **`workflow-design`** (within remit) | — |
| **B** | Work-package migration: bind every step via `step.technique` (+ `technique_args` deviations), refine `supporting[]` to strategy-only, backfill technique signatures, remove moot descriptions | `workflows/work-package/**` (+ the two `meta` techniques in A) | follow-up (this migration) | author meta techniques first (A) |
| **C** | Governance rules A1, A2, A3 (refined), A4 (techniques-first), A5 (generic-not-overfit) | `workflows/workflow-design/workflow.toon` `rules[]` (additive) | follow-up | independent (additive; may land with B) |

> **A and B are one effort now.** Because A introduces no schema/server change, it is not a separate prerequisite package — it is the design B realizes, and its two `meta` techniques are authored at the start of B's sequence (§B.5). The OPTIONAL `technique_args` widening (A Appendix A) is the only conceivable server touchpoint and is DEFERRED — not a gate.

---

# §B — Work-package Migration Plan

## B.0 Verify-worktree precondition

Before any path work: confirm the `workflows` worktree is checked out at `workflows/` on the `workflows` orphan branch (`git worktree add ./workflows workflows`). All paths below are repo-relative under that worktree. *(Activity step `verify-worktree`.)*

## B.1 Complete file manifest (`scope_manifest`)

Legend for **Action**: **modify** (edit existing), **create** (new file), **rule-add** (additive rules edit).

### B.1.a Canonical strategy techniques — `meta` (authored FIRST)

| Path | Action | One-line note |
|------|--------|---------------|
| `workflows/meta/techniques/variable-binding.md` | create (Class A, meta) | The bind-by-name / deviation / output-by-path protocol (A §2). Single-file; bare-id ref. Resolves universally; attached as a `supporting[]` strategy technique on every migrated activity. |
| `workflows/meta/techniques/scatter-gather.md` | create (Class A, meta) | The unified `gather` collection-building capability: ONE gather contract (ordered array + optional key) + ONE delegated combine over TWO scatter modes — **sequential** (`forEach`-loop accumulation; `concurrency = 1`) and **parallel** (`harness-compat::spawn-concurrent` fan-out), with the accumulate-never-overwrite + isolation-then-combine safety rules (A §3). Single-file; bare-id ref. Attached as `supporting[]` on activities that build a collection (sequential accumulation, e.g. `08`) or fan out in parallel. |
| `workflows/meta/techniques/README.md` (if a meta technique index exists) | modify | Add the two new strategy techniques to the meta index. |

These two are the FIRST authored (their ids must resolve before any activity references them — else dangling).

### B.1.b Activity TOON files — all 14 (every one: modify)

> Each row: bind every non-exempt step via `step.technique` (+ `technique_args` deviations only); ADD `variable-binding` to `techniques.supporting[]` (strategy); refine `supporting[]` to strategy-only by pushing per-step OPERATIONS down to steps; set `techniques.primary` to the domain technique; remove moot `description`s; split any multi-op step (D6).

| # | Path | Action | One-line note |
|---|------|--------|---------------|
| 01 | `activities/01-start-work-package.toon` | modify | 27 steps bind a technique (or D8-exempt); `supporting[]` → strategy-only (`variable-binding`); push the 9 per-step operations to steps; bind Class-A new techniques (review-mode/reference/project-type/branch/target-path); split any multi-op step. |
| 02 | `activities/02-design-philosophy.toon` | modify | Bind `classify-problem` + assumptions cluster (`reconcile-assumptions`/`review-assumptions`); `supporting[]` → `variable-binding`; remove descriptions; check own `rules[4]` vs AP-29. |
| 03 | `activities/03-requirements-elicitation.toon` | modify | Bind `elicit-requirements` + `manage-artifacts::write-artifact` + assumptions cluster; `supporting[]` → `variable-binding`. |
| 04 | `activities/04-research.toon` | modify | Bind `research-knowledge-base` (+ meta `knowledge-base-search`) + assumptions cluster; keep `dco-provenance` bind on `declare-context-scope`; `supporting[]` → `variable-binding`. |
| 05 | `activities/05-implementation-analysis.toon` | modify | Bind `analyze-implementation` + review-mode baseline + assumptions cluster; `supporting[]` → `variable-binding`. |
| 06 | `activities/06-plan-prepare.toon` | modify | Bind `create-plan`/`create-test-plan`/`manage-git::sync-branch`/`update-pr` + assumptions; anchor `design-framework` resource; `supporting[]` → `variable-binding`. |
| 07 | `activities/07-assumptions-review.toon` | modify | Bind `review-assumptions` (+ meta `atlassian-operations`/`github-cli-protocol` for post); `supporting[]` → `variable-binding`. |
| 08 | `activities/08-implement.toon` | modify | Bind `implement-task`/`cargo-operations::test`/`manage-git::artifact-commits`/`dco-provenance`/assumptions; mint bindings for `implement-task`/`commit` (no description today); the `forEach`-over-`plan.tasks` loop accumulates per-task `task_implementation` into `completed_tasks`/`commits` via `gather` (sequential mode; binding-difficulty Class 5 — A §3, §4); add `gather` to `supporting[]` here; `supporting[]` → `variable-binding`. |
| 09 | `activities/09-post-impl-review.toon` | modify | Bind review techniques + `prism/structural-analysis` (read-only) + `version-control::commit-regular-files` (meta) + `gitnexus-operations`; classify-and-route findings; `supporting[]` → `variable-binding`. |
| 10 | `activities/10-validate.toon` | modify | **Worked example (§B.4).** Bind `cargo-operations::preflight`/`run-suite`, `validate-build::analyze-failure`/`apply-fix`; **delete `evaluate-results`**; **declare `validation_results` as a state var and realign to the canonical envelope** — loop condition reads `validation_results.validation_passed`, drop the overfit scalars `test_results`/`build_status` (binding-difficulty Class 6 / A5; A §4, §5); `supporting[]` → `variable-binding`. |
| 11 | `activities/11-strategic-review.toon` | modify | Bind `review-strategy`/`summarize-architecture`/`manage-artifacts::verify-readme-conforms`; Class-A changes-fragment technique; `supporting[]` → `variable-binding`. |
| 12 | `activities/12-submit-for-review.toon` | modify | Bind `respond-to-pr-review`/`review-code`/`manage-git::*`/`update-pr`/`dco-provenance`; **split** `rerender-and-verify` (render + verify-body) into 2 steps (D6); `supporting[]` → `variable-binding`. |
| 13 | `activities/13-complete.toon` | modify | Bind `create-adr`/`finalize-documentation`/`conduct-retrospective`/`manage-git::remove-worktree`/`cargo-operations::doc`; D8-exempt trivial steps; `supporting[]` → `variable-binding`. |
| 14 | `activities/14-codebase-comprehension.toon` | modify | Bind `build-comprehension` + `manage-artifacts::write-artifact` + `prism/portfolio-analysis` (read-only); `supporting[]` → `variable-binding`; check own `rules[3]` vs AP-29. |

### B.1.c Work-package technique files (`workflows/work-package/techniques/**`)

| Path | Action | One-line note |
|------|--------|---------------|
| `techniques/<review-mode>.md` (id TBD, e.g. `detect-review-mode`) | create (Class A) | Review-mode detection + PR-reference capture (01, also feeds 02/05/12 review-mode steps). |
| `techniques/<reference-resolution>.md` | create (Class A) | Reference/monorepo resolution + submodule context (01 `resolve-reference`). |
| `techniques/<project-type-detection>.md` | create (Class A) | Project-type detection (01 `detect-project-type`). |
| `techniques/<naming-conventions>.md` | create (Class A) | Branch-name + canonical-target-path derivation (01 `derive-branch-name`, `compute-canonical-target-path`). |
| `techniques/<stakeholder-overview>.md` | create (Class A) | Stakeholder problem/solution overview authoring — SHARED by 01 `present-problem-overview` and 06 `present-solution-overview` (one technique, two call-sites). |
| `techniques/<changes-fragment>.md` | create (Class A) | Towncrier changes-fragment authoring + verification (11 `ensure-changes-folder-entry`, `verify-change-fragment`). |
| `techniques/<findings-classification>.md` | create (Class A, or merge into `review-code`) | Severity classification + routing flags (09 `classify-and-route-findings`); decide A vs merge during authoring. |
| `techniques/reconcile-assumptions.md` | modify (Class B, signature backfill) | Subsume the duplicated reconcile + `collect-assumptions` + per-activity category-list prose from 02–08; declare category-list input(s). |
| `techniques/review-assumptions.md` | modify (Class B, signature backfill) | Subsume `present-resolved-assumptions`/`interview-open-assumptions`/`record-response`/`update-assumptions-log` prose from 04/05/07/08. |
| `techniques/create-issue.md` | modify (signature backfill) | Subsume the 01 Jira/GitHub check/verify/search/create/link prose (heavy content-at-risk); declare ticket inputs/outputs. |
| `techniques/cargo-operations/run-suite.md` | modify (signature backfill) | Confirm `scope`/`features` inherited from group root suffice; no own inputs needed (inheritance subtlety — A §8.4). |
| `techniques/validate-build/analyze-failure.md` | modify (signature backfill) | **Add `target_path` input** (omitted today; protocol reads it — A §8.4 evidence). |
| `techniques/manage-artifacts/*`, `techniques/manage-git/*`, `techniques/cargo-operations/*`, `techniques/dco-provenance/*`, `techniques/update-pr.md`, the review-* / create-* / analyze-* / build-* singles | modify (signature backfill, as needed) | Per-operation: declare any `{name}` the protocol reads that is not declared/inherited/ambient; add `default`s (D7) so common calls are argument-free. Concrete list = §B.3. |
| `techniques/README.md` | modify | Add the new Class-A techniques to the technique index/table. |

> **Scatter/gather duplicates — NOT edited now.** `cicd-pipeline-security-audit/techniques/{dispatch-scanners,merge-scan-findings}.md`, `substrate-node-security-audit/techniques/{dispatch-sub-agents,merge-findings}.md`, and `work-package/techniques/validate-build/aggregate-results.md` are recognized as instances of the canonical `gather` pattern (A §3.7). Collapsing them onto the canonical technique is a **follow-up pass**, not part of this migration.

### B.1.d Read-only bind targets (referenced, NOT edited)

- **meta** (`workflows/meta/techniques/**`): `github-cli-protocol`, `atlassian-operations`, `knowledge-base-search`, `version-control::commit-regular-files`, `gitnexus-operations::analyze`, `harness-compat::spawn-concurrent` (composed by `scatter-gather`). The two NEW canonical techniques (`variable-binding`, `scatter-gather`) are authored in `meta` by B (§B.1.a) — these are write targets, the rest of meta is read-only.
- **prism** (`workflows/prism/techniques/**`): `prism/structural-analysis`, `prism/portfolio-analysis`.
- Binding a `work-package` step (or `supporting[]` ref) to these is legal via the universal-technique fallback / `workflow/`-prefix. Where the procedure is work-package-specific, the prose migrates into a work-package technique; where generic, the meta technique subsumes it.

### B.1.e Governance rule edit (the ONE file outside `work-package`/`meta`) — Work item C

| Path | Action | Note |
|------|--------|------|
| `workflows/workflow-design/workflow.toon` `rules[]` | **rule-add** (additive) | Add A1, A2, A3 (refined), A4 (techniques-first), A5 (generic-not-overfit) (§C). Primary placement only; not echoed into `work-package`. No content removed. |

### B.1.f Manifest size

- **2** new canonical `meta` techniques (`variable-binding`; `scatter-gather` — the unified `gather` collection-building capability with sequential + parallel scatter modes, A §3).
- **14** activity files modified.
- **~7** new work-package technique files (Class A; `findings-classification` may collapse into `review-code`, so 6–7).
- **~15–20** work-package technique files modified (Class-B merges + signature backfills).
- **1–2** technique `README.md`s modified (work-package; meta index if present).
- **1** governance file rule-add (`workflow-design/workflow.toon`).
- **State-variable realignment (A5 / binding-difficulty Classes 5–6).** In `10-validate`: **declare `validation_results`** as a state var (the canonical envelope `run-suite` emits) and **realign** the activity's vars to it — content-additive for the declaration, content-reducing for dropping the overfit scalars `test_results`/`build_status` (gated). In `08-implement`: the per-task loop **gathers** `task_implementation` into the existing `completed_tasks`/`commits` plurals (sequential `gather`) — accumulation, not a var change. Add `gather` to `supporting[]` on activities with genuine accumulation/fan-out (e.g. `08`).
- **Content removals** (deferred to B's execution gate, all require explicit approval): **14** `supporting[]` arrays REDUCED to strategy-only (per-step operations removed from them); **~135** `step.description` fields; **1** glue step deleted (`10:evaluate-results`); redundant flag `has_failures` removed; **overfit scalars `test_results`/`build_status` dropped** in favor of `validation_results.*` (Class 6 de-overfit); multi-op steps split (net +steps). Resource hyperlinks (9+) MUST migrate into bound techniques to avoid orphaning.

## B.2 Per-activity / per-step migration actions (from `05-impact-analysis.md`)

Migration classes (legend): **A** prose→NEW technique · **B** merge into EXISTING (work-package|meta|prism) · **C** already bound (migrate residual prose) · **D** trivial, D8-exempt or mint a binding · **former-HARD** now **structural** (inline `group::op(args)` → `step.technique: group::op` + `technique_args:{deviations}`).

**The former-16-HARD cases (now structural under the binding model).** Each migrates to a structured binding; the op name moves to `step.technique`, the deviations move to `step.technique_args` (deviations only — args equal to a declared `default` or same-name bag variables are omitted):

| Step | `step.technique:` | `technique_args:` (deviations) |
|------|-------------------|--------------------------------|
| `01:update-reference-submodules` | `manage-git::update-reference-submodules` | `{}` (reference_path binds by name) |
| `01:analyze-reference-with-gitnexus` | `gitnexus-operations::analyze` (meta) | `{}` (repo_path binds by name) |
| `01:create-component-worktree` | `manage-git::create-worktree` | call-site values for the 4 args only where they deviate from bag/defaults |
| `01:create-review-worktree` | `manage-git::create-worktree` | review-tree-specific `reference_path` (rename) |
| `08:run-tests` (loop) | `cargo-operations::test` | `{ scope: '-p {current_task.crate}' }` (template) |
| `10:preflight` | `cargo-operations::preflight` | `{}` |
| `10:run-suite` | `cargo-operations::run-suite` | `{ scope: '--workspace' }` (literal) |
| `10:analyze-failure` (loop) | `validate-build::analyze-failure` | `{ check_id: failed_check_id }` (rename; diagnostics/target_path bind by name; `target_path` backfilled — §B.3) |
| `10:apply-fix` (loop) | `validate-build::apply-fix` | `{}` (check_id/fix_strategy bind by name) |
| `10:revalidate` (loop) | `cargo-operations::run-suite` | `{ scope: '--workspace' }` |
| `11:verify-readme` | `manage-artifacts::verify-readme-conforms` | `{}` (planning_folder_path binds by name) |
| `12:rerender-and-verify` (loop) | **SPLIT (D6)** → `update-pr::render` then `update-pr::verify-body` | render: `{ template: 'final' }`; pr_number binds by name |
| `13:remove-worktree` | `manage-git::remove-worktree` | `{}` |
| `02..08:reconcile-iteration` (loop) | `reconcile-assumptions` | `{}` (already clean; subsume duplicated prose) |

**The big merge cluster (finding 6/7).** The duplicated `reconcile-assumptions` description + `reconcile-iteration` loop-step prose across **02, 03, 04, 05, 06, 08**, and the `present-resolved-assumptions`/`interview-open-assumptions`/`record-response` prose across **04, 05, 07, 08**, ALL bind to `reconcile-assumptions` / `review-assumptions` (Class B). The **per-activity assumption category lists** (02–08 `collect-assumptions`) are real content — they migrate into a declared input of `reconcile-assumptions` (e.g. an `assumption_categories` input the step supplies via `technique_args`), NOT lost.

**Class D (D8-exempt or mint-binding).** `env-prerequisites` (06, validate-actions only → exempt OR bind a NEW preflight technique), `set-review-mode-path` (02 → exempt), `determine-next-activity` (01 → exempt/transitions), `implement-task`/`commit` (08 → mint bindings: `implement-task`, `manage-git::artifact-commits`), `reset-fix-flags`/`regenerate-index` (09 → exempt), `capture-history`/`update-status`/`select-next` (13 → exempt), `dispatch-prism` (09 → trigger-only, exempt), `evaluate-results` (10 → **DELETED**, see §B.4).

**Collection-building steps → the unified `gather` supporting technique.** `gather` (A §3) is ONE collection-building capability with two scatter modes — **sequential** (a `forEach` loop accumulating one scalar per iteration; the `concurrency = 1` case) and **parallel** (`spawn-concurrent` fan-out + isolation). Both are the same primitive (A §3.0). So `work-package`'s loops that accumulate a scalar-per-iteration into an activity-level plural collection ARE sequential-mode gathers — concretely `08`'s `forEach`-over-`plan.tasks` loop accumulating `task_implementation` into `completed_tasks`/`commits` (binding-difficulty Class 5; A §4). `09`'s review loops are likewise sequential accumulation where they build a collection. These bind `gather` in sequential mode (attach it to `supporting[]` on those activities). **PARALLEL mode** (the concurrency + isolation extension) is attached only where genuine parallel fan-out exists; in `work-package` the immediate parallel consumers are the three duplicate-bearing audit workflows (follow-up, §B.1.c note). Parallel-mode adoption beyond the sequential accumulations is opportunistic; the sequential-mode gather IS used where a loop accumulates a collection.

**Resource-link preservation** (must move into the bound technique's protocol, else orphaned): `pr-description` (01,06), `readme` (01), `manual-diff-review` (09), `gitnexus-reference` (09), `task-completion-review` (08), `review-mode` (12), `architecture-summary` (11), `design-framework` (06), prism `l12`/`pedagogy`/`rejected-paths` lenses (09,14).

## B.3 Technique authoring/merge plan + signature-backfill list

**Author canonical strategy (Class A, meta) — FIRST:** `variable-binding`, `scatter-gather` (A §2, §3).

**Author (Class A, work-package) — candidates from `work-package/techniques` (none exist → new):** review-mode detection, reference-resolution, project-type-detection, naming-conventions (branch+target-path), stakeholder-overview (shared 01/06), changes-fragment, findings-classification (or merge into `review-code`).

**Merge (Class B) — existing work-package + meta + prism candidates:** `reconcile-assumptions`, `review-assumptions`, `classify-problem`, `elicit-requirements`, `analyze-implementation`, `create-plan`, `create-test-plan`, `create-issue`, `research-knowledge-base`, `review-code`, `review-diff`, `review-test-suite`, `review-strategy`, `summarize-architecture`, `update-pr`, `create-adr`, `finalize-documentation`, `conduct-retrospective`, `build-comprehension`; groups `manage-git`, `manage-artifacts`, `cargo-operations`, `dco-provenance`, `gitnexus-operations`, `validate-build`; meta `github-cli-protocol`/`atlassian-operations`/`knowledge-base-search`/`version-control`; prism `structural-analysis`/`portfolio-analysis`.

**Signature-backfill list (the contract-completeness pass, A §8.4).** For each operation a step binds, diff protocol `{name}` reads (minus `{$locals}` and ambient activity inputs) against the COMPOSED `inputs[]`, and downstream consumers against `output[]`; declare every gap; add `default`s for the argument-free common call. The `variable-binding` model REQUIRES complete signatures because the signature is the binding contract. Confirmed concrete gaps so far:
- `validate-build::analyze-failure` — **add input `target_path`** (protocol reads `{target_path}`; undeclared today).
- `cargo-operations::run-suite` — verify `scope`/`features` resolve via group-root inheritance (they do); **no own inputs required** — document the inheritance, do not redeclare (avoid AP-52 common-input duplication).
- All deviation-carrying former-HARD ops — ensure each arg in the `technique_args` table (§B.2) is a declared (composed) input; add `default`s (e.g. `cargo-operations.scope` default `-p <crate>` for inner loops so validate's `--workspace` is the only deviation).
- The full per-operation diff is executed during B (it requires reading every bound operation's protocol); this list seeds it.

## B.4 Worked example — validate activity de-cluttered under the new model

Demonstrates D1/D2/D6, the **`variable-binding` supporting technique**, the **deletion of `evaluate-results`**, the loop reading `validation_results.validation_passed` directly, and the **Class-6 envelope realignment** (A §4) under A5: declare `validation_results`, read its fields by path, drop the overfit scalars.

**Key insight (grounded):** `cargo-operations::run-suite` ALREADY emits `validation_results` (a nested envelope with `.validation_passed`, `.test_status`, etc.) — this envelope IS the canonical, generic shape (A5). So the activity aligns TO it (binding-difficulty Class 6): **declare `validation_results` as a state var, read `validation_results.*` by path, and drop the overfit scalars `test_results`/`build_status`** that merely re-expressed its fields. Three things then collapse: the prose glue step `evaluate-results`, the redundant flag `has_failures`, AND any need to call `validate-build::aggregate-results` separately (run-suite already aggregates). Conditions read the output path directly via the existing `getVariableValue` dotted-path walk — no evaluator change.

### BEFORE (today — `10-validate.toon`, abridged)
```toon
techniques:
  supporting[7]: ["cargo-operations::preflight", "cargo-operations::run-suite", …, "validate-build::aggregate-results", …]
steps:
  - id: run-suite
    description: "cargo-operations::run-suite(scope: '--workspace') — runs check, clippy, test, fmt-check…"
    when: "project_type == 'rust-substrate'"
  - id: evaluate-results
    description: "Read validation_results from cargo-operations::run-suite. Set has_failures and validation_passed from it."
    actions:
      - { action: set, target: has_failures, value: true, message: "true when validation_results.validation_passed is false…" }
      - { action: set, target: validation_passed, value: true, message: "Mirrors validation_results.validation_passed" }
  - id: fix-failures
    description: "Enter the fix-revalidate-cycle loop…"
    condition: { type: and, conditions: [ {is_review_mode != true}, {has_failures == true} ] }
loops:
  - id: fix-revalidate-cycle
    type: doWhile
    condition: { variable: has_failures, operator: "==", value: true }
    steps:
      - id: analyze-failure
        description: "validate-build::analyze-failure(check_id: {failed_check_id}, diagnostics: {…}, target_path: {target_path})"
      - id: apply-fix
        description: "validate-build::apply-fix(check_id: {failed_check_id}, fix_strategy: {fix_strategy})"
      - id: revalidate
        description: "Re-run cargo-operations::run-suite(scope: '--workspace')… has_failures = !validation_results.validation_passed."
```

### AFTER (new model)
```toon
techniques:
  primary: validate-build          # domain capability
  supporting: [variable-binding]   # STRATEGY: the bind-by-name protocol the worker applies to every bound step
steps:
  - id: preflight
    technique: cargo-operations::preflight     # zero binding data — inputs bind by name
    when: "project_type == 'rust-substrate'"
    actions:
      - { action: validate, target: "missing_prerequisites.length == 0", message: "Install missing toolchain prerequisites: {missing_prerequisites}" }
  - id: run-suite
    technique: cargo-operations::run-suite
    technique_args: { scope: '--workspace' }   # deviation; `validation_results` auto-binds to the bag by name
    when: "project_type == 'rust-substrate'"
  # evaluate-results: DELETED — was pure glue flattening validation_results.validation_passed into has_failures.
  - id: document-failures
    technique: <findings-classification>        # or review-code; binds in review mode
    when: "is_review_mode == true"
  - id: assess-test-coverage
    technique: review-test-suite
    when: "is_review_mode == true"
  - id: fix-failures
    technique: validate-build::analyze-failure  # entry to the loop; non-exempt → binds
    condition:
      type: and
      conditions:
        - { type: simple, variable: is_review_mode, operator: "!=", value: true }
        - { type: simple, variable: "validation_results.validation_passed", operator: "==", value: false }   # reads the PATH directly
loops:
  - id: fix-revalidate-cycle
    type: doWhile
    condition: { type: simple, variable: "validation_results.validation_passed", operator: "==", value: false }   # no has_failures
    maxIterations: 10
    steps:
      - id: analyze-failure
        technique: validate-build::analyze-failure
        technique_args: { check_id: failed_check_id }   # rename; diagnostics/target_path bind by name (target_path backfilled)
      - id: apply-fix
        technique: validate-build::apply-fix             # check_id/fix_strategy bind by name from the bag
      - id: revalidate
        technique: cargo-operations::run-suite
        technique_args: { scope: '--workspace' }         # re-emits validation_results atomically; loop condition re-reads the path
```

**What was eliminated:** the `evaluate-results` glue step (deleted), the `has_failures` derived flag (gone — conditions read `validation_results.validation_passed`), the overfit scalars `test_results`/`build_status` (dropped — the activity now reads `validation_results.test_status` etc. by path; Class 6 / A5), the `validate-build::aggregate-results` indirection (run-suite already aggregates), and all op-in-`description` prose (moved to `step.technique` + `technique_args`). **What was added:** a `validation_results` state-variable declaration (the canonical envelope is now a first-class declared var, so same-name binding and dotted-path reads resolve). **What stayed structural:** the `when` gates, the `validate` action on preflight (D8 — preflight binds a technique AND carries a validate action; the action is fine alongside the binding), the loop, and the `variable-binding` supporting technique (strategy). Net: 6 steps → 5 (one deleted), descriptions removed, the `has_failures` glue flag and the `test_results`/`build_status` overfit scalars removed, `validation_results` declared.

## B.5 Sequencing / dependencies

1. **Author the two canonical `meta` techniques FIRST** (`variable-binding`, `scatter-gather`). They define the binding protocol every migrated activity references and the scatter/gather contract; their ids MUST resolve before any activity lists them in `supporting[]` (else dangling). **This replaces the prior "A ships as a separate work package first" gate — there is no separate server package.**
2. **Within B**, order that avoids dangling bindings:
   1. **Author Class-A work-package techniques** (so their ids resolve before any step binds them).
   2. **Signature backfill** on every bound operation (so deviations resolve against complete composed signatures — A §8.4; the binding contract must be complete).
   3. **Bind steps** (`step.technique` + `technique_args` deviations) across all 14 activities; **split** multi-op steps (D6); push per-step operations out of `supporting[]` down to steps; set `techniques.primary` (domain) and `techniques.supporting = [variable-binding]` (strategy; add `gather` where a loop accumulates a collection — sequential mode, e.g. `08`'s task loop — or where genuine parallel fan-out exists). Apply **A5** when binding: where a step's deviation is only a name mismatch (Class 1), prefer **realigning the caller's state variable** to the technique's canonical input id over a `technique_args` remap, so the binding goes implicit (zero-data).
   4. **Realign state variables to canonical technique signatures (A5 / Classes 5–6).** ADDITIVE part: **declare `validation_results`** in `10-validate` (the canonical envelope) so dotted-path reads + same-name binding resolve; confirm `08`'s `completed_tasks`/`commits` receive the sequential `gather`. CONTENT-REDUCING part: **drop the overfit scalars `test_results`/`build_status`** in `10-validate` → **explicit-approval gate**.
   5. **Delete glue/derived constructs** enabled by D2 (`evaluate-results`, `has_failures`) and **migrate resource hyperlinks** into bound techniques (avoid orphaning) — these are content-reducing → **explicit-approval gate**.
   6. **Remove moot `step.description`s** (R5) — content-reducing → **explicit-approval gate**.
   7. **Validate**: agent-side review against the governance rules A1–A5 + the `variable-binding` protocol (every bound step's deviations are declared inputs; every activity's `supporting[]` is strategy-only; every non-exempt step binds; technique signatures are generic, not overfit to a caller — A5). `npx tsx scripts/validate-workflow-toon.ts` continues to run as the structural sanity check (schema-shape, transition integrity); no NEW mandatory validator code is required. (Optional advisories per A §7.1 may be added later, non-blocking.)
3. **C (governance rules)** is additive and independent; it may land with B or separately, but is most coherent landing alongside B so the rules and the conforming library ship together.

> **No prerequisite server work-package.** The OPTIONAL `technique_args` value-type widening (A Appendix A) is the only conceivable server touchpoint, is non-breaking, and is DEFERRED — it gates nothing in B (every migration deviation is a string/number/boolean, which the current type accepts).

---

# §C — Governance rules design (text for `workflows/workflow-design/workflow.toon` `rules[]`)

> **DO NOT EDIT `workflow.toon` in this activity** — this is the exact rule TEXT to add (additively) in Work item C. These append to the existing `rules[]`; no content removed.

The five rules (a) forbid UNSTRUCTURED ordered-procedure prose in `description` while EXPLICITLY ALLOWING the structured `step.technique` + `step.technique_args` binding (and routing a call-site caveat to the disposition slot), (b) require every step to bind an operation with the D8 action/control exemption stated, (c) RESERVE `techniques.supporting[]` for activity-wide strategy (refining, not eliminating, it), (d) establish techniques as the first-class extension mechanism in preference to schema/engine change, and (e) require technique signatures to be GENERIC and not overfit to any single caller — resolving a name mismatch by aligning the caller, not bending the technique (A5; refines R3 / the canonical-naming convention).

**A1 — forbid unstructured ordered-procedure prose:**
```
"Ordered-procedure prose is forbidden in any `description` field (activity or step) — a step's procedure lives in its bound technique's `protocol[]`, reached via the structured `step.technique` (`group::operation` or a bare single-file id) plus an optional `step.technique_args` deviation map; `description` carries only a one-line declarative summary of WHAT the step covers, never sequenced HOW. A single non-procedural call-site behavioral caveat belongs in the step's disposition slot (a one-line note), NOT in `description` and NOT as an ordered procedure."
```

**A2 — every step binds an operation (one operation per step):**
```
"Every step must bind an operation via `step.technique`, EXCEPT a pure action/control step — one whose only effects are `set`/`log`/`emit`/`message` actions and/or a `when` gate and/or a `checkpoint`/`triggers` — which is exempt. A bound step names exactly ONE operation; compound multi-operation steps are split, one operation per step."
```

**A3 (refined) — `supporting[]` reserved for strategy:**
```
"`techniques.supporting[]` is reserved for activity-wide STRATEGY/capability techniques (e.g. `variable-binding`, `scatter-gather`) — protocols that apply across the activity's steps. It MUST NOT list per-step operations; an operation a step invokes is bound at that step via `step.technique`. `techniques.primary` is the activity's domain capability technique."
```

**A4 (new) — techniques-first extension principle:**
```
"Techniques are the universal capability primitive and the FIRST-CLASS extension mechanism. New strategic operations (scatter/gather, variable binding, retry/escalation, voting, dedup, …) are authored as techniques — preferentially universal ones in `meta` — in preference to schema or engine changes. The schema stays a minimal skeleton; capability grows in the technique library as a standard library of strategy primitives."
```

**A5 (new) — generic-not-overfit technique signatures (refines R3 / the canonical-naming convention):**
```
"Technique input/output names, shapes, and structures are defined for the technique's INTRINSIC, GENERIC, REUSABLE semantics — never overfit to a specific caller's local variable name or a single usage instance. Resolve a step-vs-technique name mismatch by aligning the CALLER's state variable to the technique's canonical signature (or an explicit `technique_args` remap), NOT by bending the technique to the call-site. Signatures MAY be renamed/reshaped to integrate with the binding system, but only toward a better GENERIC form."
```

> **Note on enforcement.** A1–A5 are design-principle text in `workflow-design`. Their backstop is **agent-side review** (the worker applies them during authoring and review) plus the `variable-binding` protocol (which makes the binding contract self-checking: a deviation that is not a declared input surfaces). A5 specifically governs how the binding-difficulty taxonomy's name mismatches (A §4, Classes 1 and 6) are resolved — toward the generic technique signature — so implicit bind-by-name is maximized; it licenses backfilling/realigning technique signatures toward generic canonical forms AND renaming/declaring work-package state variables to match (A §5). This satisfies R6 (governance) and the requirements spec's primary-placement decision (these live in `workflow-design` `rules[]` ONLY, not echoed into `work-package`). Optional, non-blocking validator advisories (A §7.1) could later add a structural backstop, but they gate nothing — consistent with A4's principle that capability and constraint grow in the technique/rule library, not the schema.

---

## Cross-links
- **Design (consumed):** [`06a-schema-server-extension-spec.md`](./06a-schema-server-extension-spec.md) (Work item A — the `variable-binding`/`scatter-gather` technique specs + the binding model).
- **Upstream:** [`03-requirements-specification.md`](./03-requirements-specification.md) (R1–R6, AC-1…AC-8), [`05-impact-analysis.md`](./05-impact-analysis.md) (audit inventory + 2026-06-10 direction note).
