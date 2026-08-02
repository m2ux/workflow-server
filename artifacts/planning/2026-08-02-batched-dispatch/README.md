# Batched dispatch — investigation record

Supporting record for the batched-dispatch issue, which was separated from the session-presets epic ([#401](https://github.com/m2ux/workflow-server/issues/401)) on 2 August 2026 after a fourth analysis loop showed it is a dispatch-time mechanism rather than a property fixed at session creation.

The design decisions and their supersession history live with the epic they came from: [session-presets deep-dive decision record](../2026-08-02-session-presets-consolidation/deep-dive-decisions.md), decisions 20, 21, and 23 through 27. The token and timing baselines live in the [startup-cost measurement record](../2026-08-02-workflow-startup-cost/README.md).

## How the idea arrived

The epic originally proposed reviving a "solo" walk — one agent holding an entire workflow in a single context — gated behind a computed cost estimate. Three loops of analysis cut that back: first to naming one workflow eligible with no model at all, then to the observation that the reverted solo path had never been about the setup walk in the first place. The generalisation to *many activities per worker, with a tunable bound* came from the owner, and it subsumes solo entirely: solo is the degenerate case where the batch is everything and the worker is the orchestrator.

## What the measurements say

**The setup walk decomposes exactly.** The five worker ledgers of the profiled 27 July run sum to the recorded total, so the split is not an estimate. The four setup workers cost 307,272 tokens of fresh context: roughly 272,000 is context establishment — system prompt, project instructions, tool schemas, paid afresh per worker — and only 116,797 bytes, about 29,000 tokens, is delivered workflow content.

| Worker | Activity | Cache-write | Delivered content |
|---|---|---:|---:|
| 1 | discover-session | 99,742 | 5,095 B |
| 2 | initialize-session | 67,421 | 45,788 B |
| 3 | resolve-target | 59,620 | 27,383 B |
| 4 | dispatch-client-workflow | 80,489 | 38,531 B |
| | **setup walk total** | **307,272** | **116,797 B** |

Collapsing four dispatches into one leaves one establishment plus all the content: **roughly 110,000 tokens against 307,000, a saving near 65%.** The second clean run in the baseline set gives 60–66% by the same method, independently.

**The payoff is lopsided toward respawns, not dedupe.** On the best measured run of three activities the delivery ledger collapse saves about 23,000 tokens, while skipping two respawns saves 120,000 to 200,000. Batching is five to eight times more about not re-paying the harness baseline than about content collapsing — so the mechanism loses most of its value, while keeping all of its risk, if resuming a paused worker does not work.

**Delivery collapse by position in the batch.** The first activity pays full. The second collapses about 40–45%, the third about 55–70%. Whole runs of three collapse 32% (the analysis run through the middle of the main workflow) and 40% (the post-implementation run) — the two best candidates measured.

**Two independent routes to the same limit.** One context walking all fifteen activities of the main workflow would hold 937,121 characters of workflow definition — about 234,000 tokens before a line of code is read, exceeding a typical window on definitions alone. Counting delivery-ledger entries the same way puts the historical overflow, which stopped the earlier solo attempt at roughly 93 entries, at three to four of today's activities. The byte count and the entry count agree.

## What bounds a batch

The limit is server-enforced at delivery: a cumulative budget per worker context, refusing to hand over the next activity once accumulated delivery passes it, backed by a hard cap of three activities.

Both halves are needed. The existing per-delivery budget arithmetic can be made cumulative easily — the mid-batch signal already exists as a scope-only dispatch check, and the per-delivery sizes are already recorded as history events carrying the agent identity, with the summation already written in a benchmark script. But its headroom fraction is calibrated for a different question, and applied unchanged it would admit nine of fifteen activities into one context. The batch budget needs its own, much smaller fraction.

The cap covers what a byte count cannot see: the harness baseline the server never delivers, the code the worker reads, the artifacts it drafts, and context degradation across a long walk. Those are the things that actually overflowed the agent last time.

Prose-only eligibility is ruled out by the project's own design principle that critical constraints are backed by structure rather than rule text — and by the earlier failure, where the solo path had no predicate at all.

## What makes a failed resume survivable

The batched worker must report each activity as it finishes, rather than deferring its transitions to the end of the batch. With per-activity reporting, a failed resume costs one activity: a fresh worker picks up the session's current activity, takes full delivery, and re-crosses already-answered gates silently, because recorded gate responses are keyed per activity rather than per agent. With deferred reporting the session cursor goes stale, the whole batch is redone, and the worker is instructed to stop when the pointer disagrees with what it was handed.

So relaxing the rule forbidding a worker from asking for its next activity is a requirement of the mechanism, not a convenience it happens to need.

## Where batches fit in the main workflow

Thirteen of fifteen activities carry a gate, and the two that do not are not adjacent — so there is no gate-free run of two. Batching removes respawns, not pauses.

The good candidates are the analysis runs in the middle of the walk, whose work is bounded and whose working context is shared: the implementation-analysis through assumptions-review run, and the post-implementation run from the coding audit through validation. The activities that should stay one to a worker are the opening activity (largest single delivery, ten gates, and it creates the worktree mid-walk), implementation, submission for review, and research — each either unbounded in what it reads or changing the working context underneath the batch.

## Risks this mechanism introduces

- **Context degradation has no server-side detector.** A worker that has silently lost content mid-batch and still asks for reference delivery receives unreadable markers for content it no longer holds. The existing escape hatch depends on the agent noticing. Per-activity dispatch makes this impossible by construction.
- **Failure blast radius grows** with the number of activities whose artifacts are not yet committed — which is why the commit boundary is preserved rather than deferred.
- **Mid-batch arrivals are currently recorded as fresh dispatches**, because the discriminator keys on activity as well as agent. Left alone this corrupts the very saving measurement the earlier re-dispatch work is judged by, and any limit later keyed off it. The scope-only predicate already exists beside it.
- **Cost attribution collapses** unless the usage record can carry a figure per activity within one dispatch — the resolution the batch-size calibration depends on.
- **Abandoned batches leave ledger entries behind permanently**, since deliveries merge and are never pruned.

## Enabler

The premise that resuming a worker is cheap holds only because the per-agent delivery ledger shipped. Before it, resumed workers were forced into full delivery: one measured run paid over a million tokens across twelve resumes, about a quarter of the whole run.
