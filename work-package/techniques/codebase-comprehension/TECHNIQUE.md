---
metadata:
  version: 2.0.0
---

## Capability

Progressive codebase comprehension over a cumulative corpus artifact and a session-local log.

## Inputs

### project_type

*(optional)* Detected project type (rust-substrate|other)

### comprehension_dir

Absolute path of the cumulative comprehension corpus — the directory whose artifacts outlive the session that wrote them.

## Outputs

### comprehension_artifact

Cumulative [corpus artifact](../../resources/codebase-comprehension.md#corpus-artifact-template) covering the relevant codebase area

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

### comprehension_log

Session-local [comprehension log](../../resources/codebase-comprehension.md#comprehension-log-template) holding the reasoning behind the corpus artifact

#### comprehension_log_file

`codebase-comprehension.md`

#### open_questions

Questions the pass opened, each resolved or carried forward

#### deep_dives

Targeted exploration sections added during user-driven loop


## Rules

### persistent-artifacts

The corpus artifact persists across work packages as cumulative knowledge; the log belongs to the session that wrote it and carries what is specific to that pass

### progressive-depth

Start broad (architecture) and deepen progressively — let the user guide where to invest comprehension effort

### relevance-focus

Prioritize areas relevant to the current problem statement while still building broadly useful knowledge

### cross-reference

Cross-reference related comprehension artifacts and note dependencies between codebase areas

### question-driven-exploration

The log's Open Questions table is the primary input for selecting deep-dive areas. When open questions exist, present them as the default selection for the next iteration rather than generating new candidate areas from scratch.
