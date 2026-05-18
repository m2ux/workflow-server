# Completion Summary — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-18
**Activity:** `complete`
**Status:** Shipped (via direct merge to parent branch — see "Closeout shape" below)
**Driving input:** [../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md](../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)

---

## 1. Closeout shape

This work package wrapped up early. The substantive content shipped via a direct merge into the parent branch `feat/115-server-managed-session-state-meta` on the workflows submodule side. The standard tail of `validate` / `strategic-review` / `submit-for-review` was skipped because:

- The post-impl-review pass had already re-run the three schema validators (all PASS at HEAD `9be34eb`).
- Two cleanup passes (`cf18f6c`, `ffc03cd`) and one anti-pattern doc commit (`5d9ce9c`) had already covered the scope-discipline and description-hygiene concerns that strategic-review would surface.
- PR #120 was closed on GitHub during the run; the user opted to merge by direct push to the parent rather than reopen and re-route through `submit-for-review`.

The completion artifact set therefore consists of this document and the workflow retrospective only. ADR creation is not in scope (complexity classified `simple` at design-philosophy).

---

## 2. Deliverables

### 2.1 Workflows-submodule branch

- **Branch:** `feat/115-server-managed-session-state-meta` (workflows submodule)
- **Final HEAD:** `9be34eb`
- **Commit count on this work package's slice:** 14 commits from `97be373` to `9be34eb`
- **Remote status:** pushed
- **`chore/docs-retrospective-followups`** (the original feature branch): deleted both locally and on remote in the workflows submodule. SHAs remain reachable via the parent-branch merge commits.

### 2.2 Parent monorepo

- **Branch:** `chore/docs-retrospective-followups` still exists, holding submodule-pointer commits for this work package.
- **PR:** #120 — CLOSED on GitHub; not reopened.

### 2.3 Touch sites landed

All eight planned touch sites delivered, including the un-retracted bootstrap-observation cluster (touch site 9 — four sub-edits).

| # | Touch site | Status | Notes |
|---|------------|--------|-------|
| T1 | `update-pr.toon` — five `pr-body-conformance` rules + `verify-body` protocol phase + two new workflow variables | Landed | Five-rule grouped array; `verify-body` phase trimmed to three bullets in cleanup pass per AP-36 |
| T2 | `review-strategy.toon` — `verify-pr-body-conformance` phase | Landed (deviated) | Cleanup pass trimmed to three audit bullets that delegate to `update-pr::verify-body` rather than restate the five rules. See follow-up item Fwk-1 below |
| T3 | `submit-for-review.toon` — `verify-pr-body-rerender` loop + `body-non-conformant` checkpoint | Landed | `loops[].type: while`, `maxIterations: 2`, three-option checkpoint with explicit `effect` per option |
| T4 | `resources/12-pr-description.md` — issue-skipped placeholder | Landed | Additive |
| T5 | `start-work-package.toon` — `verify-signing-precondition` step | Landed (deviated) | One composite `signing.configured` validate, not the originally-planned six. The plan's six were `git config --global` prescriptions; the implementer (correctly, per principle #6 "Never Modify Upward") collapsed them so the workflow no longer prescribes commands that mutate user environment. See follow-up item Plan-1 |
| T6 | `plan-prepare.toon` — `env-prerequisites` step at position 1 with six `validate` actions | Landed | Acceptance criterion met as written |
| T7 | `meta/list-workflows` operation body rewrite to `harness.Read`/`harness.Glob` | Reverted | `5de90e9` implemented as planned; `cf18f6c` reverted to baseline `workflow-server.list_workflows`. The revert is currently unexplained in commit metadata. See follow-up item Fwk-2 |
| T8 | `design-philosophy.toon` — §4.1 `set` actions + §4.3 `path_gating_complexity` variable | Landed | `skip-optional` retargeted; the other three options of `workflow-path-selected` still write to substantive `complexity` (see follow-up item Fwk-3) |
| T9 | Meta-orchestrator collapse (bootstrap obs §4.2, un-retracted) | Landed | Four sub-edits: 9a `spawn-agent.rules.depth-1-only`, 9b deletion of three obsolete workflow-engine operations, 9c `handle-sub-workflow` procedure reduced to one bullet, 9d `dispatch-client-workflow` activity rewrite. Validators PASS |

### 2.4 Process improvements landed alongside

Two new anti-patterns were promoted to durable rules in `workflow-design/resources/02-anti-patterns.md` (`5d9ce9c`):

- **AP-36** — "Let me explain why this is here". Description hygiene: workflow-TOON `description` fields must state what the construct is, not narrate why it was added.
- **AP-37** — "Without X, Y will happen". Validate-message hygiene: validate-action `message` fields must state the failure and the fix command, not a consequence tail.

