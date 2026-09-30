---
name: codebase-comprehension
description: Comprehension techniques, corpus and log artifact templates, promotion criteria, and deep-dive guidance from reverse engineering and code forensics literature.
metadata:
  version: 2.0.2
  order: 25
  legacy_id: 25
---


# Codebase Comprehension Guide

Systematically build a mental model of an unfamiliar codebase before design decisions are made. Comprehension produces a cumulative corpus artifact and a session-local log, each with its own template below.

Knowledge-base sources for concept lookups: *Object-Oriented Reengineering Patterns* (Demeyer, Ducasse, Nierstrasz — first contact, reverse engineering lifecycle), *Your Code as a Crime Scene* (Tornhill — hotspots, temporal coupling, knowledge maps), *Software Design X-Rays* (Tornhill — behavioral analysis, complexity trends, change coupling), *Code Reading* (Spinellis — reading strategies, software archaeology, build analysis), *Working Effectively with Legacy Code* (Feathers — seams, characterization tests, dependency breaking).

## Comprehension Techniques

### 1. Reverse Engineering Patterns (Demeyer, Ducasse, Nierstrasz)

- **Read All the Code in One Hour**: time-boxed skim of the entire codebase to form initial hypotheses about structure, conventions, complexity. Orientation only — no deep understanding.
- **Skim the Documentation**: review README, architecture docs, API docs, comments for stated design intent. Note where documentation diverges from code — gaps reveal undocumented evolution. Never trust documentation without verifying against code.
- **Interview During Demo**: absent an expert walkthrough, trace execution paths through key use cases as the substitute.
- **Do a Mock Installation**: build and run the system to reveal operational behavior, dependencies, and configuration assumptions invisible to static reading.
- **Analyze the Persistent Data**: database schemas, config files, and data structures often reveal the true domain model more reliably than code structure.

### 2. Code Forensics (Tornhill)

Use these to decide where to focus comprehension effort:

- **Hotspot Analysis**: high change frequency x high complexity = where understanding matters most. Change frequency: `git log --format=format: --name-only | sort | uniq -c | sort -rn`.
- **Temporal Coupling**: files that change together across commits without direct code dependency reveal hidden architectural relationships.
- **Knowledge Maps**: `git blame` and commit history to find single-author or departed-owner areas — knowledge concentration risks.
- **Complexity Trends**: files growing more complex over time (rising hotspots) indicate design drift.
- **Change Coupling Across Boundaries**: cross-module co-change suggests a missing abstraction or boundary violation — prime deep-dive candidates.

### 3. Legacy Code Characterization (Feathers)

- **Sensing Variables**: identify key variables and state flowing through the area under study — state flow reveals operational semantics.
- **Seam Identification**: find points where behavior can be observed or intercepted without modifying the code.
- **Effect Sketches**: informal diagrams of how changes propagate effects through the system — reveals coupling not visible statically.
- **Characterization Tests**: tests documenting what the code actually does (not what it should do); both comprehension aid and safety net.

### 4. Code Reading Strategies (Spinellis)

- **Top-Down**: trace from the highest-level entry point down the call hierarchy — for systems with clear entry points and layered architecture.
- **Bottom-Up**: start with data structures and types, then how they are manipulated — for data-intensive systems or opaque architecture.
- **Build System as Map**: Cargo.toml/package.json/Makefile reveal module boundaries, dependencies, and intended structure.
- **Naming Conventions as Signal**: consistent naming encodes domain knowledge; inconsistency marks boundaries between development eras or teams.
- **Graph Properties**: is the dependency graph a DAG? Cycles? Fan-in/fan-out of key modules? The shape reveals architectural intent.

### 5. Hypothesis-Driven Top-Down Comprehension

Form an initial architecture hypothesis from directory layout and build configuration; verify by sampling entry points, module roots, public APIs; revise as evidence accumulates. Verified understanding lands in the corpus artifact; the hypothesis that produced it, and any question it leaves open, stay in the log.

### 6. Hierarchical Decomposition

| Layer | Focus | Questions Answered |
|-------|-------|--------------------|
| **Architecture** | Project structure, module boundaries, design patterns | How is the system organized? Major subsystems? |
| **Module** | Responsibilities, dependencies, public interfaces | What does each module do? How do modules interact? |
| **Abstraction** | Core types, traits, data structures, error handling | What are the building blocks? How is state managed? |
| **Design Rationale** | Why patterns were chosen, trade-offs, constraints | Why was it built this way? What does it optimize for? |
| **Domain** | Business concepts, terminology, use cases | What real-world problem does this solve? |

