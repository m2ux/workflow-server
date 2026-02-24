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

## Recommended Execution Sequence

Combine the techniques above in this recommended order during the activity:

1. **Orientation** (Reverse Engineering Patterns): Read All the Code in One Hour, Skim the Documentation, examine build system
2. **Evidence Gathering** (Code Forensics): Run hotspot analysis, temporal coupling, and knowledge map generation against the git history
3. **Structural Analysis** (Code Reading + Hierarchical Decomposition): Map architecture, identify key abstractions, trace dependency graphs
4. **Design Recovery** (Design Rationale + Legacy Code): Infer rationale, identify seams, sketch effects, document persistent data model
5. **Domain Mapping**: Connect technical constructs to domain concepts, build glossary
6. **Deep-Dive Loop**: Use forensic evidence (hotspots, coupling) plus problem relevance to prioritize deep-dive areas

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
