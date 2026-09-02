---
metadata:
  version: 1.1.0
---

## Capability

Initial mental model of the codebase area — architecture, abstractions, design rationale, and domain mapping.

## Inputs

### project_type

*(optional)* Detected project type, rust-substrate|other. Confirmed from the build system and used to shape which abstractions and patterns to look for.

### gitnexus_indexed

Whether the codebase under work has a usable GitNexus index; selects between gitnexus-operations and grep/read/glob for structural analysis.

## Outputs

### comprehension_survey

Initial survey of the codebase area, taking the shape and fill rules of the [Corpus Artifact Template](../../resources/codebase-comprehension.md#corpus-artifact-template).

#### architecture_overview

Module structure, boundaries and responsibilities, dependency relationships, and overarching patterns (layered, event-driven, actor, plugin, etc.) for the surveyed area.

#### key_abstractions

Core types, traits/interfaces, and data structures forming the domain model, with type hierarchies, error-handling strategy, and state-management approach.

#### design_rationale

Rationale inferred for each significant design choice, with the trade-off it carries and what it constrains in later changes.

#### domain_glossary

Mapping of domain-specific terms to the technical modules/constructs that implement them, connected to the problem statement.

## Protocol

### 1. Discover Existing

- List contents of the `{comprehension_dir}` directory
- Match existing artifacts by project name, module name, or domain terms from `{problem_statement}`
- Summarize relevant artifacts with coverage scope and last-updated date
- If no comprehension artifacts exist yet for this codebase, proceed with fresh analysis — this is the first comprehension pass

### 2. Check Gitnexus

- Honor the bound `{gitnexus_indexed}` flag — it records whether the codebase under work has a usable index; re-probe only where it is unset, through the operation `gitnexus-operations.index-freshness-first` names
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
  > If the codebase uses patterns or frameworks you are unfamiliar with, use web research to understand the framework conventions, then document the findings
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
- Identify what each choice constrains: which later changes it rules out, and which it makes cheap
- State each rationale as a property of the design, under the heading that marks the whole section as read out of the code rather than stated by its authors; where the source documents a reason outright, say so in the entry

### 6. Domain Mapping

- Map technical modules to domain concepts: what real-world problem does each subsystem solve?
- Build a glossary of domain-specific terms found in code, comments, and documentation
- Connect domain concepts to the problem statement to highlight relevant areas

### 7. Assemble Survey

- Fold the architecture overview, key abstractions, design rationale, and domain glossary into `{comprehension_survey}`, in the section order the [Corpus Artifact Template](../../resources/codebase-comprehension.md#corpus-artifact-template) defines
