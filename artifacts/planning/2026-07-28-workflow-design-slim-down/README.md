# Workflow-Design Slim-Down — July 2026

> Planning · Created 2026-07-28 · **Status:** Plan drafted, adversarially rejected — not ready to execute

Planning record for [issue #321](https://github.com/m2ux/workflow-server/issues/321): cutting `workflow-design` to a minimal, token-efficient, maximally effective shape.

## Why this exists

A full `workflow-design` update pass and a bare two-agent sweep — "apply the anti-pattern catalogue and the design principles to this diff" — were run against **the same branch, in the same session, hours apart**. The bare sweep found more real defects for roughly a third of the cost.

| | `workflow-design` pass | Two bare sweeps |
|---|---|---|
| Worker dispatches | 12 | 2 |
| Subagent tokens | ~1,430,000 | ~410,000 |
| High findings | 3 | 8 |
| **Cost per High** | **~477,000** | **~51,000** |

All three of the workflow's High findings came from its two audit stages. Its four planning activities consumed ~600,000 tokens and produced none. Of 17 artifacts written, six were never read by anyone or consumed by any downstream step. Seven of the ten items in that run's deferred register were defects in `workflow-design`'s own definitions.

## Outcome

Three target architectures were designed independently and scored by three judges, each through one lens. The result was unanimous:

| Proposal | Canon | Migration | Efficacy | Total |
|----------|------:|----------:|---------:|------:|
| value-preserving | 8 | 7 | 8 | **23** |
| delivery-first | 6 | 5 | 7 | 18 |
| minimal-cut | 4 | 4 | 5 | 13 |

**Issue #321's literal proposal lost.** `minimal-cut` is the framing that took the issue at face value — four activities, five artifacts, the most aggressive cut — and it scored lowest on every lens. The winning framing started from what demonstrably produced value and cut around it. The issue's headline numbers should be amended to match the plan.

## The plan is not ready to execute

The adversarial pass returned **1 Critical, 10 High and 8 Medium** defects in the plan itself. The Critical is disqualifying as written:

> **C1 — M8 hard-bricks 21 running sessions; no step in M1–M10 migrates any session.**

Deleting the five retired activity files strands every session whose `currentActivity` names one. This was raised as a hazard to check and the plan did not answer it. At time of writing a live session (`QDDWIT`) rests at `intake-and-context`.

Other findings that change the shape rather than polish it: `COMPLETE.md` is orphaned because the deletion step removes both its producers with no rebind (H9); the AP-129 deletion manifest is incomplete by its own test, since 72 markdown links resolve into the 13 retired resources across 25 source files and 30 of them are anchored while the manifest names 6 files (H2); the plan preserves an AP-68 stage-naming violation and presents it as a benefit (H3); and it proposes a persisted 55-row coverage scorecard that is AP-91's own Detect, while citing AP-91 against itself (H10).

Two sections of the audit record evidenced negatives — entries walked and found *not* tripped, with the carve-out named — so the clean parts are attested rather than assumed.

## Index

| Artifact | What it holds |
|---|---|
| [Design principles map](01-corpus-map-design-principles.md) | All 30 stances, and which constrain versus support consolidation |
| [Anti-patterns map](01-corpus-map-anti-patterns.md) | Catalogue entries governing activity structure, artifacts, orchestration, rules, resources |
| [Schemas map](01-corpus-map-schemas.md) | What the activity/workflow/condition schemas permit and forbid structurally |
| [Activities map](01-corpus-map-activities.md) | All 9 activities: step inventories, checkpoints, decisions, transitions |
| [Techniques and resources map](01-corpus-map-techniques-and-resources.md) | 38 techniques and 24 resources, bindings, and the retirement candidates |
| [Blast radius map](01-corpus-map-blast-radius.md) | Validators, baselines, hardcoded ids, the Progress contract, session resume |
| [Proposal — value-preserving](02-proposal-value-preserving.md) | The winner |
| [Proposal — delivery-first](02-proposal-delivery-first.md) | Optimised for per-dispatch delivery cost |
| [Proposal — minimal-cut](02-proposal-minimal-cut.md) | Issue #321 taken literally |
| [Judge verdicts](03-judge-verdicts.md) | Three lenses, scores, grafts, and four catalogue verifications that changed the ranking |
| [Implementation plan](04-implementation-plan.md) | The build document: target architecture, canon compliance, audit stage, retirement list, M1–M10 migration, validation |
| [Adversarial audit](05-adversarial-audit.md) | The refutation pass — 19 findings plus evidenced negatives |

## A finding worth carrying beyond this plan

The canon judge established that `anti-patterns.md` has 13 `##` sections, and that **AP-126, AP-127, AP-128 and AP-129 sit inside `## Authoring Guidance (MR)`** rather than in an anti-pattern family section. Any catalogue walk that enumerates `## *Anti-Patterns` families therefore drops them silently — including AP-128 and AP-129, the two entries this migration most depends on. That is a reliability problem for every catalogue sweep, not only for this plan.

## Known limitation of this record

The adversarial pass reviewed the plan's **tail** — the M2–M10 migration sequence and sections 6–8 — not sections 0–5. The synthesizing agent emitted the full 87,733-character plan and then a shorter closing message, and the workflow captured the closing message as the return value. The full plan was recovered from the agent's transcript and is what [04-implementation-plan.md](04-implementation-plan.md) holds, but the audit's coverage of the target architecture, canon-compliance and audit-stage sections is inferential rather than direct. Those three sections warrant a second verification pass before any of M1–M10 is attempted.

## Cost of this analysis

14 agents across 5 phases, 487 tool calls, ~2,500,000 subagent tokens, ~7h 12m wall clock. Recorded because the issue it serves is about cost: the analysis cost more than either run it analysed, which is defensible for a one-off design decision and would not be for a repeated one.
