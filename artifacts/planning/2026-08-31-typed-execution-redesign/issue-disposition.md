# Issue disposition — the twenty-one open issues under the typed-execution design

Every open issue as of 2026-08-31, with what it becomes. Four verdicts:

| Verdict | Meaning |
|---|---|
| **Dissolves** | The defect cannot be expressed under the design. The issue closes when the design lands, not because anyone fixed it |
| **Folds in** | Becomes a work item of this epic |
| **Survives** | Orthogonal. Still needs doing, and this epic neither helps nor hinders |
| **Changes shape** | Still needed, but the design moves what the work is |

**"Dissolves" is not "free."** The defect stops being possible; the migration that gets there is the
cost, and it is this epic's whole body of work. A dissolving issue should not be closed until the
stage that dissolves it lands.

---

## Dissolves

### #523 — Runner: a client that executes the mechanical parts of a workflow

**Folds in, as the load-bearing half.** This epic is a superset: #523's runner is W3 here, and its
write-timing decision is W1. Everything #523 argues holds unchanged and the evidence is reused
wholesale.

Worth stating plainly, because it affects sequencing: **#523 can ship without the typed language.**
Runner plus step-completion writes plus derivation gives derivation-based fidelity on the existing
YAML substrate. The typing and the compiled corpus are what retire the guard suite and the delivery
apparatus on top of that. If this epic is taken in one bite, #523 is its first three work items; if it
is taken in two, #523 ships first and stands on its own.

### #520 — Routine: a named run of steps a workflow can reuse

**Dissolves.** A routine is a typed function returning steps, parameterised at the call site and
checked against its signature. The proposal's own design — inputs with defaults, outputs as full
variable declarations, materialised into the referring activity at load — describes a function, its
parameters, its return type, and inlining. It needs no schema construct of its own.

The drift the issue measures survives as a finding worth acting on regardless: four copies of one run
across seven sites, three with different message texts, four differing in gating conditions, one
placing its record pass before the loop and another after, two asking genuinely different questions.
Nothing reports it because no check compares step sequences. Under the design a shared routine is one
definition, so the copies converge by construction.

### #519 — Rule and checkpoint fragments: a shared body needs a shared home

**Dissolves.** "A fragment lives on whichever workflow declared it first" is a module-resolution
question with a standard answer. Nine fragments over nineteen sites become nine exported values in
modules whose location is a naming decision rather than an accident of authoring order.

### #513 — Expression grammar: one predicate dialect, and rules that can fail a build

**Dissolves, stages 1 through 5.** One typed expression language removes the second dialect, the
coercion disagreement, the position-dependent availability, and the four unparseable values. The
issue's acceptance criterion — "for every rule the grammar states, an artifact fails when that rule is
violated" — is what a compiler is.

Stage 1, measuring which live predicates change answer when the two number conversions become one,
**stays required**: it is the migration's safety check, and a rewrite that silently flips a gate
produces no signal anywhere. It is the one part of #513 that must run before translation, not after.

Stage 6, delivering the parsed form so agents walk a structure instead of reasoning over a grammar,
**becomes moot** — agents stop evaluating gates.

### #497 — Corpus tests: the definitions cannot check themselves

**Dissolves,** and becomes W7. A corpus that compiles is a package that depends on the runtime
package, so it has a toolchain by construction. The stamps, the freshness assertions, the re-stamping
step and the pointer-comparison check are all costs of the separation and are refunded rather than
rewritten — which is the issue's own stage three, reached by a different route.

The 249-commit drift on the binding-fidelity verdicts is the strongest single argument in the tracker
for putting semantics where the definitions are.

### #402 — Server Unblocks: the server capabilities the corpus is waiting on

**Dissolves, both items.** Checkpoint dismissibility riding on which condition field is present cannot
arise when there is one predicate form — dismissibility becomes an explicit property rather than an
accident of encoding. And an activity-file rule that cannot reference a shared fragment while a
workflow-level one can is a scoping asymmetry that modules do not have.

