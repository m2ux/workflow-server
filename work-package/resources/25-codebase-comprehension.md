# Codebase Comprehension Guide

Resource for the `codebase-comprehension` activity. Provides the artifact template, comprehension techniques, and guidance for building persistent knowledge artifacts.

## Purpose

When maintaining or extending an unfamiliar codebase, there is a knowledge gap between the AI agent's ability to propose design choices and the user's ability to evaluate those choices. This activity bridges that gap by systematically building a mental model of the codebase before design decisions are made.

The resulting artifacts persist in `.engineering/artifacts/comprehension/` and grow across successive work packages, forming a cumulative knowledge base.

## Comprehension Techniques

The approach draws on established program comprehension, reverse engineering, and code forensics research from multiple disciplines.

### 1. Reverse Engineering Patterns (Demeyer, Ducasse, Nierstrasz)

The *Object-Oriented Reengineering Patterns* book defines reverse engineering as "the process of analyzing a subject system to identify the system's components and their interrelationships and create representations of the system in another form or at a higher level of abstraction." Several patterns from the "Setting Direction" and "First Contact" clusters apply directly:

- **Read All the Code in One Hour**: Skim the entire codebase in a time-boxed session to form initial hypotheses about structure, conventions, and complexity. Do not attempt deep understanding — the goal is orientation and pattern recognition.
- **Skim the Documentation**: Review available documentation (README, architecture docs, API docs, comments) for stated design intent. Note where documentation diverges from code — these gaps reveal undocumented evolution.
- **Interview During Demo**: If possible, have an expert walk through the system's behavior. In the AI-assisted context, trace execution paths through key use cases as a substitute.
- **Do a Mock Installation**: Build and run the system to understand its operational behavior, dependencies, and configuration. Reveals assumptions not visible in static code reading.
- **Analyze the Persistent Data**: Examine database schemas, configuration files, and data structures to understand the domain model from a data perspective. The persistent data often reveals the true domain model more reliably than code structure.

The key insight from the reengineering literature: "all reengineering activity must start with some reverse engineering, since you will not be able to trust the documentation."

### 2. Code Forensics (Tornhill)

*Your Code as a Crime Scene* and *Software Design X-Rays* apply forensic psychology and behavioral analysis techniques to codebases. These techniques are particularly effective for identifying where to focus comprehension effort:

- **Hotspot Analysis**: Identify files with high change frequency combined with high complexity. These are the areas where understanding matters most — they change often and are hard to reason about. Use `git log --format=format: --name-only | sort | uniq -c | sort -rn` to find change frequency.
- **Temporal Coupling Analysis**: Find files that change together across commits, even if they have no direct code dependency. This reveals hidden architectural relationships that aren't visible from import/dependency analysis alone.
- **Knowledge Maps**: Use `git blame` and commit history to identify who understands which parts of the code. Areas with departed developers or single-author ownership represent knowledge concentration risks.
- **Complexity Trends**: Track whether specific files are growing more complex over time (rising hotspots) or stabilizing. Rising hotspots indicate areas where design drift is occurring.
- **Change Coupling Across Boundaries**: When files in different modules consistently change together, it suggests either a missing abstraction or an architectural boundary violation. These cross-boundary couplings are prime candidates for deep-dive exploration.

The forensic approach prioritizes understanding: "optimize for understanding" by focusing on the areas where the evidence (version history) shows the most activity and complexity.

### 3. Legacy Code Characterization (Feathers)

*Working Effectively with Legacy Code* defines legacy code as "code without tests" and provides techniques for understanding code before modification:

- **Sensing Variables**: Identify the key variables and state that flow through the area under study. Understanding state flow reveals the operational semantics of the code.
- **Seam Identification**: Find the natural points where the system can be decomposed for understanding — places where behavior can be observed or intercepted without modifying the code.
- **Effect Sketches**: Draw informal diagrams showing how changes to one part of the code propagate effects through the system. This reveals coupling that is not obvious from static analysis.
- **Characterization Tests**: Write tests that document the current behavior of the code (not what it should do, but what it actually does). These serve as both comprehension aids and safety nets.

