# Activity batching: keep the bound, simplify the continue path

> Verified outcome · 2026-09-11 · for [#407](https://github.com/m2ux/workflow-server/issues/407); simplification queued as [#692](https://github.com/m2ux/workflow-server/issues/692)

One worker identity can walk a run of activities rather than exactly one, pausing for a gate or
a commit and resuming in place. The server bounds that run: at most three distinct activities, and
at most a fraction of the worker's declared window in delivered characters. The question this
folder answers is whether that second way of walking is worth what it adds to the design.

**Keep the bound and keep continuing across an activity boundary. Do not keep the current shape of
the continue path.** The unique prize is skipping a harness respawn, and the three-activity setup
sequence at the head of every session — the run batched dispatch named as its first user — forms
on later sealed runs. Almost all of the complexity sits in a client loop that answers "may this
context continue?" at the wrong moment, advances the pointer in two operations, and folds
replacement-on-failure into the continue operation. Those three are not required to keep the setup
save.

Resume across a gate — the same activity, the same identity — is a different mechanism and is not
on the table. Thirteen of fifteen work-package activities carry a gate. Same-activity re-delivery
collapses 63.8% of the payload. That saving survives setting the activity cap to one.

The [fleet census](census.md) is the measurement this rests on. Every count below re-takes from it,
or from the published dispatch-model and batch-benchmark figures named in place.

## What happens today

A dispatch may carry a run. The worker walks each activity, reports it as it finishes, and the
orchestrator either continues that identity onto the next activity or releases it and spawns a
replacement. The server, not the orchestrator, sizes the run: it reads the session history for
that identity and refuses the next activity once either limit binds. Three carve-outs keep the
bound aimed at a dispatched worker: a context that has taken no activity is always admitted its
first; an activity the context already holds is always served, so a gate does not end the run;
and a scope equal to the session's own agent is unbounded, because that context owns the whole
walk by construction.

Two limits, both live. The character budget is `context_tokens × 0.35 × 4` — 280,000 characters
at a 200,000-token window. The activity cap is 3. On the work-package walk the two bind within
one activity of each other. The first activity alone delivers 199,020 characters, 71% of the
budget, so in fresh mode the budget binds first. The cap covers what a character count cannot
see: the harness context the server never delivers, the code the worker reads, the artifacts it
drafts, and degradation across a long walk. Raising both dials together is the combination the
cap exists to refuse.

What the bound uniquely buys, against one fresh context per activity:

- The analysis trio (`implementation-analysis`, `plan-prepare`, `assumptions-review`) — the best
  measured candidate — falls from 261,971 characters to 222,505, **15.1%**, and skips two
  dispatches. A later corpus pin measured 253,118 against 275,053. The third activity's wire
  payload falls from 78,923 to 30,182.
- Skipping two respawns is the larger number. The profiled setup walk's four dispatches cost 77,
  65, 42 and 165 seconds; the benchmark's default spawn input is their mean, 87 seconds. Issue
  407 priced the spawn save at five to eight times the collapsing save; the dispatch model still
  says two to four times.
- `bench:batch` measures eager payloads only and never a lazy fetch, so its character figure is a
  floor. Server-side elapsed is a wash: a batch does slightly more server work to put fewer bytes
  on the wire.

The continue path is a second advancing operation. The client activity loop in meta's dispatch
activity has a four-clause gate in front of `continue-batch` (an identity is held, the envelope
is an `activity_complete`, `batch_may_continue` is true, the next destination is one activity
and not a fan) and a different gate in front of `dispatch-activity`. `continue-batch` advances
the pointer, then resumes the held identity; if the continuation returns no accepted envelope —
including a server refusal of the next activity — it mints a replacement itself. That is why
`one-advance-per-activity` exists: handing the replacement back to `dispatch-activity` would
advance a second time onto an activity already current, and record it as exited before a worker
had walked a step of it. Two faults of that shape reached review. The loop-walk and loop-gates
tests exist because a frozen-bag test cannot see a `worker_result` rewritten mid-iteration.

The continue bit itself is answered twice. The worker reads `may_continue` from the `batch`
block of `get_activity` at the **open** of the activity it is about to run, and copies that
value onto `batch_may_continue` in the envelope. Lazy fetches of that activity then draw down
the same budget, so a `true` can still be a refusal at the next boundary — documented as an
ordinary outcome, met by spawning a replacement. `next_activity` already computes the reading
that counts those fetches, and its `context_tokens` parameter says to continue on that
`may_continue` and spawn otherwise. The loop does not use it. That is the August optimisation
pass's O3, half-landed: the better reading exists and the corpus still parrots the worse one.

A fan is not a batch. Each branch takes one activity under its own identity; the per-scope bound
does not limit fan width. The loop must not continue into a destination that fans. Every later
fan design has had to restate that.

The surface that exists only because of continue-across-activities is the bound module, six test
files carrying **46 cases**, the batch benchmark, the continue-batch technique, the envelope
field, `_meta.batch` on two tools, two config knobs, a dispatch-model section, and a history
event (`batch_refused`) whose presence in a session pins that session to this server version.
About 2,200 lines across those files, before the loop YAML and the orchestrator prose. Resume
across a gate already needs identity-scoped delivery and the "already-held activity is always
served" carve-out. The rest is the continue path.

## What the fleet does

**151 session records, 0 `batch_refused` events, 221 identities that took one activity, 21 that
took two or more.** The 21 split 7 / 14: seven are the meta setup sequence, fourteen are client
workflows. Full tables and the re-take command sit in the [census](census.md).

The setup sequence forms. Six of the seven setup identities walked `discover-session` →
`initialize-session` → `resolve-target` — exactly the cap-sized, light, no-fan run batched
dispatch named as first user. The seventh walked those three plus `dispatch-client-workflow`
under the session's own `orchestrator` identity, which is the unbounded exemption rather than a
bound batch. The 5 August run that formed no batch at all was a deploy-timing miss; later runs
bank the setup save.

Client batches form sometimes. Fourteen identities across work-package, requirements-refinement,
workflow-authoring, plain-language, prism-evaluate, and a nested prism child. The designed
analysis trio appears once. One work-package pair ran under the session's own `orchestrator`
identity — the exemption, live. Sixteen of twenty-five client sessions that walked two or more
activities did not batch at all (one identity per activity). One of those sixteen is a fan, which
must not continue. Several others predate the 5 August merge, including the fifteen-activity
work-package walk of 30 July, so they are not evidence against the landed path. The post-merge
remainder is mixed.

Zero refusals is the expected tally of a loop that stops when `may_continue` is false. It is also
the expected tally of a loop that never continues. The setup split is what says the save is
banked; the client split is what says the loop complexity is paid on a path the fleet takes only
some of the time.

## The decision

**Keep the bound.** Retiring continue-across-activities — setting the cap to one and deleting the
continue step — spends the setup-walk prize on every session: two extra spawns, on the order of
174 seconds projected from the 87-second mean, for a mechanism later runs actually form. The
bound is also the structure behind "do not walk the whole workflow in one context," which is why
batched dispatch exists. A lost context still costs one activity, not the batch, because the
worker reports each activity as it finishes and answered gates replay for any replacement. The
cap is therefore not a blast-radius control. It is a degradation control, and no instrument in
this repository measures that degradation. Leaving it at three, with the budget beside it, is the
standing bet.

**Keep resume-across-gates.** Same activity, same identity, 63.8% collapse on a re-delivery.
Independent of the cap.

**Do not keep the current client-loop shape as the long-term design.** Two advancing operations,
a continue bit answered at activity open, and a continue operation that also spawns replacements
are the complexity. They are not required to keep the setup save.

**Simplify the continue path, in this order:**

1. Drive continue-or-respawn from `next_activity`'s `_meta.batch.may_continue` — the boundary
   reading that already counts the lazy fetches. Stop asking the worker to copy the open-time
   bit onto the envelope. Drop `batch_may_continue` from the envelope once the loop does not
   read it.
2. Make `continue-batch` only continue. Replacement after a failed continue, or after a refusal,
   is a dispatch, reached after releasing the identity — and only together with a pointer rule
   that makes a second `next_activity` on the activity already current a hard refusal. The fan
   work already found that `one-advance-per-activity` is not subsumed today: both callers omit
   `from_activity`, and a second advance onto the current activity still silently records false
   completion.
3. Leave the bound, the cap, the budget, and resume-across-gates.

**Do not raise both dials.** That is one worker holding on the order of 160,000 tokens of
definition text before it reads a line of the target codebase — Design C of the August scarcity
pass, and the bet the cap exists to refuse. Identifier-only delivery (Design B of that pass)
would make the bound vestigial; that is a different programme, compiled delivery and mechanical
execution, not a retune of this one.

## Why the simplification is cheap

`next_activity` already computes the boundary reading and already tells the caller to continue
on that `may_continue`. `batchState` is already exported and side-effect-free. The envelope field
is a copy of a value the worker was told to parrot; deleting the copy is deleting a path, not
adding one. The fleet has written zero `batch_refused` events, so a change to when the continue
bit is read is not fighting a live refusal-recovery path — the replacement arm inside
`continue-batch` is specified, tested, and unused in the wild.

The pointer rule in (2) is the dependency, not the continue bit. Without it, making
`continue-batch` only continue re-opens the second-advance hazard the fan work measured in live
code. That rule is owed either way.

## Scope

Server: the `next_activity` batch block is already the continue decision; the corpus and the
worker envelope have not caught up. The continue-batch technique, the client loop's two advancing
steps, and the `batch_may_continue` field on `activity_complete` are the edit surface. The bound
module, the two config knobs, and resume-worker are not.

Corpus: meta's dispatch-client-workflow loop, continue-batch, activity-worker, finalize-activity,
dispatch-activity, workflow-orchestrator. Fan exclusion stays: a destination that fans still
releases the identity.

Tests: the loop-walk and loop-gates files change because the gates change. The bound arithmetic
and the batched-dispatch e2e walks stay; they pin the bound, not the continue bit's home.

## What was verified

- The bound, the two limits, the three carve-outs, and the refuse-and-record path, from
  `src/utils/batch.ts` and the dispatch-model batching section.
- That `get_activity` applies the bound before composing a payload, and that `next_activity`
  reports `_meta.batch` at the boundary counting lazy fetches of the exiting activity, from
  `src/tools/workflow-tools.ts`.
- That the worker copies the open-time `may_continue` onto the envelope, and that the client
  loop's continue gate reads that copy, from activity-worker, finalize-activity, and
  `03-dispatch-client-workflow.yaml`.
- That `continue-batch` both continues and replaces, and that `one-advance-per-activity` exists
  to stop a second advance, from continue-batch.md. That both advancing callers omit
  `from_activity` was already reproduced by the fan supersession refutation.
- The 15.1% eager-content save and the 87-second spawn input, from `scripts/run-batch-benchmark.ts`
  and the dispatch model; the 63.8% same-activity resume collapse and the 199,020 / 71% opening
  activity, from the granularity mechanism note and the August scarcity pass.
- The fleet split — 151 records, 0 refusals, 7 setup batches, 14 client batches, 16 of 25
  multi-activity client sessions with no batch — from the [census](census.md), re-taken by
  `measure/census.py`.
- 46 test cases across six files, and about 2,200 lines across the bound module, those tests,
  the benchmark, continue-batch.md, and the dispatch-model batching section.

## Non-goals

- Retiring the bound, the cap, or the budget.
- Raising `BATCH_MAX_ACTIVITIES` or `BATCH_HEADROOM_FRACTION`.
- Changing resume-across-gates, identity-scoped delivery, or the already-held-activity carve-out.
- Making a fan a batch, or bounding fan width with the activity cap.
- Identifier-only delivery, compiled delivery, or mechanical execution.
- Re-pricing spawn wall-clock; the 87-second figure remains a projection input from four
  dispatches on one run.

## Investigation detail

[Fleet census](census.md), including the command that re-takes the 151 / 0 / 7 / 14 / 16
figures, the identity-level tables, and what the census does not measure.