This epic unblocks what #402 unblocks, so #338's two gated migrations are gated on this instead.

### #401 W1 and W3 — profiles, and attaching to a session that is already there

**W1 dissolves.** A profile is a typed constructor over the initial bag; a locked seed is `readonly`;
per-profile reachability is the reachability analysis the compiler already runs, evaluated under the
constructor's seeds. The 200-line wrapper workflow whose real payload is three seeded values, three
isolation rules and one start activity becomes those things and nothing else.

**W3 dissolves.** Reattach is free under an append-only log: you append, never overwrite. Of the six
faults the issue enumerates, four cannot occur — a session that cannot be read is distinguishable from
one that is absent, a child's completion is recorded in its own log, the identifier is the log's
identity, and order in the folder stops being load-bearing because slots stop deriving identifiers.
Two survive as real design questions and are carried into W4: a cursor pointing at an activity the
workflow no longer declares, and a run abandoned at a checkpoint.

**W2 folds in** as W4 of this epic.

### #404 — Delivery Cost: what a delivery costs to build and to send

The largest single dissolution on the tracker. Eleven work items:

| Item | Under the design |
|---|---|
| W1 — resolve each technique once per delivery | Dissolves. Composition happens once, at build |
| W2 — say what each delivery cost | Becomes a byte count over a manifest of hashes |
| W3 — teach agents to fetch cheaply | Moot. Agents do not fetch |
| W4 — startup fixed payloads | Mostly dissolves. Bootstrap is server-side and the schema read has no reader once the orchestrator is code |
| W5 — ceremony definition weight | Mostly dissolves with the setup activities the bootstrap absorbs; the commit-batching half survives |
| W6 — report fan-out without a threshold | **Survives**, as a compiler metric rather than a benchmark line. Still warn-only, still no threshold |
| W7 — duplicate content inside one delivery | Dissolves. Two identical blocks are one hash |
| W8 — a worker never walks more than one activity | Moot. Batching exists to amortise establishment across activities; the runtime keeps one context alive across many |
| W9 — a repeat fetch is answered in full | Dissolves |
| W10 — the activity body never collapses | Dissolves. The body is a hash like everything else |
| W11 — confirm re-delivered characters have fallen | Moot as stated; becomes a compile-time budget rather than a production read |

W6 is the one item that genuinely survives, and it survives *better*: a compiled corpus can report
fan-out statically instead of measuring it on a walk.

---

## Changes shape

### #436 — Engine Surfaces: who shared engine content is written for

**W1 dissolves into effect typing.** An activity that needs `Spawn` cannot be worker-audience, because
a spawned context does not carry `Spawn`. The declared field, the two delivery injection points and
the three hand-written rule carve-outs all become one containment check. The activity everybody agrees
is an unacknowledged exception stops being an exception.

**W2 half-dissolves.** Twenty-three of forty-seven rule entries on the engine group and the conduct
contract read as procedure rather than constraint — and the procedure they describe is the driving
loop, which this design deletes. What survives is the residue: rules that genuinely constrain
judgement, and which still need homes. The register produced entry by entry during the canon audit
stays the working document for that residue.

### #400 — Decision Integrity: the path from a gate to a recorded decision

**Substantially dissolves; a corpus half survives.**

The contradiction the epic opens with — one engine rule saying a gate must be shown, four workflow
rules licensing resolution without asking, three of them delivered to agents that cannot act on them —
cannot arise when the runtime owns presentation. There is no rule to contradict, because presentation
stops being an instruction and becomes something the runtime does or does not do.

"Approvals that record effects which move nothing" is definite-assignment analysis. "Steps wired to
variables nothing produces" is use-before-definition. Both become compile errors.

What survives is the content question: which gates should exist, what each asks, and whether the
decision space an option set offers is the right one. No type system answers that.

### #518 — Rule homes and audiences: a rule reaches the agent that can act on it

**Half dissolves.** Six orchestrator rules delivered to workers stop having an audience problem when
the orchestrator is code — there is no orchestrator agent to write for. The audience taxonomy shrinks
from three readers to two: the technique-executing agent, and the person.