Principle #4 (Maximize Schema Expressiveness) was tightened to forbid restating structure in description-field prose. The `workflow-design` README's anti-pattern counts were updated to reflect the new "Description Hygiene" category.

The follow-on cleanup passes (`cf18f6c`, `ffc03cd`) applied AP-36/AP-37 across the files touched by this work package: `workflow.toon`, `12-submit-for-review.toon`, `18-update-pr.toon`, `12-review-strategy.toon`, `01-start-work-package.toon`, `06-plan-prepare.toon`, `02-design-philosophy.toon`.

### 2.5 Validator status at completion

| Validator | Result | Where |
|-----------|--------|-------|
| `validate-workflow-toon workflows/work-package` | PASS — 14 activities, 25 skills | post-impl-review |
| `validate-workflow-toon workflows/meta` | PASS — 5 activities, 8 skills | post-impl-review |
| `validate-activities workflows/work-package` | PASS — 14/14 | post-impl-review |

---

## 3. Key decisions

### 3.1 Un-retracting touch site 9 (meta-orchestrator collapse)

Bootstrap-observation §4.2 (sub-agent `Task` depth limit) was initially recommended OUT in plan-prepare's first draft, then flipped IN after a reproducer plus a `claude-code-guide` consult confirmed `Task` is harness-gated, not permissionable. The collapse removed the dispatch-client-workflow activity's prior shape (meta agent spawns orchestrator agent, orchestrator spawns worker) in favour of a single agent driving the client workflow's activity loop directly via existing `workflow-engine` operations (`dispatch-activity`, `handle-checkpoint-if-yielded`, `commit-and-persist`, `evaluate-transition`).

### 3.2 Collapsing `verify-signing-precondition` to one validate

The plan's six-validate form prescribed `git config --global` mutations (e.g., `git config --global commit.gpgsign true`) as fix commands. During the cleanup pass the implementer flagged this as a principle-#6 violation — workflows do not modify user environment. The step was reshaped to a single composite `signing.configured` check whose message names the broad cause and leaves scope (system / global / repo-local) and tool (GPG vs. SSH) to the user. The asymmetry with `plan-prepare.env-prerequisites` (which kept its six validates) is correct: env-prerequisites checks workflow-required environment state, not git-config state the workflow would otherwise mutate.

### 3.3 Strategic-review delegating to `update-pr::verify-body`

The plan §4.2 specified five audit bullets in `review-strategy` mirroring the five rules on `update-pr`. The cleanup pass replaced the mirror with a three-bullet delegation: read the live PR body, call `update-pr::verify-body`, record findings. Trade-off: AP-33 (cross-skill duplication) improves — the rule logic lives in exactly one place. Defence-in-depth weakens — a defect in `verify-body` will not be independently caught by strategic-review. Documented in follow-up item Fwk-1; the plan's §9.2 acceptance criterion is technically not met as written.

### 3.4 Skipping `validate` / `strategic-review` / `submit-for-review`

The post-impl-review evidence (validators PASS, code-review findings classified and addressed in cleanup, test-suite review gap-set identified) already covered everything those activities would have produced for this particular work package — the diff is workflow-content only and the structural validators are the binding gate. The user merged direct to the parent branch rather than route through PR review. The session's `condition` field records this as "user-directed early completion".

---

## 4. Follow-up items

Tracked here because they were surfaced by the code review (§9.8 and §9.13) and the test-suite review (§2.1) but not addressed in-line during the cleanup pass.

### Fwk-1 — Strategic-review delegation pattern needs plan update

The cleanup pass converted `review-strategy::verify-pr-body-conformance` from five audit bullets to a three-bullet delegation to `update-pr::verify-body`. Plan §9.2 still names the five-bullet acceptance criterion as the target. Either:

- (a) Restore the five audit bullets to recover the defence-in-depth posture.
- (b) Mark plan §9.2 superseded and document the delegation pattern as the new approach (single source of truth wins over redundant logic, but loses the independent check).

The latter is the cleaner long-term position; the former is a one-edit revert. Decision needed before any next iteration touches `review-strategy`.

### Fwk-2 — `meta/list-workflows` revert needs decision

`5de90e9` rewrote the operation body to use `harness.Read` + `harness.Glob` instead of `workflow-server.list_workflows`. `cf18f6c` (the prose-cleanup commit) reverted it to baseline. The commit message of `cf18f6c` does not state why. Two possible explanations:

