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

The first run of the new benchmark refused the batch at its third activity, and re-basing to **0.35** admitted it. A review sweep then found that both of those figures were inflated by the same double count (below), so the arithmetic was redone against honest numbers: the analysis run delivers **155,168 characters into one context, 133,360 of them by the end of the second activity**. At 0.35 a 200,000-token window gives 280,000 characters, so the eager payloads of that run are admitted and the headroom left over is for what the worker fetches lazily while running them — which draws down the same budget and is invisible at the moment an activity is delivered. The third sweep below found that lazy half is usually the larger one.

The value survived that correction and a third one below; the reasoning behind it did not. It stays far below the eager-bundling fraction of 0.80, which on the same arithmetic admits thirteen of fifteen activities into one context.

## What the implementation measures

`npm run bench:batch` walks a run twice — a fresh context per activity, then one context for the whole run — and reports the difference. Over the analysis run at a 200,000-token window:

| | per-activity | batched |
|---|---:|---:|
| Contexts the server met | 3 | 1 |
| Characters delivered | 206,150 | 155,168 |
| Activity payloads, in walk order | 71,233 / 79,647 / 55,270 | 71,233 / 62,127 / 21,808 |
| Server-side elapsed, best of 3 | 576 ms | 569 ms |

**Delivery collapse is 24.7% on this walk, against the 32% the investigation record cites for the same run.** Both are right about different things. The record's figure comes from a real run's delivery ledger, where the worker also fetches techniques and resources lazily across each activity and those fetches collapse too. This benchmark issues activity deliveries only, so it sees the payload collapse — 79,647 → 62,127 and 55,270 → 21,808, which is 22% and 61% by position, matching the record's "second collapses 40–45%, third 55–70%" — without the lazy-fetch collapse layered on top. The 24.7% is the floor, and the honest figure for what this script walks.

**Server-side elapsed is a wash, and that is a finding rather than a defect.** Best-of-3 gives 1.2% in the batch's favour; single walks swing ±20%. Reference delivery composes every payload in full and *then* hashes it to decide what may collapse, so a batch does slightly more server work to put fewer bytes on the wire. Nothing in the tooling claims a server-side speed-up, and the smoke test's assertion is that batching is not materially slower rather than that it is faster.

**The run duration a batch saves is the contexts it avoids.** Two, on this run. Priced at 87 seconds — the mean of the four setup dispatches of the profiled 27 July run, which ran 77, 65, 42 and 165 seconds — that is 174 seconds. The script reports it as a projection with its input named and never adds it to the measured figures, because nothing headless can observe a harness spawning an agent.

## What the review sweep found

Six faults, all fixed, and the tests that now hold each one down. Four were in the first draft of the client activity loop, where the cost of being wrong is silent: the walk still completes, having skipped a commit or redone an activity.

**The continuation fired in the iteration that created the worker.** Gates are evaluated per step against the live bag, so once the dispatch bound an identity and returned a completed activity, the continuation's gate was satisfied immediately — before the commit, and with the pointer still on the activity just finished. It would have continued that worker onto the activity it had already done. Ordering the continuation ahead of the dispatch makes the two mutually exclusive by construction.

**A terminal activity leaked its worker identity.** The loop exits on a null activity, and the release only fired on a spent batch, so a final activity with room left an identity held. Nothing continues that worker, and `end-workflow` offers a return to the loop, where the stale identity would have skipped the dispatch and continued on a stale envelope. The release now also fires when there is no next activity.

**A batch that ended untidily stalled the loop.** A worker that returned no envelope, or one the server refused because its batch turned out to be spent, left the identity held and no completed activity to release it — a loop that could neither continue nor dispatch until its iteration ceiling. The continuation now handles both itself, spawning the replacement under a new identity rather than handing the activity back to a dispatch that would advance the pointer a second time.

