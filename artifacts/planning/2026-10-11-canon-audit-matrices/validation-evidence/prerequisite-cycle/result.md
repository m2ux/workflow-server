# Prerequisite-index cycle: not run

**All four dispatched walks terminated on the same platform error before producing a reading log. The cycle has no observations, so neither acceptance judgement in the [plan](plan.md) has data.** This is not a disclosure result and is not scored as one.

## What happened

Four fresh contexts were dispatched against the scenarios and acceptance rules fixed in `bf88e1ce`, before any worker launched. Each terminated with an identical API safeguard error, `[reasoning_extraction]`, on the subagent model.

| Walk | Outcome | Output produced |
| --- | --- | --- |
| Author one | Terminated, API safeguard | No visible text |
| Author two | Terminated, API safeguard | One line of text, over nine tool calls |
| Audit one | Terminated, API safeguard | No visible text |
| Audit two | Terminated, API safeguard | No visible text |

The output column counts what the worker said, which is not what it did. Author two's single line of text sits on top of nine tool calls, among them a whole-file read of the skill entry point, bounded reads of the change-surface and canon-context sections, and a 146-line range of the command catalog. A worker's visible return understates its retrieval, and the dispatch transcript holds the rest.

The briefs were distinct only in scenario. All four closed with the same request: a complete ordered log of every read the worker performed, explicitly including unnecessary reads, empty returns and discarded searches, with nothing tidied or omitted. That is a request for the worker to surface its own process, and the error names reasoning extraction.

A control probe discriminates. One worker dispatched through the same path with a minimal brief and no self-reporting request completed normally, in three tool calls and seventeen seconds. So the dispatch path works, and the common factor among the four failures is the instruction they shared rather than the environment they ran in.

The probe does not isolate which part of that instruction is responsible, and one success is not a rate. It is enough to place the cause in the brief design.

## What this does and does not establish

The prediction recorded before dispatch — ordering holds in all four walks — stands untested. Nothing here supports or weakens it.

The structural change at `9f52a90d` and `7708825b` therefore retains exactly the standing it had: sixteen operations carry a point-of-use prerequisite index, static checks pass at those bytes, and the reasoning for the change rests on the seven earlier walks in which no operation carrying such an index failed ordering. That is correlation across prior evidence, not a live result for this revision.

The strict disclosure gate remains failed on the earlier evidence. DA-05, DA-06 and DA-07 remain untouched by this change and were never in this cycle's scope.

## Why no model substitution

The error suggests changing model, which would probably let the walks run. It was not done, for a reason that outlives this cycle: the comparison these scenarios exist to support holds the agent constant and varies the skill revision. A different model reads differently, so a clean ordering result under one would not establish that the prerequisite index produced it.

That argument is weaker than it first appears in one direction worth stating: the earlier cycle's model is not recorded in its evidence, so the comparison was already imperfect. Substituting now would add a known uncontrolled variable to an already unproven one. A run under a different model is a separate labelled experiment, not this cycle.

## The method's own exposure

This bears on more than one cycle. A coordinator cannot see a subagent's tool calls, so every walk cycle has measured retrieval by asking the worker to report its own reads. That dependency is now a live constraint on this dispatch path: the request that makes a walk measurable is the one the four walks died on.

A rerun needs the evidence gathered some other way — a worker writing receipts to files as it goes, a dispatch path that exposes tool calls to the coordinator, or a narrower reporting request that does not ask the worker to account for its discarded work. Which of those is viable is unestablished. Until one is, the walk method is blocked here for reasons that have nothing to do with the skill it is meant to test.

## Stopping

The plan's stopping rule governs an observed disclosure failure and bars an equivalent retry of one. No failure of that kind occurred, so the rule is not engaged and does not bar a rerun. This cycle is closed as not run. A rerun under the same scenarios and the same committed acceptance rules remains legitimate whenever the dispatch environment permits it.