What survives is the remainder: rules homed in a domain workflow that another workflow reaches across
to borrow. That is #519's homing question and resolves with it.

### #397 — Protocol Structure: alternatives and delegation the server can see

**Changes shape.** Protocol variants — one operation with several mutually exclusive ways to run it —
and technique folds — an inline reference resolving with its arguments checked — are a sum type and a
checked call. The language gives both for free, so the *mechanism* half of the epic dissolves.

The corpus half survives and gets larger, not smaller: authoring the variants, resolving the folds,
and the canon test on whether the arms of an alternative set still agree. Making the mechanism free
does not author the content.

### #398 — Section Delivery: citing and delivering part of a resource

**One gap of three dissolves.** "The checker and the server disagree about what a link means" cannot
survive one resolver used at compile time — a citation that does not resolve fails the build, and
there is no second implementation to disagree with.

The other two survive as corpus work: the long tail of citations delivering whole files where one
section is consulted, and the introductory framing silently absent when a section is delivered alone.
The second is a composition rule the compiler can enforce once someone decides what it should be.

### #399 — Shared Homes: one home per capability, bound rather than copied

**Mostly dissolves.** "Concurrent execution is described, not bound" is a combinator with a type. Two
capabilities existing as private property of one workflow is module extraction. The survey that finds
every other place paying for the same absence survives, and is more valuable under a language where a
found duplicate has an obvious remedy.

### #491 — Running the workflow finds defects that reading it does not

**Partly dissolves.** The borrowed-technique input check that misses is signature checking. The
fourth defect — that there was nowhere to file the other three — is a process question this design
does not touch.

### #437 — Deployment Hardening: the server outside a developer's machine

**Survives, one part eased.** Dependency scanning is orthogonal and stays exactly as scoped. The
signing-key diagnostics change shape: under a hash-chained log a key that cannot be placed degrades
the authorship claim rather than making the session unreadable, so the failure the issue wants to
report loudly becomes a smaller failure that is easier to report accurately.

---

## Survives unchanged

| Issue | Why it is orthogonal |
|---|---|
| **#511** — Issue creation: a gate the operation announces as a result | A corpus-content defect: an operation declares internal bookkeeping as an output. Typed signatures make it *visible* — an output no caller reads is reportable — but the fix is still an edit to the technique |
| **#492** — Replacing wrapper prose with tools | The question is whether a technique whose whole content is "call this tool" earns its keep. The design sharpens it — a technique with no judgement content is a step the runtime could call directly — without answering it. The measurement that withdrew the deliverable stands |
| **#438** — Review Path | Eighteen items reviewers catch by hand because no step does. Definition content, not definition mechanism |
| **#338** — Corpus Backlog | Content defects and migrations. Two migrations were gated on schema decisions in #402; those gates retarget to this epic |
| **#310** — Graph Reach | Whether workflows consult the code knowledge graph. Coverage, not mechanism |

---

## Summary

| Verdict | Count | Issues |
|---|---|---|
| Dissolves outright | 6 | #520, #519, #513, #497, #402, #404 (ten of eleven items) |
| Folds in as a work item | 2 | #523, #401 W2 |
| Dissolves in part | 6 | #436, #400, #518, #397, #398, #399 |
| Partly dissolves | 1 | #491 |
| Survives, one part eased | 1 | #437 |
| Survives unchanged | 5 | #511, #492, #438, #338, #310 |

Fourteen of twenty-one open issues are wholly or substantially answered by the design rather than by
work aimed at them. That is the argument for the epic and also the reason to be careful with it: an
epic that claims to subsume most of the tracker is exactly the shape of proposal that should be made
to earn its first milestone before the rest is committed.

**The recommended handling** is not to close anything now. Each dissolving issue closes when the stage
that dissolves it lands, with the stage named in the closing comment. Until then they remain the best
statement of what is wrong, and several hold evidence this epic depends on.