**The load-bearing rule was carried by rule text beside a gate that could carry it.** The rule said to continue only with room; the gate said only that an identity was held and an activity had completed. The gate now carries the condition, which makes it and the release exact complements — for a completed activity, exactly one fires. This is the same standard the mechanism applies to its own bound, and it was being applied unevenly.

**The budget double-counted eagerly bundled content.** An `activity_dispatched` size is the whole `get_activity` response, bundled techniques and resources included; their own observability events were then added again. Measured at +48% on one activity and +32% across the run, which made a nominal 280,000-character budget bind at roughly 165,000. Counted once, only lazy fetches add to an activity payload. This is what re-based the numbers above.

**A technique fetch spent an activity slot.** An out-of-band context announces itself on its first server call of any kind, and that dispatch event carries no payload size because no activity was delivered. The slot was spent anyway, so a context that had taken two activities could be refused a third with a message stating it had taken three. Slots now count only deliveries that carried a payload.

Smaller ones in the same pass: the refusal was recorded per retry rather than per limit, so the tally the settings are revised from counted how insistent a worker was; the refusal message told the orchestrator to dispatch afresh without saying the replacement needs a **new** identity, which the bound is keyed on; an out-of-range `BATCH_MAX_ACTIVITIES=0` fell back to the default of three — the loosest setting and the opposite of what an operator writing zero means — and is now clamped to one, which is batching switched off; and the corpus claim that the bound "cannot be talked past" overstated it, since the delivery scope is the caller's own unauthenticated `agent_id`.

The sweep also caught that the corpus branch was eight commits behind its own branch tip, so the pull request would have reverted three other merged changes including a live anti-pattern entry. Merged rather than rebased, in the pattern the branch history already uses.

## What a second sweep found

A claim-verification pass against the running server, and a mutation pass that applied 52 single-line changes and re-ran every survivor against the full suite. The mutation score was 35 killed to 17 surviving; every survivor named here is now dead.

**The recovery corrupted the session.** The fix for the stalled-loop fault above handed a failed continuation back to the dispatch step, and both advance the session pointer — so a failed continuation advanced twice onto the same activity, and the second advance records that activity exited and complete before a worker has walked a step of it. Measured live: the activity came back simultaneously current and completed, with only a misdirected warn-only validation string as a signal, and every later reader of the session believing it. The continuation now owns getting a worker onto what it advanced to, spawning the replacement itself.

This is the second fault introduced by fixing the first. Both were in the recovery path, and both were invisible to a walk that never fails — which is the argument for the loop-gate test being about state rather than about a happy path.

**The refusal had no carrier.** The corpus told the orchestrator to act on the worker reporting a refusal, and the corpus defines exactly two tagged envelopes, neither of which can say that. The recovery worked only by accident — the identity happened to be null — while the contract described a signal that does not exist. It now keys on an envelope that is not one of the two, which the partial-result rule already covers.

**The bound was expressed twice and drifted at the boundary.** The refusal admits a batch sitting exactly on its budget; `may_continue` tells it to continue. That pairing is deliberate, and flipping either operator passed the whole suite because they were separate expressions of one comparison. They now share one reading of a scope's standing, and a test asserts the complement across the boundary rather than either side of it.

**The benchmark's accounting was unreconciled with the server's.** The benchmark counts deliveries with its own copy of the rule — which is exactly how one double count got into both at once. Injecting that double count into the benchmark alone moved the headline saving by eight points with the suite green. It now counts with the server's own `deliveredChars` as its only figure, so no second implementation is left for a test to reconcile.

**Three figures were wrong, each stated in more than one place.** The double count inflates a run of three by **70.2%**, not 32% — the 32% was the *collapse* figure from the investigation record, a different quantity, and 70% is the only value consistent with the +48% single-activity figure and the 164,540 bind point already quoted. The eager fraction of 0.80 admits **thirteen** of fifteen activities, not nine. And the per-dispatch spawn cost is **87 seconds**, the mean of the four measured setup dispatches of 77, 65, 42 and 165 — 41 was a token count read as a duration, and it made the projected saving 82 seconds where the measurement gives 174.

