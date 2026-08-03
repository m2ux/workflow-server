# Batched dispatch — implementation record

Supporting record for the batched-dispatch work against [#407](https://github.com/m2ux/workflow-server/issues/407). The measurements, the case for the mechanism, and the risk register live in the [investigation record](../2026-08-02-batched-dispatch/README.md); this one records what was built, the decisions taken while building it, and the numbers the implementation itself produced.

## Where the bound lives, and why it needed no new state

A batch is not declared anywhere. It **is** the run of activities one delivery scope takes delivery of, which the session history already records: `activity_dispatched` carries the scope and the payload size, and the content-fetch events carry the techniques and resources delivered alongside. So both halves of the bound are a derived predicate over history — no session-state field, no schema migration, and no way for a worker to leave the bound behind by omitting a parameter.

Enforcement sits in `get_activity` before composition runs, so a refusal costs nothing: the payload is never assembled, let alone delivered.

## The two carve-outs, and why each is load-bearing

**An activity the scope already holds is always served.** Thirteen of the main workflow's fifteen activities carry a gate. A worker resuming after one asks for the payload it is still sitting on, and refusing that would end every batch at its first gate — the mechanism would never reach its second activity.

**The session's own agent is unbounded.** `deliveryScope` falls back to `state.agentId` when no `agent_id` is passed, so a scope equal to the session agent is the context that owns the whole walk by construction — which is what `contextMode: 'persistent'` describes. Bounding it would break the persistent solo topology that `bench:token` measures and that the reference-delivery suite walks. The issue says "a cumulative budget per worker context", and this is what draws the line at *worker*: a batch bounds a subordinate context, not the context that is the session.

This was the one interpretive decision the issue did not settle. The alternative — bounding every multi-activity scope — is stricter but retires persistent solo sessions as a side effect, which is a separate call.

## The headroom fraction was set from measurement, twice

The starting value was 0.20, on the arithmetic in the investigation record: 937,121 characters across fifteen activities averages some 62,000 an activity, so three activities ought to sit near 187,000 characters, and 0.20 of a 200,000-token window gives 160,000.

The first run of the new benchmark refused the batch at its third activity, and re-basing to **0.35** admitted it. A review sweep then found that both of those figures were inflated by the same double count (below), so the arithmetic was redone against honest numbers: the analysis run delivers **154,699 characters into one context, 132,891 of them by the end of the second activity**. At 0.35 a 200,000-token window gives 280,000 characters, so the run is admitted with the activity **cap** closing it, and some 125,000 characters remain for what the worker fetches lazily while running those activities — which draws down the same budget and is invisible at the moment an activity is delivered.

That is the intended relationship between the two limits: the cap does the routine work, and the budget catches a run of unusually heavy activities. It stays far below the eager-bundling fraction of 0.80, which on the same arithmetic admits nine of fifteen activities into one context. The value survived the correction; the reasoning behind it did not, and is now the reasoning above.

## What the implementation measures

`npm run bench:batch` walks a run twice — a fresh context per activity, then one context for the whole run — and reports the difference. Over the analysis run at a 200,000-token window:

| | per-activity | batched |
|---|---:|---:|
| Contexts the server met | 3 | 1 |
| Characters delivered | 204,743 | 154,699 |
| Activity payloads, in walk order | 70,764 / 79,178 / 54,801 | 70,764 / 62,127 / 21,808 |
| Server-side elapsed, best of 3 | 576 ms | 569 ms |

**Delivery collapse is 24.4% on this walk, against the 32% the investigation record cites for the same run.** Both are right about different things. The record's figure comes from a real run's delivery ledger, where the worker also fetches techniques and resources lazily across each activity and those fetches collapse too. This benchmark issues activity deliveries only, so it sees the payload collapse — 79,178 → 62,127 and 54,801 → 21,808, which is 42% and 60% by position, matching the record's "second collapses 40–45%, third 55–70%" — without the lazy-fetch collapse layered on top. The 24.4% is the floor, and the honest figure for what this script walks.

**Server-side elapsed is a wash, and that is a finding rather than a defect.** Best-of-3 gives 1.2% in the batch's favour; single walks swing ±20%. Reference delivery composes every payload in full and *then* hashes it to decide what may collapse, so a batch does slightly more server work to put fewer bytes on the wire. Nothing in the tooling claims a server-side speed-up, and the smoke test's assertion is that batching is not materially slower rather than that it is faster.

**The run duration a batch saves is the contexts it avoids.** Two, on this run. Priced at 41 seconds — the mean per-dispatch spawn cost across the four setup workers of the profiled 27 July run, whose most expensive ran 165 seconds — that is 82 seconds. The script reports it as a projection with its input named and never adds it to the measured figures, because nothing headless can observe a harness spawning an agent.

## What the review sweep found

Six faults, all fixed, and the tests that now hold each one down. Four were in the first draft of the client activity loop, where the cost of being wrong is silent: the walk still completes, having skipped a commit or redone an activity.

**The continuation fired in the iteration that created the worker.** Gates are evaluated per step against the live bag, so once the dispatch bound an identity and returned a completed activity, the continuation's gate was satisfied immediately — before the commit, and with the pointer still on the activity just finished. It would have continued that worker onto the activity it had already done. Ordering the continuation ahead of the dispatch makes the two mutually exclusive by construction.

**A terminal activity leaked its worker identity.** The loop exits on a null activity, and the release only fired on a spent batch, so a final activity with room left an identity held. Nothing continues that worker, and `end-workflow` offers a return to the loop, where the stale identity would have skipped the dispatch and continued on a stale envelope. The release now also fires when there is no next activity.

**A batch that ended untidily stalled the loop.** A worker that returned no envelope, or one the server refused because its batch turned out to be spent, left the identity held and no completed activity to release it — a loop that could neither continue nor dispatch until its iteration ceiling. The continuation now returns a null identity on either, and the dispatch that follows it in the body spawns the replacement in the same iteration.

**The load-bearing rule was carried by rule text beside a gate that could carry it.** The rule said to continue only with room; the gate said only that an identity was held and an activity had completed. The gate now carries the condition, which makes it and the release exact complements — for a completed activity, exactly one fires. This is the same standard the mechanism applies to its own bound, and it was being applied unevenly.

**The budget double-counted eagerly bundled content.** An `activity_dispatched` size is the whole `get_activity` response, bundled techniques and resources included; their own observability events were then added again. Measured at +48% on one activity and +32% across the run, which made a nominal 280,000-character budget bind at roughly 165,000. Counted once, only lazy fetches add to an activity payload. This is what re-based the numbers above.

**A technique fetch spent an activity slot.** An out-of-band context announces itself on its first server call of any kind, and that dispatch event carries no payload size because no activity was delivered. The slot was spent anyway, so a context that had taken two activities could be refused a third with a message stating it had taken three. Slots now count only deliveries that carried a payload.

Smaller ones in the same pass: the refusal was recorded per retry rather than per limit, so the tally the settings are revised from counted how insistent a worker was; the refusal message told the orchestrator to dispatch afresh without saying the replacement needs a **new** identity, which the bound is keyed on; an out-of-range `BATCH_MAX_ACTIVITIES=0` fell back to the default of three — the loosest setting and the opposite of what an operator writing zero means — and is now clamped to one, which is batching switched off; and the corpus claim that the bound "cannot be talked past" overstated it, since the delivery scope is the caller's own unauthenticated `agent_id`.

The sweep also caught that the corpus branch was eight commits behind its own branch tip, so the pull request would have reverted three other merged changes including a live anti-pattern entry. Merged rather than rebased, in the pattern the branch history already uses.

## The corpus mechanism

The orchestrator holds no batch state. The worker reads `_meta.batch.may_continue` and carries it out on its `activity_complete` envelope as `batch_may_continue`; the loop continues that worker onto the next activity when it is true and releases the identity when it is false. So the server owns the bound, the worker relays it, and the orchestrator does no sizing and no reasoning about context load.

`continue-batch` is the activity-boundary counterpart of `resume-worker`'s gate-boundary continuation: it advances the session pointer and continues the held worker, where `resume-worker` continues it on the activity it already holds. Splitting them by boundary keeps each one's capability a single sentence, and the split has a measured reason — a boundary crossed in seconds resumes against a warm cache, a boundary waiting on a person does not, and batching across the latter saves nothing because the re-warm is paid either way.

### The commit boundary decided the shape

The issue asks for two things that pull against each other: workers may ask for their next activity, and every activity boundary still commits and pushes before transitions are evaluated. That commit is explicitly denied to workers.

A worker calling `next_activity` itself would cross the boundary without the orchestrator, so the commit would be skipped — the second requirement would fail to buy the first. What the mechanism actually needs is for the worker to keep going rather than terminate, and that is a second `get_activity` under the identity it already holds, after the orchestrator has committed and advanced the pointer. So `worker-control-plane-ban` stands and gains a sentence saying where asking for the next activity does happen; the rule that changed is `verify-dispatched-activity`, which now checks against the activity the current continuation bound rather than the one the run opened with.

### Per-activity reporting is what makes a failed resume cheap

`one-activity-at-a-time-in-a-batch` states the requirement and its consequence together: the pointer tracks where the walk actually is, so a failed resume costs one activity. The replacement worker takes the current activity in full and re-crosses answered gates silently, because `checkpointResponses` is keyed `activityId-checkpointId` with no agent component and `yield_checkpoint` replays any prior response for the same activity.

## What this work does not do

**The client dispatch loop still runs in a spawned worker.** Meta binds `workflow-engine::activity-worker` to every one of its activities, so `03-dispatch-client-workflow` — whose loop applies `dispatch-activity` and therefore `spawn-agent` — executes inside a spawned agent, which `depth-1-only` says holds no dispatch primitive. The defect is real and predates this work.

Fixing it means the meta orchestrator executes that activity itself, and there is no construct in the corpus that says so: activity audience is not declarable, and an orchestrator reading its own activity body runs into `no-get-activity-from-orchestrator`. That is a new schema construct plus a carve-out in a load-bearing rule — a design call that belongs with the owner and is separable from batching, which works within the existing topology. Left for a follow-up rather than decided here.

**The re-measurement against the July baselines is post-merge.** It needs real runs with real agents; the headless benchmark and the smoke test are what can be asserted before then, and the conservative settings are revised from `batch_refused` counts and per-activity usage rows once runs exist.

## Where things are

| Concern | Home |
|---|---|
| The bound, as a derived predicate | `src/utils/batch.ts` |
| Enforcement at delivery, and `_meta.batch` | `src/tools/workflow-tools.ts`, `get_activity` |
| Policy and its two settings | `src/config.ts` |
| The refusal event | `src/schema/state.schema.ts`, `batch_refused` |
| Cost per activity | `src/tools/workflow-tools.ts`, `record_usage` and `projectUsage` |
| The walk, and the arithmetic | `tests/e2e/batched-dispatch.test.ts`, `tests/batch-bound.test.ts` |
| The loop's control flow, read out of the definition | `tests/batch-loop-gates.test.ts` |
| Duration and collapse, measured | `scripts/run-batch-benchmark.ts`, `tests/e2e/batch-duration-smoke.test.ts` |
| The mechanism, in definitions | `workflows/meta/techniques/workflow-engine/continue-batch.md` and the loop in `03-dispatch-client-workflow.yaml` |
| The model, documented | `docs/dispatch_model.md` |
