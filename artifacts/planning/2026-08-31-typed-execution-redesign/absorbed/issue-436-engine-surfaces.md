## Summary

Two files reach further than anything else in the corpus. The workflow-engine group's container declares rules that merge into every operation in the group, and the shared conduct contract reaches every agent in every workflow — so anything written into either is delivered on every dispatch, in every run, to agents who mostly cannot act on it. A third file, the orchestrator's own entry technique, is what the agent driving a session reads before it does anything at all.

Two things are wrong on those surfaces. Nearly half the rule bodies do not constrain work, they describe it: which tool to call, in what order, what to do when a call comes back wrong, how to choose between two delivery forms. And an activity has no way to say who executes it, so the one activity in the corpus that has to run in the orchestrator is handed to a spawned worker instead, in breach of three rules that have no way to make an exception for it.

Both are the same question asked of different constructs — who is this content for, and which construct owns it — and both are answered by editing the same six files. This epic covers one work item per gap.

## The two gaps

**An activity cannot say who runs it.** The meta workflow's third activity drives the client workflow: it loops, spawning a worker for each client activity and mediating the checkpoints those workers yield. Every meta activity is handed to a spawned worker, and that one is no exception — so the agent doing the spawning is itself a spawned agent. The technique that owns spawning says a spawned agent does not inherit the dispatch primitive, and that one orchestrator drives all orchestrator-level work across all session levels. Nothing exempts this activity, and nothing in the corpus acknowledges that it is the exception. It cannot simply be run in place either, because three absolute rules stand between the orchestrator and any activity body, and an activity has no field with which to declare that it is written for the orchestrator rather than for a worker. On the profiled run whose startup was measured, this dispatch was the most expensive of the four setup dispatches, at 165 seconds.

**Procedure is written where constraints belong.** Swept against the catalogue entry that names this — a rule reading as an instruction to perform work rather than a constraint on it — 23 of the 47 rule entries across the engine group and the conduct contract fire. The rules are not wrong about the behaviour; they are in the wrong section, and in one case they restate a protocol phase that already exists. Five of the container's ten rules are procedure, which is the shape of the file rather than the carelessness of whoever wrote them: a container carries a Capability section and a Rules section and no Protocol, so a procedure belonging to the group as a whole has nowhere local to go. That also means trimming the prose is not the fix — each procedure needs a real destination, and the framework already offers three: a resource for criteria a reader consults, a technique Protocol for work one operation performs, and an activity step for sequencing across operations.

## The work

**W1 — An activity declares its audience.** A new activity-level field, defaulting to the worker audience so every existing activity is unchanged. Delivery follows the declaration: the activity-delivery tool injects the orchestrator-side technique set and rules for an orchestrator-audience activity instead of the worker-side ones, so the agent that reads it receives the operations it is about to use — including the dispatch primitive. The three role rules gain one declared exception each, naming the declaration rather than naming the activity, so the carve-out is a property of the schema and not a special case anyone has to remember. The meta workflow declares its dispatch activity to the orchestrator, and the orchestrator's protocol gains the step that reads and runs it. The activity's steps, gates, transitions and outcome are untouched — this changes who executes it, not what it does.

**W2 — Each procedure moves to the construct that performs it.** Delivery and consult policy becomes one resource split into sections, cited at section grain, holding the four container rules that are decision criteria — whether to reuse a bundled body or fetch it, whether to ask for a whole resource or one section, when to force a full re-delivery, when a step's technique loads — while the container keeps the invariant behind each. Two rules move into Protocol phases that already perform them; the checkpoint-response operation's two error rules become branch notes under the phase that can hit them; the trace resolve moves to the operation that performs it. Four rules on the orchestrator entry technique go away entirely, with two clauses named that must survive the deletion — the cross-group invariant about a resumed worker's identity, and the one clause found nowhere else in the corpus, that the server restores session state on attach and it is not to be reconstructed. Eight conduct rules lose an engine-routing tail and keep their conduct statement. One list gets no corpus home at all, because each tool's own schema already states which arguments it takes.

Either item may land first, and whichever lands second inherits the other's resolution. W1 is listed first because it carries a measured saving and a schema change worth settling before the rules around it are rewritten; the three role rules W1 amends are prohibitions rather than procedure, so W2's sweep keeps them and the two edits meet rather than collide.

## Why now is cheap

The evidence for both is already gathered and specific. W2's register was produced entry by entry during a canon audit — every rule on the surface with its verdict and its proposed destination — so the work is moving named text to named homes rather than deciding what is wrong. W1's rule surface, its rejected alternative, and its 165-second dispatch are all recorded from an implementation that touched the same activity and deliberately left the violation alone.

Both costs recur on every run. A procedure written into the container or the conduct contract is delivered on every dispatch for as long as it sits there, and the client-dispatch worker is spawned once per session whether or not anything about it has changed. W2's defect is also the class that hides: four consecutive audit passes over a change touching both files reported these rules clean, because a walk that follows the prompt rather than the entry never applies the test to the block nobody asked about.

## Scope of change

W1: one field on the activity schema and its generated JSON, the two injection points in activity delivery, three rule carve-outs, one orchestrator protocol step, and the meta workflow's own declaration. The walk tests covering the meta workflow will see that activity's delivered payload change shape, and the schema reference's construct tables and enforcement-model classification gain the new field.