Smaller ones: the smoke test's floor was 5% against a measured 24.7%, so a regression halving the saving passed; its projected-seconds assertion was tautological over a hard-coded constant; the benchmark's collapse field under-reports tenfold because payload collapse never emits an `unchanged` event; and the reported headroom, the budget floor, the dedupe's context key and the limit reported when both bind were each unpinned.

### What is known and stated rather than fixed

- **The loop-gate test models one bag per iteration.** At runtime `worker_result` is rewritten mid-iteration by the gate path, so the test checks gate wiring rather than the full sequence. Its value is in the wiring — that is where four of the six faults were — but it should not be read as a sequence test.
- **A batch surviving a real checkpoint onto its next activity has no end-to-end walk.** The replay key is unit-covered and the corpus contract is explicit, but the yield → respond → resume → advance → take-next-activity hop under one identity is asserted nowhere over the server.
- **Server-side elapsed does not reproduce.** Best-of-three lands anywhere from 8% against the batch to 5% for it across runs; the character figures are bit-identical every time. The tooling now says which is which.
- **The installed vitest is 1.6.1 against a declared `^4.1.10`**, resolved from the parent checkout. Pre-existing and outside this change, but every figure here was measured on 1.6.1.

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

## What the third and fourth sweeps found

The third pass read the sealed session records rather than the benchmark, and the fourth swept prose for references a reader cannot resolve. Between them they corrected the calibration's premise and one defect.

**The calibration had been reading the smaller half.** `bench:batch` never fetches a technique or resource lazily, so its figure is the eager floor rather than what a batch accumulates. Across 112 real worker contexts, one activity costs a median 74,109 characters once its lazy fetches are counted — 90th percentile 182,642, maximum 261,827. So the claim that the cap does the routine work and the budget catches unusually heavy runs was the wrong way round for the main workflow, where two real runs reach the budget after two activities. Both cases are wanted, and which one binds is now stated per workflow: the budget on heavy client activities, the cap on the setup sequence whose activities cost 33,000 to 154,000, and proportionally for a smaller declared window.

**No session on disk would be refused.** All 67 files walked, 124 state nodes including nested children: every worker scope sits at exactly one distinct activity, and the two above that are the session's own agent. Identities were reused 35 times, always for the same activity — which is what the already-taken carve-out serves.

**The orchestrator's own bullet dropped a clause the gate carries.** It said to continue on `batch_may_continue` alone, omitting the non-null next-activity requirement, which on a terminal activity reads as continue the worker onto nothing. The same fault the structure had already been fixed for, still live in the prose an orchestrator reads.

**Two review classes gained canon**, since nothing stopped either recurring: a reference that does not resolve to one source, and prose delivered before the framework that resolves references exists. The second carries a guard, because a stance nothing checks is the shape of constraint the canon's own principle 9 rejects — and that guard promptly refused a first attempt at citing the rule homes from the bootstrap text, which was the form its own entry forbids there.

**The loop is walked, not only gated.** The gate test evaluates each gate against one bag and cannot see `worker_result` being rewritten mid-iteration, which is the shape of both faults that reached review. A second test reads the loop body from the definition and walks iterations; reconstructing both faults as mutations, both fail it. Writing it corrected the invariant — the pointer advances once per activity, not per iteration, because an iteration that only answers a gate must not advance.

**Figures corrected across the passes:** the double count inflates a run of three by 70%, not 32%; the eager fraction admits thirteen of fifteen, not nine; the per-dispatch spawn cost is 87 seconds, the mean of 77, 65, 42 and 165, where 41 was a token count read as a duration; and the benchmark's own figure moved to 155,168 when two corpus bumps added 469 characters to every full activity payload. The establishment-to-collapse ratio is roughly two to four times, not five to eight, once the token figures are counted once per response.
