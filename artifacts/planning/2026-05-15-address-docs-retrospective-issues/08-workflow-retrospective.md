# Workflow Retrospective — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-18
**Work Package:** Address Docs-Refresh Retrospective Issues (no associated issue)
**Final HEAD (workflows submodule):** `9be34eb` on `feat/115-server-managed-session-state-meta`
**PR:** #120 (closed; merge done by direct push to parent)

This retrospective covers the workflow itself, not the artefacts produced. The three structural surprises during the run — description-hygiene drift, harness-depth-1 sub-agent constraint, and a cross-lineage branch-name collision — each suggest concrete workflow-content changes for the next iteration.

---

## 1. Session shape

Path actually taken: `start-work-package` → `design-philosophy` → `codebase-comprehension` → `plan-prepare` (two passes through `approach-confirmed`) → `assumptions-review` → `implement` → `post-impl-review` → `complete`.

Path skipped (user-directed early completion): `validate` → `strategic-review` → `submit-for-review`.

Checkpoint sequence (all resolved before the early-completion call):

| Activity | Checkpoint | Resolution | Notes |
|----------|------------|------------|-------|
| `start-work-package` | `issue-verification` | `skip-issue` | Same as prior run — derived from retrospective, no issue |
| `start-work-package` | `pr-creation` | `proceed` | PR #120 created at this point |
| `design-philosophy` | `classification-confirmed` | `confirmed` | Classified `simple` |
| `design-philosophy` | `workflow-path-selected` | `skip-optional` | `skip_optional_activities=true` |
| `plan-prepare` | `approach-confirmed` | `revise` then `confirmed` | First pass revised after un-retracting bootstrap obs §4.2 |
| `post-impl-review` | `file-index-table` | `no-issues` | Code review and test-suite review attached |

---

## 2. What worked

### 2.1 The §2.5 principles audit caught real defects before implementation

`plan-prepare` added a §2.5 table that audits each touch site against the 14 principles, the schema-construct inventory, and the 29 (then 31) anti-patterns. The audit produced three substantive adjustments to §3/§4/§5 that would not have been obvious from the touch-site list alone:

- Touch site 1 split into 1a/1b/1c so the two new workflow variables (`body_conforms`, `body_findings`) got an explicit `variables[]` declaration row instead of being implicit (AP-13).
- Touch site 2 reframed from "five rule copies" to "five audit-framed bullets" (AP-24). The cleanup pass later collapsed even those to a delegation, but the audit caught the duplicated-rules anti-pattern before it landed.
- Touch site 8 split into 8a/8b/8c so the new `path_gating_complexity` variable got an explicit declaration in `workflow.toon` (AP-13 again).

The pattern — pre-implementation audit against principles, inventory, and anti-patterns — is reusable. Recommendation: keep this table in the `plan-prepare` template for workflow-content work packages.

### 2.2 Validators caught structural drift early

The three TOON validators (`validate-workflow-toon` × 2, `validate-activities`) caught two implementation-time errors that would otherwise have surfaced at strategic-review: a mis-keyed grouped array in an early draft of `update-pr`, and a missing `effect` field on one of the three `body-non-conformant` options. Both were fixed before commit. Principle #13 ("Format Literacy Before Content") earned its place on this run.

### 2.3 The change-block index made post-impl-review tractable across 14 commits

`06-change-block-index.md` indexed every hunk across the `97be373..9be34eb` range, including the three cleanup commits that landed after the planned scope. Without that index the code review would have either missed the §9.8 revert (Critical-1) or taken substantially longer to surface it.

---

## 3. What didn't work

### 3.1 Description-hygiene drift was endemic before AP-36/AP-37 landed

The cleanup pass that produced `cf18f6c` ("strip rationale prose from TOON descriptions") touched seven files and reshaped dozens of `description`, `message`, `procedure`, and option-description fields. The drift it was correcting was distributed — almost every workflow file authored before this work package had at least one rationale-narration tail in a description field.

