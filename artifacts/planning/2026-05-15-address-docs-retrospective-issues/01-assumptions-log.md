# Assumptions Log — Address Docs-Refresh Retrospective Issues

**Work package:** `2026-05-15-address-docs-retrospective-issues`
**Created:** 2026-05-15 (design-philosophy)
**Maintained across:** design-philosophy, codebase-comprehension, plan-prepare, implement, code-review, strategic-review

---

## How to read this file

Each assumption is recorded as a bold-label block (per resource 26 — `assumption-reconciliation`). Every bold-label line ends with two trailing spaces to preserve line breaks in rendered markdown.

**Resolvability** — `Code-analyzable` (validatable by reading the codebase / TOON definitions) or `Stakeholder-dependent` (requires human decision or external input).

**Status** — `Open`, `Validated`, `Invalidated`, `Partially Validated`, or `Carried-Forward`.

Categories used in this activity:

- **Problem Interpretation** — what the work package is and is not.
- **Complexity Assessment** — why `moderate` was chosen for substantive purposes (session-state `simple` is path-gating only).
- **Workflow Path** — implications of `skip-optional` and the carried-forward state.

---

## Scorecard

```
Total: 23 | Validated: 22 | Invalidated: 0 | Partially Validated: 1 | Open: 0
Convergence iterations: 1 | Newly surfaced (plan-prepare): 10 | Newly resolvable: 0
```

Convergence reached after one reconciliation iteration. The two previously-open Stakeholder-dependent assumptions (A-DP-05-residual, A-DP-09) were resolved by user input during `plan-prepare` and are confirmed closed at `assumptions-review` (2026-05-15). The Partially Validated entry (A-DP-05) is retained as Partially Validated because its hybrid resolvability label is structural — the actionable code-side claim is Validated; the harness-side residual was tracked separately as A-DP-05-residual and is now Validated as well. Ten planning-phase assumptions added at `plan-prepare` (A-PP-01 through A-PP-10) — all Validated in place; none reopens the resolvable set.

---

## Problem Interpretation

### A-DP-01: Retrospective root-cause attribution is correct

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** All three review-feedback items on PR #119 trace to a single structural cause — the canonical PR-description template's constraints encoded as prose inside a markdown "What NOT to Include" table in `workflows/work-package/resources/12-pr-description.md`, rather than as enforceable `rules:` on `update-pr` or as a `strategic-review` checklist line.  
**Finding:** Confirmed. `workflows/work-package/skills/18-update-pr.toon` carries only `template-selection` rules at the rule-set; it has no `verify`/`validate` step, no `summary-max-two-sentences`, no `no-commit-headings-in-changes`, no `engineering-link-mandatory`, and no `issue_skipped` placeholder rendering rule. `workflows/work-package/skills/12-review-strategy.toon` has no checklist line referencing the PR body's conformance to the canonical template. The constraints exist only as prose inside resource 12.  
**Evidence:** `grep -nE "verify|validate|template|canonical|placeholder|summary.?length|skip.?issue|issue.?skipped|rules:" workflows/work-package/skills/18-update-pr.toon` returns only the two template-selection rule lines (L42-44). `grep -nE "PR body|pr.?body|pr.?description|template|canonical|placeholder|summary.?length|issue link|skip.?issue" workflows/work-package/skills/12-review-strategy.toon` returns a single hit on a different concern (`changes/` fragments at L27). Iteration 1.  
**Resolution:** Validated.

### A-DP-02: The named files in the retrospective are the actual relevant edit sites

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The files identified in §1 "System understanding" of `01-design-philosophy.md` exist at those paths in the current `workflows` worktree.  
**Finding:** All named files exist: `workflows/work-package/skills/12-review-strategy.toon`, `workflows/work-package/skills/18-update-pr.toon`, `workflows/work-package/resources/12-pr-description.md`, `workflows/work-package/activities/01-start-work-package.toon`, `workflows/work-package/skills/15-manage-git.toon`, `workflows/work-package/activities/06-plan-prepare.toon`, `workflows/meta/activities/00-discover-session.toon`.  
**Evidence:** Directory listings of `workflows/work-package/{skills,resources,activities}/` and `workflows/meta/activities/`. Iteration 1.  
**Resolution:** Validated.