- The harness-primitive form was discovered to be incompatible with the operations-bundle dispatch shape (workers don't receive `harness.Read`/`harness.Glob` via the bundle).
- The revert was unintentional — the prose-cleanup pass over-reached into structural fields.

If the first, plan §9.8 needs rewriting and the operation likely needs to become orchestrator-only (never bundled to workers). If the second, restore from `5de90e9` and re-validate.

### Fwk-3 — Other `workflow-path-selected` options still write substantive `complexity`

Touch site 8 retargeted only the `skip-optional` option's effect from `complexity` to `path_gating_complexity`. The other three options (`full-discovery`, `research-only`, `elicitation-only`) still write `complexity`. The plan §9.10 named only `skip-optional`, so the criterion is met as written. Open question: are the other three options substantive overrides (correct as-is) or path-gating preferences (should also be retargeted)? Documenting the distinction in the checkpoint's description field is the minimum fix.

### Fwk-4 — Stale markdown documentation references three deleted operations

The §9.13 deletion of `bubble-checkpoint-up`, `extract-checkpoint-handle`, `handle-workflow-complete` from `meta/skills/00-workflow-engine.toon` did not propagate to the prose documentation. Three files reference the deleted operations:

- `meta/resources/02-workflow-orchestrator-prompt.md` line 20 — `bubble-checkpoint-up`
- `meta/activities/README.md` lines 84-85 — `extract-checkpoint-handle`, `handle-workflow-complete`
- `meta/README.md` lines 23, 42, 133 — describes old `dispatch-client-workflow` shape and the now-orphaned `client_workflow_completed` variable

`meta/resources/02-workflow-orchestrator-prompt.md` is the highest priority: if it is bundled into a future orchestrator prompt, the agent will be instructed to call a non-existent operation.

### Fwk-5 — Orphan `client_workflow_completed` variable

`meta/workflow.toon` line 58 still declares `client_workflow_completed`; `meta/activities/04-end-workflow.toon` line 33 still references it as a `setVariable` target. After the §9.15 rewrite, no condition or transition reads the variable. It is now declared-but-unused — an inverted AP-13 (and an AP-36 candidate because its description survives but its purpose has been removed). Removal is the clean fix.

### Fwk-6 — Test-plan coverage gaps for touch site 9

Test-suite review §2.1 flagged four acceptance criteria (§9.12–§9.15) with no test-plan entries. Recommended additions: TC-MD1 through TC-MD5 — targeted greps for deleted operation names, the single-bullet `handle-sub-workflow` procedure, the required five operations in `dispatch-client-workflow.operations[]`, the absence of `spawn-agent`/`continue-agent`/etc. at the activity level, and the `depth-1-only` rule on `spawn-agent`. Each is a one-liner.

### Fwk-7 — Minor-2 typo

`meta/skills/07-harness-compat.toon` line 37: `"yieltd"` should be `"yield"` or `"yielded"`. Single-character fix.

---

## 5. Scope discipline

The diff stayed within the workflow-content scope set at plan-prepare. No `src/`, `schemas/`, or test-suite source files were touched. The two cleanup commits (`cf18f6c`, `ffc03cd`) and the anti-pattern commit (`5d9ce9c`) extend the touched-file set with description hygiene edits across workflow files that the plan's touch sites already named, which is in-scope by the spirit of the plan even though §3 didn't enumerate description edits per-file.

---

## 6. Activities and checkpoints

Activities completed (in order): `start-work-package`, `design-philosophy`, `codebase-comprehension`, `plan-prepare`, `assumptions-review`, `implement`, `post-impl-review`, `complete`.

Activities skipped (user-directed): `validate`, `strategic-review`, `submit-for-review`.

Checkpoints resolved:

| Activity | Checkpoint | Resolution |
|----------|------------|------------|
| `start-work-package` | `issue-verification` | `skip-issue` |
| `start-work-package` | `pr-creation` | `proceed` |
| `design-philosophy` | `classification-confirmed` | `confirmed` |
| `design-philosophy` | `workflow-path-selected` | `skip-optional` |
| `plan-prepare` | `approach-confirmed` | `revise` → `confirmed` (second pass) |
| `post-impl-review` | `file-index-table` | `no-issues` |

---

## 7. Pointers

- Plan: [05-work-package-plan.md](05-work-package-plan.md)
- Test plan: [05-test-plan.md](05-test-plan.md)
- Code review: [06-code-review.md](06-code-review.md)
- Test-suite review: [06-test-suite-review.md](06-test-suite-review.md)
- Change-block index: [06-change-block-index.md](06-change-block-index.md)
- Design philosophy: [01-design-philosophy.md](01-design-philosophy.md)
- Assumptions log: [01-assumptions-log.md](01-assumptions-log.md)
- Codebase comprehension: [02-codebase-comprehension.md](02-codebase-comprehension.md)
- Bootstrap observations: [observations-from-bootstrap.md](observations-from-bootstrap.md)
- Retrospective: [08-workflow-retrospective.md](08-workflow-retrospective.md)