The root cause was the absence of a formal rule. Principle #4 ("Maximize Schema Expressiveness") covered the failure case structurally (don't put rules in prose), but it didn't address the more common drift: putting *why* into a `description` field that should only carry *what*. AP-36 ("Let me explain why this is here") and AP-37 ("Without X, Y will happen") were added as durable anti-patterns in `5d9ce9c`, and Principle #4 was tightened to forbid restating structure in description-field prose.

The cleanup pass touched the files this work package was already editing, so the in-scope content is now AP-36/AP-37-clean. The rest of the workflow content is not. That is a workflow-design backlog item, not a regression — the anti-patterns are durable rules now, so the next work package that touches a file will apply them on the way through. But a future content-hygiene sweep across the existing workflow files would close the gap faster than waiting for organic edits.

**Workflow recommendation:** Add a one-line check to the `post-impl-review` skill or a future `lint-descriptions` script: walk every workflow-TOON `description` field and flag the canonical AP-36 patterns (`"interpolated into"`, `"consumed by"`, `"drives"`, `"without "`, `"so that "`). Not a blocker; a long-term tooling investment.

### 3.2 Harness `Task` depth-1 limit surfaced as a bootstrap observation, not as workflow-design knowledge

Bootstrap observation §4.2 was initially recommended OUT in plan-prepare's first draft. The reasoning was that the depth limit might be permissionable. A reproducer plus a `claude-code-guide` consult during the `revise` pass of `approach-confirmed` confirmed `Task` is harness-gated and cannot be opened up. The plan flipped IN with four sub-edits (9a–9d) that collapsed the meta-orchestrator pattern entirely.

The cost of the late realisation was relatively low — one `revise` cycle on `approach-confirmed`. But the underlying issue is that the workflow-design library did not previously encode the depth-1 fact anywhere durable. Now it does, on `harness-compat::spawn-agent.rules.depth-1-only`, and the meta orchestrator pattern that depended on the false assumption has been removed.

**Workflow recommendation:** When a harness fact becomes load-bearing, encode it on the relevant harness-compat operation as a named rule before basing other workflow content on it. The `claude-code-guide` consult should ideally be part of the `codebase-comprehension` activity for any work package that touches meta/harness operations.

### 3.3 Cross-lineage branch-name collision broke PR #120

The work package was opened on `chore/docs-retrospective-followups` from `feat/115-server-managed-session-state`. The workflows submodule has its own branch by the same name, also rooted at `feat/115-server-managed-session-state-meta`. When the user pushed the workflows-side branch first and the parent-monorepo submodule pointer then advanced, PR #120's diff briefly contained submodule-pointer churn that did not match the workflow content the PR claimed to ship. The PR was closed and the merge went direct.

The collision was specific to the dual-repo layout (parent monorepo + workflows submodule) and the convention of using the same branch name on both sides. The current setup encourages the collision: branches in the two repos that ship together share the same name by convention, and humans must mentally track which side is ahead at any given push.

**Workflow recommendation:** Two options:

- (a) Add a prefix convention — workflows-submodule feature branches get `wf/`; parent feature branches get `mn/` (or similar). Disambiguates at a glance.
- (b) Add an explicit step in `submit-for-review` to verify the parent and submodule branches are mutually consistent before opening the PR: the submodule pointer in the parent's HEAD must equal the workflows-submodule HEAD on the matching branch. If they diverge, yield a checkpoint asking the user to resolve before pushing.

(b) is more invasive but eliminates the failure mode mechanically. (a) is one convention change and a README note. Either is better than the current state, which is "humans hold the consistency in their head".

### 3.4 Test-plan §4 coverage map drifted from §9 acceptance criteria

When touch site 9 was un-retracted at the second pass of `approach-confirmed`, §9 of the plan grew from 13 to 17 acceptance criteria. The test plan §4 ("Coverage map") was not updated. Four criteria (§9.12–§9.15) have no test-plan entries — surfaced by test-suite review §2.1 as Gap-1.

The §9 criteria are met in practice (validators caught structural errors, code review confirmed shape), but the test plan claims coverage of 13 items, not 17. The drift is documentation, not enforcement.

