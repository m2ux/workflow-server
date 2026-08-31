## Summary

Five faults in the workflow definitions were found by an earlier review, written down with their locations, and never fixed, because no backlog item ever owned them. They are still present word for word. Each is small, none is blocked by anything, and together they are one pull request.

This issue carries them out of the corpus-backlog epic, which is closing: its other three remainders were absorbed into the phases of the two-paths initiative (#527), and these five have no relationship to that work beyond both touching definition files.

## The five

**An environment assignment sits after the command it is meant to configure.** In the cargo check operation and its siblings, a variable is set after the `nice` command rather than before it, which is not valid shell. The instruction reads as though it works.

**A test-thread budget is stated two ways.** The cargo group's rule gives one figure; the check and clippy operations give another. An agent reading the group rule and an agent reading the operation get different numbers.

**A first step contradicts its own scoping.** The create-issue operation opens with a step that does something the operation's own scope excludes.

**A concurrency instruction fights its group's rule.** The suite runner tells the agent to fan out; the group it belongs to says foreground only. Both are delivered together, and nothing reconciles them.

**A checkpoint message interpolates a variable nothing sets.** The message names `{problem_complexity}` while its own default option sets a variable called `path_gating_complexity`, so the message renders with a hole in it where the value should be.

## Why now is cheap

The defects are enumerated, quoted and located — this is reading and fixing, not investigating. They have been findable-but-unowned through two review generations.

The fifth kind is already catchable automatically: the binding-fidelity guard walks checkpoint messages and gate expressions, so a recurrence would be reported. That makes this item purely the five fixes, with no guard to build alongside them.

## Scope

One corpus pull request. Five fixes across the cargo operation group, the create-issue operation, the suite runner, and one checkpoint message.

## Acceptance criteria

- [ ] The environment assignment precedes the command it configures, and the sibling operations carry the same correction.
- [ ] The test-thread budget is stated once, and the operations that restated it cite that home rather than repeating a figure.
- [ ] The create-issue operation's first step is within the operation's declared scope.
- [ ] The suite runner's concurrency instruction and its group's foreground-only rule no longer contradict each other.
- [ ] The checkpoint message and the variable its default option sets agree on a name, and the binding-fidelity guard confirms the mismatch is gone.

## Non-goals

- **A guard for any of these classes.** The one that could be caught mechanically already is.
- **The wider question of where a concurrency contract lives.** The suite runner's tension is fixed here as a contradiction between two pieces of text. Whether concurrent execution should be a named, bound structure rather than prose is #399 W1, which retargets this same call site — **whichever of the two lands second inherits the other's resolution.**

## Investigation detail

The defects were enumerated in the corpus-backlog epic (#338), whose body is captured verbatim in the planning folder for the tracker reorganisation that closed it:
**[2026-08-31-typed-execution-redesign/absorbed](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign/absorbed)**

