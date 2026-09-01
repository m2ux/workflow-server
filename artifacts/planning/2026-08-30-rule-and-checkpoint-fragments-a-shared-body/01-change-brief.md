# Change Brief — Rule and checkpoint fragments: a shared home

**Workflow:** `work-package` v4.0.0
**Mode:** Update
**Date:** 2026-08-30
**Change categories:** Structural refactor
**Change request:** Decide whether the `fragments` construct survives, and carry out whichever migration that decision selects, per [#519](https://github.com/m2ux/workflow-server/issues/519).
**Baseline:** [`origin/workflows` @ bc52c69](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) — the corpus tip after [#522](https://github.com/m2ux/workflow-server/pull/522) merged.

---

## Purpose

Issue #519 asks whether `fragments` earns its place or stands in for two absences: a shared home for generic rules, and shared activities for shared gates. Both halves of that question have found homes elsewhere since it was raised. [#522](https://github.com/m2ux/workflow-server/pull/522) filled the rule absence — the meta conduct techniques became the shared home, all seven rule fragments and their seventeen reference sites were deleted, `fragments.rules` left the schema and the resolver, and the `duplicate-rule` guard's remedy was rewritten to name the conduct home. [#520](https://github.com/m2ux/workflow-server/issues/520) specifies the `routines/` construct that takes the gate absence, and states in its own Investigation detail that it retires #519's checkpoint half. This run opened expecting to own a third piece — a variable-declaration gap in `remediate-vuln` — and measurement refuted it, so what the run owns is the record: the decision #519 asks for, and the evidence that every other criterion is discharged.

| Goal | Meaning |
|------|---------|
| Record the decision #519 asks for | `fragments` survives, narrowed to checkpoints, and #520 is where its remaining migration is carried out |
| Establish each criterion's standing with evidence | Every one of the six criteria is measured against the corpus tip rather than asserted, so closing the issue rests on what the files say |
| Leave both targets untouched | No criterion of #519 leaves a definition change under `work-package` or `remediate-vuln`, and neither target is edited |
| Repair what the walk found in shared canon | Remediation round 1 fixes the two pre-existing findings the criteria walk surfaced, in three files both targets read |

**Out of scope:**

- Whether `fragments` survives, and where a shared checkpoint body may live. Both are #520's, per the outcomes below.
- What either gate says. The interview and per-assumption decision keep their wording, options and effects.
- The borrowed-activity mechanism itself.
- Rule-audience placement (#518) beyond what #522 already landed.

---

## Dimensions

No dimension changes. Purpose, activity list, checkpoints, artifacts and rules all stand as the baseline has them. The checkpoints dimension is the subject of the two judgements carried to #520 and changes under that issue, not this run.

---

## Open judgements

**Disposition: carried open.** Judgements 1 and 2 are carried because #520 is where they are decided, not because this run left them unexamined. Each outcome names that issue and the form the answer takes there. Judgement 3 is settled: the gap it asked about does not exist.

| # | Judgement | Why it is open | Effect if decided either way | Outcome |
|---|-----------|----------------|------------------------------|---------|
| 1 | Does `fragments` survive, carrying checkpoints only? | No construct reaches six of the seven sites | Keep a working mechanism, or block on one that does not exist | Carried open — [#520](https://github.com/m2ux/workflow-server/issues/520) |
| 2 | Where may a shared checkpoint body live? | Criterion 3 forbids the only scope available | No corpus change, or a schema affordance for two bodies | Carried open — [#520](https://github.com/m2ux/workflow-server/issues/520) |
| 3 | Must a workflow borrowing a gate declare that gate's effect variables? | The intake reading found six undeclared | Guard and declarations change, or the gap is carried | Settled — no gap exists |

### 1. Does `fragments` survive?

The issue reasoned that filling both absences might leave the construct with nothing to carry. The first absence is filled. The second is not fillable with the constructs the schema offers. `technique`, `action`, `checkpoint` and `loop` are the only step kinds, so no activity can be invoked from inside another activity's step list. Six of the seven sites are mid-activity or inside a `forEach` loop, and a technique cannot present a gate.

#520 answers it. That issue specifies `routines/`: a named run of steps an activity refers to by name, materialised into the referring activity at load. Its stated migration is the two shared checkpoint bodies and the seven reference sites this run inherited. Its acceptance criteria require the bodies deleted rather than orphaned, and its Investigation detail states that it retires #519's checkpoint half.

### 2. Where may a shared checkpoint body live?

Criterion 3 forbids a fragment body naming single-activity state while sitting at workflow scope. Both remaining bodies do that. The `assumption-interview` condition reads `is_review_mode` and `has_open_assumptions`, its message interpolates `assumption_review_presentation`, and its options write `assumption_outcome`, `has_deferred_assumptions` and `needs_individual_interview`. `assumption-decision` reads `current_assumption`. There is nowhere else for them to sit, because `fragments` is declared on `workflow.yaml` and no activity file may declare one a sibling can reference.

#520 answers it. A routine is its own definition kind with inputs, outputs and steps, living in `routines/` beside `activities/` and holding no place in the graph. A shared body then sits beside the state it names, with no workflow root to lift it to. #520 carries its own placement criterion: a routine's placement follows from its reference sites, and a guard enforces it.

### 3. Must a borrowing workflow declare the gate's effect variables?

No, and no gap exists. The premise this run opened on was wrong, and measurement refutes it.

A variable is declared in either of two places: the workflow file, or an activity's own `variables.writes`. An activity's declarations are contributed to every workflow whose graph includes that activity. The four borrowed activities declare the five interview variables on themselves, `remediate-vuln/workflow.yaml` declares `is_review_mode`, and `declaredVariables` folds an included activity's contributions in by reading the file where that activity lives. Resolving `remediate-vuln` returns 118 declarations, covering all eight variables its borrowed gates read and write.

The guard passes because the declarations exist, not because it cannot see them. The intake reading counted only `remediate-vuln/workflow.yaml`'s own `- name:` entries, which is the wrong denominator under the activity-variable contract.

---

## What #519 still owns after #520

| # | Acceptance criterion | Standing | Evidence |
|---|---|---|---|
| 1 | A recorded decision on whether `fragments` survives | Carried to #520 | Judgement 1 |
| 2 | No fragment declared by a workflow whose domain does not cover it | Met | Only `work-package` declares one, and only its own activities reference it |
| 3 | No fragment body names single-activity state at workflow scope | Carried to #520 | Judgement 2 |
| 4 | No fragment with one reference site | Met | Two remain, at four and three sites |
| 5 | A referencing workflow declares no variable it never produces | Met | 118 declarations resolve for `remediate-vuln`, covering all eight |
| 6 | The `duplicate-rule` remedy names the shared home | Met | Guard text on `origin/main` |

Four are met at the corpus tip. The two that are not are #520's to carry out. No criterion is left for a definition change under either target, so the [scope manifest](06-scope-manifest.md) names no file belonging to one.

The three files it does name entered through remediation, not through #519. The criteria walk that measured these standings surfaced two pre-existing defects in the shared canon both targets read, and the operator chose to repair them rather than record them and move on. The [findings register](09-findings-register.md) holds what they were and what the repair changed.

The guard text behind criterion 6 reads *move it to the meta conduct technique whose audience it binds and delete every copy*. `check-fragments.ts` run against this run's worktree reports `fragments: OK — every ref resolves, every fragment is used, no inline duplicates`.

---

## What the run delivered

#519 closes on the record: four criteria met at the corpus tip, two carried out under #520, and no definition change owed under either target.

Alongside that record the run delivers three files of shared canon, repairing the two findings its own criteria walk raised — the Artifact Writing Register made reachable from any workflow, and the schema construct inventory given its missing `fragments.checkpoints` row. One finding stays open and unfixed here: a stale entry in the binding-fidelity triage baseline, whose remedy is in the server repository, outside this run's edit surface.