**Workflow recommendation:** When `plan-prepare` revisits a checkpoint via `revise`, the worker should re-render the test-plan §4 table against the updated §9 set as part of the second pass. A small skill addition: `plan-prepare::resync-test-plan-coverage` that diffs `5-acceptance-criteria` against `5-test-plan-coverage` and yields if they're inconsistent. Alternatively, fold the test-plan coverage map into the same §9 table to make divergence impossible.

---

## 4. What should change in the workflow definitions

Distinct from the per-work-package follow-ups in `08-COMPLETE.md` §4. These are workflow-definition changes that the next work package or two should land.

### 4.1 Add a description-hygiene structural lint

Status: optional, durable improvement.

A small script (`scripts/lint-descriptions.ts`) that walks every workflow-TOON `description`, `message`, `procedure` bullet, and option-description, and flags regex patterns characteristic of AP-36 and AP-37. Output: a per-file findings list. Integrated into `npm run typecheck` or run separately in `post-impl-review`.

The reason this isn't already part of the validator: schema validators check structural conformance, not prose content. Description-hygiene checks need a separate linter.

### 4.2 Branch-name disambiguation

Status: required before the next dual-repo work package.

Either the prefix convention (cheap) or the consistency check (robust) from §3.3. The prefix convention is a five-minute change to `start-work-package`'s branch-name-derivation logic plus a README update. The consistency check is a new `submit-for-review` step.

Recommend starting with the prefix convention and adding the consistency check on the next work package that touches `submit-for-review`.

### 4.3 Harness-fact recording discipline

Status: process change, no code.

When a harness constraint becomes load-bearing for workflow content (Task depth, foreground-only requirement, allow-list scope, etc.), the worker MUST record it as a named rule on the relevant `harness-compat::<op>` operation before the workflow content that depends on the constraint lands. This is principle #10 ("Encode Constraints as Structure") applied to harness facts specifically.

The bootstrap-observation §4.2 cycle is the canonical example of what this discipline prevents: a harness fact was assumed away in the first plan-prepare pass, surfaced via reproducer in the revise cycle, and could have been encoded in `spawn-agent` rules at the start of the codebase-comprehension activity instead.

Recommend adding a `consult-harness-compat` action to the `codebase-comprehension` skill for any work package whose touch sites include `meta/`.

### 4.4 Test-plan coverage map auto-resync on plan revision

Status: nice-to-have.

The `plan-prepare::resync-test-plan-coverage` action described in §3.4. Or — more invasively — fold §9 acceptance criteria and their test coverage into a single table that makes divergence structurally impossible.

### 4.5 Strategic-review delegation decision

Status: required follow-up (Fwk-1 in `08-COMPLETE.md`).

The cleanup pass converted `review-strategy::verify-pr-body-conformance` from "five audit bullets that mirror the rules" to "delegate to `update-pr::verify-body`". This is a doctrine question, not a one-off decision: should strategic-review independently re-verify what earlier activities produced (defence-in-depth), or trust the earlier activities and verify only what is unique to strategic-review's vantage (single source of truth)?

A workflow-design decision is needed. Either answer is defensible; the current state is one example of the cleaner answer (delegation) without a documented commitment to that pattern. The plan's §9.2 acceptance criterion is technically not met because the workflow-design doctrine is unresolved.

### 4.6 List-workflows operation shape decision

Status: required follow-up (Fwk-2 in `08-COMPLETE.md`).

The plan's §9.8 framing — "convert `list-workflows` from MCP tool to harness primitives so workers can call it" — assumed the operations-bundle dispatch would propagate `harness.Read` and `harness.Glob` to the worker. The cleanup pass reverted, possibly because that assumption is wrong. The next worker-side investigation needs to determine: do worker agents receive `harness.Read`/`harness.Glob` via operations bundles, or do those tools only resolve in the orchestrator's context?

If the latter, `list-workflows` becomes an orchestrator-only operation. If the former, the revert was unintentional and should be undone.

---

## 5. Themes

Three structural themes ran through the run.

### 5.1 Doctrine emerges from the friction it removes

