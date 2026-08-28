# What the measurements say about how much work to hand over at a time

Companion to [README.md](README.md), for [#523](https://github.com/m2ux/workflow-server/issues/523).
Figures taken on 2026-08-28 from the committed profiling records and the server's own delivery counters.

**On the reliability of what follows.** The independent review of this area was cut short when an account
spending limit was reached, so everything here rests on a single unreviewed pass. It reproduces against
the files cited, but the first two figures below are what decide the design, and they deserve measuring
again before anyone builds against them.

## The question

The obvious way to build a program that drives a workflow is to have it hand out one step at a time: send
only what the step needs, and nothing is wasted. The measurements say that is the wrong shape, and by a
wide margin. Understanding why needs three costs put on the same footing.

Some vocabulary first. When an agent takes a turn, the model re-reads the accumulated conversation before
producing anything new; that re-reading is billed, and it is the dominant term. Establishing a brand new
agent context is a separate, larger cost paid before any workflow content arrives at all. And the server
avoids repeating content by recognising bytes it has already sent, which only works while a payload
depends on the definitions rather than on the state of the run.

## What one exchange with an agent costs

From `.engineering/artifacts/planning/2026-08-02-workflow-startup-cost/runs-profiled.txt`, nine real
runs. Dividing the re-read total by the number of turns gives the cost of one exchange:

| Run | Re-read tokens | Turns | Per exchange |
|---|---|---|---|
| 1 | 3,962,088 | 72 | 55,029 |
| 2 | 4,906,770 | 79 | 62,111 |
| 3 | 7,260,057 | 95 | 76,422 |
| 4 | 4,475,812 | 78 | 57,382 |
| 5 | 5,022,533 | 72 | 69,757 |
| 6 | 2,555,316 | 89 | 28,712 |
| 7 | 6,155,596 | 109 | 56,473 |
| 8 | 4,070,705 | 82 | 49,643 |
| 9 | 8,218,394 | 113 | 72,729 |
| **Mean** | | | **≈ 58,700** |

Converted to the same units as fresh content, one exchange costs about what **18,800 characters** of new
material costs. The average technique, fully composed, is **5,275 characters**. So paying for an exchange
in order to deliver one step's worth of content loses roughly **3.6 to 1**.

## What a fresh agent context costs

Between 23,000 and 42,000 tokens before any workflow content arrives, per
`.engineering/artifacts/planning/2026-08-02-batched-dispatch/README.md:75`. Two agents on the profiled
runs did almost nothing but be established, and their figures bear this out: one at 23,328 and one at
28,626.

That is worth five to nine exchanges with an agent that already exists. Avoiding one new context is
therefore the single most valuable thing available.

## Why re-reading dominates

On the first run, re-reading accounted for 3,962,088 tokens against 402,586 for new material — a ratio
near ten to one, and between seven and twelve to one across the nine. Once each is priced, the re-reading
of accumulated conversation and the new content in a turn come out the same order of magnitude. So
halving what is sent while doubling how often it is sent is, at best, no gain.

The trap is that the term which grows under a one-step-at-a-time design is the one the headline figures
leave out. Every reply an agent receives stays in its conversation and is re-read on every subsequent
turn.

## The arithmetic against one step at a time

The twelve-activity reference path carries **226 steps**, against today's twelve deliveries. Handing out
one step per exchange adds around 214 exchanges:

```
214 exchanges × ~4,700 tokens equivalent  ≈ 1.0M
the most that could be saved on delivery  ≈ 125K
```

**A loss of roughly 8 to 1.**

Ranked by weight, the costs are: how many fresh agent contexts are established, then how many exchanges
take place, then how many bytes are sent. That is the reverse of what the existing benchmarks measure —
`run-token-benchmark.ts`, `run-dispatch-benchmark.ts`, `run-batch-benchmark.ts` and `run-profile.ts` all
price bytes, and none of them prices an exchange. A first experiment with one-step delivery would
therefore appear to succeed.

## There is nothing wasted to reclaim

It is tempting to assume the current delivery sends steps that never run. It does not. The server's own
delivery log over the twelve-activity path:

| Reading | Count |
|---|---|
| Included in full | 65 |
| Withheld: condition not yet answerable | 51 |
| Withheld: no value produced yet | 30 |
| Withheld: condition false | 3 |
| **Steps that will not run but were sent anyway** | **0** |
| Technique steps in total | 149 |

The selection rule is at `src/tools/workflow-tools.ts:1199-1217`: each step's condition is evaluated
against the values as they stand when the activity opens, and a step is included only if the answer
holds. So sending less per delivery reclaims nothing, because nothing is being wasted.

## Where the saving actually is

The 51 conditions that could not be answered at delivery time are the opportunity. They are unanswerable
only because the values they depend on are produced by earlier steps of the same activity, and those
values do not reach the session until the activity ends. A runner that holds the position and the values
as it goes can answer each one at the moment it becomes answerable, and hand over the next unbroken run
of steps in a single delivery.

| | Exchanges saved | Tokens |
|---|---|---|
| Observed on the recorded walk | 23 | ~108K |
| The remainder, in principle | 84 | ~395K |

On top of that, roughly **33,000 characters of every delivery** are rules and techniques whose only
subject is how to drive a workflow, and they stop being needed.

So the saving comes from **fewer, larger, better-timed deliveries** — not from finer ones.

## What follows from this

1. **The loop belongs with the agent doing the work, not the orchestrator.** An exchange with a worker
   averages 58,700 re-read tokens; with an orchestrator the range is 66,620 to 111,681, which is 1.4 to
   1.9 times dearer.
2. **A delivery must be worth at least four steps.** One exchange against 18,800 characters, one
   technique against 5,275. One step per exchange is not a candidate. The natural unit is the unbroken run
   from where the run has got to up to the first condition that cannot yet be answered.
3. **A reply travels with the next request.** A separate call for reporting a result doubles the exchange
   count again.
4. **Asking an agent to do something is a turn in a context that already exists, never a new one.** There
   are 611 technique steps across 117 activities, about 5.2 per activity; starting a fresh context for
   each would multiply the dominant cost fivefold. This also means nothing is gained in isolation — the
   same context sees every technique of an activity, exactly as now. What is gained is enforcement and a
   reliable record of position.
5. **None of this applies between the runner and the server.** These figures price exchanges with an
   agent. A local program calling a local server may be as chatty as it likes, and that is what makes the
   whole arrangement work.

## What this does not touch

Around 31% of a measured 4.1 million token run went on establishing agent contexts. The server has no
influence over that: it never starts a context — the orchestrator uses the harness's own facility, and
the server only observes — and the protocol only allows a client to call the server, never the reverse.

An agent must still stop when a user has to decide something, because only the orchestrator can reach a
person. Moving decisions inside the server changes who records that a question is outstanding, not who
asks it. So this makes hand-offs **cheaper, not fewer**.

Making them fewer is a matter of the corpus. On the measured run, seven of eight user decisions arrived
mid-activity, with 26, 14, 14, 11, 10, 3 and 1 steps still to run behind them, and
`scripts/check-checkpoint-entry.ts` covers only the first step. A guard covering mid-activity decisions
with many steps behind them would attack that 31% directly, and needs none of this work.

## Accounting for usage

Usage is recorded per activity. The call requires the activity's name and records the change since the
last figure for that hand-off (`src/tools/workflow-tools.ts:1733-1787`), and the schema at `:65-75` notes
that agents cannot measure themselves and must omit the call entirely when the harness reported nothing,
so "nothing was reported" stays distinguishable from "measured zero".

A per-step figure is therefore unreachable: a step carried out inside a live agent context has no
harness-reported figure and the server cannot invent one. Delivery, by contrast, is already counted per
step, per technique and per resource (`:1507-1535`, consumed by `src/utils/batch.ts:98-123`).

So a runner neither gains nor loses anything on usage accounting — **as long as hand-offs stay aligned to
activities**. If a hand-off becomes a run of steps that can cross an activity boundary, the required
activity name, the reconciliation that finds activities with no usage recorded, and the per-activity
elapsed-time spans all stop being well defined at once.

## One thing to fix in continuous integration

Nothing currently gates on how many exchanges take place, and the token benchmark's 1% threshold is on
bytes alone. If the delivery grain is going to be defended, an exchange has to be priced, and none of the
four existing benchmarks does it.
