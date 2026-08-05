# A resumed worker is waited on — investigation and design record

Supporting record for [#433](https://github.com/m2ux/workflow-server/issues/433). The run that surfaced it is meta session `CRMRHT`, client `5MRSES`, reviewing `midnightntwrk/midnight-node#1938`. This folder records what the definitions say today, what the harness surface actually offers, the design chosen for each of the three faults, and the alternatives weighed.

## What the definitions say today

`harness-compat/TECHNIQUE.md` carries `foreground-always` as three bullets in descending preference: a true blocking spawn wherever the harness offers one; failing that, async dispatch **paired with a wait on that harness's completion signal**; and fire-and-forget forbidden outright. The rule closes with a trailer pointing at the harness files: "Harness-specific technique files document how each host expresses blocking-equivalent wait; this rule states only the contract."

The four harness adapters each expose three Rules sections — `spawn`, `resume`, `concurrent` — which `resolve-harness-operation` selects between by `{operation_kind}`. Counting the wait obligations that are actually written down:

| Adapter | spawn | resume | concurrent |
|---|---|---|---|
| `claude-code.md` | `run_in_background=false`, and what omitting it forfeits | *(silent)* | wait until every agent yields or completes |
| `cursor.md` | `run_in_background=false`, and what omitting it forfeits | *(silent)* | wait until every agent yields or completes |
| `cline.md` | wait until the sub-agent yields or completes | *(silent)* | wait until every agent yields or completes |
| `generic.md` | waits (block or completion signal) until the agent yields or completes | *(silent)* | wait until every agent yields or completes |

Eight of twelve slices state a wait. The four that do not are the four resume slices. Every adapter states one for spawn and one for concurrent, and none states one for resume — which is what makes this a stated-at-the-wrong-altitude problem rather than four independent oversights. `foreground-always` names the fallback without naming what discharges it, so each adapter author had to infer the same thing from the same rule, and all four inferred the same silence.

`continue-agent`'s own Protocol does carry the wait — step 3 is "Wait until the agent yields or completes (blocking-equivalent)". So does `resume-worker` step 3. The generic layer is correct; the harness layer, which is where the concrete primitive and the concrete signal are named, is where the wait goes unsaid. An operator following the resolve map lands on the adapter slice and reads two bullets that concern only which primitive to call.

## What the harness surface actually offers

Read from the tool schemas as delivered, not from the authored claims about them.

`SendMessage` takes `to`, `message` and `summary`. There is no `block` parameter and no timeout — the schema has no blocking form to select. Its description confirms the direction of travel: "Messages from teammates are delivered automatically; you don't check an inbox." So the send call returns on acceptance of the resume, not on completion of the work.

The completion signal is the harness task-notification. `TaskOutput`'s own deprecation banner names it: "Background tasks return their output file path in the tool result, and you receive a `<task-notification>` with the same path when the task completes."

`TaskOutput` is the obvious wrong answer for the wait, and the surface says so on three counts. It is marked deprecated. It carries `block` (default true) with a `timeout` (default 30s, max 600s), so a blocking call returns on the timeout with the agent unfinished. And for this task kind the banner is explicit: "For `local_agent` tasks: use the Agent tool result directly. Do NOT Read the .output file — it is a symlink to the full subagent conversation transcript (JSONL) and will overflow your context window." The live run measured that cost at roughly ten thousand tokens of transcript for one wait on an agent that had not finished.

## What the run showed

Three resumes, each followed by an orchestrator turn that ended. The longest silence was seventeen minutes during `codebase-comprehension`, read by the user as a hang and interrupted to ask why the workflow had stopped. Nothing had stopped. Every `Agent` spawn beneath the orchestrator was foreground, including the client worker's own dispatch. Only the resume link was asynchronous, and only the orchestrator's ended turn made the run indistinguishable from a dead one.

Two adjacent faults on the same run would let a genuinely broken chain go unnoticed:

**A worker stopped while its children ran.** The meta worker carrying `dispatch-client-workflow` armed a completion watcher on the client worker it had dispatched and returned an interim status table instead of an envelope, on the reasoning that the watcher would re-invoke it later. The watcher had nothing left to deliver to. Recovery cost a round trip: notice the missing envelope, read the client session's state back off the server, reconstruct the routing facts the envelope would have carried, and continue the worker with them restated in the prompt — the paraphrase `context-travels-as-state` exists to prevent.

`activity-worker.md` Rules covers control-plane calls, one-activity-at-a-time, delivery keys and the batch bound. Nothing there speaks to a context's obligation to outlive what it dispatched.

**The orchestrator-side check passed the worst-shaped result there is.** `reject-partial-worker-result` rejects a result "reporting fewer steps than the activity defines, or leaving a required checkpoint without a response". Both tests are counts over an envelope's fields. Prose in place of an envelope has no fields to count, so it satisfies neither test and passes.

`resume-worker.md` and `continue-batch.md` both already branch on "what came back is not one of the two tagged results" and cite `reject-partial-worker-result` as the home for that test. The home does not hold it — a false citation of the kind the canon names `cited-home-owns-claim`.

## Design

### The wait obligation states what discharges it

`foreground-always` bullet two gains the discharge condition: the wait is held by keeping the turn open until the harness's completion signal arrives for that agent, an acknowledgement that the dispatch was accepted is not that signal, and a turn that ends before it arrives has taken the forbidden third form whatever the dispatch intended.

That is the whole of the invariant, and it stays in one place. Bullet two already required "waiting on that harness's completion signal"; what it lacked was any statement of what waiting consists of, which is the single behaviour separating a conforming async dispatch from a forbidden one.

The trailer that points at the adapters names the three facts only an adapter can supply: the primitive, whether it can block, and the signal to wait on where it cannot.

### Each adapter's resume slice names its own primitive's standing

The invariant stays at the contract altitude; what each adapter adds is the harness fact its own slice owns.

`claude-code.md` and `cursor.md` state that `SendMessage` has no blocking form, name the task-notification as the signal that discharges the wait, and name `TaskOutput` as a non-wait with its cost. Cursor wraps the Claude Code agent primitive, so the two slices carry the same text — the same relationship their `spawn` slices already have, where cursor's second bullet is verbatim claude-code's.

`cline.md` and `generic.md` gain the wait bullet their own `spawn` slices already carry, phrased for a resume primitive that may return on acceptance.

### A worker outlives what it dispatched, and ends with an envelope

Two rules on `activity-worker.md`.

`outlive-dispatched-children` — while a step of this activity holds work still running outside this context, the activity is not finished. A completion signal armed on that work is delivered to the context that armed it, so a context that has ended leaves the signal with nowhere to land and the result unread.

The trigger is phrased over "work still running outside this context" rather than over nested agents, which keeps it accurate without taking a position on `spawn-agent`'s `depth-1-only` (see Open tension below).

`final-message-is-an-envelope` — this context's last emission is the envelope the activity owes, and anything emitted in its place leaves the envelope owed. The roster of shapes that are *not* an envelope stays on the orchestrator-side rule rather than being restated here, so the shape test keeps one home; the worker rule states the duty and cites it.

Two entries rather than one: the triggers differ. A context can finish every child and still end in prose, and a context can end early with children live and no report at all. Folding them would leave one of the two shapes unnamed.

### The orchestrator-side check rejects on shape

`reject-partial-worker-result` leads with the envelope test — an accepted result is one of the two tagged envelopes carrying the fields that envelope requires — then keeps the two count tests as further grounds for rejecting an envelope that is one. Interim prose is named among the shapes that are not accepted, so the rule catches the observed result rather than passing it.

`dispatch-activity` Protocol step 4's second note drops its inline restatement of the counts and branches on "not an accepted result", citing the rule. The branch then widens with the rule instead of drifting from it, and the note gains the discriminator that separates it from the note above: that note is for a context the harness reports ended, this one for a live worker whose result is unaccepted.

The two citers in `resume-worker.md` and `continue-batch.md` need no edit — after the widening, the home holds the test they attribute to it.

## Why the silence criterion is met without a heartbeat

#433 asks that a run mid-activity be distinguishable from a stalled one, and rules a heartbeat out of scope: "a heartbeat over a fire-and-forget dispatch would hide it rather than fix it." The wait discharges the criterion on its own. An orchestrator holding its turn open on a pending signal is visibly waiting on the harness surface; an orchestrator that has ended its turn is visibly idle. The two states stop looking alike once the turn is held, which is the same edit that makes the dispatch conforming.

## Alternatives weighed

**State the wait in `foreground-always` alone and leave the adapters silent.** Rejected. It is where the invariant belongs and it is now there, but an operator resolving `{operation_kind}: resume` reads the adapter slice — that is what `resolve-harness-operation` sends them to. Leaving the slice silent is the arrangement that produced four silent adapters from one correct rule.

**Restate the invariant in each adapter slice.** Rejected as the other pole: four copies of one contract, drifting, which the canon names `no-duplicated-guidance`. Each slice carries only the fact its own harness supplies and cites `foreground-always` for the obligation.

**Point `cursor.md` at `claude-code.md` rather than repeating the text.** Rejected. The adapters are self-contained rule slices a resolver selects exactly one of; a pointer would make the cursor slice unreadable on its own. The folder's existing convention is verbatim repetition where the primitive is genuinely the same, and the `spawn` slices already do it.

**Give `SendMessage` a blocking form.** Out of scope by #433's non-goals — that belongs to the harness, and `resume-is-optimisation` already holds that workflows must be correct without harness-level resume at all.

**Add a catalog entry for async dispatch with no wait.** Not taken. It would pull `anti-patterns.md` and its Creation Rules into the change, and the defect here is four adapters missing a fact, not a smell the catalog cannot already name — `structure-backed-constraints` covers a critical constraint carried by text alone.

**Fold the two `activity-worker.md` rules into one.** Rejected on trigger grounds, above.

## Canon dispositions recorded on the walk

Three entries fire on this content and are answered rather than avoided.

`no-duplicated-guidance` — `claude-code.md` and `cursor.md` carry identical resume bullets. Accepted: the adapters are self-contained rule slices a resolver selects exactly one of, and their `spawn` slices already repeat verbatim where the primitive is genuinely the same. The alternative is recorded above.

`no-rationale-in-description` — `outlive-dispatched-children`'s second sentence survives its delete test, which is the tell for rationale. Kept as a live hazard stated as an invariant, which the repo's doc-style mandate sanctions, and which #433 asks for by name: "states why a signal armed on a child cannot reach a stopped context." It is an observable property of the harness stated from the reader's own position, not an account of design intent.

`structure-backed-constraints` — `foreground-always` is marked CRITICAL and carried by text alone, and stays so. No checkpoint, condition or validate action can observe a harness turn boundary, so there is no construct to back it with; the constraint reaches the only actor that can honour it, on the surface that actor reads. Pre-existing, and not widened by this change.

## Open tension, recorded not resolved

`spawn-agent`'s `depth-1-only` says spawned sub-agents do not inherit the orchestrator's dispatch primitive. The meta workflow's `03-dispatch-client-workflow` activity binds `dispatch-activity` from a worker, so that worker does dispatch, and it is the case `outlive-dispatched-children` exists for. Read strictly, `depth-1-only` says the case cannot arise; read as a prohibition on nested *orchestrator* agents, one agent doing orchestrator-level work for a child session is within it.

`outlive-dispatched-children` is phrased over work still running outside the context, so it holds either way and asserts nothing about which reading is right. Reconciling the two is its own change.

## Acceptance criteria mapping

| Criterion from #433 | Where it lands |
|---|---|
| `claude-code.md` and `cursor.md` § resume state `SendMessage` has no blocking form, name the signal, forbid ending the turn early | Both adapters' resume slices |
| A resume whose primitive cannot block is followed by a wait, on every harness | All four adapters' resume slices |
| `TaskOutput` against a `local_agent` task named as a non-wait, with its cost | `claude-code.md` and `cursor.md` resume slices |
| `activity-worker.md` forbids stopping while dispatched children are live, and states why the signal cannot reach a stopped context | `outlive-dispatched-children` |
| A worker's final message is one of the two envelopes; interim prose rejected by name | `final-message-is-an-envelope`, and `reject-partial-worker-result` |
| `reject-partial-worker-result` rejects on envelope shape as well as counts | `dispatch-activity.md` rule text, and step 4's second note |
| A run mid-activity is distinguishable from a stalled one | Discharged by the held turn — see the section above |
