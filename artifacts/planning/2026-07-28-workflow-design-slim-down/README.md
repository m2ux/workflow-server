# Workflow-Design Slim-Down — July 2026

> Planning · Created 2026-07-28 · **Status:** Strategy settled (new workflow id, additive). One Critical wiring defect must be fixed during authoring.

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

## Where this landed

**The design.** Three architectures were designed independently and scored by three judges, each through one lens. Unanimous:

| Proposal | Canon | Migration | Efficacy | Total |
|----------|------:|----------:|---------:|------:|
| value-preserving | 8 | 7 | 8 | **23** |
| delivery-first | 6 | 5 | 7 | 18 |
| minimal-cut | 4 | 4 | 5 | 13 |

**Issue #321's literal proposal lost.** `minimal-cut` took the issue at face value — four activities, five artifacts, most aggressive — and scored lowest on every lens. The issue's headline numbers should be amended to match the plan. Target shape is 4 activities (`01-intake-and-context`, `06-scope-and-draft`, `08-quality-review`, `09-validate-and-commit`), sparse prefixes preserved, 37 techniques → 23, 17 artifacts → 6.

**The strategy changed after the first audit.** The original plan rewrote `workflow-design`'s activity files in place and deleted five. That bricks **21 of 32 running sessions** — `readActivityRaw` matches the filename-derived id with no fallback, and `validateActivityTransition` returns `null` on an empty valid set, so `next_activity` succeeds *silently* and the failure only surfaces when `get_activity` throws. 19 of the 21 are parked at `retrospective`.

The replacement is **additive**: author the slim design as a new workflow, `workflow-authoring` v1.0.0, and leave `workflow-design` untouched. Existing sessions drain naturally; retirement is gated on a measurable **drain-to-zero** trigger. Registration needs nothing but the directory — discovery is a `readdir` + `isDirectory()` scan, and `workflow.yaml` never enumerates activities, which is what lets the migration land one activity at a time.

## Blocking defect

One item must be fixed *in the authored structure*, not after:

> **C-1 — `09`'s tail is unconditional on both back edges.** `transitionTo` is "Recorded and returned, **not engine-applied**" (`src/schema/activity.schema.ts:50`), so selecting `remediate` does not move the session — the worker continues linearly through the rest of `09`'s steps. Gate 2 is presented anyway; `COMPLETE.md` is written on a non-terminal pass; and `remove-worktree` fires, **destroying the edit surface the remediation round then needs**. The session transitions to `quality-review`, whose first step authors fixes — with no worktree.

Fix is small: `when: and(remediation_selected != true, review_closed != true)` on steps 7–17, plus gating close-out and worktree removal on `commit_approved == true`. But it changes the authored YAML, so it cannot be deferred.

Three further High defects are fixable during authoring: `resolve-consumer-surface` is bound before either of its inputs exists (its `{target_workflow_id}` input *is* the loop variable of the loop it sits outside); two of `audit-canon`'s Rules restate its own Protocol phase, falsifying the AP-19 assertion; and `01:4 halt-on-wrong-target` cannot halt, because `action` has no halt primitive — a wrong-target review falls through `isDefault` into a silent audit of the workflow the human just rejected.

## Two holes neither review caught until the second pass

- **`{target_path}` is unproduced in review mode.** Its only producer is gated `!= 'review'`, and review mode never enters that activity. `--root ""` is treated as absent, so the guards silently fall back to the stale main checkout — in the one mode whose entire job is sweeping other workflows.
- **`target_workflow_ids` is not reset on a review→update escalation**, so an escalated update re-sweeps all N review targets when one was fixed.

## Index

