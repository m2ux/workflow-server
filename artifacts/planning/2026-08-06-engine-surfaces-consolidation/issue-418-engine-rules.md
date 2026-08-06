# Capture: issue #418 — Engine rules: move the procedure sitting in rule bodies to the operations, activities and resources that own it

Body verbatim as of 6 August 2026 (filed 3 August 2026; subsumed into the engine-surfaces epic as W2 and closed on 6 August 2026).

---

## Summary

A rule is meant to constrain work. Across the workflow-engine group and the shared conduct contract, a large share of rule bodies instead *describe* work: which tool to call, in what order, what to do when a call comes back wrong, how to choose between two delivery forms. Swept against the catalogue entry that names this — a rule reading as an instruction to perform work rather than a constraint on it — **23 of the 47 rule entries on those surfaces fire**.

The rules are not wrong about the behaviour. They are in the wrong section, and in one case they duplicate a protocol phase that already exists. This is about giving each procedure the home the schema already provides for it.

## Why the engine container attracted it

A group's container file carries a Capability and a Rules section and nothing else. It has no Protocol. So any procedure that belongs to the group as a whole — rather than to one operation in it — has nowhere local to go, and Rules is the only section that will accept it. Five of the container's ten rules are procedure, and that is the shape of the file rather than the carelessness of whoever wrote them.

That also means trimming the prose is not the fix. Each procedure needs a real destination, and the framework already offers three: a resource for criteria a reader consults, a technique Protocol for work one operation performs, and an activity step for sequencing across operations.

## What moves where

**Delivery and consult policy becomes a resource.** Four container rules are decision criteria: whether to reuse a bundled body or fetch it, whether to ask for a whole resource or one section, when to force a full re-delivery, and when a step's technique loads. Nothing about those is a cadence — they are questions a reader answers before acting, which is what resources own. They become one policy resource split into sections, cited at section grain so a consumer loads only the criterion it needs. What stays in the container is the invariant behind each: a marker is unreadable to a context that never received the bytes, and a whole-resource id and a section id are distinct delivery keys.

**Two rules move to a Protocol that already exists.** The dispatched-activity check is the clearest case in the register: the worker's own entry technique already carries the phase that performs it, so the container rule restates a step that is already there. Deleting the procedure loses nothing. The same treatment suits the per-response validation check, which belongs in the entry techniques where the responses arrive.

**Error paths become notes under the phase that can hit them.** The checkpoint-response operation has its own Protocol, and its two rules are recovery recipes for calls that phase makes — what to do when the server rejects an option, and what to confirm before claiming auto-advance. They belong as branch notes under that phase. The invariants survive: never invent an option, and auto-advance is valid only where both of its fields are present.

**The trace resolve moves to the operation that performs it.** One rule requires a client's close-out path to resolve accumulated trace tokens, and states that the dispatch operation owns only the accumulate half. The resolve happens in the client's retrospective operation, which already cites this rule — so the call belongs in that Protocol, and the dispatch side keeps the accumulate invariant.

**Four rules on the orchestrator entry technique go away entirely.** One lists rules another file owns, and already omits the dispatch-accounting rule most specific to the orchestrator's role — the list drifted without anyone touching it. A second names a single rule and adds only that rule's own trigger back, under the same name as the rule it cites, which makes the shortened address ambiguous for every caller. A third restates a rule the loader has already merged into that very file. The fourth states loader behaviour. The reach these appear to buy is already there: the group's container rules merge into every descendant, and the dispatch operation is in the orchestrator's own bundle. Two things must survive the deletion — the one genuinely cross-group invariant about a resumed worker's identity, which belongs in the container so the loader delivers it, and one clause found nowhere else in the corpus: that the server restores session state on attach and it is not to be reconstructed.

**Eight conduct rules lose a tail, not a rule.** Each is a sound statement about how an agent behaves, followed by engine routing or an attribution of whose remit something falls under — which operation to delegate through, which operation resolves a path, which operations to advance by. The routing is already owned by the engine techniques and by the activity that binds them. The conduct statement stays; the tail goes.

**One list has no corpus home and should not get one.** The rule requiring a session index on authenticated calls enumerates the four tools exempt from it. Which tools take that argument is stated by each tool's own schema, which the agent is holding when it reads the rule. A resource mirroring that would be a second home that drifts. What survives is what no schema states: where the index comes from, and that it is stable for the life of the session.

## Why now

The two heaviest files here are inherited by everything. The group container's rules merge into every operation in the group, and the conduct contract reaches every agent in every workflow — so a procedure written into either is delivered on every dispatch, to agents that mostly cannot act on it.

It is also the class of defect that hides. Four consecutive audit passes over a change touching both files reported these rules clean, because a walk that follows the prompt rather than the entry never applies the test to the block nobody asked about.

## Scope of change

Six definition files, one new policy resource, and the section citations that reach it. No schema change and no server change. Two of the six are shared surfaces, so the change wants reviewing as a set rather than piecemeal.

## Acceptance criteria

- [ ] Every rule body on the affected surfaces states a constraint, an invariant, or a prohibition, and none reads as a step that could stand unaltered as a numbered phase.
- [ ] Each procedure removed from a rule is present in a Protocol phase, a branch note under one, an activity step, or a policy resource section — named in the change, so nothing is deleted without a destination.
- [ ] The clause about attach-time state restoration survives, since it has no other home.
- [ ] No rule names another file's rules as a roster.
- [ ] The policy resource carries criteria only, and no imperative cadence.
- [ ] All repository guards pass, and the reference walk still completes.

## Non-goals

- Changing any behaviour. Every constraint in force today stays in force; this moves where it is written.
- The conduct contract's own scope question. Whether workflow tool semantics belong in a cross-cutting conduct file at all is a separate decision, and this change only removes routing tails from rules that keep their conduct statement.
- Adding a mechanical guard for the rule-versus-procedure distinction. Worth having, and separable.

## Investigation detail

The full register — every rule entry on the surface with its verdict and proposed destination — was produced during the canon audit of the delivery-identity work, in the thread on [#410](https://github.com/m2ux/workflow-server/pull/410) and [#411](https://github.com/m2ux/workflow-server/pull/411).

