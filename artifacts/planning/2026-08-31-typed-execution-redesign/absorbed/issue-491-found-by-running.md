## Summary

Four defects in the workflow system were found while a work package was being executed, not while anyone was looking for them. They are unrelated to each other in subject matter, and they share one thing that makes them worth a single report: every one of them was met by a run passing through the code, and none of them would have been produced by a survey of the files. The fourth is the one that makes the other three urgent, because it is the reason none of them has anywhere to go.

They surfaced during the work package for epic #397, which is itself about references that no mechanism checks. The pattern repeated inside the work that was studying it.

## What happens today

A workflow is a set of activities, and an activity can borrow a technique that another workflow authored. When the system checks that a borrowed technique is given the values it asks for, it checks against the workflow that wrote the technique, never against the workflow that is running it. So a technique borrowed into a different setting is verified in a scope it does not execute in. There are 143 places where this happens, and between 20 and 37 findings sit across that boundary depending on how the boundary is drawn.

An activity can also be returned to. When a run goes back to an earlier activity and finishes it a second time, that activity has to choose where to go next, and it chooses by reading a flag that says whether this package's path includes a later stage. The flag is set once, when the path is first chosen, and nothing ever clears it. So the second visit routes to the stage that has already been completed, and the route that would skip it is unreachable, because no step is able to clear the thing it tests. The invariant that breaks: an activity that can be re-entered needs an exit that does not depend on a flag no step can clear.

There is a guard that exists and does not run. Its script sits with all the other guards, but it was never added to the registry the suite reads, so it executes only from its own test file and never as part of the suite. A guard that runs only in its own test reports on nothing.

And when a work package decides something is out of scope, it writes a row into a register of deferred items, and each row ends with a column for the issue link that will carry it forward — or a dash, until one is raised. Nothing in any workflow raises it. The register has no owning activity, deliberately, because any activity may be the first to defer something. The only thing that ever reads the register is the close-out document, which reports how many rows are open and stops there. So a deferral is recorded faithfully and then goes nowhere, and the column that anticipates a raiser has no raiser anywhere in the system. This report exists because that gap was reached: three of the four findings below were deferred on the understanding that they would be filed, and there was no mechanism to file them.

## The four findings

1. **Borrowed techniques are checked in the wrong scope.** Bindings are verified against the authoring workflow rather than the running one, leaving 143 bind sites unverified where they actually execute. This is independent of the inline-reference work in #397.

2. **A re-entered activity has no way forward.** The flag guarding the onward transition is set at classification and cleared by nothing, and no backward transition into an activity is modelled, so the second pass through routes to an already-finished stage.

3. **A guard is missing from the registry.** The branch-as-step guard has a script and a test but no registry entry, so the suite never runs it.

4. **Nothing raises an issue for a deferred item.** The deferred-items register anticipates an issue link per row. No activity in any workflow creates one, and the register's only consumer reports a count.

The first three are in the workflow definitions and the guard suite. The fourth is in the register template and, more accurately, in the absence of any activity that acts on it. All four are in this repository: the guard script and its test under the scripts and tests directories, the activity definitions and register templates under the workflows directory.

## Why now is cheap

The evidence is already written down. Each of these was measured or traced during a live run, and the planning artifacts linked below carry the counts, the reasoning and the code paths. Filing later means re-deriving all of it, and the run that produced it will be gone.

The fourth finding is cheap in a different way: it is the one whose absence costs the other three. Fixing it is what makes deferral mean something, and until it is fixed every future deferral has the same fate.

## Scope

Each finding is separable and can be fixed on its own. The report is single because the evidence and the pattern are shared, not because the fixes are coupled.

## Acceptance criteria

- A borrowed technique's bindings are checked against the workflow that runs it, and the 143 bind sites are reported under that scope.
- An activity that can be re-entered has a forward exit that does not depend on a flag no step can clear.
- The branch-as-step guard is in the registry and runs in the suite.
- A deferred item's register row acquires an issue link through some owned step, rather than through nobody.

## Non-goals

This does not change how inline references are resolved or delivered; that is #397 and is in flight.

It also does not cover a fifth set of findings that look similar and are not. Four separate places were found where an activity binds a technique without supplying an input that the technique declares — including one where the input's own description states it arrives by step binding. Those are instances of the defect #397 is fixing, not defects in their own right, and they belong in that work package's provenance record as a rate rather than here as tickets. They are mentioned only so a reader does not conflate the two sets.

## Investigation detail

Evidence, traces and the measured counts are in the work package planning folder for #397: https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-15-handling-inline-techniques — see the deferred-items register for findings 1 and 2, and the implementation analysis for the guard-suite baseline behind finding 3.

