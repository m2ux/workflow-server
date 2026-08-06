# Engine surfaces — consolidation record

This folder is the investigation-detail home for the engine-surfaces epic, which consolidates two issues about the same set of files: the workflow-engine group's rules, the orchestrator's entry technique, and the cross-workflow conduct contract — the surfaces that ride along on every dispatch, to every agent, in every workflow.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation record |
|---|---|---|---|
| W1 — activity audience | #425 | [issue-425-activity-audience.md](./issue-425-activity-audience.md) | [2026-08-03-batched-dispatch-implementation](../2026-08-03-batched-dispatch-implementation/) — the rule surface and the rejected alternative, under **What this work does not do**; [2026-08-02-workflow-startup-cost](../2026-08-02-workflow-startup-cost/) — the 165-second dispatch |
| W2 — engine rules | #418 | [issue-418-engine-rules.md](./issue-418-engine-rules.md) | The per-entry register — every rule on the surface with its verdict and proposed destination — was produced in the review thread on pull requests #410 and #411 |

Each capture is the issue body verbatim at consolidation time, so the evidence, tables, and acceptance detail stay reachable after the issue closes.

## Why these two consolidate

- **They edit the same files.** W2 rewrites the engine group's container rules, deletes four rules on the orchestrator entry technique, and moves procedure into that technique's Protocol. W1 adds a declared exception to three role rules on those same surfaces and adds a step to that same Protocol. Worked apart, each change conflicts with the other and the second inherits a surface it was not written against.
- **They are the same question asked twice.** Both ask who a piece of content is written for and which construct owns it. W1 answers it for an activity — the schema gains a way to say which role executes this, and delivery follows the declaration. W2 answers it for a rule body — a constraint stays, a procedure moves to the operation, activity, or resource that performs it.
- **They share a cost argument.** The container's rules merge into every operation in the group and the conduct contract reaches every agent in every workflow, so anything written into either is delivered on every dispatch. W2 removes what most recipients cannot act on; W1 makes the recipient set a declared property rather than an assumption.

## Sequencing

Either order works and whichever lands second inherits the other's resolution. W1 is listed first because it carries a measured saving and a schema change that wants settling before the rules around it are rewritten; W2 is listed second because it leaves the orchestrator Protocol in the shape W1's new step joins. The three role rules W1 amends are prohibitions, not procedure, so W2's sweep keeps them and the two edits meet rather than collide.

## Key numbers carried into the epic

- 23 of the 47 rule entries on the workflow-engine group and the shared conduct contract fire against the catalogue entry for a rule that reads as an instruction to perform work rather than a constraint on it.
- 5 of the engine container's 10 rules are procedure — a consequence of the container file's shape, which offers a Capability section and a Rules section and no Protocol.
- 8 conduct rules lose an engine-routing tail while keeping their conduct statement; 4 rules on the orchestrator entry technique go away entirely, with two clauses that must survive the deletion named in the issue.
- The client-dispatch worker was the most expensive of the four setup dispatches on the profiled run, at 165 seconds. W1 removes that dispatch.
- 6 definition files change, plus one new policy resource and the section citations that reach it. No schema change for W2; one activity-level field for W1.

## What is deliberately not here

- **A mechanical guard for the rule-versus-procedure distinction.** W2's own non-goals hold it out as worth having and separable. It is not folded in, because a guard over a corpus that currently fails it is a canon question before it is a mechanical one — the same reasoning that keeps the guard out of the variant-parity item now carried by #397 W4.
- **Whether workflow tool semantics belong in a cross-cutting conduct file at all.** A separate decision. W2 only removes routing tails from rules that keep their conduct statement.
- **Batching.** #407 and pull request #424 touch the same activity and work within the present topology; neither needs W1 nor is blocked by it.
