## Summary

An activity's steps already nest: a loop's body is itself a list of steps the server walks, checks and delivers. What a run of steps cannot be is *named*, so it cannot be referred to from anywhere else. Where two activities need the same run — present something, gate it, record the answer, then walk the items one at a time — each carries its own copy, and where the run contains a gate, that gate's body is lifted to the workflow root so both activities can reach it.

A **routine** is a named run of steps that declares what it needs and what it produces. An activity refers to a routine by name and supplies its parameters at the point of use. The server materialises the routine's steps into the referring activity when the definitions load, so everything downstream — the step manifest, artifact composition, the guard suite, the end-to-end walker — sees ordinary steps.

The name is chosen to fit the vocabulary: a routine is a fixed run of actions, and the word collides with nothing the schema already uses. Every other candidate does — "sequence" is how the schema already describes an activity's own steps, "group" and "operation" belong to techniques, and "fragment" names the mechanism this replaces.

## What the corpus carries today

Two shared checkpoint bodies sit at the root of the work-package workflow, reached from seven places across four activities. Their content names state belonging to a single activity: a condition on the review-mode and open-assumption flags, a message interpolating the presentation object, options writing the deferred and individual-interview flags, and per-item text reading the current assumption. The workflow file therefore holds one activity's variable names, and renaming one of them means editing the workflow file — the inverse of the layering the graph exists to provide, where an activity names its outcomes and the workflow names destinations.

Across the whole corpus that mechanism carries ten shared bodies serving twenty-five reference sites: eight rule texts at eighteen sites, and two checkpoint bodies at seven. It has no notion of a home. A body lives in whichever workflow declared it first, so generic rules end up owned by a domain workflow and borrowed across a boundary neither workflow's subject covers.

The run of steps those seven sites reproduce is a gate, a record step, and a loop over the open assumptions whose body presents an item, gates it and records the answer. The four copies have drifted. Three carry different message texts. Four differ in the conditions gating their steps. One places its record pass before the loop and another after. Two of the gates now ask genuinely different questions with different option sets. Nothing reports any of this, because no check in the suite compares step sequences across activities, and identical text is the only duplication the suite can see.

The shared run is smaller than any activity: it is three steps and a loop, sitting in the middle of activities that each do considerably more. That granularity is why a routine is its own kind of definition with no place in the graph, rather than a way of reaching an existing activity.

Authors already do by hand what a mechanism should do. Step identifiers are prefixed per site so that two copies of one gate record their answers separately, and per-item gates carry an author-written identifier template so each iteration is distinguishable. Both are correct today and both are manual.

## The design

**The definition.** A routine lives in a `routines/` directory beside `activities/`, one file per routine, with no position number because it holds no place in an order. It declares `inputs` — named parameters with optional defaults, the same shape a technique's inputs take — and `outputs`, which are full session-variable declarations carrying type, description and default, the same shape an activity's writes take. Its `steps` are the ordinary step list, so a routine may contain technique, action, checkpoint and loop steps.

```yaml
# work-package/routines/assumption-reconciliation.yaml
id: assumption-reconciliation
version: 1.0.0
name: Assumption Reconciliation
description: Gate residual open assumptions, record the batch answer, then interview individually on request.

inputs:
  - id: gate_message
    description: Text presented at the batch gate, naming the phase whose assumptions these are.
  - id: decision_space
    description: Which option set the per-item gate offers.
    default: resolve-or-defer

outputs:
  - name: has_deferred_assumptions
    type: boolean
    description: Whether any assumption was deferred to stakeholder review.
    defaultValue: false
  - name: needs_individual_interview
    type: boolean
    description: Whether the batch gate selected individual drill-down.
    defaultValue: false

steps:
  - kind: checkpoint
    id: batch-gate
    message: "{gate_message}"
    blocking: true
    options: [...]
  - kind: technique
    id: record-batch
    technique: review-assumptions::record
    when: needs_individual_interview != true
  - kind: loop
    id: interview
    loopType: forEach
    variable: current_assumption
    over: open_assumptions
    when: needs_individual_interview == true
    steps:
      - kind: technique
        id: present
        technique:
          name: review-assumptions::interview
          inputs: { assembly_mode: interview }
      - kind: checkpoint
        id: decision#{current_assumption.id}
        options: [...]
      - kind: technique
        id: record
        technique: review-assumptions::record
```

**The reference site.** A `kind: routine` step names the routine and binds its inputs under `with`. It carries the site gates every step kind carries, and nothing about routing.

```yaml
  - kind: routine
    id: reconcile-assumptions
    routine: assumption-reconciliation
    with:
      gate_message: "Open assumptions remain after research ({assumption_review_presentation}). Accept the agent's positions, defer all, or interview individually."
    when: has_open_assumptions == true
```

A routine name resolves as `[workflow::]name`, a bare name resolving against the referring workflow and then the shared home — the resolution the existing shared-body reference already implements.

**Materialisation and identifier hygiene.** The loader materialises a routine's steps into the referring activity before exit bindings are validated, alongside the existing shared-body materialisation. Every identifier inside the materialised body is prefixed with the reference step's identifier, using a full stop as the separator so it cannot be confused with the iteration discriminator or a technique path. The example above yields `reconcile-assumptions.batch-gate`, `reconcile-assumptions.record-batch`, `reconcile-assumptions.interview` and, inside the loop, `reconcile-assumptions.interview.decision#{current_assumption.id}`. Two references to one routine in one activity are collision-free by construction, and the per-site prefixing authors write today becomes automatic. Delivery follows the same route the shared checkpoint body already takes: the materialised steps are spliced into the raw definition text the worker receives, after step identifiers are resolved, so an author writes a reference and a worker reads steps.

