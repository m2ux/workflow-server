---
name: build-comprehension
description: Build or augment codebase comprehension via progressive analysis and persistent artifacts.
metadata:
  ontology: legacy
  kind: skill
  version: 1.0.0
  order: 22
  legacy_id: 22
---

# Build Comprehension

## Capability

Build or augment codebase comprehension through progressive analysis and persistent knowledge artifacts

## Inputs

### problem-statement

Problem statement from design philosophy — focuses the comprehension on relevant areas

### target-path

Path to the target codebase directory

### project-type

*(optional)* Detected project type (rust-substrate|other)

## Protocol

### 1. Discover Existing

- List contents of .engineering/artifacts/comprehension/ directory
- Match existing artifacts by project name, module name, or domain terms from problem_statement
- Summarize relevant artifacts with coverage scope and last-updated date

### 2. Check Gitnexus

- Check if the target codebase has a GitNexus index: call list_repos or read gitnexus://repo/{name}/context
- If indexed: use attached resource meta/03 (gitnexus-reference) for the full tool reference with exploration workflows, checklists, and examples. GitNexus tools are REQUIRED for structural analysis throughout this skill.
- If not indexed or stale: fall back to grep/read/glob for all exploration steps.

### 3. Architecture Survey

- Top-down survey: start with project root structure, build system, entry points
- When GitNexus is available: use query() to discover execution flows and functional areas, read cluster resources for module groupings, and context() for dependency mapping — this yields structural understanding faster than grep and is the required primary approach
- Use glob to map directory structure, find module files, and locate test files — glob is the appropriate tool for filesystem-shape discovery during the architecture survey
- Identify module boundaries and their responsibilities from directory layout, module declarations, and public APIs
- Map dependency relationships between modules (imports, trait implementations, cross-module calls)
- Identify overarching patterns: layered architecture, event-driven, actor model, plugin system, etc.
- Form architecture hypotheses and verify by sampling implementation files

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

- Artifact naming: {codebase-area-name}.md in .engineering/artifacts/comprehension/
- Derive codebase-area-name from the target project or subsystem name (slugified)
- When augmenting: add new sections, update existing sections with deeper detail, preserve prior content
- Include metadata header: date, work-package reference, coverage scope, related artifacts
- Include an 'Open Questions' section (markdown table) between Domain Concept Mapping and Deep-Dive Sections — this section is maintained by the question-management protocol

### 8. Deep Dive

- Present candidate areas based on architecture survey and problem relevance
- For selected area: trace data flows, examine implementation details, document edge cases
- When GitNexus is available: use context() to trace callers/callees, read process resources for full execution traces, and cypher() for custom call chain queries
- Append findings as dedicated subsections in the comprehension artifact

### 9. Question Management

- The 'Open Questions' section is a markdown table with columns: #, Question, Status, Resolution, Deep-Dive Section
- After each deep-dive iteration, mark resolved questions as 'Resolved' with a one-line summary and cross-reference to the deep-dive section that answered them
- Add new questions discovered during investigation with status 'Open' — questions naturally emerge from tracing data flows, examining edge cases, and reading adjacent code
- Below the table, maintain a 'Remaining follow-up items (out of scope)' list for questions identified but explicitly out of scope for the current work package

## Outputs

### comprehension-artifact

Persistent comprehension artifact covering the relevant codebase area

- **artifact**: `{codebase-area}.md`
- **architecture_overview**: Module structure, dependencies, and design patterns
- **key_abstractions**: Core types, traits, data structures with domain context
- **design_rationale**: Inferred rationale for significant design choices
- **domain_glossary**: Mapping of domain terms to technical constructs
- **deep_dives**: Targeted exploration sections added during user-driven loop

## Rules

### gitnexus-usage

- gitnexus-first: gitnexus query() and context() are the primary tools for understanding execution flows, call relationships, module dependencies, and architecture. Grep is reserved for pure text patterns and unindexed codebases — not a default. This is a requirement, not a preference. Use attached resource meta/03 (gitnexus-reference) for checklists, pattern tables, and worked examples.
- gitnexus-skill: For GitNexus-based analysis, the gitnexus-operations skill (meta workflow) provides the full task-oriented protocol — explore, impact-analysis, debug, refactor. Load it via get_skill skill_id: 'gitnexus-operations', workflow_id: 'meta' when performing codebase exploration or impact analysis with a GitNexus index.

### persistent-artifacts

Comprehension artifacts persist across work packages — they are cumulative knowledge, not disposable planning documents

### augment-not-replace

When existing artifacts cover the same area, augment them with new sections and deeper detail rather than replacing

### hypothesis-framing

Frame design rationale as hypotheses for user validation — the goal is to enable the user to qualify assumptions, not to assert correctness

### progressive-depth

Start broad (architecture) and deepen progressively — let the user guide where to invest comprehension effort

### relevance-focus

Prioritize areas relevant to the current problem statement while still building broadly useful knowledge

### cross-reference

Cross-reference related comprehension artifacts and note dependencies between codebase areas

### question-driven-exploration

The Open Questions table is the primary input for selecting deep-dive areas. When open questions exist, present them as the default selection for the next iteration rather than generating new candidate areas from scratch.

## Errors

### no_existing_artifacts

**Cause:** No comprehension artifacts exist yet for this codebase

**Recovery:** Proceed with fresh analysis — this is the first comprehension pass

### large_codebase

**Cause:** Codebase is too large for exhaustive analysis

**Recovery:** Focus on areas relevant to the problem statement and note unexplored areas for future passes

### unfamiliar_patterns

**Cause:** Codebase uses patterns or frameworks the agent is unfamiliar with

**Recovery:** Use web research to understand framework conventions, then document findings

## Resources

- [codebase-comprehension](skill:legacy/work-package/resources/codebase-comprehension)
- (UNRESOLVED: meta/03)
