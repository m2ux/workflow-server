# The busiest workflow, stage by stage

The work item asks for the high-traffic workflow's stages to be called out explicitly. That is
`work-package`: fifteen activities, the definition every other workflow borrows from, and the one
that runs most often.

The short answer is that work-package is almost entirely sequential for reasons that are not about
concurrency at all. Eight of its fifteen activities hold a loop; six of those eight loops exist to
ask the operator something one item at a time, and a session has one open question. What remains is
two fan-out shapes, one hard blocker, and two places that already run work concurrently.

| Stage | Sequential structure | Class |
|---|---|---|
| 01 Start work package | No loop | — |
| 02 Design philosophy | No loop | — |
| 03 Requirements elicitation | `domain-iteration` over `question_domains` | Not a candidate — a question per domain |
| 04 Research | `assumption-interview` over `open_assumptions` | Not a candidate — checkpoint per assumption |
| 05 Implementation analysis | `assumption-interview` over `open_assumptions` | Not a candidate — checkpoint per assumption |
| 06 Plan / prepare | No loop | — |
| 07 Assumptions review | `assumption-interview-loop` over `open_assumptions` | Not a candidate — checkpoint per assumption |
| 08 Implement | `task-cycle` over `implementation_plan.tasks` | **Blocked** — one working tree, one branch |
| 08 Implement | `assumption-interview` over `open_assumptions` | Not a candidate — checkpoint per assumption |
| 09 Lean coding audit | Two independent scans, then a gated third | **Ready** — a two-way fan |
| 10 Post-implementation review | `block-interview-loop` over `flagged_block_indices` | Not a candidate — checkpoint per flagged block |
| 10 Post-implementation review | Three independent review passes, twice | **Ready** — the one fan-out shape in the workflow |
| 11 Validate | `cargo-operations::run-suite` | **Already concurrent** — four shells, no named contract |
| 12 Strategic review | No loop | — |
| 13 Submit for review | No loop | — |
| 14 Complete | `deferred-item-raise-loop` over `open_deferred_items` | Not a candidate — raise-or-leave checkpoint per row |
| 15 Codebase comprehension | Convergence loop, `analyse-challenge` | **Already bound** — the corpus's model fan-out site |

---

## The larger fan-out shape: post-implementation review

`work-package/activities/10-post-impl-review.yaml` runs three review passes one after another —
`code-review` binding `review-code`, `structural-analysis-inline` binding `prism/structural-analysis`,
and `test-suite-review` binding `review-test-suite`. The `review-fix-cycle` loop that follows re-runs
the same three as `re-code-review`, `re-manual-diff-review` and `re-test-suite-review` after each
round of fixes.

**They are independent producers into one appended collection.** The activity declares
`review_findings` among its reads and `code_findings_actionable` and `test_findings_actionable` among
its writes. Each pass contributes findings and its own actionable flag; none reads another's output.
`classify-and-route-findings`, the step that follows them, is the combine phase already written.

This is the shape `scatter-gather` describes: independent work units, an ordered gather that appends,
and a delegated combine. Three units is a small fan, but the passes are long — each reads the change
surface and reasons over it — so the saving is close to two thirds of the stage's review time, and it
is paid twice on any run that fixes something.

**What it is not.** `manual-diff-review` cannot join them. It produces `flagged_block_indices`, which
the block-interview loop consumes before `code-review` runs, so it is upstream of the fan rather than
a member of it. And the prism dispatch beside `structural-analysis-inline` triggers a child workflow,
which is the session layer this epic holds out.

## The smaller fan-out shape: the lean-coding audit

`work-package/activities/09-lean-coding-audit.yaml` runs `ponytail/review-over-engineering` and then
`ponytail/harvest-debt`, and the two do not touch.

`review-over-engineering` reads the change — the diff, or `target_path` within the chosen pass scope
— and writes `review_findings` as `review-findings.md`. `harvest-debt` declares no inputs at all: it
greps the tree for ponytail markers and writes `debt_ledger` as `debt-ledger.json` plus the boolean
`has_debt_markers`. Two scans, two artifacts, two disjoint outputs.

The third step, `report-gain`, is gated on `has_debt_markers` and so follows `harvest-debt`. It is
the combine, and it is already in the right place.

A two-way fan saves less than a three-way one, but both units are full reads of the change surface,
so the two are comparable in length and the saving is close to half the stage.

## The hard blocker: the task cycle

`task-cycle` over `implementation_plan.tasks` is where the wall-clock actually goes, and it cannot
fan out as written. Each iteration implements, runs a crate-scoped `cargo-operations::test`, commits
through `manage-git::artifact-commits`, appends a provenance row, self-reviews, and collects
assumptions. Two iterations sharing one git index is not a race that ordering resolves.

The corpus can express the isolation: `meta/activities/patterns/04-isolated-fan-out.yaml` offers an
`isolation_mode` of `context` or `worktree`. The question is whether it is worth it, and the honest
answer from reading plans is usually no — tasks in an implementation plan are ordered by
construction, each building on the last, and a plan whose tasks are genuinely independent is a plan
that should have been more than one work package.

Recorded as blocked rather than not-a-candidate because the decision is a real one and the mechanism
exists, not because the migration looks likely.

## The stage that is already concurrent

`11-validate` binds `cargo-operations::run-suite`, whose protocol starts four concurrent shell
invocations and waits for all of them before composing the envelope. This is the one place in
work-package where concurrent execution happens today.

It is also the site that motivated W1, and the reason it has no named contract is specific: the
shared fan-out primitive dispatches agents, and this dispatches shells in the caller's own turn.
`site-inventory.md` treats it in full under A1.

## The stage that already did it right

`15-codebase-comprehension` runs the convergence loop, whose challenge phase
(`work-package/techniques/analyse-challenge/challenge.md`) builds one work unit per adversarial
perspective, dispatches through `scatter-gather`, keeps each unit's findings isolated until combine,
and states that the mode available to this context follows `depth-1-only`.

It is the model the rest of the corpus's fan-out sites should be read against, and the only one whose
author wrote down which scatter mode an activity worker actually gets.

## What this means for the workflow

Six of work-package's eight loops are conversations. A conversation runs at the operator's pace and
the corpus is right to walk it one item at a time; nothing here proposes changing that.

The concurrency this workflow could actually buy is one stage's three review passes, one stage's two
scans, and — on a different mechanism entirely — the validation suite it already runs concurrently.
That is a smaller prize than an eight-loop count suggests, and saying so is most of what this walk
was for.
