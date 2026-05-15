# Work Package Plan — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-15
**Activity:** `plan-prepare`
**Driving inputs:** [01-design-philosophy.md](01-design-philosophy.md), [01-assumptions-log.md](01-assumptions-log.md), [02-codebase-comprehension.md](02-codebase-comprehension.md), [../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md](../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)

---

## 1. Goal

Convert the retrospective's six prioritised recommendations into enforceable workflow content. The single highest-leverage change is the defence-in-depth pair (rules on `update-pr` + checklist line on `strategic-review`); the remaining items close the supporting gaps that surfaced on PR #119. Three bootstrap-observation items (§4.1 templated checkpoint, §4.2 sub-agent depth, §4.3 classification overwrite) are folded in as workflow-content-only edits per the recommendations below.

The work is workflow-content only — TOON skills, activities, resources, and one meta operation. No MCP-server source (`src/`, `schemas/`) or test code is in scope.

---

## 2. Scope decisions surfaced for confirmation

These ride into the `approach-confirmed` checkpoint at the end of this activity.

| Bucket | Source | Recommend | Rationale |
|---|---|---|---|
| 1 | Retrospective high-priority (strategic-review checklist line) | **IN** | One-line change, closes the gate the retrospective flagged. |
| 2 | Retrospective medium-priority (update-pr verify step + render-rerender loop) | **IN** | Primary load-bearing change; defence-in-depth with #1. |
| 3 | Retrospective medium-priority (signing pre-check) | **IN** | Move detection from `strategic-review` to `start-work-package`. |
| 4 | Retrospective low-priority (promote anti-patterns to rules, issue-skipped placeholder, env-prerequisites step, list-workflows rewrite) | **IN** | Each is a small, localised edit; collectively close the secondary gaps. |
| 5 | Bootstrap obs §4.1 (templated `{problem_type}`/`{complexity}` in checkpoint message) | **IN** (workflow-content fix only) | Add explicit `set` actions before the checkpoint in `design-philosophy`. The defensive `yield_checkpoint` variables-payload variant is **OUT** — server-source change not justified. |
| 6 | Bootstrap obs §4.2 (sub-agent `Task` depth) | **OUT — observation retracted** | The original observation was incorrect. Workers CAN be foreground-spawned from depth ≥ 1; the bootstrap failure was per-subagent-type allowed-tools configuration, not a harness depth limit. No workflow-content change needed. |
| 7 | Bootstrap obs §4.3 (classification overwrite smell) | **IN** | Separate path-gating from substantive complexity at `workflow-path-selected` — single-line edit while editing `design-philosophy`. |

Stakeholder-dependent assumptions resolved at `assumptions-review` (the next activity), not at this checkpoint:

- **A-DP-05-residual** — harness depth-1 `Task` behaviour. The §4.2 fix is workflow-content only, so this assumption does not block the plan; it informs whether further harness-side work is required later.
- **A-DP-09** — bootstrap-observation scope. Resolved here by recommending §4.1/§4.2/§4.3 IN as above; `assumptions-review` may revisit.

---

## 2.5 Alignment with workflow-design principles

Each touch site is audited against the 14 principles in `resources/00-design-principles.md`, the formal-construct map in `resources/01-schema-construct-inventory.md`, and the 29 anti-patterns in `resources/02-anti-patterns.md`. Adjustments listed in the "Alignment action" column have been folded into §3 / §4 / §5 below.

