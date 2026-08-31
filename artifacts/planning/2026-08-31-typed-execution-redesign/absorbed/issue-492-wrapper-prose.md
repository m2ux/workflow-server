## Summary

One of six deliverables in the work package for epic #397 was to replace a set of instruction sheets with direct tool calls, on the reasoning that a sheet whose whole content is "call this tool" is a layer that can be removed. It has been withdrawn from that package and is offered here as its own piece of work, because measurement showed the deliverable cannot be accepted on its own stated terms.

Nothing was implemented and nothing was deleted. The withdrawal happened before any file was touched, which is why the rest of the package can proceed with an honest baseline.

## What happens today

A group of instruction sheets covers one external service. Each sheet describes how to make one call to it. The proposal was to delete the sheets that only wrap a call and keep the ones that also interpret a result, since interpretation is the part a tool cannot hold.

Two things stood in the way, and only the second is a matter of judgement.

The first is arithmetic. The size of the affected population was measured four times, and every correction made it smaller. It began as forty-one call sites. Then a figure describing five operations that would convert with nothing left over turned out to have been counted across a wider set of groups, and none of those five was in this group. Then it emerged that none of the eleven operations in question would retire whole. Then the count of sites the change would actually remove came to two, out of twenty-three. A deliverable that shrinks every time it is measured is not ready to be built.

The second is a direct contradiction. The group these sheets belong to carries a rule of its own saying that callers must go through its operations rather than reaching the underlying service directly — the exact arrangement the conversion was meant to produce. Three other workflows cite that rule. So the target state is forbidden in as many words by the contract governing the thing being changed. Delivering the conversion means changing that contract, and changing it was in nobody's scope.

There is also a matter of what the tools are. The tools these sheets name do not belong to this server. They belong to separate services the assistant is already connected to, which already state what arguments they require and already reject a call that leaves one out. So the safety property the proposal wanted was already present, supplied by tools that already exist. Registering copies here would mean building an outward-facing client this server has never had, in order to forward calls to a service the assistant already reaches.

## The alternative that was considered and not taken

There is a coherent design in the vicinity. Rather than deleting the wrapper sheets, the interpreting parts could become rules on the group's own contract, so the interpretation travels with the group instead of living in separate sheets. That would satisfy the group's rule instead of contradicting it.

It was not taken because of its size: somewhere between forty-nine and seventy-five consumer sites are affected, and the group's own rule would have to be rewritten. That is a different piece of work from the one that was scoped, and it deserves to be chosen deliberately rather than arrived at by accident partway through something else.

It may well be the right architecture, found late. Whoever takes this up should weigh it properly rather than treating it as a rejected option.

## Two findings worth carrying, independent of the decision

Counting these calls by resolving the links between sheets found seventy-five call sites across thirty-one files in four workflows, reaching fifteen operations. The published counting rules used elsewhere in the package see seventeen of those seventy-five. Fifty-eight are invisible, and fifty-six of those are invisible for a single reason: the word introducing the call is not the one word the published rules recognise. Three of the four workflows count as zero throughout, including one that was absent from an earlier survey altogether. Seven operations have their entire set of external callers invisible.

And one workflow reaches these operations in ordinary prose, with no link to resolve at all — six files, twelve reaches. So counting by resolving links is itself incomplete. A call can be made in a sentence, and a sentence has no syntax to match.

The practical statement, which the package has adopted: a total can be reproducible without being complete, and resolving links does not make it complete either. That is fine for a check that asserts a number and reports what it finds. It is not sufficient authority to delete something.

## Scope

Decide whether the interpreting-parts-become-group-rules design should be built, and if so, build it. Rewriting the group's own rule is part of the work, not a precondition to be waived.

## Acceptance criteria

- The group's rule about callers using its operations, and whatever the change produces, agree with each other.
- Every external caller of the affected operations is enumerated by a method that does not depend on the word introducing the call, and that count is stated with the method that produced it.
- No caller is left reaching an operation that no longer exists.
- Any claim that the change removes N call sites states the population N was counted over.

## Non-goals

This does not touch the rest of epic #397. The reference-checking and delivery work there proceeds without it, and the criterion covering this conversion is left explicitly open rather than partly satisfied, so nothing downstream baselines against a half-delivered figure.

This is also not the same as the four workflow defects in #491. Those were found by running the workflow and have no owner; this is a scoped deliverable withdrawn on measurement, with a design question behind it.

## Investigation detail

The measurements, the corrections in sequence, and the recorded available-and-not-taken option are in the work package planning folder for epic #397: https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-15-handling-inline-techniques — see the requirements document for the criterion left open, the work package plan for the option and its cost, and the deferral register for the row pointing here.

