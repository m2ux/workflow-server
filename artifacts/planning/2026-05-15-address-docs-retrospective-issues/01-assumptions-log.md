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
Total: 13 | Validated: 10 | Invalidated: 0 | Partially Validated: 1 | Open: 2
Convergence iterations: 1 | Newly surfaced: 0
```

Convergence reached after one reconciliation iteration. The two remaining Open assumptions are Stakeholder-dependent and will be presented at the `assumptions-review` activity. The Partially Validated entry (A-DP-05) is partly empirical / harness-observed; its residual uncertainty is reclassified as Stakeholder-dependent.

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

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** The depth-1 spawn failure observed during bootstrap is a Claude Code harness behaviour, not a configuration error in this specific session.  
**Risk if wrong:** A workflow-content-only fix would not solve the underlying problem; the harness configuration would be the right edit point.  
**What would resolve it:** User confirmation of the harness behaviour at `assumptions-review`. Iteration 1.

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

**Status:** Open  
**Resolvability:** Stakeholder-dependent  
**Assumption:** Bootstrap-observation items are candidates for `plan-prepare` to decide; default is spin-out to a separate work package.  
**Risk if wrong:** A simpler folded-in approach might be cheaper than spinning out.  
**What would resolve it:** Stakeholder decision at `plan-prepare`'s scope checkpoint. Iteration 1.

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

## Convergence check

After iteration 1, the open set is:

| # | Assumption | Why open |
|---|---|---|
| A-DP-05-residual | Harness-behavior verification (depth-1 `Task` availability) | Empirical / requires user confirmation |
| A-DP-09 | Bootstrap observations §4.1–§4.3 scope decision | Stakeholder decision at `plan-prepare` |

Both remaining open assumptions are Stakeholder-dependent. No further code analysis would reduce them. `has_resolvable_assumptions = false`. Convergence reached.

`has_open_assumptions = true` — two stakeholder-dependent items remain for `assumptions-review`.

---

## Handoff to `assumptions-review`

The two open assumptions above will be presented to the user at the `assumptions-review` activity. Both are decision items, not verification questions:

- **A-DP-05-residual** — user is best placed to confirm whether the depth-1 `Task` constraint is a stable harness behaviour or a transient configuration artefact.
- **A-DP-09** — user decides whether to fold the three bootstrap observations into this work package or spin them out.
