# Prerequisite-index cycle: not run

**All four dispatched walks terminated on the same platform error before producing a reading log. The cycle has no observations, so neither acceptance judgement in the [plan](plan.md) has data.** This is not a disclosure result and is not scored as one.

## What happened

Four fresh contexts were dispatched against the scenarios and acceptance rules fixed in `bf88e1ce`, before any worker launched. Each terminated with an identical API safeguard error, `[reasoning_extraction]`, on the subagent model.

| Walk | Outcome | Output produced |
| --- | --- | --- |
| Author one | Terminated, API safeguard | None |
| Author two | Terminated, API safeguard | One line, before any read |
| Audit one | Terminated, API safeguard | None |
| Audit two | Terminated, API safeguard | None |

Three distinct scenario briefs hit the same error, and the one walk that began work died at its first step, so the cause sits with the dispatch environment rather than with any scenario, the skill or the briefs.

## What this does and does not establish

The prediction recorded before dispatch — ordering holds in all four walks — stands untested. Nothing here supports or weakens it.

The structural change at `9f52a90d` and `7708825b` therefore retains exactly the standing it had: sixteen operations carry a point-of-use prerequisite index, static checks pass at those bytes, and the reasoning for the change rests on the seven earlier walks in which no operation carrying such an index failed ordering. That is correlation across prior evidence, not a live result for this revision.

The strict disclosure gate remains failed on the earlier evidence. DA-05, DA-06 and DA-07 remain untouched by this change and were never in this cycle's scope.

## Why no model substitution

The error suggests changing model, which would probably let the walks run. It was not done, for a reason that outlives this cycle: the comparison these scenarios exist to support holds the agent constant and varies the skill revision. A different model reads differently, so a clean ordering result under one would not establish that the prerequisite index produced it.

That argument is weaker than it first appears in one direction worth stating: the earlier cycle's model is not recorded in its evidence, so the comparison was already imperfect. Substituting now would add a known uncontrolled variable to an already unproven one. A run under a different model is a separate labelled experiment, not this cycle.

## Stopping

The plan's stopping rule governs an observed disclosure failure and bars an equivalent retry of one. No failure of that kind occurred, so the rule is not engaged and does not bar a rerun. This cycle is closed as not run. A rerun under the same scenarios and the same committed acceptance rules remains legitimate whenever the dispatch environment permits it.