### A-DP-03: `meta/discover-session` actually prescribes `list_workflows`

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The retrospective's claim that `meta/discover-session` prescribes `workflow-engine::list-workflows` is accurate.  
**Finding:** Confirmed. `workflows/meta/activities/00-discover-session.toon` L14 lists `workflow-engine::list-workflows` in `operations[]`, and L22-23 invokes it in step `list-available-workflows`. The forbidden-tool claim for workers is consistent with the workflow-server worker-agent rules (workers cannot call `list_workflows`, per the workflow-server rules file in `.claude/rules/`).  
**Evidence:** `grep -n "list_workflows\|list-workflows" workflows/meta/activities/00-discover-session.toon` returns hits at L14 and L23. Iteration 1.  
**Resolution:** Validated.

### A-DP-04: §4.1 bootstrap observation — `classification-confirmed` message is a literal-templated string

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `design-philosophy` activity defines `classification-confirmed` with a `message` field that interpolates `{problem_type}` and `{complexity}` but no preceding step writes those variables.  
**Finding:** Confirmed via the `get_activity` response in this session. The checkpoint message is `"Based on my analysis, this appears to be a {problem_type} with {complexity} complexity. Confirming in 30s unless you intervene."` The activity's `steps[]` (`define-problem`, `classify-problem`) contain no `actions[]` entries that `set` `problem_type` or `complexity`. The only step that uses `actions: set` before a checkpoint is `determine-path`, which sets `needs_comprehension=true`. The bootstrap observation §4.1 is structurally accurate.  
**Evidence:** `get_activity({session_index: "QIUBSR"})` output, this activity definition. Iteration 1.  
**Resolution:** Validated.

### A-DP-05: §4.2 bootstrap observation — sub-agents lack `Task` at depth ≥ 1

