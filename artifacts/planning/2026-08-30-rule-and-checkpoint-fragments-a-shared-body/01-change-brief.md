# Change Brief — Rule and checkpoint fragments: a shared home

**Workflow:** `work-package` v4.0.0
**Mode:** Update
**Date:** 2026-08-30
**Change categories:** Structural refactor
**Change request:** Decide whether the `fragments` construct survives, and carry out whichever migration that decision selects, per [#519](https://github.com/m2ux/workflow-server/issues/519).
**Baseline:** [`origin/workflows` @ bc52c69](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) — the corpus tip after [#522](https://github.com/m2ux/workflow-server/pull/522) merged.

---

## Purpose

Issue #519 asks whether `fragments` earns its place or stands in for two absences: a shared home for generic rules, and shared activities for shared gates. Both halves of that question have found homes elsewhere since it was raised. [#522](https://github.com/m2ux/workflow-server/pull/522) filled the rule absence — the meta conduct techniques became the shared home, all seven rule fragments and their seventeen reference sites were deleted, `fragments.rules` left the schema and the resolver, and the `duplicate-rule` guard's remedy was rewritten to name the conduct home. [#520](https://github.com/m2ux/workflow-server/issues/520) specifies the `routines/` construct that takes the gate absence, and states in its own Investigation detail that it retires #519's checkpoint half. What this run owns is the remainder: a variable-declaration gap that neither issue reaches.

| Goal | Meaning |
|------|---------|
| Close the borrowed-gate variable gap | `remediate-vuln` declares two of the eight variables the gates in its borrowed activities read and write; the run declares the rest |
| Widen the guard that should have caught it | The `undeclared-effect-variable` check reaches activities a workflow borrows by path, so the next borrowing workflow cannot reproduce the gap silently |
| Route the construct question to where it is decided | The judgements about whether `fragments` survives and where a shared body may live are recorded against #520 rather than answered here |

**Out of scope:**

- Whether `fragments` survives, and where a shared checkpoint body may live. Both are #520's, per the outcomes below.
- What either gate says. The interview and per-assumption decision keep their wording, options and effects.
- The borrowed-activity mechanism itself.
- Rule-audience placement (#518) beyond what #522 already landed.

---

## Dimensions

| Dimension | This run's shape |
|-----------|------------------|
| Variables | `remediate-vuln` borrows `04-research`, `05-implementation-analysis`, `07-assumptions-review` and `08-implement` from `work-package` — every activity holding a checkpoint `ref`. The gates in those activities read `is_review_mode`, `has_open_assumptions`, `assumption_review_presentation`, `open_assumptions` and `current_assumption`, and write `assumption_outcome`, `has_deferred_assumptions` and `needs_individual_interview`. `remediate-vuln` declares `is_review_mode` and `assumption_outcome`. The run declares the other six, so every variable a borrowed gate touches is named by the workflow whose session bag it fires in. |

Purpose, activity list, checkpoints, artifacts and rules are unchanged against the baseline. The checkpoints dimension is the subject of the two judgements carried to #520 and changes under that issue, not this run.

---

## Open judgements

**Disposition: carried open.** Judgements 1 and 2 are carried because #520 is where they are decided, not because this run left them unexamined — each outcome names that issue and the form the answer takes there. Judgement 3 is settled and in scope.

| # | Judgement | Why it is open | Effect if decided either way | Outcome |
|---|-----------|----------------|------------------------------|---------|
| 1 | Does `fragments` survive, now that it carries checkpoints only? | The issue reasoned that filling both absences might leave the construct with nothing to carry. The first absence is filled. The second is not fillable with the constructs the schema offers today: `technique`, `action`, `checkpoint` and `loop` are the only step kinds, so no activity can be invoked from inside another activity's step list, and six of the seven sites are mid-activity or inside a `forEach` loop. A technique cannot present a gate either. | Survives: the corpus keeps a working mechanism whose whole remaining surface is two bodies and seven sites, and the issue's question becomes a placement rule. Retires: a site can move only once a new construct exists. | **Carried open — decided in [#520](https://github.com/m2ux/workflow-server/issues/520).** That issue specifies `routines/`: a named run of steps an activity refers to by name, materialised into the referring activity at load. Its stated migration is exactly the two shared checkpoint bodies and the seven reference sites this run inherited, its acceptance criteria require the bodies deleted rather than orphaned, and its Investigation detail states that it retires #519's checkpoint half. The construct question is #520's to answer. |
| 2 | Where may a shared checkpoint body live? | Acceptance criterion 3 forbids a fragment body naming single-activity state while sitting at workflow scope. Both remaining bodies do exactly that — the `assumption-interview` condition reads `is_review_mode` and `has_open_assumptions`, its message interpolates `assumption_review_presentation`, its options write `assumption_outcome`, `has_deferred_assumptions` and `needs_individual_interview`, and `assumption-decision` reads `current_assumption`. There is nowhere else for them to sit: `fragments` is declared on `workflow.yaml`, and nothing in the schema lets an activity file declare a fragment a sibling activity can reference. | Workflow scope stands: no corpus file changes and criterion 3 is retired with its reason recorded. An activity-scoped home: `work-package/workflow.yaml` loses its `fragments` block, one activity file gains it, seven `ref` values gain a qualifier, and the schema, resolver and guard all move with them. | **Carried open — decided in [#520](https://github.com/m2ux/workflow-server/issues/520).** A routine is its own definition kind with inputs, outputs and steps, living in `routines/` beside `activities/` and holding no place in the graph, so a shared body sits beside the state it names with no workflow root to lift it to. #520 carries its own placement criterion — a routine's placement follows from its reference sites, and a guard enforces it. That settles this judgement in a form a placement rule written here would only have approximated. |
| 3 | Must a workflow that borrows an activity carrying a checkpoint `ref` declare that gate's effect variables? | `remediate-vuln` borrows all four activities holding a `ref` and declares `is_review_mode` and `assumption_outcome` but not `has_open_assumptions`, `needs_individual_interview`, `has_deferred_assumptions`, `assumption_review_presentation`, `open_assumptions` or `current_assumption`. The `undeclared-effect-variable` check does not see this: it scans each workflow's own `activities/` directory, and `remediate-vuln` has none. So acceptance criterion 5 passes the guard while the condition it describes still holds. | In scope: the guard gains a borrowed-activity walk and `remediate-vuln/workflow.yaml` gains the declarations. Out of scope: the run closes with criterion 5 marked met-by-guard and the residual question carried as a limitation. | **In scope — this run owns it.** #520 addresses the shared-body construct and says nothing about which variables a borrowing workflow declares, so this judgement survives it. The check already exists and only its walk is incomplete, and an undeclared effect variable in a workflow that runs is a live binding gap rather than a mechanism question. The run widens the walk to activities a workflow borrows by path and declares what the widened walk finds. |

---

## What #519 still owns after #520

| Acceptance criterion | Standing at the baseline |
|---|---|
| 1 — a recorded decision on whether `fragments` survives | Deferred to #520, recorded as judgement 1 above |
| 2 — no fragment declared by a workflow whose domain does not cover it | Met. After #522 only `work-package` declares a fragment, and only `work-package` activities reference one |
| 3 — no fragment body names single-activity state at workflow scope | Deferred to #520, recorded as judgement 2 above |
| 4 — no fragment with one reference site | Met. `pass-output-forwarding` was the only one and #522 deleted it; the two survivors carry four and three sites |
| 5 — a referencing workflow declares no variable it never produces on account of a shared body | Passes the guard, fails in fact through the borrowed-activity path. This run's judgement 3 |
| 6 — the `duplicate-rule` remedy names the shared home | Survives #520 and stays in #519's scope. The guard text at the baseline reads *move it to the meta conduct technique whose audience it binds and delete every copy*, so it is met by #522 pending this run's confirmation |

---

## Confirmation ask

Approving this brief commits the run to one corpus edit — six variable declarations on `remediate-vuln/workflow.yaml` — plus the guard walk that makes them checkable, and to closing #519 against #520 for the construct question rather than answering it here.