### 7. Elaboration and Connection

For each observed design choice ask: why this over alternatives? What constraints led here? How does it relate to known patterns? What are the implications for the change I need to make?

### 8. Progressive Deepening

- **Shallow pass**: all modules get architecture-level understanding (Read All the Code in One Hour).
- **Medium depth**: modules adjacent to the change area and temporal-coupling partners get abstraction-level understanding.
- **Deep dive**: hotspots and the subsystem being modified get full comprehension — design rationale, effect sketches, characterization.

### 9. Data Flow Tracing and Operational Context

Structural comprehension answers "what exists", not "how data moves" or "what happens at runtime when things go wrong". These gaps are most dangerous when the work package adds validation or guard logic: understanding only the consumer side can produce guards that reject legitimate data.

#### Data Flow Tracing

Consult end-to-end data-flow for each function or code path the work package will modify:

- **Upstream**: where does input data originate? The producer's implementation, not just the consumer's expectations. If the producer is in a different module, crate, or service, comprehension extends there.
- **Transformations**: intermediate steps that filter, aggregate, clamp, or reformat between production and consumption.
- **Downstream**: who reads the outputs, and how do consumers react to different output states?
- **Invariant alignment**: what invariants does the producer guarantee vs. what the consumer assumes? A consumer-side assertion for an invariant the producer doesn't enforce rejects legitimate data.

The most common comprehension failure is staying inside the module being modified: if function F in module M takes inputs from module P, comprehension includes P — otherwise guards are structurally correct within M but operationally wrong.

#### Operational Context and Failure Modes

Lexicon for the code path under study:

- **Execution context**: dispatch class, thread model, execution priority. In Substrate, a `Mandatory` dispatch returning an error rejects the block; in a consensus system where all nodes process the same inputs, that halts the network. Execution context determines whether an error is a local retry, a skipped item, or a system-wide halt.
- **Error propagation**: what happens on error — caught and handled? Rolled back at a transaction boundary? Surfaced to the user? Halts processing? For inherent extrinsics, `IsFatalError` — if all variants return `true`, every error is fatal.
- **Resource bounds**: what caps the work an untrusted or unlucky input can induce — declared constants, cache capacities, per-identity budgets — and what each one actually limits, which is often narrower than its name suggests.
- **Operational scenarios** beyond the steady-state happy path:
  - **Startup and genesis**: initial values; a guard assuming "previous value is meaningful" may fail on the first block after genesis when the previous value is zero/default.
  - **Recovery after downtime**: if external state advanced significantly while offline, a bounded-advance guard may reject the catch-up jump.
  - **External system timing**: if this code runs every 6 s but the external system updates every 20 s, equal inputs across invocations are the common case, not an edge case.
  - **Reorganization and rollback**: if an external chain (e.g. Cardano) reorganizes, can the same numeric position appear with a different hash?
- **Consensus implications**: if every node receives the same input, every node hits the same error — a guard that rejects "invalid" data doesn't protect the system, it halts it. Any assertion in a consensus-critical consumer must be matched by enforcement in the producer; if the producer doesn't guarantee the invariant, the consumer must handle violations without halting.

These concerns belong in the architecture survey and deep dives, not as a separate end step: key abstractions raise "where does this data come from?"; rationale raises "what happens if this fails?"; domain mapping raises "what is the timing relationship with dependencies?". Open questions of this kind ("Does the producer enforce the window bound?", "What happens at genesis when the previous position is zero?") prevent guards from becoming halt vectors.

## Corpus Artifact Template

The durable artifact. It states what is true of the codebase area, in the present tense, for a reader who has neither the session nor the code open. Its top-level split is structure (what exists) against behaviour (what happens when it runs).

