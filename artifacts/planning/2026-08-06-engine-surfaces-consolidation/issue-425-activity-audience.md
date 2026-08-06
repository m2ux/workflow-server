# Capture: issue #425 — Activity audience: the client dispatch loop runs in the orchestrator instead of a spawned worker

Body verbatim as of 6 August 2026 (filed 3 August 2026; subsumed into the engine-surfaces epic #436 as W1 and closed on 6 August 2026).

---

## Summary

The meta workflow's third activity drives the client workflow: it loops, spawning a worker for each client activity and mediating the checkpoints those workers yield. Every meta activity is handed to a spawned worker, and that one is no exception — so the agent doing the spawning is itself a spawned agent.

The harness technique that owns spawning says a spawned agent does not inherit the dispatch primitive, and that workflows must not be designed around nested orchestrator agents. One orchestrator drives all orchestrator-level work across all session levels. Nothing exempts this activity, and nothing in the corpus acknowledges that it is the exception.

Fixing it means the meta orchestrator executes that activity itself rather than dispatching for it. Beyond removing a rule violation, it removes a dispatch: on the profiled run whose startup was measured, the client-dispatch worker was the most expensive of the four setup dispatches at 165 seconds.

## Why it cannot just be executed inline today

Three rules stand between the orchestrator and its own activity, and each is absolute:

- Workflow orchestrators never call the tool that delivers an activity body. So the orchestrator has no way to read the steps it would execute.
- Orchestrators never execute activity steps or produce domain artifacts; they delegate by dispatching.
- The orchestrator's own protocol says to always dispatch a worker and never execute activity steps inline.

Absolute rules are cheap to hold and cheap to check. The reason the first one exists is worth keeping in view: an orchestrator that holds activity bodies in its own context is how the reverted walk-everything-in-one-context path grew until it overflowed. Relaxing it is safe here because the relaxation is narrow and declared, but it is a real relaxation and that is the substance of this work.

There is also no way for a definition to say who runs an activity. Activities declare their own techniques, their steps, their routing and their rules, but not their audience. The workflow above them splits techniques and rules into an orchestrator set and an activity set; an activity itself cannot say which set it belongs to.

## The fix

**An activity declares its audience.** A new activity-level field, defaulting to the worker audience so every existing activity is unchanged. This is not a new kind of schema field: the workflow-level technique sets are already server-enforced because they decide what a delivery bundles, and an activity choosing between those sets sits beside them rather than opening a new category.

**Delivery follows the declaration.** The activity-delivery tool always injects the activity-audience techniques, the activity rules, and the core worker techniques. For an activity declared to the orchestrator it injects the orchestrator-side equivalents instead, so the agent that reads it receives the operations it actually needs — including the dispatch primitive it is about to use.

**The three role rules gain one declared exception each**, naming the declaration rather than naming the activity, so the carve-out is a property of the schema and not a special case anyone has to remember.

**The meta workflow declares its dispatch activity to the orchestrator**, and the orchestrator's protocol gains the step that reads and runs it.

## Scope of change

One field on the activity schema and its generated JSON; the two injection points in activity delivery; three rule carve-outs plus the orchestrator protocol step; the meta workflow's own declaration. The activity's steps, gates, transitions and outcome are untouched — this changes who executes it, not what it does.

The walk tests that cover the meta workflow will see that activity's delivered payload change shape, and the schema reference's construct tables and enforcement-model classification gain the new field.

## Why keep the activity rather than fold the loop into prose

The cheap alternative is to delete the activity and move its loop into the orchestrator technique's protocol, where a section already describes driving the activity loop. That needs no schema change and no server change.

It should not be taken. The meta workflow exists as the structural home for orchestration logic that used to live in technique prose, and this activity is the clearest instance of that: its loop condition and its per-step gates are checkable structure, validated by the repository's expression guard and, since the batched-dispatch work, by a test that reads those gates out of the definition and evaluates them. Three control-flow faults in the batching change were caught by exactly that structure. Turning it back into prose no guard can read moves in the wrong direction.

## Acceptance criteria

- [ ] An activity can declare that the orchestrator executes it, and the default for every activity that says nothing is unchanged.
- [ ] An orchestrator-audience activity is delivered with the orchestrator technique set and rules; a worker-audience activity is delivered exactly as it is today.
- [ ] The three role rules state their exception in terms of the declaration, so no activity is named as a special case.
- [ ] The meta workflow's client-dispatch activity runs in the orchestrator, and no spawned agent applies the spawn operation.
- [ ] The schema reference documents the field in its construct tables and classifies it in the enforcement model.
- [ ] All repository guards and the full test suite pass.

## Non-goals

- **Orchestrators reading arbitrary activities.** The exception is keyed to a declaration an author makes deliberately, and the rule against an orchestrator holding activity bodies otherwise stands as written.
- **Any change to what the activity does.** Its loop, its gates, its transitions and its outcome are the same before and after.
- **Batching.** The batched-dispatch work ([#407](https://github.com/m2ux/workflow-server/issues/407), [#424](https://github.com/m2ux/workflow-server/pull/424)) touches the same activity and works within the present topology; it neither needs this nor is blocked by it.

## Investigation detail

Separated from [#407](https://github.com/m2ux/workflow-server/issues/407) while implementing it, where the same activity was edited and the violation was confirmed but left alone. The reasoning, the rule surface, and the rejected alternative are recorded under **What this work does not do** in the [batched-dispatch implementation record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-03-batched-dispatch-implementation). The 165-second dispatch comes from the [startup-cost measurement record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-workflow-startup-cost).

