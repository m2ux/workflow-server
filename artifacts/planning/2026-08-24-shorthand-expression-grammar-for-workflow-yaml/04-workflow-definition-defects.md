# Workflow Definition Defects Observed During This Run

Nine defects in the workflow definitions themselves, plus one run-level conformance failure. None concerns the shorthand expression grammar this session evaluated — that work is in `EVALUATION-REPORT.md` and `MITIGATION-PLAN.md`. These concern the machinery that ran the evaluation, and the closure gate decided they leave the session and become their own issue.

This file is the only durable record of the set. Whoever raises the issue should work from it.

## Provenance

Seven were observed by the workers that ran the client workflow and handed to the closing activity. Two more were found while reading the session record during close-out; they are marked **found during close-out** below. The count differs from the seven handed over for that reason.

## The nine defects

### 1. The planning folder has no README, so nothing tracks progress

A session's planning folder normally carries a `README.md` with a Progress table — one row per activity, marked as each completes. This folder has no README. The meta setup sequence handed back under the `depth-1-only` harness constraint before it seeded one.

The consequence is visible in the server's own projection: all five meta activities, all six client activities and all ten activities across the two analysis sessions are listed under `progress_mark_unreported`. Nothing was mis-recorded; there was simply nowhere to record it. It also leaves the close-out's "refresh the README cost line" step with no line to refresh.

### 2. The `adjust` option on two scope gates carries no variable, so re-entry is indistinguishable from first entry

In `00-scope-definition.yaml` and `01-dimension-planning.yaml`, the checkpoint option that sends the user back to adjust the scope sets no variable — it carries only `exit: adjust`. When the activity is re-entered, the variable bag is byte-identical to what it held on first entry.

Whatever the user asked to change survives only as prose in the dispatch message to the next worker. Nothing in state distinguishes a second pass from a first, and nothing records what the adjustment was. This run took two passes through `confirm-scope`, so the path was exercised.

### 3. `scope_summary` is written but never declared

The operation `plan-evaluation::summarize-scope` produces a value called `scope_summary`, and the `confirm-scope` checkpoint message interpolates it into the text shown to the user. The activity's `variables.writes` does not declare it.

A value that reaches the user through a gate message but appears in no declaration is invisible to anything reasoning over the definition — validation, impact analysis, or a reader tracing where a variable comes from.

### 4. `parent_session_index` is declared with nothing to bind it

`workflow-engine::handle-sub-workflow` declares an input `parent_session_index`. No step and no workflow variable supplies it. The composed signature reports it UNRESOLVED, and the step that triggers the sub-workflow binds only `workflow_id`.

This is the binding-gap case the engine's own `signature-is-the-contract` rule describes: an input that is declared, never satisfied, and carries no default.

### 5. `execute-analysis` passes two values to its children without declaring either

The `execute-analysis` activity hands `selected_lenses` and `analysis_focus` down to the analysis sub-workflows through `passContext`. Neither appears in the activity's `variables.writes`.

Both values genuinely crossed into the child sessions this run and shaped what the two analysis groups examined, so the omission is in the declaration rather than in the behaviour.

### 6. A `mixed` target classification collapses to `general`, contradicting the lenses actually run

The `target-type-vocabulary` resource maps a `mixed` classification onto `general`. This session recorded `evaluation_target_type: mixed`, and group 2 ran lens 12, catalogued code-only, alongside lens 15, catalogued code-and-general.

So the vocabulary flattened the target to `general` while the run selected lenses on the strength of it being partly code. The classification the definition holds and the lenses the run chose disagree.

### 7. Workers are required to resolve a destination they are forbidden the means to resolve

The `finalize-activity` operation requires every worker to return `next_activity_id`, resolved by evaluating the workflow graph against the post-activity variable bag. The rule `worker-control-plane-ban` forbids a worker from calling `get_workflow`, and the graph is never delivered into a worker's context by any other route.

The requirement is therefore unsatisfiable from where it is placed. Every worker in this run reported its exit and left the destination to the orchestrator — including this closing activity, which received its routing from the coordinator rather than resolving it.

### 8. Closure never measures the run against the client workflow's declared outcomes — **found during close-out**

The `end-workflow` activity declares `target_workflow_outcomes` among the variables it reads, and its `verify-outcomes` step binds that variable as the list of outcomes to check the run against. No meta activity ever writes it. It is absent from the session's variable bag.

The step falls back to its secondary source — the outcome each completed client activity reported as it finished — and that fallback is what this run was measured against. Those reported outcomes are the bare token `complete` per activity, not the declarative prose the client workflow declares. Closure therefore confirms that each activity finished, which is a weaker statement than that the workflow achieved what it set out to.

This is the same shape as defects 3 and 4: a declared name with no producer.

### 9. Both analysis sub-sessions are still open at their final activity — **found during close-out**

The two `prism` sessions, `YM6QZV` (Consistency) and `7OPXHM` (Expressiveness, Architecture, Feasibility), both report status `running` with `deliver-result` as their current activity. Each has an `activity_entered` event and a recorded usage row for that activity. Neither has an `activity_exited` or an `activity_outcome`.

The work itself is complete: both sessions wrote their `REPORT.md` and `DEFINITIVE-FINDINGS.md`, and `consolidate-report` consumed both. What is missing is the exit that would carry the session to a terminal state. In the record a finished sub-workflow looks exactly like an abandoned one, which matters for anyone auditing later or resuming a run that genuinely stalled.

## Also carried out: the artifact line-budget overrun

Separate from the nine, and recorded here because the session state under-reports it.

Four artifacts each overran a line budget written for roughly twelve findings:

| Artifact | Findings carried | Budget written for |
|---|---|---|
| `consistency/REPORT.md` | 20 | ~12 |
| `dimensions/REPORT.md` | 34 | ~12 |
| `EVALUATION-REPORT.md` | 47 | ~12 |
| `MITIGATION-PLAN.md` | 48 | ~12 |

Each writer judged its overrun structural rather than verbose: condensing to the budget meant dropping findings or dropping mandated fields from each finding. The budget assumes a finding count this evaluation exceeded roughly fourfold.

The session state records this unevenly. The `artifact_conformance` variable itemises one violation only — `EVALUATION-REPORT.md`, at 672 lines against a ~200-line budget. The two group reports survive as a bare `artifact_conformance: false` boolean on their `completed_analyses` entries, with no detail. The `MITIGATION-PLAN.md` overrun is recorded nowhere in state at all; it is known only from the worker that wrote it.

So a reader consulting the session record alone would conclude one artifact overran, when four did.

## Suggested issue shape

Defects 3, 4, 5 and 8 are one family: a value that is used but not declared, or declared but never produced. They are cheap to fix together and a validation rule could prevent the class.

Defects 1, 7 and 9 concern lifecycle bookkeeping — nothing seeds the README, workers cannot resolve their own routing, sub-sessions never reach a terminal state — and are worth treating as one thread.

Defects 2 and 6 are independent and small.

The line-budget overrun is a question about the budget rather than about the artifacts: four writers independently judged it unmeetable at this finding count.