```markdown
# {Codebase Area Name} — Comprehension

> read at [revision] · covers [what this artifact covers] · related: [links to related corpus artifacts]

[One sentence naming what this area does.]

## Structure

[The dependency shape in a sentence or two, then a diagram of it.]

### Entry Points

[The path from process start to this area, as a diagram of the call chain.]

### Module Map

| Module | Responsibility | Depends on |
|--------|----------------|------------|
| [module] | [what it is for, in prose] | [modules] |

### Core Types and Interfaces

| Type or interface | Role |
|-------------------|------|
| [type] | [what it is for, in prose] |

### Design Patterns

[One paragraph per pattern: the shape, where it shows up, and when it governs at run time.]

## Behaviour

### Data Flow

[Where trust or authority enters, then one diagram per producer-to-consumer route with a paragraph on each.]

### Invariant Alignment

| Invariant | Producer enforces? | Consumer assumes? | Gap |
|-----------|-------------------|-------------------|-----|
| [invariant] | [the enforcing check, linked, or no] | [yes/no] | [the gap, or —] |

### Failure and Bounds

[The execution context and how far a failure travels, then what caps the work an untrusted or unlucky input can induce.]

| Limit or failure | What it binds or causes |
|------------------|-------------------------|
| [constant, cache, budget or error] | [its actual scope, in prose] |

### Operational Scenarios

| Scenario | Effect on this code path | Risk |
|----------|--------------------------|------|
| Genesis / first invocation | [what happens] | [severity] |
| Recovery after downtime | [what happens] | [severity] |
| External system timing mismatch | [what happens] | [severity] |
| External chain reorganization | [what happens] | [severity] |

## Design Rationale

[Read out of the code, its comments and its structure; an entry says so where a source states the reason outright. One paragraph per choice: what the code does, the logic that makes it coherent, and what it costs or constrains.]

## Glossary

| Domain term | Construct | Meaning |
|-------------|-----------|---------|
| [term] | [module, type or function] | [explanation] |
```

## Comprehension Log Template

The session-local record: the questions this pass asked, the investigations that answered them, and what it left open. The settled facts live in the corpus artifact.

```json
{
  "area": "the codebase area",
  "coverage": "what was read, at which revision",
  "open_questions": [
    { "id": "Q-1", "question": "…", "status": "open", "resolution": null, "answered_by": null }
  ],
  "deep_dives": [
    {
      "id": "DD-1",
      "area": "the area investigated",
      "date": "YYYY-MM-DD",
      "findings": ["one traced data flow, implementation detail or edge case per entry"],
      "enumerations": [
        { "set": "what was walked in full", "produced_by": "the query or command", "members": ["…"] }
      ]
    }
  ],
  "challenges": [
    { "perspective": "…", "date": "YYYY-MM-DD", "surfaced": ["…"] }
  ],
  "out_of_scope": [
    { "item": "an item outside this work package the pass surfaced", "to_settle": "what it would take" }
  ]
}
```

A resolved question carries its one-line `resolution` and the `id` of the deep dive that answered it in `answered_by`.

## Promotion

The log is the working; the corpus artifact takes what survives. When a question resolves, its answer is written into the corpus section it belongs to, as a statement about the code, and the reasoning that reached it stays in the log.

- **Promote** the settled outcome — a measured constant, a resolved gap in an invariant row, a correspondence confirmed against upstream source, a rationale the evidence supports.
- **Keep local** the derivation — the question, the alternatives weighed, the trace that closed it, the challenge output, and anything scoped to this work package.
- A promoted fact reads as a property of the code, carrying no trace of the question that produced it.
- Facts persist; prose does not. A later pass may merge, restate, or drop corpus wording that a new fact supersedes, so long as no fact is lost.

## Cross-Referencing

- Check whether other corpus artifacts cover the same modules or types, and link them from the corpus artifact's header line.
- Note when understanding of one area depends on another.
- If the work package's problem spans multiple codebase areas, create or update a separate corpus artifact per area. One log covers the pass, however many areas it touched.

## Rules

These govern the corpus artifact.

### prose-over-symbols

Paragraph prose names code per [Prose](/meta/resources/writing-register.md#prose). Code identifiers, expressions, field lists and enum variants live in tables, diagrams, fenced blocks and link targets — the surfaces built to carry them.

### role-columns-in-prose

Tables carry identifiers generally, under `prose-over-symbols`; a column describing what something is *for* carries prose, the one exception this artifact takes to the writing register's no-prose-in-a-cell. Parameter lists, field names and variant names belong to the definition the row links to.

### demonstratives-over-counts

Introduce a list with a demonstrative rather than a tally — the count goes stale the moment an entry is added. Where a value matters, name the constant that holds it rather than the number it currently is.

### diagram-the-shape

The dependency shape, the entry-point call chain, and each data-flow route carry a diagram. The diagram carries the shape and the prose carries the detail.

### present-tense-facts

The corpus artifact states what is, in the present tense. Narrative of how the code came to be this way, and comparison against what it used to do, belong to the change record.

### line-budget

Roughly 150 lines for a corpus artifact covering one area. An area needing materially more is two areas.