### 4. Code Reading Strategies (Spinellis)

*Code Reading: The Open Source Perspective* provides systematic strategies for reading unfamiliar code:

- **Top-Down Strategy**: Start with the highest-level entry point and trace downward through the call hierarchy. Suitable when the system has clear entry points and layered architecture.
- **Bottom-Up Strategy**: Start with the data structures and types, then understand how they are manipulated. Suitable for data-intensive systems or when the architecture is opaque.
- **Build System as Map**: The build configuration (Cargo.toml, package.json, Makefile) reveals module boundaries, dependencies, and the intended compilation/linking structure.
- **Naming Conventions as Signal**: Consistent naming conventions encode domain knowledge. Inconsistent naming often marks boundaries between different development eras or teams.
- **Graph Properties**: Understand the dependency graph: is it a DAG? Are there cycles? What's the fan-in and fan-out of key modules? The shape of the dependency graph reveals architectural intent.

### 5. Hypothesis-Driven Top-Down Comprehension

Start with high-level hypotheses about the codebase's structure and purpose, then verify them by examining code. This mirrors how expert developers naturally approach unfamiliar code (von Mayrhauser & Vans, 1995).

- Form an initial hypothesis about the architecture from directory layout and build configuration
- Verify by sampling key files: entry points, module roots, public APIs
- Revise hypotheses as evidence accumulates
- Document verified understanding and open questions

### 6. Hierarchical Decomposition

Break the codebase into layers of understanding, progressing from broad to specific:

| Layer | Focus | Questions Answered |
|-------|-------|--------------------|
| **Architecture** | Project structure, module boundaries, design patterns | How is the system organized? What are the major subsystems? |
| **Module** | Responsibilities, dependencies, public interfaces | What does each module do? How do modules interact? |
| **Abstraction** | Core types, traits, data structures, error handling | What are the building blocks? How is state managed? |
| **Design Rationale** | Why patterns were chosen, trade-offs, constraints | Why was it built this way? What does this optimize for? |
| **Domain** | Business concepts, domain terminology, use cases | What real-world problem does this solve? |

### 7. Elaboration and Connection

Connect new information to existing knowledge structures. For each design choice observed, ask:

- Why this approach over alternatives?
- What constraints led to this design?
- How does this relate to patterns I already know?
- What are the implications for the change I need to make?

### 8. Progressive Deepening

Not all areas require equal depth. Use hotspot analysis and problem relevance to focus comprehension effort:

- **Shallow pass**: All modules get architecture-level understanding via the "Read All the Code in One Hour" pattern
- **Medium depth**: Modules adjacent to the change area and temporal coupling partners get abstraction-level understanding
- **Deep dive**: Hotspots and the specific subsystem being modified get full comprehension including design rationale, effect sketches, and characterization

### 9. Data Flow Tracing and Operational Context

Structural comprehension (architecture, abstractions, design rationale) answers "what exists" but not "how data moves through the system" or "what happens when things go wrong at runtime." These gaps are particularly dangerous when the work package adds validation or guard logic — understanding only the consumer side of a data flow can lead to guards that reject legitimate data, or assertions that assume invariants the producer doesn't guarantee.

#### Data Flow Tracing

For each function or code path the work package will modify, trace the data flow end-to-end before proposing any design:

- **Upstream**: Where does the input data originate? Identify the producer — the code that constructs the values this function receives. Read the producer's implementation, not just the consumer's expectations. If the producer is in a different module, crate, or service, that is precisely where comprehension must extend.
- **Transformations**: What happens to the data between production and consumption? Are there intermediate steps that filter, aggregate, clamp, or reformat the data?
- **Downstream**: Where does the output go? Who reads the values this function writes? How do downstream consumers react to different output states?
- **Invariant alignment**: What invariants does the producer guarantee? What invariants does the consumer assume? If the consumer plans to add a validation (e.g., an `ensure!` guard), verify that the producer can always satisfy it. A consumer-side assertion for an invariant the producer doesn't enforce creates a failure mode where legitimate data is rejected.