| # | Touch site | Construct(s) used | Principle(s) embodied | Anti-patterns guarded against | Alignment action |
|---|---|---|---|---|---|
| 1 | `18-update-pr.toon` — 5 named rules + new `verify-body` protocol phase | Skill `rules.pr-body-conformance[5]` (grouped-array form per AP-26); Skill `protocol.verify-body[]` imperative bullets (AP-15); two new workflow variables `body_conforms` (boolean) and `body_findings` (array) | #4 Maximize Schema Expressiveness (no prose-as-rules); #10 Encode Constraints as Structure (rules + variables, not commentary); #5 Convention Over Invention (existing file uses `template-selection[2]` grouped array) | AP-13 "implicit variables" — `body_conforms`/`body_findings` declared in `workflows/work-package/workflow.toon::variables[]`; AP-26 flat prefix keys — grouped under one key; AP-9 prose checkpoints — none, real checkpoint follows in #3 | Add explicit workflow-variable declarations (§3 touch site 1 expanded) |
| 2 | `12-review-strategy.toon` — new `verify-pr-body-conformance` protocol phase | Skill `protocol.verify-pr-body-conformance[]` with imperative audit bullets (AP-15) | #9 Modular Over Inline (the rules themselves live on `update-pr`; this phase audits the rendered output rather than restating the rules); #5 Convention Over Invention (review-strategy already structures protocol as imperative bullets) | AP-24 "rule restates the protocol" — the bullets are framed as audit actions ("verify that…"), NOT as verbatim copies of the rule strings; AP-33 cross-skill duplication — explicitly acknowledged as defence-in-depth in §7 risks; canonical source is §4 of this plan | Bullet wording reframed in §4 footnote — bullets phrased as imperative audit checks, not rule-text copies |
| 3 | `12-submit-for-review.toon` — `loops[]` + `body-non-conformant` checkpoint | Activity `loops[].type: while` with `condition.type: simple` (canonical loop form); `loops[].maxIterations: 2` (schema field); Activity `checkpoints[]` with `blocking: true`, three `options[]` each carrying explicit `effect` (`setVariable` / no-op-continue / `transitionTo`) | #4 Maximize Schema Expressiveness (loop, checkpoint, effect — three formal constructs replace any prose escape hatch); #3 One Question at a Time (the checkpoint is a single decision with discrete options); #10 Encode Constraints as Structure (the bound is `maxIterations`, not a rule string) | AP-5 combined checkpoints — three options on one decision, not three checkpoints; AP-10 "repeat as prose" — loop construct; AP-19 "rule text only" — `maxIterations` enforces the bound | Effects table added in §5 below — each option's `effect` is enumerated, not described in prose only |
| 4 | `resources/12-pr-description.md` — Issue-skipped placeholder variant | Resource markdown (non-schema content) | #12 Non-Destructive Updates (additive — placeholder variant added; no removals) | AP-20 "Updated README that removes content" — explicitly noted as additive-only in §5 / acceptance #4 | None — already aligned |
| 5 | `01-start-work-package.toon` — `verify-signing-precondition` step with six `validate` actions | Step `actions[].action: validate` (canonical action type for pre-conditions per inventory) | #10 Encode Constraints as Structure (six `validate` actions replace "must check signing" prose); #11 Plan Before Acting (pre-condition gating before downstream steps) | AP-19 "rule text only" — `validate` actions are structural; AP-29 "single-step rule" — these are step-level actions, not skill rules, so the constraint lives where it's enforced | None — already aligned |
| 6 | `06-plan-prepare.toon` — `env-prerequisites` step at position 1 with six `validate` actions | Step `actions[].action: validate` | Same as #5; plus #5 Convention Over Invention (existing `start-work-package` uses the same pattern after #5 lands) | Same as #5 | None — already aligned |
| 7 | `meta/00-workflow-engine.toon::list-workflows` operation body rewrite | Skill `operations.list-workflows.tools` switched from `workflow-server.list_workflows` to `harness.Read`/`harness.Glob`; `procedure[]` updated to match | #6 Never Modify Upward (fixing operation body to match the worker's tool allowlist — content conforms to constraint, not the other way around); #9 Modular Over Inline (operation body stays modular within the skill) | AP-32 "Inconsistent tool names across skills" — the activity-side `operations[]` ref still says `workflow-engine::list-workflows` so external contract is preserved; AP-34 "describes mechanics, not value" — the operation's `output` description must remain unchanged | Add explicit note in §3 row 7 that activity-side operation ref is unchanged (already captured in TC-M3 of the test plan) |
| 8 | `02-design-philosophy.toon` — §4.1 `set` actions + §4.3 variable separation | Step `actions[].action: set` (two `set` actions for `problem_type` and `complexity` before the `classification-confirmed` checkpoint); new workflow variable `path_gating_complexity` declared in `work-package/workflow.toon::variables[]` (avoids overwriting substantive `complexity`); checkpoint `options[].effect.setVariable` updated to write to the new variable | #4 Maximize Schema Expressiveness (`set` action — not "ensure variable is written" prose); #10 Encode Constraints as Structure (the variable carries the path-gating semantic, not a code comment); #2 Define Complete Scope (the new variable is added to the workflow's `variables[]` so the scope is enumerated) | AP-13 "implicit variables" — `path_gating_complexity` is declared, not implied; AP-28 "contradictory siblings" — the previous overwrite of `complexity` made it ambiguous; the new variable removes that contradiction | Add §3 row 8c sub-edit: declare `path_gating_complexity` variable in `work-package/workflow.toon` |

