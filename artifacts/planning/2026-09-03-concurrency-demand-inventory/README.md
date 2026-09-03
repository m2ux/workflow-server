# Where the corpus runs things one at a time, and where it could stop

**Date:** 2026-09-03
**Corpus:** `workflows` at `131e2942`. **Server:** `main` at `4740f4d6`.
**Delivers:** [#539](https://github.com/m2ux/workflow-server/issues/539) **W2 — inventory the demand, plan the migration**.

This folder is the identify-and-plan output the work item asks for. It walks every place in the corpus
where work happens one unit at a time, says of each whether concurrent execution is available, is
available once a decision is made, or does not apply, and puts the available ones in an order.

Implementing any migration is out of scope, and the epic says so in its non-goals. Nothing here
changes a definition.

| File | Holds |
|---|---|
| `README.md` | What the item assumed, what the corpus holds now, and the headline counts |
| [site-inventory.md](./site-inventory.md) | All thirty-one sites, each classified with its citation and the reason independence does or does not hold |
| [work-package-stages.md](./work-package-stages.md) | The busiest workflow, stage by stage, as the item asks explicitly |
| [migration-backlog.md](./migration-backlog.md) | The prioritised order, each item's cost, and what it depends on |

---

## 1. What the work item assumed, and what is true now

The item was written when its epic still expected W1 to produce a written decision naming a fan-out
contract, and W2 to inventory demand against that contract. W1 was closed as overtaken: the shared
primitives merged on their own rather than through a decision. Four things follow, and each of them
changes what this inventory can say.

**A shared fan-out capability exists and is widely bound.** `meta/techniques/scatter-gather.md`
carries one primitive with two scatter modes, sequential and parallel, a gather contract that
appends rather than overwrites, and a combine phase identical across modes. Forty-four definition
files reference it, twenty-six of them activity or workflow YAML. Underneath it,
`harness-compat::spawn-concurrent` performs the dispatch and `orchestration-patterns::dispatch-workers`
selects the mode through a `dispatch_concurrency` input that defaults to `1`. Five borrowable pattern
activities under `meta/activities/patterns/` package the whole shape. An author who wants agent
fan-out has a vocabulary to write it in; section 2 is about whether the run-time reaches it.

**The contract covers agents, not shells.** `spawn-concurrent` states its capability as dispatching
multiple independent *agents* in parallel, and each harness slice under `harness-compat/` resolves to
emitting several agent calls in one turn. The site that motivated W1 —
`meta/techniques/cargo-operations/run-suite.md`, which starts four concurrent shell invocations and
waits for all of them — is a different kind of concurrency, in the same process, owned by the caller.
No named construct covers it. This is the part of W1 that is genuinely still open, and it is smaller
and more specific than the item's phrasing suggests: not "name a fan-out contract" but "the fan-out
contract that exists does not reach shell concurrency, and one site plus one rule depend on that".

**The contradiction the epic flagged as crossing phases is settled.** The item warns that run-suite's
concurrency instruction is in tension with its group's foreground-only rule and that whichever of the
two phases lands second inherits the other's resolution. That resolution is already in the corpus:
`cargo-operations`'s `foreground-only` now reads that several foreground shells running concurrently
in one caller stay within the rule, and that backgrounded worker dispatches do not. Nothing is
inherited; the tension is gone.

**Concurrency is not a property a loop can carry.** This is the finding that sets the cost of every
item in the backlog. The activity schema's `loop` step accepts `loopType`, `variable`, `over`,
`breakCondition`, `maxIterations`, `steps`, `when`, `condition` and `required`, and closes itself to
anything else. There is no concurrency field, on the loop or anywhere else in
`schemas/activity.schema.json` or `schemas/workflow.schema.json`. Making a sequential loop concurrent
is therefore never an attribute flip. It replaces the loop with a decompose → brief → dispatch →
gather → combine run of steps, which is a change to the activity's shape, its variable contract, and
what its outcome statement claims. Every "ready" row below costs that, and the backlog prices it.

## 2. Where fan-out is available, and where the demand is

The demand this document measures sits inside activities. The capability that would serve it is not
reachable from there, and that single fact prices every row in the backlog.

**An activity's steps run in a spawned worker.** `orchestrator-conduct`'s `no-domain-work` states
that orchestrators, meta or workflow, never execute activity steps; they delegate through
`workflow-engine::dispatch-activity`. `meta/activities/03-dispatch-client-workflow.yaml` drives the
client workflow's activity loop on exactly that basis, and `no-inline-on-resume` closes the one
opening a resumed session might have offered.

That is not merely the recommended path, it is the only entry. The server's `discover` tool returns
`meta/resources/bootstrap-protocol.md`, which opens every session by calling `start_session` for the
meta workflow under `agent_id: "orchestrator"` and requires every worker spawned from there to be
awaited. A client workflow's activities reach a worker because that is how a session begins.

**A worker cannot dispatch.** `orchestrator-conduct`'s `one-level-of-indirection` reads: "An
orchestrator dispatches workers; a worker dispatches none of its own. One level."
`harness-compat::spawn-agent`'s `depth-1-only` says the same thing from the harness side, and draws
the consequence out in full: a spawned agent has no dispatch primitive, `concurrency = 1` is its
scatter contract rather than a shortfall against it, any `scatter-gather` it runs is the sequential
case, and "parallel scatter is available only where the dispatch primitive is — at the orchestrator".

**So the parallel mode of the shared primitive is orchestrator-only, and no activity definition
executes at the orchestrator.** Six activity definitions bind
`orchestration-patterns::dispatch-workers` from a step — `cicd-pipeline-security-audit`'s primary
scan, `substrate-node-security-audit`'s reconnaissance and primary audit, and three of the five
borrowable pattern activities. `dispatch-workers` branches on `dispatch_concurrency`, dispatching a
single concurrent batch above one and a `spawn-agent` per brief at one. Run inside a worker, the
concurrent branch has no primitive to reach, so what runs is the sequential one. That is
conformance, not breakage: `scatter-gather`'s `parallelism-is-optimisation` makes sequential valid
for correctness, and
`depth-1-only` says running the sequential case *is* conformance. But it means the corpus currently
has no site at which fan-out actually happens, and adding a seventh would not change that.

One definition already reads the constraint correctly.
`work-package/techniques/analyse-challenge/challenge.md` builds one work unit per perspective and
dispatches via `scatter-gather` with the mode explicitly following `depth-1-only`. It is the only
fan-out site in the corpus whose author wrote down which mode this context actually gets.

The pattern library states the opposite in its own README — "These activities cover **in-activity
fan-out / consolidate** only" — and that sentence and `one-level-of-indirection` cannot both hold.
Settling which of them gives is the first item in the backlog, and until it is settled no migration
below buys any wall-clock at all.

## 3. What the walk found

Thirty-one sites. Twenty-seven are `forEach` loops, which is every one in the corpus; two are runs
of independent passes that are sequential without being loops; two already run concurrently on prose
alone.

| Class | Count | What it means |
|---|---|---|
| **Ready** | 8 | Independence holds on the definitions as they stand. Nothing has to be decided first |
| **Blocked** | 4 | A cross-iteration read or a shared write has to be resolved before independence can be claimed |
| **Not a candidate** | 17 | The site cannot fan out, for a reason that is structural rather than incidental |
| **Already concurrent, contract absent** | 2 | The work is concurrent today, described in prose, with nothing naming the structure |

Three reasons account for all seventeen not-a-candidate rows, and each is a fact about the system
rather than a judgement about the site.

**One operator, one open question.** Twelve of them hold a checkpoint, or hold a dialogue that needs
the operator's answer before the next step. The session file schema carries `activeCheckpoint` as a
single object, not a collection, so a session has at most one checkpoint outstanding. Two iterations
that both stop to ask cannot both be waiting.

**Session-level dispatch is a different layer, and the epic excludes it.** Three of them trigger a
child workflow per iteration. Running activities or sessions concurrently is named as a non-goal in
both #539 and #527, and `anti-patterns.md`'s `duplicate-shared-capability` keeps session-level
`dispatch-activity` explicitly separate from mid-phase fan-out.

**Two of them are the sequential member of a pair.** `meta/activities/patterns/03-plan-and-execute.yaml`
runs plan steps in order because that is what the pattern is for; the concurrent sibling is
`01-orchestrator-workers.yaml`, sitting beside it in the same library.

A row classified **ready** means independence holds in the definitions. Section 2 is why that is a
necessary condition and not a sufficient one: readiness says a site *could* fan out, and the
execution model currently says nothing at that layer *does*.

## 4. The finding that is about a plan rather than a loop

`prism` plans its own concurrency and then does not use it.

`plan-analysis` declares an output component `parallelism_plan` — "Which units can run concurrently
(multi-unit scopes only)" — and the plan template `analysis-plan.md` reserves a **Concurrent** line
for which units may run at the same time. The four pass activities that consume the plan iterate
`analysis_units` one unit at a time, and no prism activity or workflow file mentions concurrency at
all. The field is computed, written into a document a human reads, and never reaches the machinery.

This is worth stating separately because it is the only place where the corpus already knows which
units are independent. Everywhere else the independence judgement is this document's; there, it is
the workflow's own, and it is being discarded.

## 5. How the classification was made

A site is **ready** when every iteration reads only its own unit and values fixed before the loop
starts, and writes either its own file or an appended collection. A site is **blocked** when an
iteration reads a variable the loop itself appends to, or when two iterations write the same path.
A site is **not a candidate** when concurrency is unreachable for it — the operator, the session
layer, or the pattern's own purpose.

Each row cites the definition the judgement comes from. Where a row's reason is a schema fact rather
than a definition, it cites the schema. Two rows carry an observation about a pre-existing defect
found while reading; those are marked as observations and are not part of this item's scope.
