# Workflow Retrospective — Fix Work Package Transition Folder Defect

**Date:** 2026-05-20
**Work package:** Fix Work Package Transition Folder Defect
**PR:** [#121](https://github.com/m2ux/workflow-server/pull/121) (approved, ready for merge)
**Final HEAD:** `3aca657` on `fix/work-package-transition-folder-defect`

A short retrospective on a `simple`-complexity defect-fix run, written tight per user direction at session start.

---

## 1. Session shape

`start-work-package` → `design-philosophy` → `codebase-comprehension` → `plan-prepare` → `assumptions-review` → `implement` → `post-impl-review` → `validate` → `strategic-review` → `submit-for-review` → `complete`.

Eleven activities, single linear path, no `revise` cycles. `skip_optional_activities = true` at design-philosophy elided elicitation and research as planned.

---

## 2. What worked

### 2.1 The transient/persistent symmetry framing made the plan trivial

`plan-prepare` framed the fix as "converge branch A onto branch B's shape, plus one folder-promotion step". Branch B existed in the same file (`src/tools/resource-tools.ts`), already worked, and was covered by four regression tests. The plan reduced to: copy branch B's structure, add `ensurePlanningFolder` + `discardTransient` at the edges, flip two existing tests that encoded the buggy shape. No new helpers, no schema changes, no design choices. Five tasks, all small.

The lesson is not new — when a codebase already contains the correct shape, point at it instead of designing from scratch — but the run is a clean example of the principle paying off.

### 2.2 Post-impl review surfaced the plan deviation in the same pass it landed

The synthetic-slug guard (the `startsWith('transition-')` check that wasn't in the plan) appeared during `implement` because the bare `??` fallback never fired in practice. Post-impl review caught it as F1 in the same pass, documented it in [06-post-impl-review.md](06-post-impl-review.md), and the README's Implementation Notes were updated before strategic-review started. By the time strategic-review ran, the deviation was already a documented, reviewed artifact rather than a surprise.

Pattern: when a plan deviation lands during `implement`, it should be surfaced in `post-impl-review` and propagated to the README's Implementation Notes section before downstream activities consume the diff. This run did that without prompting.

### 2.3 Strategic-review's S2 → `fix-findings` → cleanup commit was a clean loop

Strategic-review identified the synthetic-slug coupling (S2) as a hygiene concern — the inline guard duplicated knowledge the registry could simply not record. The user selected `fix-findings`; commit `3aca657` moved the omission to `start_session` so `dispatch_child` no longer cares about slug shape. The fix preserved the contract while removing the coupling. The whole loop — review, decide, fix, validate — completed in one cycle without further revision.

---

## 3. What didn't work (small items)

### 3.1 Test plan line numbers drifted

The test plan (authored at plan-prepare) named `:1568-1613` for TC-1 and `:1615-1661` for TC-2. After the rewrite, TC-1 added tmp-snapshot/discard assertions (now `:1568-1645`) and TC-2 shifted to `:1647-1730`. The line ranges were corrected in `complete` (test-plan finalise step), but the drift is the same pattern flagged in the prior retrospective (Fwk-6 in `2026-05-15-address-docs-retrospective-issues/08-workflow-retrospective.md` §3.4).

The fix proposed there — resync test-plan numbers on plan revision or fold line ranges into the same table as acceptance criteria — would have caught this. Recommendation: when `finalize-test-plan` is the last touch on the test plan anyway, consider treating per-test line ranges as build-from-source content (e.g. permalink-by-`it` name) rather than authored numbers. The test name is stable; the line number is not.

### 3.2 The "manual TC-4" was implicitly performed by the workflow run itself

Test plan TC-4 was specified as a manual reproduction with no user-supplied slug. The work package itself was started with a user-supplied slug, so TC-4 was not exercised by the natural session flow. The manual reproduction was skipped because the implementation's behaviour for the no-slug branch is structurally identical to the with-slug branch (the only difference is which slug `promotedSlug` resolves to), and the automated tests cover both paths through TC-1's slug-passthrough assertion and the inline implementation comment.

The judgment is defensible but the test plan is now slightly out of step with what actually ran. A future tightening would either drop TC-4 (collapse it into TC-1's coverage table) or explicitly run it from a separate workspace at validate time.

---

## 4. Themes

### 4.1 Defect fixes have a natural "reference branch" pattern

This work package's central technique — pointing the broken branch at an already-correct branch in the same file — is reusable for any defect where a near-identical correct implementation exists nearby. Recognising the pattern at `plan-prepare` time turns design effort into copy-and-adjust effort.

### 4.2 Synthetic state should be invisible at the use site

The synthetic `transition-<uuid>` slug existed to satisfy the transient-folder bookkeeping API, but it was never a name a downstream caller should see. The first fix kept the synthesis but guarded against it at the use site (`dispatch_child`); the strategic-review-driven cleanup pushed the guard back to the source (`start_session` simply doesn't record synthetic slugs in the registry). The end-state is "if you ask the registry for a slug, you get a real one or nothing" — the use site no longer needs special knowledge.

Pattern: synthesised values that exist only for internal bookkeeping should not leak into the same lookup surface real values inhabit. The cleanup commit (`3aca657`) is the canonical example for this codebase.

---

## 5. Process improvements (recommendations only)

| # | Improvement | Source |
|---|-------------|--------|
| 1 | Permalink-by-`it`-name for test source references in test plans (instead of fragile line numbers) | §3.1 |
| 2 | Either drop or strengthen test plan's manual-reproduction TC entries when they overlap with automated coverage | §3.2 |

Both are nice-to-haves; neither blocks the next work package.

---

## 6. Activities that didn't run

- `create-adr` / `update-adr-status` — gated on moderate/complex; skipped (complexity = simple).
- Elicitation, research — skipped via `skip-optional` at design-philosophy.

No downside observed. The defect was localised enough that the optional discovery activities would have produced empty artifacts.

---

## 7. Pointers

- Completion summary: [08-COMPLETE.md](08-COMPLETE.md)
- Plan: [05-work-package-plan.md](05-work-package-plan.md)
- Test plan: [05-test-plan.md](05-test-plan.md)
- Post-impl review: [06-post-impl-review.md](06-post-impl-review.md)
- Strategic review: [07-strategic-review.md](07-strategic-review.md)
- Prior-run retrospective (driving input for the §3.1 observation): [../2026-05-15-address-docs-retrospective-issues/08-workflow-retrospective.md](../2026-05-15-address-docs-retrospective-issues/08-workflow-retrospective.md)