**Net adjustments to §3 / §4 / §5 from this audit:**

- Touch site 1: split into 1a (5 rules), 1b (verify-body phase), 1c (declare two new workflow variables).
- Touch site 2: clarify in §4 that the strategic-review bullets are audit-framed, not rule-text copies (anti-pattern 24).
- Touch site 3: §5 now includes an explicit `effect` table for the three checkpoint options.
- Touch site 8: now has three sub-edits (8a §4.1 set actions, 8b §4.3 new variable + effect update, 8c declare new variable in `workflow.toon`).

No new buckets in §2. No buckets retracted (other than bucket 6 which was already retracted in the prior pass).

---

## 3. Touch sites and sequencing

Eight touch sites, grouped into four leverage tiers. Each tier ships value independently; an early abort after Tier 1 still resolves the retrospective's high-priority finding. Several touch sites have sub-edits surfaced by the §2.5 principles audit; each sub-edit is in the same file as its parent and is sequenced together.

| Tier | # | File | Edit class | Est. time |
|---|---|---|---|---|
| **Tier 1 — High-leverage defence-in-depth** | 1a | `workflows/work-package/skills/18-update-pr.toon` | Add grouped rule array `rules.pr-body-conformance[5]` (five named rules per §4). Existing file already uses grouped arrays for `template-selection[2]` — same pattern. | 15-20m |
| | 1b | `workflows/work-package/skills/18-update-pr.toon` | Add new `protocol.verify-body[]` phase. Phase body: render → run five rule checks → write `body_conforms` (boolean) and `body_findings[]` (array of `{rule_id, detail}`) to session variables. | 15-25m |
| | 1c | `workflows/work-package/workflow.toon` | Declare two new variables in `variables[]`: `body_conforms` (`type: boolean`, `defaultValue: false`) and `body_findings` (`type: array`, `defaultValue: []`). Required so the verify phase's outputs and the verify-rerender loop's condition reference declared variables, not implicit ones (anti-pattern 13). | 5-10m |
| | 2 | `workflows/work-package/skills/12-review-strategy.toon` | Add `protocol.verify-pr-body-conformance[]` phase with five audit-framed bullets (NOT verbatim rule copies — see §4 footnote). Reads live PR body via `gh pr view --json body`. | 20-30m |
| | 3 | `workflows/work-package/activities/12-submit-for-review.toon` | Add activity-level `loops[]` with `id: verify-pr-body-rerender`, `type: while`, `condition.type: simple` (`variable: body_conforms`, `operator: ==`, `value: false`), `maxIterations: 2`. Add `checkpoints[]` entry `body-non-conformant` with `blocking: true` and three `options[]` each carrying an explicit `effect` (see §5 effects table). | 30-45m |
| | 4 | `workflows/work-package/resources/12-pr-description.md` | Add Issue-skipped placeholder variant: `🐛 _Issue: skipped_`. Additive — no existing content removed (preservation per principle #12). | 5-10m |
| **Tier 2 — Signing pre-check** | 5 | `workflows/work-package/activities/01-start-work-package.toon` | Add `verify-signing-precondition` step after `analyze-reference-with-gitnexus` and before `derive-branch-name`. Six `actions[].action: validate` entries covering `user.signingkey`, agent reachability, etc. (`validate` is the canonical action for pre-condition gating per construct inventory). | 20-30m |
| **Tier 3 — Env-prerequisites + meta-discover-session fix** | 6 | `workflows/work-package/activities/06-plan-prepare.toon` | Add `env-prerequisites` step at position 1 (before `apply-design`). Six `actions[].action: validate` entries: workflows worktree presence, `target_path`, `reference_path`, `planning_folder_path` writable, `gh` auth, GPG agent. Same construct pattern as #5. | 20-30m |
| | 7 | `workflows/meta/skills/00-workflow-engine.toon` | Rewrite `list-workflows` operation body to use harness `Read`+`Glob` over `workflows/*/workflow.toon`. Drop the `workflow-server.list_workflows` tool ref from the operation's `tools` section. Operation's `output` description and external contract preserved; activity-side `operations[]` string (`workflow-engine::list-workflows`) stays unchanged so no caller is affected (anti-pattern 32 guard). | 20-30m |
| **Tier 4 — Bootstrap-observation follow-ups** | 8a | `workflows/work-package/activities/02-design-philosophy.toon` | §4.1 fix — add two `actions[].action: set` entries (one for `problem_type`, one for `complexity`) immediately before the `classification-confirmed` checkpoint yields. Replaces implicit "variables are written somewhere" assumption with a structural write (principle #10). | 10-15m |
| | 8b | `workflows/work-package/activities/02-design-philosophy.toon` | §4.3 fix — change the `workflow-path-selected` checkpoint's `skip-optional` option's `effect.setVariable` so it writes to the new `path_gating_complexity` variable rather than overwriting substantive `complexity`. Any downstream transition/decision currently reading `complexity` for path-gating purposes must be repointed at `path_gating_complexity` in the same edit. | 10-15m |
| | 8c | `workflows/work-package/workflow.toon` | Declare new variable `path_gating_complexity` in `variables[]` (`type: string`, `defaultValue: ""`, description names it as the path-gating-only mirror of `complexity`). Required so the new variable is enumerated (principle #2) and not implicit (anti-pattern 13). | 5-10m |
| | ~~9~~ | ~~`workflows/meta/skills/07-harness-compat.toon` + dispatch-activity~~ | **REMOVED.** Bootstrap obs §4.2 retracted — workers can be spawned foreground from depth ≥ 1. No edits needed. | — |

Eleven sub-edits total across Tiers 1–4 (the original seven touch sites, with #1 split into 1a/1b/1c and #8 split into 8a/8b/8c surfaced by the principles audit).

**Total estimated time:** 2.75-4.5h agentic + 30-60m human review. Slight increase over the previous estimate (2.5-4h) reflects the explicit variable declarations and effects table folded into the plan; the underlying scope did not grow.

---

## 4. Canonical rule wording (defence-in-depth pair)

The five rules below are the **canonical source** for both Tier 1 sites. Wording is anchored to resource 12.

### 4.1 Rule strings (live in `18-update-pr.toon` only)

The five rules appear in their declarative-constraint form in **one authoritative location**: `18-update-pr.toon` under `rules.pr-body-conformance[5]` (grouped-array form per anti-pattern 26).

| Rule id | Wording (canonical, declarative — used as-is in `update-pr` rules) |
|---|---|
| `summary-max-two-sentences` | "Summary section is 1-2 sentences, leads with the outcome, and includes measurable impact when available." |
| `engineering-link-mandatory` | "Engineering link is present, resolved from the parent repo's `git remote get-url origin` and current `git branch --show-current`, and resolves to a committed file on the remote." |
| `issue-link-or-explicit-placeholder` | "Issue line is present. When `issue_skipped == true`, render `🐛 _Issue: skipped_` as an explicit placeholder rather than dropping the line or fabricating a number." |
| `no-commit-headings-in-changes` | "Changes section groups bullets by component (bold component name), not by Conventional Commits header or commit message." |
| `no-files-changed-list` | "Changes section does not enumerate file paths. File-level detail belongs in the PR's Files-changed tab." |

### 4.2 Audit bullets (live in `12-review-strategy.toon` `verify-pr-body-conformance` phase)

The strategic-review phase must NOT verbatim copy the rule strings — that would match anti-pattern 24 ("rule restates the protocol") at cross-skill scope and creates double-maintenance with no added information. Instead, each bullet is framed as an imperative audit action that references the rule id from `update-pr`.

| Rule id (from §4.1) | Strategic-review audit bullet (canonical, imperative — used as-is in the phase body) |
|---|---|
| `summary-max-two-sentences` | "Read the Summary section of the live PR body (`gh pr view --json body`). Confirm it is 1-2 sentences and leads with the outcome. Flag if violated, referencing `update-pr::rules.pr-body-conformance.summary-max-two-sentences`." |
| `engineering-link-mandatory` | "Confirm the Engineering link in the live PR body resolves to a committed file on the remote of the parent repo. Flag if violated, referencing `update-pr::rules.pr-body-conformance.engineering-link-mandatory`." |
| `issue-link-or-explicit-placeholder` | "Confirm an Issue line is present in the live PR body. When `issue_skipped == true`, confirm it renders as the explicit placeholder. Flag if violated, referencing `update-pr::rules.pr-body-conformance.issue-link-or-explicit-placeholder`." |
| `no-commit-headings-in-changes` | "Confirm the Changes section groups bullets by component (bold component name). Flag any Conventional-Commits-styled headings, referencing `update-pr::rules.pr-body-conformance.no-commit-headings-in-changes`." |
| `no-files-changed-list` | "Confirm the Changes section does not enumerate file paths. Flag any file-list bullets, referencing `update-pr::rules.pr-body-conformance.no-files-changed-list`." |

### 4.3 Drift mitigation

The rule strings live in exactly one location (`update-pr`); the audit bullets live in exactly one location (`strategic-review`); the canonical mapping between them is §4 of this plan. When wording changes later, the rule string in `update-pr` is updated first, the audit bullet in `strategic-review` is updated to reference the (possibly renamed) rule id, and §4 of this plan is updated to record the new pairing. This satisfies anti-pattern 27 (one authoritative location per rule) and anti-pattern 33 (duplicated behavioural guidance) — both copies serve **different roles** (declarative constraint vs. imperative audit) at the same architectural level, and neither restates the other verbatim.

---

## 5. Verify-rerender loop semantics

- **Placement:** activity-level `loops[]` on `submit-for-review` only. Not on `plan-prepare` — the Initial template lacks the Changes and Engineering link content that the rules check, so the rules apply only at the Final-template render.
- **Loop construct (canonical per `01-schema-construct-inventory.md`):**
  ```
  loops[1]:
    - id: verify-pr-body-rerender
      type: while
      condition:
        type: simple
        variable: body_conforms
        operator: ==
        value: false
      maxIterations: 2
      steps[1]:
        - id: rerender-and-verify
          skill: update-pr      # reruns render + verify-body phase
  ```
- **Workflow variables consumed by the loop's condition:** `body_conforms` (declared in 1c). The loop's body re-runs the render and the new `verify-body` phase, which rewrites `body_conforms` and `body_findings`.
- **Escape hatch:** after `maxIterations`, a blocking `body-non-conformant` checkpoint. Each of the three options carries an explicit `effect` from the canonical effect set (`setVariable`, `transitionTo`):

| Option id | Label | Effect (formal `effect.*`) | Semantics |
|---|---|---|---|
| `proceed-with-override` | Proceed with override | `setVariable: { body_conforms: true, body_override_recorded: true }` | Records the deviation, breaks the loop's condition, continues into submit. Used when the deviation is acknowledged and intentional. |
| `provide-input` | Provide missing input | `setVariable: { body_conforms: false }` plus a `transitionTo` that re-enters the same loop with a fresh iteration budget (handled via re-dispatch of `submit-for-review` from the orchestrator; the activity itself terminates and reopens). | The user supplies the missing input (e.g., an Issue rationale, an engineering branch push) outside the loop, then the activity is re-entered. |
| `abort` | Abort submission | `transitionTo: complete` with `setVariable: { submission_aborted: true }` | Terminates the activity with an explicit failure status. The retrospective for the work package will capture the abort reason from `body_findings`. |

The new variable `body_override_recorded` (boolean, default `false`) and `submission_aborted` (boolean, default `false`) must be declared in `work-package/workflow.toon::variables[]` as part of touch site 1c (added to its description).

- **Persisted artifact:** none in the planning folder. The render writes `/tmp/pr-body.md` (as today). Strategic-review reads the live PR body via `gh pr view --json body`. Two-tier defence-in-depth is sufficient (CI lint is out of scope per Q9).

---

## 6. Implementation order (deterministic dependency chain)

Within a tier, edits are independent (no shared state). Across tiers, order matters only at Tier 1, where the verify loop in #3 depends on the phase output in #1 and the rule wording in #1 must match #2's checklist.

```
T1.1c work-package/workflow.toon — declare body_conforms, body_findings,    ─┐
       body_override_recorded, submission_aborted variables (gates 1a/1b/3)  │
T1.1a update-pr rules.pr-body-conformance[5]                                 │
T1.1b update-pr verify-body protocol phase (consumes 1c variables)           │
T1.2  strategic-review verify-pr-body-conformance phase (audit-framed)       ├─ (run validator after each)
T1.3  submit-for-review loops[] + body-non-conformant ckpt with effects[]    │
T1.4  resource 12 issue-skipped variant                                      ─┘

T2.1 start-work-package verify-signing-precondition (6 validate actions)     (independent)

T3.1 plan-prepare env-prerequisites step (6 validate actions)                (independent)
T3.2 meta/00-workflow-engine list-workflows rewrite                          (independent)

T4.8c work-package/workflow.toon — declare path_gating_complexity variable   ─┐
T4.8a design-philosophy §4.1 set actions (problem_type + complexity)         ├─ (run validator after each)
T4.8b design-philosophy §4.3 effect retarget to path_gating_complexity       ─┘
# T4.9 removed (bootstrap obs §4.2 retracted)
```

Note: within Tier 1, sub-edit 1c must land **before** 1a/1b/3 because the rules' `verify-body` phase and the loop's condition reference the variables declared in 1c. Within Tier 4, sub-edit 8c must land before 8b for the same reason. Schema validation will catch out-of-order edits anyway, but the recommended order avoids transient validator failures during implementation.

After each edit: `npx workflow-validator` (or equivalent — confirmed by `test-plan.md`) to catch schema breaks early. Final smoke run: invoke `update-pr` against PR #120's body end-to-end (after the new tier has landed). This is what the test plan covers.

---

## 7. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Loop wording drifts between `update-pr` and `strategic-review`. | Medium | Both rule strings live in this plan (§4) as the canonical source. Implementation task copies them in verbatim. |
| `verify-body` phase reports false positives (e.g., a section legitimately formatted differently). | Medium | The five rules are intentionally narrow (Summary length, Engineering link presence, Issue placeholder, Changes grouping pattern, no file lists). Each has a deterministic regex/check. |
| `maxIterations: 2` is too tight when the engineering branch needs to be pushed mid-render. | Low | `provide-input` escape hatch on the `body-non-conformant` checkpoint — the user pushes the branch then resumes; the loop reruns with `maxIterations: 1`. |
| Schema validator fails on the new `loops[]` block in `submit-for-review`. | Low | `loops[].while` + `maxIterations` is already used in `design-philosophy`, `plan-prepare`, `codebase-comprehension`, and `implement` — pattern is established. |
| §4.1 fix (adding `set` actions) breaks an existing test that asserts the absence of those actions. | Very low | No such test exists per the comprehension artifact's deep-dive. |
| Worker-prompt rule (workers never call `list_workflows`) collides with the rewritten operation. | Very low | The rewrite drops the `list_workflows` tool ref entirely; the operation now uses `Read`+`Glob` which workers DO have. |

---

## 8. Out of scope

- MCP-server source (`src/`, `schemas/`) edits — including the `yield_checkpoint` variables-payload extension (§4.1 defensive variant) and the harness collapse (§4.2 architectural variant).
- Retroactive PR-body fix on PR #119 (already corrected inline, merged).
- New tests for the MCP server. The test plan covers schema-validation and structural assertions on the TOON edits only.
- CI lint as a third defence-in-depth tier (Q9 — out of scope; no evidence of post-strategic-review mutation).
- Migration of the rendered PR body to a planning-folder artifact (Q2 — local `/tmp` + live `gh pr view` is sufficient).
- Rationale capture for `issue_skipped` placeholder (Q7 — gated on a free-text-input checkpoint primitive that does not exist).
- Audit of every `workflow-engine` operation that implicitly assumes nested agents (Q10) — only the two specifically identified (`dispatch-activity`, `handle-sub-workflow`) need touch.

---

## 9. Acceptance criteria

For the work package to ship:

1. The five rules in §4.1 exist verbatim under `rules.pr-body-conformance[5]` in `18-update-pr.toon`, expressed as a grouped-array rule per the existing `template-selection[2]` convention.
2. The five audit bullets in §4.2 exist verbatim in a new `protocol.verify-pr-body-conformance[]` phase in `12-review-strategy.toon`. They reference rule ids from `update-pr`; they do NOT verbatim copy the rule strings (anti-pattern 24 guard).
3. `12-submit-for-review.toon` has a `loops[]` block with `type: while`, `condition.type: simple` (`variable: body_conforms`, `operator: ==`, `value: false`), `maxIterations: 2`. A blocking `body-non-conformant` checkpoint exists with three options, each carrying the explicit `effect` enumerated in §5.
4. `workflows/work-package/workflow.toon::variables[]` declares four new variables: `body_conforms` (boolean, default `false`), `body_findings` (array, default `[]`), `body_override_recorded` (boolean, default `false`), `submission_aborted` (boolean, default `false`).
5. Resource 12 has an Issue-skipped placeholder rule rendering `🐛 _Issue: skipped_`. No existing content removed (preservation per principle #12 — diff against pre-edit baseline shows only additions).
6. `01-start-work-package.toon` has a `verify-signing-precondition` step (positioned between `analyze-reference-with-gitnexus` and `derive-branch-name`) with six `actions[].action: validate` entries.
7. `06-plan-prepare.toon` has an `env-prerequisites` step at position 1 with six `actions[].action: validate` entries.
8. `meta/00-workflow-engine.toon::list-workflows` operation body no longer references `workflow-server.list_workflows`; the operation's `tools` section uses `Read`+`Glob` over `workflows/*/workflow.toon`. The operation's `output` description, external contract, and the activity-side `operations[]` ref (`workflow-engine::list-workflows`) are unchanged.
9. `02-design-philosophy.toon` writes `problem_type` and `complexity` via two `actions[].action: set` entries before `classification-confirmed` yields.
10. `02-design-philosophy.toon`'s `workflow-path-selected` checkpoint's `skip-optional` option's `effect.setVariable` writes to `path_gating_complexity`, NOT to the substantive `complexity` variable. Any downstream transition/decision currently reading `complexity` for path-gating purposes is repointed at `path_gating_complexity`.
11. `workflows/work-package/workflow.toon::variables[]` declares the new variable `path_gating_complexity` (string, default `""`).
12. Schema validators (`tsx scripts/validate-workflow.ts work-package`, `tsx scripts/validate-workflow.ts meta`, `tsx scripts/validate-workflow-toon.ts`) all exit 0 on every edited file (principle #13 — schema validation before commit; principle #6 — never modify upward).
13. Manual smoke run: `update-pr` against PR #120's body produces a body that passes its own `verify-body` phase with no `body_findings`.

> Note: the prior acceptance criterion about `harness-compat::spawn-agent` documenting a depth-1 constraint was removed because the underlying observation (bootstrap §4.2) was retracted — workers CAN be spawned foreground from depth ≥ 1.

---

## 10. Handoff

Next activity per the transition table: `assumptions-review` (carries the two open stakeholder-dependent assumptions A-DP-05-residual and A-DP-09 to the user). After `assumptions-review`, the path is `implement → post-impl-review → validate → strategic-review → submit-for-review → complete`.