The most common comprehension failure is staying inside the module being modified. If the work package touches function F in module M, but F's inputs come from module P, the comprehension must include P — otherwise, the agent proposes guards that are structurally correct within M but operationally wrong because P can produce values that violate them.

#### Operational Context and Failure Modes

Static code reading reveals structure. Operational analysis reveals behavior — especially failure behavior. For the code path being modified:

- **Execution context**: What dispatch class, thread model, or execution priority does this code run under? In Substrate, a `Mandatory` dispatch that returns an error causes the block to be rejected. In a consensus system where all nodes process the same inputs, a rejected block means every node rejects it — the network halts. Understanding the execution context determines whether an error is a local retry, a skipped item, or a system-wide halt.
- **Error propagation**: Trace what happens when this code returns an error. Is the error caught and handled? Does it propagate to a transaction boundary with rollback? Does it surface to the user? Does it halt processing? For inherent extrinsics, check `IsFatalError` — if all variants return `true`, every error is fatal.
- **Operational scenarios**: Consider conditions beyond the steady-state happy path:
  - **Startup and genesis**: What are the initial values? Does the first invocation produce data that looks different from subsequent ones? A guard that assumes "previous value is meaningful" may fail on the first block after genesis when the previous value is a zero/default.
  - **Recovery after downtime**: If the system was offline and external state advanced significantly, what happens on the first invocation after restart? A bounded-advance guard may reject the catch-up jump.
  - **External system timing**: How frequently is this code invoked relative to external state changes it depends on? If the code runs every 6 seconds but the external system updates every 20 seconds, the same external state will be observed across multiple invocations — equal inputs are the common case, not an edge case.
  - **Reorganization and rollback**: If an external chain (e.g., Cardano) reorganizes, what values does the data provider produce? Can the same numeric position appear with a different hash?
- **Consensus implications**: For consensus-critical code, if every node receives the same input from the same data provider, then every node will hit the same error. A guard that rejects "invalid" data in this context doesn't protect the system — it halts it. The principle: any assertion in a consensus-critical consumer must be matched by enforcement in the producer. If the producer doesn't guarantee the invariant, the consumer must handle violations without halting.

#### Integrating These Techniques

Data flow tracing and operational analysis are not separate activities performed at the end — they should be woven into the architecture survey and deep-dive steps. When examining a module's key abstractions, ask "where does this data come from?" When documenting design rationale, ask "what happens if this fails?" When mapping domain concepts, ask "what is the timing relationship between this system and its dependencies?"

The comprehension artifact's Open Questions section should include questions in these categories. Questions like "Does the producer enforce the window bound?" or "What happens at genesis when the previous position is zero?" are exactly the kind of questions that prevent guards from becoming halt vectors.

## Recommended Execution Sequence

Combine the techniques above in this recommended order during the activity:

1. **Orientation** (Reverse Engineering Patterns): Read All the Code in One Hour, Skim the Documentation, examine build system
2. **Evidence Gathering** (Code Forensics): Run hotspot analysis, temporal coupling, and knowledge map generation against the git history
3. **Structural Analysis** (Code Reading + Hierarchical Decomposition): Map architecture, identify key abstractions, trace dependency graphs
4. **Data Flow and Operational Analysis** (Data Flow Tracing + Operational Context): For the specific code path the work package targets, trace data upstream to the producer and downstream to consumers. Identify the execution context, error propagation path, and operational scenarios (genesis, recovery, timing, reorg). Verify that any invariants the work package plans to enforce are guaranteed by the data producer.
5. **Design Recovery** (Design Rationale + Legacy Code): Infer rationale, identify seams, sketch effects, document persistent data model
6. **Domain Mapping**: Connect technical constructs to domain concepts, build glossary
7. **Deep-Dive Loop**: Use forensic evidence (hotspots, coupling) plus problem relevance to prioritize deep-dive areas

## Knowledge Base References

The following sources in the knowledge base are directly relevant to this activity:

| Source | Key Contributions |
|--------|-------------------|
| *Object-Oriented Reengineering Patterns* (Demeyer, Ducasse, Nierstrasz) | Setting Direction and First Contact pattern clusters; reverse engineering lifecycle; system understanding patterns |
| *Your Code as a Crime Scene* (Tornhill) | Forensic code analysis; hotspot identification; temporal coupling; knowledge maps; organizational metrics |
| *Software Design X-Rays* (Tornhill) | Behavioral code analysis; complexity trends; change coupling; fractal value analysis; architectural hotspots |
| *Code Reading: The Open Source Perspective* (Spinellis) | Code reading strategies; program comprehension; software archaeology; build system analysis |
| *Working Effectively with Legacy Code* (Feathers) | Seam identification; characterization tests; dependency breaking; sensing variables; effect analysis |

## Discovering Existing Artifacts

Before creating new knowledge, check for existing comprehension artifacts:

1. List contents of `.engineering/artifacts/comprehension/`
2. Match by project name, module names, or domain terms from the current problem statement
3. For each relevant artifact found:
   - Summarize its coverage scope and last-updated date
   - Note which sections are relevant to the current task
   - Identify gaps that should be filled during this pass
4. Present findings to the user at the `existing-artifacts-review` checkpoint

## Artifact Template

Comprehension artifacts follow this structure. When augmenting an existing artifact, add new sections or deepen existing ones — do not replace prior content.

```markdown
# {Codebase Area Name} — Comprehension Artifact

> **Last updated**: YYYY-MM-DD
> **Work packages**: [list of work package references that contributed]
> **Coverage**: [brief description of what this artifact covers]
> **Related artifacts**: [cross-references to other comprehension artifacts]

## Architecture Overview

### Project Structure
[Directory layout, build system, entry points]

### Module Map
[Modules, their responsibilities, and dependency relationships]

### Design Patterns
[Overarching architectural patterns observed: layered, event-driven, etc.]

## Key Abstractions

### Core Types
[Primary types/structs/classes and their roles]

### Traits and Interfaces
[Key traits/interfaces, their purposes, and implementors]

### Data Model
[Core data structures, relationships, state management]

### Error Handling
[Error types, propagation strategy, recovery patterns]

## Design Rationale

### {Decision Area 1}
- **Observation**: [What was observed]
- **Hypothesized rationale**: [Why this choice was likely made]
- **Trade-offs**: [What this optimizes for vs. what it sacrifices]
- **Implications for changes**: [How this affects modifications]

### {Decision Area N}
[Same structure for each significant design choice]

## Data Flow and Operational Context

### Data Flow Map
[For each function the work package modifies: producer → transformations → consumer]
[Document which module produces the input data, what invariants the producer guarantees]

### Invariant Alignment
| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| [invariant] | [yes/no — cite code] | [yes/no] | [description of gap if any] |

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

## Deep-Dive Sections

### {Area Name} — [YYYY-MM-DD]
[Targeted exploration findings: data flows, implementation details, edge cases]

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
```

## Deep-Dive Exploration

During the deep-dive loop, the agent should:

1. **Present candidates**: List areas available for exploration based on the architecture survey, prioritized by relevance to the current problem statement
2. **Propose specific questions**: For each area, suggest concrete questions the user might want answered (e.g., "How does error propagation work between module X and module Y?")
3. **Perform targeted analysis**: For the selected area, trace data flows, examine implementation details, identify edge cases, and document internal design decisions
4. **Append to artifact**: Add findings as a dedicated subsection under "Deep-Dive Sections" with a date stamp
5. **Check sufficiency**: Return to the `comprehension-sufficient` checkpoint — does the user have enough context, or do they want to explore further?

## Cross-Referencing

When creating or updating comprehension artifacts:

- Check if other comprehension artifacts reference the same modules or types
- Add cross-references in the metadata header
- Note when understanding of one area depends on understanding of another
- If the current work package's problem spans multiple codebase areas, create or update separate artifacts for each and note the relationship