AP-36 and AP-37 did not exist before this run. They emerged because the cleanup pass that fixed the description-hygiene drift had to enumerate the patterns it was fixing in order to fix them consistently. Once enumerated, they became durable rules.

Pattern: when a cleanup pass spans many files, the enumeration the cleanup needs to do is itself doctrine. Capture it as anti-patterns before the cleanup commits land, not after.

### 5.2 Harness facts must be encoded structurally or they get re-discovered

The Task depth-1 limit was discovered, forgotten, and rediscovered across at least three previous work packages (per the work package plan's §2.5 row 9a discussion). It is now encoded as a named rule on `harness-compat::spawn-agent`. Future workers do not have to rediscover it.

Pattern: every harness rediscovery is evidence that a harness fact needs a structural home. The `harness-compat` skill is that home.

### 5.3 Dual-repo conventions need explicit support, not human discipline

The cross-lineage branch-name collision was caused by a convention (matching branch names across parent and submodule) that humans are expected to track. PR #120 is the second time this layout caused a confused-state PR; the first was earlier in this session's parent branch (`feat/115-server-managed-session-state`). Conventions that depend on human tracking will fail at low but nonzero rate. Conventions that fail in workflow tools are noisy and fixable; conventions that fail in git history are quiet and expensive.

Pattern: any convention that requires humans to hold consistency across two repos should be replaced by a mechanical check.

---

## 6. Activities that didn't run

`validate`, `strategic-review`, `submit-for-review` were skipped per user direction. Their counterfactual value on this run:

- `validate` — would have run `npm test` / `npm run typecheck` against the parent monorepo. The workflows submodule edits are not exercised by Vitest, so validate would have produced a green status that the validators in post-impl-review already established.
- `strategic-review` — would have produced a third pass over the diff. The two cleanup commits already did the scope-discipline and description-hygiene sweep; a structural review would have surfaced the same Major-1/Major-2/Major-3 items as the code review.
- `submit-for-review` — would have re-rendered the PR body and run the new `verify-body` phase against it. The new phase was not tested end-to-end on this run; that's a deferred smoke (Fwk-6 / TC-Z1 in the test plan).

The principal counterfactual loss is the end-to-end smoke of the `verify-body` phase. The next work package that uses `update-pr` will exercise it.

---

## 7. Process improvements summary

| # | Improvement | Origin | Status |
|---|-------------|--------|--------|
| 1 | AP-36 description-hygiene anti-pattern | This run's cleanup pass | Landed (`5d9ce9c`) |
| 2 | AP-37 validate-message hygiene anti-pattern | This run's cleanup pass | Landed (`5d9ce9c`) |
| 3 | Principle #4 tightened — no structure-restatement in descriptions | This run's cleanup pass | Landed (`5d9ce9c`) |
| 4 | `harness-compat::spawn-agent.rules.depth-1-only` | Bootstrap obs §4.2 | Landed (touch site 9a) |
| 5 | `dispatch-client-workflow` activity rewrite | Bootstrap obs §4.2 | Landed (touch site 9d) |
| 6 | Description-hygiene structural lint | This retrospective §4.1 | Recommended, not started |
| 7 | Branch-name prefix convention or consistency check | This retrospective §4.2 | Recommended, not started |
| 8 | `consult-harness-compat` action in codebase-comprehension | This retrospective §4.3 | Recommended, not started |
| 9 | Test-plan coverage map auto-resync | This retrospective §4.4 | Recommended, not started |
| 10 | Strategic-review doctrine decision (delegation vs. defence-in-depth) | Fwk-1 | Open |
| 11 | `list-workflows` operation shape decision | Fwk-2 | Open |

---

## 8. Pointers

- Completion summary: [08-COMPLETE.md](08-COMPLETE.md)
- Plan: [05-work-package-plan.md](05-work-package-plan.md)
- Code review: [06-code-review.md](06-code-review.md)
- Test-suite review: [06-test-suite-review.md](06-test-suite-review.md)
- Bootstrap observations: [observations-from-bootstrap.md](observations-from-bootstrap.md)
- Prior work package's retrospective (driving input): [../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md](../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)