W2: six definition files, one new policy resource, and the section citations that reach it. No schema change and no server change. Two of the six are shared surfaces, so the change wants reviewing as a set rather than piecemeal.

## Acceptance criteria

- [ ] An activity can declare that the orchestrator executes it, and the default for every activity that says nothing is unchanged.
- [ ] An orchestrator-audience activity is delivered with the orchestrator technique set and rules; a worker-audience activity is delivered exactly as it is today.
- [ ] The three role rules state their exception in terms of the declaration, so no activity is named as a special case.
- [ ] The meta workflow's client-dispatch activity runs in the orchestrator, and no spawned agent applies the spawn operation.
- [ ] The schema reference documents the new field in its construct tables and classifies it in the enforcement model.
- [ ] Every rule body on the affected surfaces states a constraint, an invariant, or a prohibition, and none reads as a step that could stand unaltered as a numbered phase.
- [ ] Each procedure removed from a rule is present in a Protocol phase, a branch note under one, an activity step, or a policy resource section — named in the change, so nothing is deleted without a destination.
- [ ] The clause about attach-time state restoration survives, since it has no other home.
- [ ] No rule names another file's rules as a roster, and the policy resource carries criteria only, with no imperative cadence.
- [ ] All repository guards pass, the reference walk still completes, and the full test suite is green.

## Non-goals

- **Changing any behaviour with W2.** Every constraint in force today stays in force; the work moves where it is written.
- **Orchestrators reading arbitrary activities.** W1's exception is keyed to a declaration an author makes deliberately, and the rule against an orchestrator holding activity bodies otherwise stands as written. The reason it exists is worth keeping in view: an orchestrator that holds activity bodies in its own context is how the reverted walk-everything-in-one-context path grew until it overflowed.
- **Folding the dispatch loop into prose.** The cheap alternative is to delete the activity and move its loop into the orchestrator technique's protocol, needing no schema or server change. It should not be taken: the loop condition and the per-step gates are checkable structure that the expression guard and a gate-evaluating test already read, and three control-flow faults in the batching change were caught by exactly that structure.
- **A mechanical guard for the rule-versus-procedure distinction.** Worth having and separable. A guard over a corpus that currently fails it is a canon question before it is a mechanical one — the same reasoning that holds the guard out of the variant-parity item now carried by #397 W4.
- **The conduct contract's own scope question.** Whether workflow tool semantics belong in a cross-cutting conduct file at all is a separate decision; W2 only removes routing tails from rules that keep their conduct statement.
- **Batching.** The batched-dispatch work (#407, #424) touches the same activity and works within the present topology; it neither needs W1 nor is blocked by it.
- **Delivery cost as a goal.** W1 removes one of the four setup dispatches, which is a real saving, but the payload and ceremony trimming around it belongs to #404 — whose W8 is about the remaining three dispatches walking as a single run, and holds independently of this.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — the activity audience field, the two delivery injection points, three rule carve-outs, the orchestrator protocol step, and the meta workflow's declaration
- [ ] W2 — the rule sweep across the engine group and the conduct contract, with the policy resource and its section citations

Consolidates #425 (W1) and #418 (W2); both bodies are captured verbatim in the planning folder. They are one epic because they edit the same six files: W2 rewrites the container rules and the orchestrator entry technique that W1 amends and adds a step to, so worked apart each change conflicts with the other and the second inherits a surface it was not written against.

## Investigation detail

Full record — the grouping rationale, both verbatim issue captures, the sequencing note, and the numbers carried into each work item:
**[engineering/artifacts/planning/2026-08-06-engine-surfaces-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-06-engine-surfaces-consolidation)**

W1's rule surface and its rejected alternative are recorded under **What this work does not do** in the [batched-dispatch implementation record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-03-batched-dispatch-implementation); the 165-second dispatch comes from the [startup-cost measurement record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-workflow-startup-cost). W2's per-entry register — every rule on the surface with its verdict and destination — was produced during the canon audit of the delivery-identity work, in the thread on [#410](https://github.com/m2ux/workflow-server/pull/410) and [#411](https://github.com/m2ux/workflow-server/pull/411).



## A step only the orchestrator can dispatch (extends W1)

`work-package`'s `post-impl-review` selects `dispatch-prism` when `problem_complexity == "complex"`,
but a depth-1 worker has no dispatch primitive, so the step declares `actions: []` and executes only
when the orchestrator happens to notice and dispatch it out of band. On the run that surfaced this,
that out-of-band pass produced both Critical findings the posted verdict rested on — and it
overturned the code review's own verified conclusion. A technique whose selection condition is met
has no reachable execution path from the worker the condition selects it for.

The same gate leaves `structural-analysis.md` with no producer at exactly the complexity that most
needs it: `structural-analysis-inline` is gated `problem_complexity != "complex"`, and the step that
replaces it above that threshold does nothing. On a second run a fortnight later the work landed
inside `review-code`'s conservation walk instead, which is again where that run's only Critical
finding came from. One defect, found twice, in two activities.

**W1**'s activity-audience field is the construct this needs. An orchestrator-audience activity
receives the orchestrator-side technique set, which is what makes a dispatch-only step reachable by
declaration rather than by the orchestrator noticing.

Source: items 19 and 20 of the [July–August retrospective review](https://github.com/shieldedtech/midnight-agent-eng/blob/mike/.engineering/artifacts/planning/2026-08-06-workflow-retrospective-review/03-item-tracker.md).

