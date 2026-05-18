# Code Review — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-18
**Activity:** `post-impl-review`
**PR:** [#120](https://github.com/m2ux/workflow-server/pull/120) (currently CLOSED on GitHub)
**Diff base:** `97be373`
**Diff HEAD:** `9be34eb`
**Reference:** [05-work-package-plan.md §9 — Acceptance criteria (17 items)](05-work-package-plan.md)

Severity legend: **Critical** (ship-blocking) / **Major** (must fix before ship) / **Minor** (should fix) / **Nit** (style/wording) / **Informational** (note only).

---

## 1. Acceptance-criteria audit

Each of the 17 §9 items audited against the live diff.

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | Five rules in `update-pr` (grouped-array, §4.1 wording verbatim) | MET | `rules.pr-body-conformance[5]` present; all five rule strings byte-for-byte match plan §4.1. |
| 2 | Five audit bullets in `review-strategy` (§4.2 wording verbatim, referencing rule ids, NOT verbatim rule copies) | **NOT MET** | See Major-1 below. The new `verify-pr-body-conformance[3]` phase delegates to `update-pr::protocol.verify-body` and records findings — it does not host the five audit bullets enumerated in §4.2 of the plan, and none of the five rule ids appears in the strategic-review skill. |
| 3 | `submit-for-review.loops[]` + `body-non-conformant` checkpoint with explicit effects | MET | `loops[1]` with `type: while`, condition on `body_conforms == false`, `maxIterations: 2`; checkpoint has three options with the §5 effects. |
| 4 | Four new workflow variables (`body_conforms`, `body_findings`, `body_override_recorded`, `submission_aborted`) | MET | All four declared with correct types and defaults. |
| 5 | Issue-skipped placeholder in resource 12 (additive) | MET | New subsection added; pre-existing content preserved. |
| 6 | `start-work-package.verify-signing-precondition` with **six** `validate` actions | **NOT MET (intentional)** | See Major-2 below. The step exists but has 1 composite `signing.configured` validate, not 6. `ffc03cd` collapsed the six because the prior validates prescribed `git config --global ...` and `gpgconf --launch gpg-agent` commands that modify user environment — a violation of "never modify upward". Spirit of the criterion (pre-condition gate placed correctly) is preserved; the literal count is not. |
| 7 | `plan-prepare.env-prerequisites` at position 1 with six `validate` actions | MET | Step is `steps[0]`; six `validate` actions cover the listed prerequisites; messages tightened per AP-37 but each retains cause + fix command. |
| 8 | `meta/list-workflows` body uses `Read`+`Glob`, no `workflow-server.list_workflows` ref | **NOT MET (regressed)** | See Critical-1 below. `5de90e9` implemented the rewrite as planned; `cf18f6c` reverted it back to `workflow-server.list_workflows`. The operation name and `output` description are preserved; the body is back to baseline. |
| 9 | `design-philosophy` `set` actions for `problem_type`+`complexity` before `classification-confirmed` | MET | Two `set` actions on `classify-problem` step, both targeting the right variables. |
| 10 | `workflow-path-selected.skip-optional.effect.setVariable` writes `path_gating_complexity`; any downstream path-gating ref repointed | PARTIALLY MET | See Minor-1 below. `skip-optional` is correctly retargeted. Other `workflow-path-selected` options (`full-discovery`, `research-only`, `elicitation-only`) still write `complexity: complex` / `complexity: moderate` — these are debatable: they MAY be substantive overrides, in which case they're fine; if they're path-gating, they should also be repointed. The plan §9.10 names only `skip-optional`, so the criterion as written is met. |
| 11 | `path_gating_complexity` variable declared | MET | Last of five appended entries in `work-package/workflow.toon`. |
| 12 | `harness-compat::spawn-agent.rules.depth-1-only` rule | MET | Named rule alongside existing `foreground-always` and `index-in-prompt`. |
| 13 | Three `workflow-engine` operations deleted; no remaining callers | PARTIALLY MET | See Major-3 below. Operations are gone from `meta/skills/00-workflow-engine.toon`; TOON validators pass. But three markdown files (`meta/resources/02-workflow-orchestrator-prompt.md`, `meta/activities/README.md`, `meta/README.md`) still reference the deleted operation names. Stale prose docs, not enforced by validators. |
| 14 | `handle-sub-workflow.procedure` is a single `dispatch_child` bullet; `output` (`child_session_index`) unchanged | MET | One bullet only; output unchanged. |
| 15 | `dispatch-client-workflow.operations[]` lists the five workflow-engine ops; no `spawn-agent`/`continue-agent`/`compose-prompt`/`extract-checkpoint-handle`/`handle-workflow-complete` refs at activity level | MET | `operations[5]` matches the criterion list verbatim; activity-level references to the prohibited operations are gone. |
| 16 | All three schema validators exit 0 | MET | `validate-workflow-toon work-package` PASS, `validate-workflow-toon meta` PASS, `validate-activities work-package` PASS. |
| 17 | Smoke run of `update-pr` against PR #120 | DEFERRED | Per plan, runs at `validate` activity. PR #120 is currently CLOSED on GitHub; the smoke procedure may need to target a different live PR or re-open #120. |

**Score:** 12 MET, 1 PARTIALLY MET (criterion 10), 4 NOT MET (criterion 2 deviation, criterion 6 intentional collapse, criterion 8 regression, criterion 13 stale-docs trailing edge), 1 DEFERRED (criterion 17).

---

## 2. Findings

### Critical-1 — `meta/list-workflows` operation body regressed to `workflow-server.list_workflows`

**Severity:** Critical (criterion 8 not met as written).

**Location:** `meta/skills/00-workflow-engine.toon::operations.list-workflows`

**Observation:** `5de90e9 refactor(workflow-engine): list-workflows uses harness Glob+Read instead of MCP tool` implemented the criterion-8 rewrite — `tools: harness[2] (Glob, Read)`, `procedure[3]` describing the Glob+Read+parse flow. `cf18f6c refactor: strip rationale prose from TOON descriptions` then reverted to the baseline `tools: workflow-server[1] (list_workflows)`, `procedure[1] (Call list_workflows)`.

**Why this matters:** Plan §9.8 + plan §2.5 row 7 frame this rewrite as the canonical resolution for AP-32 ("inconsistent tool names across skills") and the worker-prompt rule that workers never call `list_workflows`. The retrospective driving this work package called out workers attempting to invoke the tool and failing on permission grounds. Reverting the body re-opens that failure mode for any worker that calls `list-workflows`.

**Possible explanations** (not evident from the commit message of `cf18f6c`):

1. The harness `Read`+`Glob` form was discovered to be incompatible with the operations-bundle dispatch shape (worker doesn't receive the tools).
2. The revert was unintentional — a prose-cleanup pass over-reached into structural fields.

**Recommendation:** Investigate the revert. If (1), the harness-primitive shape needs a different fix (e.g., `list-workflows` becomes an orchestrator-only operation, never bundled to workers) and §9.8 needs to be rewritten or marked superseded. If (2), restore the harness-primitive body from `5de90e9` and re-validate.

---

### Major-1 — `review-strategy::protocol.verify-pr-body-conformance` no longer hosts the five audit bullets

**Severity:** Major (criterion 2 not met as written).

**Location:** `work-package/skills/12-review-strategy.toon::protocol.verify-pr-body-conformance`

**Observation:** The plan §4.2 prescribed five audit-framed bullets — one per rule id, each referencing `update-pr::rules.pr-body-conformance.<rule-id>` and phrased as an imperative audit check. The current implementation is three bullets:

```
verify-pr-body-conformance[3]:
  - "Read the live PR body via `gh pr view {pr_number} --json body --jq .body`."
  - "Run update-pr::protocol.verify-body against the live body."
  - "If body_conforms == false, record each body_findings entry in strategic-review-{n}.md under 'PR body conformance'."
```

The new shape delegates the rule evaluation to `update-pr::protocol.verify-body` and records findings — none of the five rule ids appears in the skill.

**Trade-off analysis:**

- The new shape **improves** AP-33 alignment (duplicated behavioural guidance): the rule evaluation logic lives in exactly one place (`update-pr::protocol.verify-body`), not two.
- The new shape **weakens** the defence-in-depth posture the plan was framed around: strategic-review now passes iff `update-pr::verify-body` passes; there is no second, independently-implemented check. If `verify-body` has a bug, strategic-review will not catch it.
- The plan's `verify-body` and the strategic-review audit were designed to be implemented independently. By delegating, strategic-review inherits any defect in `verify-body`.

**Recommendation:** The delegation is defensible (single source of truth wins over redundant logic in most cases), but the plan §4.2 acceptance criterion and §4.3 drift mitigation reasoning should be updated to match. Either:

1. Mark §9.2 as superseded; document the delegation pattern as the new approach.
2. Restore the five audit bullets to give strategic-review an independent check.

The current state is a deviation from the plan without a corresponding plan update. AP-27 ("rule appears in workflow AND activity") is no longer at risk because the rules live in one place — but the plan's mitigation reasoning needs to catch up.

---

### Major-2 — `verify-signing-precondition` has 1 validate, not 6

**Severity:** Major (criterion 6 not met as written; rationale is sound but the deviation should be acknowledged in the plan).

**Location:** `work-package/activities/01-start-work-package.toon::steps.verify-signing-precondition`

**Observation:** `ffc03cd fix(start-work-package): stop prescribing git-config-changing commands` reduced the step from 6 `validate` actions (each with a fix command like `git config --global commit.gpgsign true`, `gpgconf --launch gpg-agent`, etc.) to 1 composite check (`signing.configured == true`) with a single message that explicitly says "The workflow does not modify your git configuration."

**Trade-off analysis:**

- The 6-action form prescribed `git config --global` mutations of the user's environment. Workflows are not supposed to alter user infrastructure (principle #6, "Never Modify Upward").
- The 1-action form trades fine-grained diagnostics for environmental respect. The user gets one failure message naming the broad cause and is left to choose the scope (system, global, repo-local) and the tool (GPG vs. SSH) themselves.
- The plan §9.6 explicitly required six entries. The implementer's judgement was that the plan was wrong on this point.

**Recommendation:** This is a substantive deviation worth documenting in the plan retroactively (an addendum or a §9.6.1 note) so future readers understand why the count doesn't match. The fix itself is defensible — arguably the better design — but the criterion as numbered is not met.

Compare with the `06-plan-prepare.env-prerequisites` step (criterion 7), which kept its six validates because those checks (workflows worktree present, target_path set, GPG agent reachable) are about **environment state** the workflow needs, not git-config state the workflow would otherwise mutate. The asymmetry is correct; the plan should record why.

---

### Major-3 — Stale markdown documentation references three deleted `workflow-engine` operations

**Severity:** Major (criterion 13 partially met).

**Location:**
- `meta/resources/02-workflow-orchestrator-prompt.md` line 20 — refers to `bubble-checkpoint-up`
- `meta/activities/README.md` lines 84-85 — refers to `workflow-engine::extract-checkpoint-handle`, `workflow-engine::handle-workflow-complete`
- `meta/README.md` lines 23, 42, 133 — describes the old `dispatch-client-workflow` shape and the deleted `client_workflow_completed` variable

**Observation:** `9be34eb` deleted the three operations from `meta/skills/00-workflow-engine.toon` and rewrote the `dispatch-client-workflow` activity, but did not propagate the change to the prose documentation. Schema validators don't catch this because they operate on TOON files only.

**Why this matters:** `meta/resources/02-workflow-orchestrator-prompt.md` is the prompt template used when an orchestrator is dispatched — it tells the agent to call `bubble-checkpoint-up`, which no longer exists. If this resource is bundled into a future orchestrator prompt, the agent will be instructed to call a non-existent operation. The README files are reference material — confusing but not broken at runtime.

**Recommendation:** Update the three markdown files in a follow-up commit, ideally before merge of this work package. At minimum, `meta/resources/02-workflow-orchestrator-prompt.md` line 20 should be rewritten to match the new `dispatch-client-workflow` shape (drive the activity loop directly with `dispatch-activity`/`evaluate-transition`/`commit-and-persist`/`present-checkpoint-to-user`/`respond-checkpoint`, no bubbling).

Related: `meta/activities/04-end-workflow.toon` line 33 still references `client_workflow_completed: false` as a setVariable target, and `meta/workflow.toon` line 58 still declares the variable. Both are now orphaned — the variable is no longer read by any condition or transition after the §9.15 rewrite. Removing it is the clean fix; leaving it is an AP-13 ("implicit variables") candidate inverted (declared-but-unused rather than used-but-undeclared) and an AP-36 candidate (the variable's description survives but its purpose is gone).

---

### Minor-1 — Other `workflow-path-selected` options still write substantive `complexity`

**Severity:** Minor (criterion 10 met as written; deeper consistency question).

**Location:** `work-package/activities/02-design-philosophy.toon` lines 124-148 (the `full-discovery`, `research-only`, `elicitation-only` options of the `workflow-path-selected` checkpoint).

**Observation:** Plan §9.10 named only `skip-optional` as the option whose effect needed retargeting from `complexity` to `path_gating_complexity`. The other three options still write `complexity: complex` (full-discovery), `complexity: moderate` (research-only and elicitation-only). The criterion is met literally.

**Question for the user / next iteration:** When the user picks `full-discovery` at this checkpoint, are they (a) overriding the design-time substantive classification because they've decided the problem is genuinely more complex than the classifier said, or (b) declaring a path-gating preference that should not overwrite the substantive value?

If (a), the current state is correct.
If (b), the same `skip-optional → path_gating_complexity` retargeting should apply to the other three options for consistency.

The plan §4.3 rationale frames the bootstrap obs §4.3 fix in terms of "selecting `skip-optional` at the path-gating checkpoint" specifically, which suggests (a) is the intended semantic for the other options. Documenting this distinction in the checkpoint's description would help future readers.

**Recommendation:** Either leave as-is and document the semantic, or extend the retargeting and remove the ambiguity. No urgency.

---

### Minor-2 — Typo in `harness-compat::resume-agent.output[1].result`

**Severity:** Minor.

**Location:** `meta/skills/07-harness-compat.toon` line 37 (in `9be34eb`).

**Observation:** The output description reads:

```
output[1]:
  - result: "The resumed agent's next yieltd or final output"
```

"yieltd" should be "yield" or "yielded".

**Recommendation:** Single-character fix; no semantic impact but worth fixing before merge.

---

### Minor-3 — `verify-body` phase is now three bullets without the loop-side context

**Severity:** Minor.

**Location:** `work-package/skills/18-update-pr.toon::protocol.verify-body`

**Observation:** Plan §3 (touch site 1b) described the phase as 6 bullets covering: when to run, what to render, how to evaluate each rule, how to populate `body_findings`, how to set `body_conforms`, the re-entry behaviour, and the "do NOT push if body_conforms=false on first render" guard. `cf18f6c` trimmed to 3 bullets:

```
verify-body[3]:
  - "Render the Final-template body to /tmp/pr-body.md."
  - "Evaluate each rule in rules.pr-body-conformance against the rendered text. For each failure append { rule_id, detail } to body_findings."
  - "Set body_conforms=true when body_findings is empty after all rules are evaluated; false otherwise."
```

The phase is correct per AP-36 (no rationale narration). What's lost: the "Final-template only" gate (the rendering implicitly assumes Final template — bullet 1 says so, but the phase's name doesn't convey it) and the "do NOT push on first render failure" guard.

**Trade-off:** The "do NOT push on first render failure" guard is arguably encoded structurally — `submit-for-review.loops[].verify-pr-body-rerender` re-runs the verify-body phase before pushing, so the loop handles the rerender attempt. If the loop construct fully captures the intent, the prose bullet would be AP-36 (process narration restating what the loop already encodes).

**Recommendation:** Confirm that the loop in `submit-for-review` fully captures the "no-push-on-first-failure" semantic. If yes, the trim is correct. If the rendered body still pushes on the first iteration before the loop checks `body_conforms`, a structural guard is needed (e.g., a `when` clause on whatever step pushes the body).

---

### Nit-1 — `body_findings` description is silent on entry shape

**Severity:** Nit.

**Location:** `work-package/workflow.toon::variables.body_findings`

**Observation:**

```
- name: body_findings
  type: array
  description: "List of pr-body-conformance violations. Each entry is { rule_id: string, detail: string }."
  defaultValue: []
```

The description names the entry shape. AP-36 allows that — the entry shape is not structurally encoded (the schema's `type: array` doesn't carry an element shape), so describing it in the description field is the canonical workaround. Fine as-is.

A more rigorous fix would extend the workflow schema to support `items` typing on array variables; out of scope for this work package.

---

### Nit-2 — `submit-for-review.body-non-conformant.message` uses `\n\n` rendering

**Severity:** Nit / Informational.

**Location:** `work-package/activities/12-submit-for-review.toon` checkpoint `body-non-conformant.message`

**Observation:** The message string uses `\n\n` literal escape sequences. This is consistent with other checkpoint messages in the codebase (e.g., `review-outcome` uses the same pattern), so this is convention-aligned. No change needed.

---

### Informational-1 — AP-36 and AP-37 are now the rules driving the prose cleanups

**Severity:** Informational.

**Location:** `workflow-design/resources/02-anti-patterns.md` (new section "Description Hygiene Anti-Patterns")

**Observation:** `5d9ce9c` landed AP-36 and AP-37 as durable rules. `cf18f6c` and `ffc03cd` then applied them across the workflow content as a follow-up cleanup pass. The result is a small but meaningful tightening of every `description` / `message` / `action-description` / `option-description` / `procedure-bullet` field touched by this PR.

This is doctrinally sound and a useful by-product of the work package. It is out of scope of the plan's §3 touch-site list but documented in the change-block index. The plan's §10 "Handoff" section may want an addendum noting that two new anti-patterns landed and the precedent for trimming existing fields has been set across `work-package/workflow.toon`, `12-submit-for-review.toon`, `18-update-pr.toon`, `12-review-strategy.toon`, `01-start-work-package.toon`, `06-plan-prepare.toon`, and `02-design-philosophy.toon`.

---

### Informational-2 — Self-application of AP-36/AP-37

**Severity:** Informational.

The review artifacts produced in this activity (`06-change-block-index.md`, this file, `06-test-suite-review.md`) are markdown review documents, not workflow TOON files. AP-36/AP-37 apply to workflow files; review documents are explicitly allowed prose. Where rationale appears in this review, it is factual analysis of the diff, not narration in a `description` field.

---

## 3. Workflow-design principles audit

Each touch site rechecked against `workflow-design/resources/00-design-principles.md`:

| Principle | Compliance | Notes |
|---|---|---|
| #1 Cognitive Coupling | OK | Each touch site's edits are co-located within the file they modify; no cross-file coupling introduced. |
| #2 Define Complete Scope | OK | All five new variables enumerated in `variables[]`. |
| #3 One Question at a Time | OK | `body-non-conformant` is a single decision with three options. |
| #4 Maximize Schema Expressiveness | OK after `cf18f6c` cleanup | Descriptions tightened to declarative form; rationale moved out per AP-36. |
| #5 Convention Over Invention | OK | Grouped-array rules form (`pr-body-conformance[5]`) matches existing `template-selection[2]`; `validate` actions match the construct inventory. |
| #6 Never Modify Upward | **TIGHTENED** | `ffc03cd` (Major-2) is precisely the application of this principle — the prior six-validate form would have modified user environment. |
| #7 Single Entry Point | n/a | No entry-point changes. |
| #8 Plan Before Acting | OK | Pre-condition gates (`verify-signing-precondition`, `env-prerequisites`) embody this. |
| #9 Modular Over Inline | OK | Rules live on `update-pr`; strategic-review delegates rather than restates. |
| #10 Encode Constraints as Structure | OK | `loops[].maxIterations`, checkpoint `effect.setVariable`/`transitionTo`, and `validate` actions are all structural. |
| #11 Plan Before Acting | (duplicate of #8) | — |
| #12 Non-Destructive Updates | OK with documented removals | Three `workflow-engine` operations deleted with explicit user approval per plan §2 bucket 6. |
| #13 Format Literacy / Schema Validation | OK | All three validators exit 0. |
| #14 ... | n/a | — |

---

## 4. Anti-patterns audit (focus on AP-36, AP-37, plus the standard set)

| AP | Compliance | Notes |
|---|---|---|
| AP-5 Combined checkpoints | OK | Each checkpoint is a single decision. |
| AP-9 Prose checkpoints | OK | `body-non-conformant` is a real checkpoint with structured options. |
| AP-10 Repeat as prose | OK | `verify-pr-body-rerender` is a real `loops[]` construct. |
| AP-13 Implicit variables | OK at variable-declaration level. **Trailing-edge issue**: `client_workflow_completed` is now declared-but-unused (orphaned by the §9.15 rewrite) — inverted form of AP-13, see Major-3. |
| AP-19 Rule text only | OK | Each rule on `update-pr` has a corresponding structural enforcement path. |
| AP-20 Updated content that removes | OK | Resource 12 placeholder section is additive; the three deleted operations were approved removals. |
| AP-24 Rule restates the protocol | OK after Major-1's delegation | Strategic-review no longer restates the rules; delegation is the cleaner solution. |
| AP-26 Flat prefix keys | OK | `pr-body-conformance[5]` is a grouped array. |
| AP-27 Rule appears in workflow AND activity | OK | The rules live in exactly one place (`update-pr`). |
| AP-28 Contradictory siblings | OK | `complexity` vs. `path_gating_complexity` distinction now clean for `skip-optional`. (Minor-1 leaves the question open for the other three options.) |
| AP-32 Inconsistent tool names across skills | **AT RISK** | Critical-1: `list-workflows` operation body now uses `workflow-server.list_workflows` again, which is exactly what plan §9.8 was designed to avoid. |
| AP-33 Cross-skill duplication | TIGHTENED | Major-1's delegation removed the duplicated rule strings between `update-pr` and `review-strategy`. |
| **AP-36 Description rationale narration** | OK across the touched files | `cf18f6c` swept the touched files; spot-checks show descriptions are now declarative. Some markdown docs (out of scope) still violate but those are not workflow TOON files. |
| **AP-37 Justification tails on validate messages** | OK | `ffc03cd` cleaned up `verify-signing-precondition`; `cf18f6c` cleaned up `env-prerequisites`. Every validate message in the diff now has the form `<what's wrong>. Run '<command>'.` or simply `<what's wrong>.`. |

---

## 5. Summary of severity classifications

| Severity | Count | Findings |
|---|---|---|
| Critical | 1 | Critical-1 (list-workflows regression) |
| Major | 3 | Major-1 (review-strategy delegation), Major-2 (signing-precondition 1-not-6), Major-3 (stale markdown docs) |
| Minor | 3 | Minor-1 (other path-gating options), Minor-2 (yieltd typo), Minor-3 (verify-body trim trade-off) |
| Nit | 2 | Nit-1, Nit-2 |
| Informational | 2 | Informational-1, Informational-2 |

**Per activity step "classify-and-route-findings":**
- `needs_code_fixes = true` (Critical-1 + Major-1/2/3 all warrant code action before merge).
- The review-fix-cycle loop should run.

---

## 6. Recommendations summary

1. **Critical-1:** Investigate whether `cf18f6c`'s revert of the `list-workflows` body was intentional. If unintentional, restore the harness-primitive form; if intentional, update plan §9.8 to match reality.
2. **Major-1:** Decide between restoring the five audit bullets or formally adopting the delegation pattern (and updating §9.2 + §4.3 of the plan).
3. **Major-2:** Add a §9.6.1 addendum to the plan documenting why the literal six-validate form was collapsed.
4. **Major-3:** Update `meta/resources/02-workflow-orchestrator-prompt.md`, `meta/activities/README.md`, `meta/README.md`, `meta/workflow.toon` (orphan `client_workflow_completed`), and `meta/activities/04-end-workflow.toon` (orphan setVariable) to match the §9.15 rewrite.
5. **Minor-1:** Add a sentence to the `workflow-path-selected` checkpoint description clarifying whether the other three options' `complexity` writes are substantive overrides.
6. **Minor-2:** Fix "yieltd" typo.
7. **Minor-3:** Confirm the submit-for-review loop's "no-push-on-first-failure" semantic is captured structurally; if not, add a `when` guard on the push step.
