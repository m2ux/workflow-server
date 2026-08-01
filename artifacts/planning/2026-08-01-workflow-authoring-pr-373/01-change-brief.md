# Change Brief — Server when-merge tail: checkpoint dismissal, activity-rule fragment refs, AP-134 guard

**Workflow:** `workflow-server` engine — server code, `scripts/` guard suite, `schemas/` descriptions; no library workflow definition in scope (target as confirmed at the design-intent gate)
**Mode:** Update
**Date:** 2026-08-01
**Change categories:** none of the five update-mode categories — engine/loader/guard-script surface, recorded at intake and accepted at the design-intent gate
**Change request:** Implement the server half of the `when`/`condition` merge ([PR #373](https://github.com/m2ux/workflow-server/pull/373)): `condition_not_met` dismissal for `when`-gated checkpoints (#189 C8 tail), fragment references in activity-file rules (#338 W6 b3), and the AP-134 citation-grain guard (#358), with test coverage for all three.
**Baseline:** draft PR #373, branch `feat/when-merge-rule-fragments-ap134-guard` @ `3c11961f` (placeholder commit, zero changed files; base `main@753727a1`), checked out at `.worktrees/pr2-server`; routed as PR 2 of the [backlog routing plan](../2026-08-01-backlog-pr-routing/README.md)

---

## Purpose

Every workflow definition keeps running exactly as it runs today; this session changes the engine those definitions are served by. The shipped schema already picked `when` as the survivor of the step-gate duality, but structured `condition` retains one exclusive capability — only it makes a checkpoint dismissible via `condition_not_met` — and that exclusivity blocks the corpus migration (PR 3). Separately, workflow-level rules can reference shared fragments while activity-file rules cannot, keeping duplicated rule text alive; and AP-134's mechanical tell has no guard, so the class #370 closed can silently return.

| Goal | Meaning |
|------|---------|
| G1 — Dismissal parity | `condition_not_met` accepts a checkpoint gated by either construct (`when` or structured `condition`); schema descriptions updated so the LEGACY marking on structured `condition` names its removal target at the next schema major. |
| G2 — Activity-rule fragment refs | Activity-file rules accept the same reference form workflow rules already resolve, materialized at load; the fragments guard treats activity rules as ref-capable slots. |
| G3 — Citation-grain guard | New hard-zero guard flagging a technique that cites a resource whole and anchored in the same file, seeded with the one documented economical exception, registered in the check-all suite. |
| G4 — Tests | Dismissal cases for both gate forms, loader coverage for activity-rule refs, guard fixture coverage. |

**Out of scope:**

- The corpus migration itself — [PR 3 (`workflow/338-when-migration`)](../2026-08-01-backlog-pr-routing/README.md), gated on this PR merging first
- Top-20 citation verdicts, #189-C3 content defects, ORCHESTRATION MODEL fragment conversion — PR 1 ([#372](https://github.com/m2ux/workflow-server/pull/372))
- #338 W8 (B12 retire sweep) — parked until a schema major is cut
- Any `workflows/` definition edits — this PR changes no definition files

---

## Dimensions

Engine-target run: the rows describe schema-construct semantics every workflow definition consumes, not edits to any single definition. Purpose, activity list and artifacts of the served workflows are untouched by this change and are absent per the update dimension set.

| Dimension | This run's shape |
|-----------|------------------|
| Checkpoints | Dismissal semantics widen: `condition_not_met` extends to `when`-gated checkpoints, removing structured `condition`'s last exclusive capability; schema descriptions re-worded so LEGACY names its removal target. No corpus checkpoint file changes in this PR. |
| Rules | Activity-file rules gain the fragment-reference form workflow-level rules already resolve, materialized at load; `check-fragments` treats activity rules as ref-capable slots. No corpus rule bodies change in this PR. |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Home of the guard's seeded exception | The sources say "seeded with the one documented economical exception" without naming where the seed lives — in the guard script, a fixture, or a standalone exceptions manifest | In-script seed: simplest, but opaque and edits the guard to change; exceptions manifest: extensible and reviewable, but one more file the suite must own and check |
| 2 | Hard-zero activation vs corpus state | A hard-zero citation-grain guard passes only once the corpus is clean (the #370 tail plus PR #372's top-20 verdicts); the routing plan gates PR 3 on this PR but sets no gate between PR 1 (#372) and this one | Land hard-zero immediately: guard red on `main` until #372 merges (or exceptions temporarily seeded); gate activation on #372's merge: suite stays green, but the guard's protection window opens later |

---

## Confirmation ask

Approving this brief commits the run to implementing the three server-side change groups plus tests on `feat/when-merge-rule-fragments-ap134-guard`, with zero `workflows/` definition edits and no material content removals.
