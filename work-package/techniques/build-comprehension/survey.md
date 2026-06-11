---
metadata:
  version: 1.0.0
---

## Capability

Broad comprehension pass: discover existing artifacts, establish the GitNexus posture, then survey architecture, abstractions, design rationale, and domain mapping to form the initial mental model of the codebase area.

## Inputs

### comprehension_dir

Directory holding codebase-comprehension artifacts (inherited from the [build-comprehension](./TECHNIQUE.md) group root; declared here as the binding contract). Listed to discover and match existing artifacts before fresh analysis.

### project_type

*(optional)* Detected project type, rust-substrate|other (inherited from the [build-comprehension](./TECHNIQUE.md) group root). Confirmed from the build system and used to shape which abstractions and patterns to look for.

### problem_statement

The work package problem statement; used to match relevant existing artifacts and to prioritize areas during the survey.

### target_path

Path to the reference project root surveyed for structure, build system, and entry points.

### gitnexus_indexed

Flag resolved by start-work-package indicating whether the reference codebase is indexed; selects between gitnexus-operations and grep/read/glob for structural analysis.

## Outputs

### architecture_overview

Module structure, boundaries and responsibilities, dependency relationships, and overarching patterns (layered, event-driven, actor, plugin, etc.) for the surveyed area.

### key_abstractions

Core types, traits/interfaces, and data structures forming the domain model, with type hierarchies, error-handling strategy, and state-management approach.

### design_rationale

Inferred rationale for significant design choices and their trade-offs, framed as hypotheses for user validation.

### domain_glossary

Mapping of domain-specific terms to the technical modules/constructs that implement them, connected to the problem statement.

## Protocol

### 1. Discover Existing

- List contents of the `{comprehension_dir}` directory
- Match existing artifacts by project name, module name, or domain terms from `{problem_statement}`
- Summarize relevant artifacts with coverage scope and last-updated date
- If no comprehension artifacts exist yet for this codebase, proceed with fresh analysis — this is the first comprehension pass

### 2. Check Gitnexus

- Honor the `{gitnexus_indexed}` flag resolved by start-work-package — it already determined whether the reference codebase is indexed; do not re-probe unless it is unset (if you must, read `gitnexus://repo/{name}/context` per `gitnexus-operations.index-freshness-first`)
- If `{gitnexus_indexed}` is true: structural analysis throughout this technique goes through the gitnexus-operations operations (`query`, `context`, `impact`, `cypher`) — they are REQUIRED for structural analysis here, the default over grep
- Only when `{gitnexus_indexed}` is false (the codebase is genuinely not indexed or stale): fall back to grep/read/glob for all exploration steps

### 3. Architecture Survey

- Top-down survey: start with the `{target_path}` project root structure, build system, and entry points
- Confirm the `{project_type}` from the build system and language conventions encountered (rust-substrate|other), and use it to shape which abstractions and patterns to look for in later steps
- When GitNexus is available: apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md) to discover execution flows and functional areas, read cluster resources for module groupings, and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) for dependency mapping — faster than grep and the required primary approach
- Use glob to map directory structure, find module files, and locate test files — glob is the appropriate tool for filesystem-shape discovery during the architecture survey
- Identify module boundaries and their responsibilities from directory layout, module declarations, and public APIs
- Map dependency relationships between modules (imports, trait implementations, cross-module calls)
- Identify overarching patterns: layered architecture, event-driven, actor model, plugin system, etc.
  - If the codebase uses patterns or frameworks you are unfamiliar with, use web research to understand the framework conventions, then document the findings
- Form architecture hypotheses and verify by sampling implementation files
- If the codebase is too large for exhaustive analysis, focus on areas relevant to the problem statement and note the unexplored areas for future passes

### 4. Abstractions Analysis

- Identify core types, traits/interfaces, and data structures that form the domain model
- Document type hierarchies, trait bounds, and generic constraints
- Map error handling strategy: error types, Result patterns, error propagation
- Document state management approach: where state lives, how it flows, mutation patterns

### 5. Design Rationale

- For each significant design choice, infer the likely rationale from context clues: comments, naming, structure, constraints
- Identify trade-offs: what does this design optimize for? what does it sacrifice?
- Frame rationale as hypotheses for user validation — not assertions

### 6. Domain Mapping

- Map technical modules to domain concepts: what real-world problem does each subsystem solve?
- Build a glossary of domain-specific terms found in code, comments, and documentation
- Connect domain concepts to the problem statement to highlight relevant areas
