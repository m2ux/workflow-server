---
metadata:
  version: 2.2.0
---

## Capability

Progressive codebase comprehension over a cumulative corpus artifact and a session-local log.

## Inputs

### project_type

*(optional)* The project type the target tree is detected as

### comprehension_dir

Absolute path of the cumulative comprehension corpus — the directory whose artifacts outlive the session that wrote them.

## Outputs

### comprehension_artifact

Cumulative [corpus artifact](../../resources/codebase-comprehension.md#corpus-artifact-template) covering the relevant codebase area, as the template's own sections lay it out: module structure and dependencies, the core types and the design patterns, the rationale behind the significant choices, and the domain terms mapped onto technical constructs

### comprehension_log

Session-local [comprehension log](../../resources/codebase-comprehension.md#comprehension-log-template) holding the reasoning behind the corpus artifact

#### open_questions

Questions the pass opened, each resolved or carried forward


## Rules

### persistent-artifacts

The corpus artifact persists across work packages as cumulative knowledge; the log belongs to the session that wrote it and carries what is specific to that pass

### progressive-depth

Start broad (architecture) and deepen progressively — let the user guide where to invest comprehension effort

### relevance-focus

Prioritize areas relevant to the current problem statement while still building broadly useful knowledge

### cross-reference

Cross-reference related comprehension artifacts and note dependencies between codebase areas