**Status:** Partially Validated  
**Resolvability:** Partially code-analyzable; residual uncertainty Stakeholder-dependent  
**Assumption:** Depth-1 sub-agents in this Claude Code harness do not have access to the `Task` primitive.  
**Finding:** `workflows/meta/skills/07-harness-compat.toon` documents `spawn-agent` with a `cursor` harness invocation `Task(subagent_type=generalPurpose, ...)` and carries no depth-1 restriction in the prose or rules. The skill assumes any harness implementing `spawn-agent` supports unbounded recursion. The empirical harness behaviour (observed during this work package's bootstrap — depth-1 spawn failed) contradicts this assumption but is not encoded in any repository artifact. The repository-side claim "the operation does not document the depth constraint" is validated; the harness-side claim "the harness does not support depth-1 spawn" is empirical and cannot be code-resolved.  
**Evidence:** `workflows/meta/skills/07-harness-compat.toon` L1-67 (full file read). Iteration 1.  
**Resolution:** Partially Validated. The actionable part — `harness-compat::spawn-agent` does not document the depth constraint — is Validated. The harness-behavior part is reclassified as Stakeholder-dependent and recorded as A-DP-05-residual below for tracking.

### A-DP-05-residual: Harness-behavior verification

**Status:** Validated  
**Resolvability:** Stakeholder-dependent (resolved by user input)  
**Assumption:** The depth-1 spawn failure observed during bootstrap is a Claude Code harness behaviour, not a configuration error in this specific session.  
**Finding:** User clarified during `plan-prepare` (and reconfirmed at `assumptions-review`) that workers CAN be foreground-spawned from depth ≥ 1 in this Claude Code harness. The bootstrap failure was per-subagent-type allowed-tools configuration (the `subagent_type` used for the spawned client orchestrator did not include the `Task` tool in its allowed-tools list, or the agent prompt did not pass the Task primitive through correctly) — not a harness depth limit. The observations-from-bootstrap §4.2 entry has been formally retracted. No workflow-content fix is required for the harness-depth concern; the §4.2 row was removed from the plan (T4.9 / touch site 9 removed) and the §4.2 retraction is documented in `observations-from-bootstrap.md` and `05-work-package-plan.md` §2 row 6.  
**Evidence:** User input during `plan-prepare`; `observations-from-bootstrap.md` §2 (RETRACTED block); `05-work-package-plan.md` §2 row 6 and §3 (T4.9 removed). Iteration 1, confirmed at `assumptions-review` 2026-05-15.  
**Resolution:** Validated.

## Complexity Assessment

### A-DP-06: The six recommendation buckets in the retrospective are independent

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The six recommendation buckets can be implemented as independent edits except for the deliberate defence-in-depth pairing of `update-pr` rules and `strategic-review` checklist line.  
**Finding:** The six edit sites span four skills and three activities — `12-review-strategy.toon`, `18-update-pr.toon`, `12-pr-description.md` (resource), `01-start-work-package.toon`, `15-manage-git.toon`, `06-plan-prepare.toon` — with no shared mutable state between them. The defence-in-depth pair is the only intentional cross-coupling. The persist-rendered-PR-body recommendation and the verify-step recommendation both touch `18-update-pr.toon` but are additive and can be applied in either order.  
**Evidence:** File inventory of `workflows/work-package/{skills,activities,resources}/`. Iteration 1.  
**Resolution:** Validated.

### A-DP-07: None of the recommended changes require schema extension

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The recommended TOON edits fit within existing schemas.  
**Finding:** The skill schema (`schemas/skill.schema.json`) supports `protocol`, `rules` (named string-or-array), `inputs`, `outputs`, and operation-scoped `rules`. The activity schema (`schemas/activity.schema.json`) supports `steps`, `checkpoints`, `loops` (forEach / while / doWhile with `condition`), `actions`, and step-level `condition`. All recommended edits — new rules entries, new checklist lines, new verify step, new `actions[]` entries, new render path — map directly onto these existing fields. No new top-level fields, no new operation primitives. The `yield_checkpoint` extension (§4.1 defensive variant) is the only candidate that would force a server-source schema change.  
**Evidence:** `grep -nE "rules|protocol|checkpoint|loops|actions|verify|condition|step" schemas/skill.schema.json schemas/activity.schema.json`. Iteration 1.  
**Resolution:** Validated.

### A-DP-08: The `update-pr` verify loop is expressible within current TOON skill structure

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** A render-validate-rerender loop can be expressed using existing TOON constructs.  
**Finding:** Activity-level `loops[]` with `type: while` and a `condition:` already exists in multiple activities (`02-design-philosophy.toon`, `05-implementation-analysis.toon`, `06-plan-prepare.toon`, `08-implement.toon`, `14-codebase-comprehension.toon`). The `design-philosophy` activity itself uses `loops[1] - id: assumption-reconciliation - type: while - condition: has_resolvable_assumptions == true`. The `update-pr` verify-rerender loop can be expressed identically on the parent activity (`submit-for-review` is the primary call site; `plan-prepare` is secondary). The activity schema's `loops[].maxIterations` field (L281) provides the bounded-loop safety the design philosophy calls out as Open Question §5.3.  
**Evidence:** `grep -lE "loops:|while" workflows/work-package/activities/`; `schemas/activity.schema.json` L250, L281. Iteration 1.  
**Resolution:** Validated.

### A-DP-09: Bootstrap observations §4.1–§4.3 are out of scope unless `plan-prepare` opts in

**Status:** Validated  
**Resolvability:** Stakeholder-dependent (resolved at `plan-prepare`)  
**Assumption:** Bootstrap-observation items are candidates for `plan-prepare` to decide; default is spin-out to a separate work package.  
**Finding:** Resolved at `plan-prepare` per the recorded recommendation (A-PP-09) and confirmed at `assumptions-review`. Final scope: §4.1 (templated `{problem_type}`/`{complexity}` checkpoint) IN as a workflow-content fix (Tier 4, touch site 8a); §4.2 (sub-agent `Task` depth) OUT — observation retracted because workers CAN be foreground-spawned from depth ≥ 1; §4.3 (classification overwrite smell) IN as a workflow-content fix (Tier 4, touch site 8b). The §4.1 server-source defensive variant (yield_checkpoint variables-payload extension) and the §4.2 architectural collapse are OUT (server-source / architectural changes).  
**Evidence:** `05-work-package-plan.md` §2 rows 5/6/7, §3 Tier 4; `observations-from-bootstrap.md` §1, §2 (retraction); A-PP-09 above. Iteration 1, confirmed at `assumptions-review` 2026-05-15.  
**Resolution:** Validated.

## Workflow Path

### A-DP-10: Skip-optional is the correct path

**Status:** Validated  
**Resolvability:** Stakeholder-dependent (already resolved at checkpoint)  
**Assumption:** `skip-optional` is appropriate.  
**Finding:** Accepted at `workflow-path-selected` checkpoint (option `skip-optional`, 2026-05-15T12:57:17Z). Recorded in `session.json#checkpointResponses`.  
**Evidence:** `session.json` L31-42. Iteration 1.  
**Resolution:** Validated.

### A-DP-11: `codebase-comprehension` is required and not skippable

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `determine-path` sets `needs_comprehension=true` unconditionally.  
**Finding:** Confirmed via `get_activity`. The `determine-path` step's `actions[1]` is `{action: set, target: needs_comprehension, value: true, description: "Codebase comprehension is mandatory before planning"}`. No condition gating; runs every time.  
**Evidence:** `get_activity({session_index: "QIUBSR"})` output, step `determine-path`. Iteration 1.  
**Resolution:** Validated.

### A-DP-12: `is_review_mode` is not set (falsy) — review-mode steps are skipped

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `is_review_mode` is absent / falsy.  
**Finding:** `session.json#variables` contains only `complexity`, `issue_skipped`, `needs_elicitation`, `needs_research`, `pr_skipped`, `skip_optional_activities`. `is_review_mode` is absent — falsy by default. Steps `assess-ticket-completeness` and `set-review-mode-path` (both gated on `is_review_mode == true`) are correctly skipped.  
**Evidence:** `session.json` L18-25. Iteration 1.  
**Resolution:** Validated.

### A-DP-13: Defence-in-depth wording can be identical across `update-pr` rules and `strategic-review` checklist line

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The schema permits identical rule strings in two skill files.  
**Finding:** `schemas/skill.schema.json` does not impose `uniqueItems` on the rule arrays (`grep -nE "uniqueItems|pattern|enum" schemas/skill.schema.json` returns no uniqueness constraint on rule strings — only an `enum` on artifact `action` and a `pattern` on version strings). Identical wording across `12-review-strategy.toon` and `18-update-pr.toon` is therefore schema-compatible.  
**Evidence:** `schemas/skill.schema.json` L82, L194 (the only `pattern`/`enum` hits). Iteration 1.  
**Resolution:** Validated.

---

## Plan-Prepare assumptions (added at `plan-prepare`, 2026-05-15)

Categories follow resource 26: Design Approach, Task Breakdown, Dependency Assumptions, Test Strategy, Scope Decisions.

### Design Approach

### A-PP-01: Two-tier defence-in-depth is sufficient (no CI lint)

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Render-time verify in `update-pr` + live-body re-fetch in `strategic-review` is sufficient defence-in-depth. A third tier (a CI lint over the merged PR body) is not required.  
**Finding:** No evidence of post-strategic-review mutation in the docs-refresh retrospective (`13-workflow-retrospective.md`). The three review-feedback items on PR #119 were all caught by the human reviewer at `review-received`, not by a post-merge process. Both render-time and strategic-review tiers see the same constraint set; a CI lint would catch only the rare case of post-PATCH human mutation. Validated in the comprehension artifact §I.  
**Evidence:** Comprehension artifact §I; retrospective Observations table. Iteration 1.  
**Resolution:** Validated.

### A-PP-02: Verify phase in skill; rerender loop in activity

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The render-validate-rerender pattern is best expressed as a new `verify-body` protocol phase inside `18-update-pr.toon` (which emits `body_conforms` and `body_findings[]`), with the rerender loop expressed as activity-level `loops[]` on `12-submit-for-review.toon`.  
**Finding:** `loops[]` is an activity-level construct per `schemas/activity.schema.json` L250. Skills carry `protocol` and `rules` but not `loops`. The pattern (skill emits a boolean condition consumed by an activity-level `while` loop) is already used in `02-design-philosophy.toon`'s assumption-reconciliation loop, this activity's same loop, and `08-implement.toon`. Validated in comprehension artifact §C.  
**Evidence:** Comprehension artifact §C; `schemas/activity.schema.json` L250, L281. Iteration 1.  
**Resolution:** Validated.

### Task Breakdown

### A-PP-03: Eight retrospective recommendations + three bootstrap observations decompose into ten independent implementation tasks

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The work decomposes into ten implementation tasks (Tier 1 ×4, Tier 2 ×1, Tier 3 ×2, Tier 4 ×3 — counting touch site #9 as two file edits) with no shared mutable state across tiers. The defence-in-depth pair (T1.1/T1.2) is the only intentional cross-coupling.  
**Finding:** A-DP-06 already validated the six retrospective buckets as independent. Folding in §4.1, §4.2 (docs-only), and §4.3 adds three more touch sites; each is localised to a single TOON file or pair of files. No shared mutable state.  
**Evidence:** Plan §3 sequencing block; comprehension artifact §2 file-by-file analysis. Iteration 1.  
**Resolution:** Validated.

### A-PP-04: §4.1 fixable by adding explicit `set` actions; no schema extension needed

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The §4.1 templated-literal bug can be fixed entirely in workflow content — by adding two `set` actions to `02-design-philosophy.toon` that write `problem_type` and `complexity` to session state before the `classification-confirmed` checkpoint yields. No `yield_checkpoint` schema extension is required.  
**Finding:** Activity schema (`schemas/activity.schema.json`) already supports `actions: set` with `target` and `value` fields. A-DP-07 validated that recommended TOON edits fit within existing schemas. Two new `set` actions on the existing `classify-problem` step (or a new step before the checkpoint) is well within the existing patterns (e.g., `determine-path` uses `actions: set`).  
**Evidence:** Activity schema; `02-design-philosophy.toon` step structure observed in `get_activity` response. Iteration 1.  
**Resolution:** Validated.

### Dependency Assumptions

### A-PP-05: Repo provides `validate-workflow.ts` and `validate-workflow-toon.ts` as the canonical TOON validators

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The test plan can rely on `tsx scripts/validate-workflow.ts <workflow>` and `tsx scripts/validate-workflow-toon.ts` as the canonical structural validators; no separate `workflow-validator` package is needed.  
**Finding:** `ls scripts/` returns `validate-activities.ts`, `validate-workflow-toon.ts`, `validate-workflow.ts`. `package.json` declares no `validate` npm script, but `tsx` is in `devDependencies`, so direct invocation is supported.  
**Evidence:** `ls scripts/`; `package.json` lines 1-30. Iteration 1.  
**Resolution:** Validated.

### A-PP-06: Workers have `Read` and `Glob` in their tool allowlist

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The `list-workflows` operation rewrite can use harness `Read` and `Glob` primitives because workers have those tools available.  
**Finding:** The §4 bootstrap observation already confirms a worker workaround that read `workflows/*/workflow.toon` directly — the worker successfully used `Read` over the directory. `Glob` is available to all agents (it's a harness primitive, not an MCP tool). The forbidden-tool list for workers covers `next_activity`, `get_workflow`, `list_workflows`; `Read` and `Glob` are not on that list.  
**Evidence:** Retrospective Observations table; worker workaround in the docs-refresh work package; CLAUDE.md worker rules. Iteration 1.  
**Resolution:** Validated.

### Test Strategy

### A-PP-07: Targeted `grep`-based assertions are an acceptable test proxy

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** There is no TOON-content unit-test harness; structural assertions implemented as `grep`/`diff` commands against the edited TOON files are an acceptable test proxy.  
**Finding:** `vitest.config.ts` (parent repo) covers server source under `src/` and `tests/`. No TOON test harness exists in `workflows/`. Existing TOON-edit work packages (per the comprehension artifact's pattern survey) rely on the validator scripts plus the schema as the structural floor. `grep`-based assertions in the test plan are documentation of the implementer's verification steps, not automated tests.  
**Evidence:** Repo layout; absence of TOON tests under `tests/`. Iteration 1.  
**Resolution:** Validated.

### A-PP-08: TC-Z smoke runs can target PR #120 without affecting the live PR

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The end-to-end smoke runs (TC-Z1–TC-Z4) can be executed against PR #120's body either by capturing a snapshot of the body first (and restoring after) or by reading the body without writing.  
**Finding:** TC-Z1 reads `gh pr view 120 --json body` (read-only). TC-Z2 deliberately mutates the body for one test cycle — the implementer captures `gh pr view 120 --json body > /tmp/pr-120-body.before.md` before mutation and restores via `gh api repos/m2ux/workflow-server/pulls/120 -X PATCH -f body=@/tmp/pr-120-body.before.md` after. TC-Z3 / TC-Z4 are read-only of the loop / strategic-review behaviour. All four operations are reversible.  
**Evidence:** `gh pr view --json body` semantics; `gh api ... PATCH` is the existing update path used in `update-pr`. Iteration 1.  
**Resolution:** Validated.

### Scope Decisions

### A-PP-09: §4.1/§4.2/§4.3 are IN scope as workflow-content-only edits

**Status:** Validated (recommendation; final decision rides into `approach-confirmed` checkpoint)  
**Resolvability:** Stakeholder-dependent (decision item)  
**Assumption:** §4.1 (templated checkpoint), §4.2 (sub-agent Task depth — docs-only variant), §4.3 (classification overwrite smell) are all IN scope for THIS work package. The §4.1 defensive `yield_checkpoint` schema extension is OUT (server-source change). The §4.2 architectural collapse is OUT (deferred).  
**Finding:** All three are workflow-content-only when restricted to the proposed variants. §4.1's set-actions fix is consistent with A-PP-04. §4.2's docs-only variant edits `harness-compat::spawn-agent` rules and `dispatch-activity` procedure — both workflow-content. §4.3's variable separation edits `02-design-philosophy.toon` only. The originating A-DP-09 was Stakeholder-dependent because `plan-prepare` was the right place to decide. The recommendation is made; the checkpoint formalises it.  
**Evidence:** Comprehension artifact §J; plan §2; design-philosophy §4.  
**Resolution:** Validated (pending checkpoint).

### A-PP-10: Issue-skipped placeholder uses the terse form

**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The Issue-skipped placeholder is the terse `🐛 _Issue: skipped_`; rationale capture is a future enhancement.  
**Finding:** Comprehension §G resolved Q7 to form (1). The free-text-input checkpoint primitive required for form (3) does not exist in the schema (`schemas/checkpoint.schema.json` exposes options[] as enumerated, not free-text).  
**Evidence:** Comprehension §G; checkpoint schema. Iteration 1.  
**Resolution:** Validated.

---

## Convergence check

After iteration 1, the open set was:

| # | Assumption | Why open | Resolution |
|---|---|---|---|
| A-DP-05-residual | Harness-behavior verification (depth-1 `Task` availability) | Empirical / required user confirmation | Validated at `plan-prepare` (user input) and confirmed at `assumptions-review` — workers CAN spawn at depth ≥ 1; §4.2 retracted. |
| A-DP-09 | Bootstrap observations §4.1–§4.3 scope decision | Stakeholder decision at `plan-prepare` | Validated at `plan-prepare` per A-PP-09 (§4.1 IN, §4.2 OUT-retracted, §4.3 IN) and confirmed at `assumptions-review`. |

Both previously-open Stakeholder-dependent assumptions are now closed. `has_resolvable_assumptions = false`. `has_open_assumptions = false`. `stakeholder_review_complete = true`. Convergence reached and confirmed.

---

## Assumptions-review outcome (2026-05-15)

The `assumptions-review` activity re-audited the assumptions log and confirmed both previously-open assumptions had already been resolved by user input during `plan-prepare`:

- **A-DP-05-residual** → Validated. The §4.2 retraction in `observations-from-bootstrap.md` and the removal of touch site 9 / T4.9 from the plan reflect the user's clarification. No further harness-side action required for this work package.
- **A-DP-09** → Validated. The §4.1 IN / §4.2 OUT-retracted / §4.3 IN scope decision recorded as A-PP-09 is the final scope for this work package.

No new assumptions surfaced during this activity. The interview-loop checkpoint was not yielded because the open set is empty. The activity transitions to `implement` per the default transition.

---

## Implementation TODO list (from `05-work-package-plan.md` §3, §6)

Tasks are listed in the leverage-tier order from the plan. Within a tier, tasks are independent; across tiers, only Tier 1 has internal ordering (T1.1 → T1.2 → T1.3 → T1.4 by rule-wording dependency; otherwise parallel-safe).

| # | Task | Touch site | Tier | Est. |
|---|------|-----------|------|------|
| T1.1 | Add `verify-body` protocol phase to `update-pr` (emits `body_conforms`, `body_findings[]`) and five `rules.pr-body-conformance.*` rules with wording from plan §4. | `workflows/work-package/skills/18-update-pr.toon` | 1 | 30-45m |
| T1.2 | Add `verify-pr-body-conformance` protocol phase to `strategic-review` with five bullets — wording byte-identical to T1.1 rules — that read live PR body via `gh pr view --json body`. | `workflows/work-package/skills/12-review-strategy.toon` | 1 | 20-30m |
| T1.3 | Add activity-level `loops[]` (`id: verify-pr-body-rerender`, `type: while`, `condition: body_conforms == false`, `maxIterations: 2`) and blocking `body-non-conformant` checkpoint (options: `proceed-with-override`, `provide-input`, `abort`) to `submit-for-review`. | `workflows/work-package/activities/12-submit-for-review.toon` | 1 | 30-45m |
| T1.4 | Add Issue-skipped placeholder variant (`🐛 _Issue: skipped_`) to resource 12; no other content change. | `workflows/work-package/resources/12-pr-description.md` | 1 | 5-10m |
| T2.1 | Add `verify-signing-precondition` step (six `validate` actions) between `analyze-reference-with-gitnexus` and `derive-branch-name`. | `workflows/work-package/activities/01-start-work-package.toon` | 2 | 20-30m |
| T3.1 | Add `env-prerequisites` step at `steps[0]` of `plan-prepare` — six `validate` actions covering workflows worktree, target_path, reference_path, planning_folder_path writability, gh auth, GPG agent. | `workflows/work-package/activities/06-plan-prepare.toon` | 3 | 20-30m |
| T3.2 | Rewrite `workflow-engine::list-workflows` operation body to use harness `Read`+`Glob` over `workflows/*/workflow.toon`; drop `workflow-server.list_workflows` tool ref. Operation name unchanged. | `workflows/meta/skills/00-workflow-engine.toon` | 3 | 20-30m |
| T4.1 | Two edits in design-philosophy: (a) §4.1 add `set` actions for `problem_type` and `complexity` before `classification-confirmed` checkpoint yields; (b) §4.3 separate path-gating from substantive complexity at `workflow-path-selected` (introduce `path_gating_complexity` or rename existing variable). | `workflows/work-package/activities/02-design-philosophy.toon` | 4 | 20-30m |
| T4.2a | Document depth-1 `Task` constraint in `harness-compat::spawn-agent` rules. | `workflows/meta/skills/07-harness-compat.toon` | 4 | 10-15m |
| T4.2b | Add inline-fallback note to `workflow-engine::dispatch-activity`: "if invoked from a depth ≥ 1 agent, run the worker prompt inline rather than spawning". | `workflows/meta/skills/00-workflow-engine.toon::dispatch-activity` | 4 | 10-15m |
| V1 | After each task: run `tsx scripts/validate-workflow.ts <workflow>` and `tsx scripts/validate-workflow-toon.ts`. Run `npm test` and `npm run typecheck` after Tier 1 lands. | All | — | per-task |
| V2 | Smoke run (TC-Z1): re-render PR #120's body through the new `update-pr` skill; confirm `body_conforms=true`. | Manual | — | 15m |

**Total estimate:** 3-4.5h agentic + 30-60m human review. Aligns with plan §3 totals.

These tasks ride into the `assumptions-review` activity for confirmation alongside the two open stakeholder-dependent assumptions.
