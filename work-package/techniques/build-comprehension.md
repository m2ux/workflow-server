---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 22
  legacy_id: 22
---

## Capability

Build or augment codebase comprehension through progressive analysis and persistent knowledge artifacts

## Inputs

### project-type

*(optional)* Detected project type (rust-substrate|other)

## Protocol

### 1. Discover Existing

- List contents of .engineering/artifacts/comprehension/ directory
- Match existing artifacts by project name, module name, or domain terms from {problem-statement}
- Summarize relevant artifacts with coverage scope and last-updated date
- If no comprehension artifacts exist yet for this codebase, proceed with fresh analysis — this is the first comprehension pass

### 2. Check Gitnexus

- Confirm the codebase is indexed and fresh per gitnexus-operations.index-freshness-first (read `gitnexus://repo/{name}/context`)
- If indexed: structural analysis throughout this technique goes through the gitnexus-operations operations (`query`, `context`, `impact`, `cypher`) — they are REQUIRED for structural analysis here. If not indexed or stale, fall back to grep/read/glob.
- If not indexed or stale: fall back to grep/read/glob for all exploration steps.

### 3. Architecture Survey

- Top-down survey: start with the {target-path} project root structure, build system, and entry points
- Confirm the {project-type} from the build system and language conventions encountered (rust-substrate|other), and use it to shape which abstractions and patterns to look for in later steps
- When GitNexus is available: apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) to discover execution flows and functional areas, read cluster resources for module groupings, and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) for dependency mapping — faster than grep and the required primary approach
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

### 7. Artifact Management

- Write the {comprehension-artifact} following the artifact structure and comprehension techniques in [codebase-comprehension](../resources/codebase-comprehension.md)
- Artifact naming: {codebase-area-name}.md in .engineering/artifacts/comprehension/
- Derive codebase-area-name from the target project or subsystem name (slugified)
- When augmenting: add new sections, update existing sections with deeper detail, preserve prior content
- Include metadata header: date, work-package reference, coverage scope, related artifacts
- Include an 'Open Questions' section (markdown table) between Domain Concept Mapping and Deep-Dive Sections — this section is maintained by the question-management protocol

### 8. Deep Dive

- Present candidate areas based on architecture survey and problem relevance
- For selected area: trace data flows, examine implementation details, document edge cases
- When GitNexus is available: apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) to trace callers/callees, read process resources for full execution traces, and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) for custom call chain queries
- Append findings as dedicated subsections in the comprehension artifact

### 9. Question Management

- The 'Open Questions' section is a markdown table with columns: #, Question, Status, Resolution, Deep-Dive Section
- After each deep-dive iteration, mark resolved questions as 'Resolved' with a one-line summary and cross-reference to the deep-dive section that answered them
- Add new questions discovered during investigation with status 'Open' — questions naturally emerge from tracing data flows, examining edge cases, and reading adjacent code
- Below the table, maintain a 'Remaining follow-up items (out of scope)' list for questions identified but explicitly out of scope for the current work package

## Outputs

### comprehension-artifact

Persistent comprehension [artifact](../resources/codebase-comprehension.md#artifact-template) covering the relevant codebase area

#### artifact

`{codebase-area}.md`

#### architecture_overview

Module structure, dependencies, and design patterns

#### key_abstractions

Core types, traits, data structures with domain context

#### design_rationale

Inferred rationale for significant design choices

#### domain_glossary

Mapping of domain terms to technical constructs

#### deep_dives

Targeted exploration sections added during user-driven loop

## Rules

### persistent-artifacts

Comprehension artifacts persist across work packages — they are cumulative knowledge, not disposable planning documents

### augment-not-replace

When existing artifacts cover the same area, augment them with new sections and deeper detail rather than replacing

### progressive-depth

Start broad (architecture) and deepen progressively — let the user guide where to invest comprehension effort

### relevance-focus

Prioritize areas relevant to the current problem statement while still building broadly useful knowledge

### cross-reference

Cross-reference related comprehension artifacts and note dependencies between codebase areas

### question-driven-exploration

The Open Questions table is the primary input for selecting deep-dive areas. When open questions exist, present them as the default selection for the next iteration rather than generating new candidate areas from scratch.
