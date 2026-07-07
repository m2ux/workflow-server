---
metadata:
  version: 1.1.0
---

## Capability

Build or augment codebase comprehension through progressive analysis and persistent knowledge artifacts. The group splits the comprehension protocol into ops: [survey](./survey.md) (broad architecture pass), [deep-dive](./deep-dive.md) (targeted area investigation), and [revise-questions](./revise-questions.md) (Open Questions maintenance).

## Inputs

### project_type

*(optional)* Detected project type (rust-substrate|other)

### comprehension_dir

Directory holding codebase-comprehension artifacts

#### default

`.engineering/artifacts/comprehension/`

## Outputs

### comprehension_artifact

Persistent comprehension [artifact](../../resources/codebase-comprehension.md#artifact-template) covering the relevant codebase area

#### comprehension_artifact_file

`{$codebase_area}.md`

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