**The contract boundary.** The check that derives what an activity actually reads and writes from its steps treats a `kind: routine` step as a boundary rather than recursing into it. The routine's declared inputs, less those a `with` binding satisfies with a literal, count as the referring activity's reads; the routine's declared outputs count as its writes. The activity's declared contract is therefore held against the routine's signature, never against its body. This is what a routine buys over any arrangement that shares a body without a signature, and it is the single change to the derivation.

**Placement.** A routine referenced by more than one workflow lives in the shared home; a routine referenced by exactly one workflow lives in that workflow. Placement is computed from reference sites, so an author never chooses it and a guard enforces it. This is the property the current shared-body mechanism lacks, and it is why six of its eight rule texts sit in workflows whose subject does not cover them.

**Enforcement.** An unknown routine name, a cycle among routines, a `with` binding naming an input the routine does not declare, and an unbound input with no default are each load failures. A new guard reports a declared output no step in the body writes, a declared input no step in the body reads, a placement that disagrees with the reference-site rule, and a routine with no reference sites at all — the last mirroring the hard finding an unreferenced shared body already produces.

**The step-kind walk.** Step kinds are tested in fifty-eight places across twenty files, every one a positive comparison, with no exhaustive switch anywhere. A new kind therefore compiles clean and is silently skipped by roughly eight structural walks, including the contract derivation, the step-technique bundler and the walker. Those walks are replaced by one shared helper that recurses into any step carrying a nested step list, and a single exhaustiveness assertion makes the next new kind a compile error. The walker's separately maintained list of kinds is widened in the same change, since it is structurally independent of the schema and would otherwise go stale without complaint.

**Isolated checking.** A routine's contract is checkable with no host workflow: derive it from the routine's own body and compare against its declared signature. The walker gains a routine-level entry that walks a routine's steps against a variable set seeded from its declared inputs, so every option of every gate inside it is exercised once, rather than only through whichever workflows happen to include it.

**Migration.** The two shared checkpoint bodies and their seven reference sites move to routines. The shared-body mechanism keeps its rule half, whose eight remaining texts have a placement problem rather than a structural one.

## What this makes cheap

The nesting, recursion and flattening a routine needs are already in place, because a loop step holds a nested step list that the identifier scoping, the flattening walk, the artifact composition and the manifest check all handle. Artifact prefixes need no rule of their own: a routine has none, and its artifacts land under the referring activity's prefix. Dispatch cost is unchanged, because a routine runs inside the referring activity's existing hand-off — worth stating explicitly, since re-dispatch accounted for about 31% of a measured 4.1 million token run, and a hand-off whose only purpose is to ask a question is the most expensive way to ask one.

The retirement is enforced rather than trusted: an unreferenced shared body is already a hard finding, so the two checkpoint bodies are deleted rather than orphaned.

## Scope

Server, schema and corpus. The contract boundary and the placement rule are the load-bearing pieces and should be settled before the schema lands, because both decide what a routine file may declare.

## Decisions this proposal leaves open

Whether the reconciliation run is a per-phase concern or a once-per-run concern. If once per run, two of the four sites reach the reconciliation activity later on every path through the workflow and can simply drop their copies, so the routine carries four sites rather than seven.

Which decision vocabulary the per-item gate offers. A parameterised `decision_space` preserves both of the vocabularies now in use, and should only do so if the difference between them is intended.

Whether an activity's declared endings are still the right home for the two the corpus writes nothing to.

## Acceptance criteria

- [ ] A routine declares inputs, outputs and steps, and takes no place in any graph.
- [ ] An activity refers to a routine by name and binds its inputs at the reference site.
- [ ] A routine's steps are materialised into the referring activity at load, and the worker receives them as steps.
- [ ] Identifiers inside a materialised routine are prefixed from the reference site, and two references to one routine in one activity record their decisions separately.
- [ ] The referring activity's declared contract is held against the routine's signature, not its body.
- [ ] A routine's placement follows from its reference sites and a guard enforces it.
- [ ] An unknown routine, a routine cycle, an undeclared input binding and an unbound input without a default each fail the load.
- [ ] A routine's contract is checkable without a host workflow, and the walker exercises a routine's gates directly.
- [ ] One shared step walk replaces the per-kind comparisons in the structural walks, and an exhaustiveness assertion makes the next step kind a compile error.
- [ ] The two shared checkpoint bodies and their seven reference sites are routines, and no workflow file names another activity's variables on their account.
- [ ] The guard suite is green, including the walk over every affected workflow.

## Non-goals

- A routine declares no named outcome to return. Every activity that would refer to one declares a single ending, so nothing in the corpus can receive an outcome today.
- A routine never costs a hand-off of its own, is not reachable as a transition destination, and is never a workflow's first or last node.
- Child workflows keep their role. A routine is the sub-activity construct, not a replacement for a mechanism whose point is a separate session.
- The graph keeps its role: it binds activity endings to destinations and gains nothing about routines.
- Nested routines and cross-workflow routines are out of the first version.
- No change to what any shared gate asks, beyond the decision recorded above.

## Investigation detail

Adjacent: #519, which asks whether the shared-body mechanism earns its place — this retires its checkpoint half and leaves its rule half's placement question open. #466 supplies the parameterisation half of the same problem, and the `with` binding above is where the two meet.

