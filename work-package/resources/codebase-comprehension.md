---
name: codebase-comprehension
description: Comprehension techniques, artifact template, and deep-dive guidance from reverse engineering and code forensics literature.
metadata:
  version: 1.1.1
  order: 25
  legacy_id: 25
---


# Codebase Comprehension Guide

Systematically build a mental model of an unfamiliar codebase before design decisions are made. Artifacts persist in `.engineering/artifacts/comprehension/` and are augmented across successive work packages into a cumulative knowledge base.

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

Form an initial architecture hypothesis from directory layout and build configuration; verify by sampling entry points, module roots, public APIs; revise as evidence accumulates; document verified understanding and open questions.

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
- **Operational scenarios** beyond the steady-state happy path:
  - **Startup and genesis**: initial values; a guard assuming "previous value is meaningful" may fail on the first block after genesis when the previous value is zero/default.
  - **Recovery after downtime**: if external state advanced significantly while offline, a bounded-advance guard may reject the catch-up jump.
  - **External system timing**: if this code runs every 6 s but the external system updates every 20 s, equal inputs across invocations are the common case, not an edge case.
  - **Reorganization and rollback**: if an external chain (e.g. Cardano) reorganizes, can the same numeric position appear with a different hash?
- **Consensus implications**: if every node receives the same input, every node hits the same error — a guard that rejects "invalid" data doesn't protect the system, it halts it. Any assertion in a consensus-critical consumer must be matched by enforcement in the producer; if the producer doesn't guarantee the invariant, the consumer must handle violations without halting.

These concerns belong in the architecture survey and deep dives, not as a separate end step: key abstractions raise "where does this data come from?"; rationale raises "what happens if this fails?"; domain mapping raises "what is the timing relationship with dependencies?". Open Questions of this kind ("Does the producer enforce the window bound?", "What happens at genesis when the previous position is zero?") prevent guards from becoming halt vectors.

## Artifact Template

Comprehension artifacts follow this structure. When augmenting an existing artifact, add new sections or deepen existing ones — do not replace prior content.

```markdown
# {Codebase Area Name} — Comprehension Artifact

> YYYY-MM-DD · work packages: [contributing refs] · coverage: [what this artifact covers] · related: [cross-refs to other comprehension artifacts; omit if none]

## Architecture Overview

### Project Structure
[Directory layout, build system, entry points]

### Module Map
[Modules, responsibilities, dependency relationships]

### Design Patterns
[Overarching architectural patterns observed: layered, event-driven, etc.]

## Key Abstractions

### Core Types
[Primary types/structs/classes and their roles]

### Traits and Interfaces
[Key traits/interfaces, purposes, implementors]

### Data Model
[Core data structures, relationships, state management]

### Error Handling
[Error types, propagation strategy, recovery patterns]

## Design Rationale

### {Decision Area}
- **Observation**: [What was observed]
- **Hypothesized rationale**: [Why this choice was likely made]
- **Trade-offs**: [What this optimizes for vs. sacrifices]
- **Implications for changes**: [How this affects modifications]

[Repeat per significant design choice]

## Data Flow and Operational Context

### Data Flow Map
[Per function the work package modifies: producer → transformations → consumer; which module produces the input, what invariants the producer guarantees]

### Invariant Alignment
| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| [invariant] | [yes/no — cite code] | [yes/no] | [gap description if any] |

### Execution Context
[Dispatch class, error propagation path, failure consequences]

### Operational Scenarios
| Scenario | Effect on This Code Path | Risk |
|----------|------------------------|------|
| Genesis / first invocation | [what happens] | [severity] |
| Recovery after downtime | [what happens] | [severity] |
| External system timing mismatch | [what happens] | [severity] |
| External chain reorganization | [what happens] | [severity] |

## Domain Concept Mapping

### Glossary
| Domain Term | Technical Construct | Description |
|-------------|-------------------|-------------|
| [term] | [module/type/function] | [explanation] |

### Domain Model
[How domain concepts map to code structure]

## Open Questions

[Unresolved questions, including producer-guarantee and operational-scenario questions]

## Deep-Dive Sections

### {Area Name} — [YYYY-MM-DD]
[Targeted exploration findings: data flows, implementation details, edge cases]
```

## Cross-Referencing

- Check whether other comprehension artifacts reference the same modules or types; add cross-references in the header line.
- Note when understanding of one area depends on another.
- If the work package's problem spans multiple codebase areas, create or update a separate artifact per area and note the relationship.