| Artifact | What it holds |
|---|---|
| [Design principles map](01-corpus-map-design-principles.md) | All 30 stances, and which constrain versus support consolidation |
| [Anti-patterns map](01-corpus-map-anti-patterns.md) | Catalogue entries governing activity structure, artifacts, orchestration, rules, resources |
| [Schemas map](01-corpus-map-schemas.md) | What the activity/workflow/condition schemas permit and forbid structurally |
| [Activities map](01-corpus-map-activities.md) | All 9 activities: step inventories, checkpoints, decisions, transitions |
| [Techniques and resources map](01-corpus-map-techniques-and-resources.md) | 38 techniques and 24 resources, bindings, retirement candidates |
| [Blast radius map](01-corpus-map-blast-radius.md) | Validators, baselines, hardcoded ids, the Progress contract, session resume |
| [Proposal — value-preserving](02-proposal-value-preserving.md) | The winner |
| [Proposal — delivery-first](02-proposal-delivery-first.md) | Optimised for per-dispatch delivery cost |
| [Proposal — minimal-cut](02-proposal-minimal-cut.md) | Issue #321 taken literally |
| [Judge verdicts](03-judge-verdicts.md) | Three lenses, scores, and four catalogue verifications that changed the ranking |
| [Implementation plan](04-implementation-plan.md) | The build document: architecture, canon compliance, audit stage, retirement, migration, validation |
| [Adversarial audit — sections 5–8](05-adversarial-audit.md) | First refutation pass: 1 Critical, 10 High, 8 Medium |
| [Verification — sections 0–4](06-verification-sections-0-4.md) | Second pass over the architecture sections: 1 Critical, 3 High, 6 Medium, plus attested negatives |
| [Revised strategy](07-revised-strategy-new-workflow-id.md) | The new workflow id, the additive S1–S8 sequence, the drain trigger, and amendments for all ten surviving design defects |

## Findings that generalise beyond this plan

**Four catalogue entries hide outside the anti-pattern families.** `anti-patterns.md` has 13 `##` sections, and AP-126/127/128/129 sit inside `## Authoring Guidance (MR)` alongside MR-1…MR-4. Any catalogue walk enumerating `## *Anti-Patterns` families drops them silently — including AP-128 and AP-129, the two entries this migration most depends on. This affects every catalogue sweep, not only this plan.

**`workflow-design`'s techniques have no cross-workflow address.** They are flat files in `techniques/`, and every cross-workflow bind in the corpus is group-qualified (`workflow-engine::list-workflows`, `manage-artifacts::write-artifact`). So the new workflow must copy ≈18 of them — a real AP-74/AP-110 exposure with no mitigation but the time-box. Authoring them inside a group in the new tree makes this the last time they are copied.

**The 154 KB canon need not be duplicated.** Cross-workflow *resource* refs are supported, so the four criteria homes are cited rather than copied — one physical copy, §6 intact. But an unresolvable resource is skipped with `continue` and no warning, so premature deletion of `workflow-design` would silently empty the new workflow's criteria bundle. That is what the committed delivery test at S5 exists to detect.

## The honest cost of the strategy

Trading an in-place rewrite for coexistence trades a sharp failure for a slow one. In-place had a zero-length duplication window and a hard-brick risk; additive has a zero brick risk and a **permanent duplication** risk. Nineteen sessions sit at `retrospective` and nobody is obliged to finish them, so drain-to-zero is only measurable if it is also *reachable* — hence the committed census script, the append-only drain log, and a ≥90-day abandonment policy. Without those, two design workflows coexisting is the steady state and C1 has been traded for a chronic §6 violation.

And `workflow-design` keeps every defect this work exists to fix for the whole window — including two 30-second auto-advances that auto-select *proceed to commit* when `fail_count > 0`. In-place rewriting would have fixed those for in-flight sessions. This strategy deliberately does not. That is the price of not bricking 21 of them.

## Record-keeping notes

The implementation plan was assembled from two message blocks: the synthesizing agent wrote 86,848 characters, then a closing block, and the workflow captured only the closing one as its return value. The first committed copy of `04-implementation-plan.md` was therefore truncated mid-table inside migration step M2, with M3–M10 and sections 6–8 absent. It has been rejoined and is now complete at 120,721 bytes with all nine sections and eleven migration steps. The first audit reviewed only the tail, which is why the second verification pass over sections 0–4 was run separately — and why it found a Critical the first pass could not have seen.

Cost of the analysis: 16 agents total, ~2,775,000 subagent tokens. The two scoped passes cost ~278,000 between them in about 16 minutes, against ~2,500,000 and ~7 hours for the first workflow — the same lesson the issue itself is about, reproduced inside its own planning.
