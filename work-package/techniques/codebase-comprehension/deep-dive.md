---
metadata:
  version: 1.0.0
---

## Capability

Targeted investigation of a selected codebase area: trace data flows, examine implementation detail and edge cases, and append the findings to the comprehension artifact following the artifact structure. Serves both the mandatory initial deep-dive and each user-selected deep-dive iteration (area selection + targeted analysis).

## Inputs

### comprehension_artifact

The comprehension artifact whose architecture survey and existing Open Questions seed the candidate-area selection, and to which findings are appended.

### comprehension_dir

Directory holding codebase-comprehension artifacts. Names the location the artifact is written to (`{codebase_area}.md`).

### gitnexus_indexed

Flag indicating whether the codebase is indexed; selects between gitnexus-operations (context, cypher, process resources) and grep/read for tracing call chains.

## Outputs

### comprehension_artifact

Updated comprehension artifact — written as `{codebase_area}.md` in `{comprehension_dir}`, augmenting prior content rather than replacing it.

#### deep_dives

Targeted exploration subsections appended for the selected area: traced data flows, implementation details, and edge cases.

## Protocol

### 1. Deep Dive

- Present candidate areas based on architecture survey and problem relevance. When open questions already exist in the artifact, present them as the default selection rather than generating new candidates from scratch (per `question-driven-exploration`).
- On the mandatory initial pass, attempt to resolve every open question without user selection; only subsequent iterations are user-selected by area.
- For selected area: trace data flows, examine implementation details, document edge cases
- When GitNexus is available: apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) to trace callers/callees, read process resources for full execution traces, and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) for custom call chain queries
- Append findings as dedicated subsections in the comprehension artifact

### 2. Artifact Management

- Write the `{comprehension_artifact}` following the artifact structure and comprehension techniques in [codebase-comprehension](../../resources/codebase-comprehension.md)
- Derive `{$codebase_area}` from the target project or subsystem name (slugified)
- Artifact naming: `{codebase_area}.md` in `{comprehension_dir}`
- When augmenting: add new sections, update existing sections with deeper detail, preserve prior content
- Include metadata header: date, work-package reference, coverage scope, related artifacts
- Include an 'Open Questions' section (markdown table) between Domain Concept Mapping and Deep-Dive Sections — this section is maintained by the [revise-questions](./revise-questions.md) question-management protocol
