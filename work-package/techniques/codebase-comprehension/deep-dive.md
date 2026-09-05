---
metadata:
  version: 2.1.0
---

## Capability

Targeted investigation of a selected codebase area, recorded in the comprehension log with its settled outcomes promoted to the corpus artifact.

## Inputs

### comprehension_artifact

The corpus artifact for this area, whose architecture survey seeds candidate-area selection.

### comprehension_log

*(optional)* The log from earlier passes over this area; its Open Questions are the default candidates for the next investigation.

### gitnexus_indexed

Flag indicating whether the codebase is indexed; selects between gitnexus-operations (context, cypher, process resources) and grep/read for tracing call chains.

## Outputs

### comprehension_artifact

The corpus artifact for the area, carrying the outcomes this investigation settled as statements about the code.

#### artifact

`{codebase_area}.md`

#### audience

`human`

### comprehension_log

The session-local record of this investigation: the questions it worked, the findings that answered them, and the items it left open.

#### artifact

`codebase-comprehension.md`

#### audience

`human`

#### deep_dives

Targeted exploration findings for the selected area: traced data flows, implementation detail, and edge cases.

## Protocol

### 1. Deep Dive

- Emit candidate areas based on architecture survey and problem relevance as bindable output
  > Where open questions already exist in the log, prefer them as the default selection over new candidates, per `question-driven-exploration`.
- On the mandatory initial pass, attempt to resolve every open question without a selection gate; only subsequent iterations consume an activity-selected area.
- For selected area: trace data flows, examine implementation details, document edge cases, applying the [Comprehension Techniques](../../resources/codebase-comprehension.md#comprehension-techniques)
- When `{gitnexus_indexed}` is true: apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) to trace callers/callees, read process resources for full execution traces, and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) for custom call chain queries

### 2. Record the Investigation

- Write `{comprehension_log}` per the [Comprehension Log Template](../../resources/codebase-comprehension.md#comprehension-log-template)
- Record this investigation alongside the ones earlier passes wrote, rather than in place of them
- Record every set this investigation walked in full — the call sites a symbol has, the keys a topology aligns across its configuration files, the branches a function admits — naming the query or command that produced it. A later pass reads the set from here rather than walking it again, per [Report and Methodology](../../resources/findings-report.md#report-and-methodology); an enumeration left as prose about what was learned is one the next pass has to rebuild.

### 3. Promote Settled Outcomes

- Derive `{$codebase_area}` from the target project or subsystem name (slugified)
- Select which findings cross into `{comprehension_artifact}` per [Promotion](../../resources/codebase-comprehension.md#promotion)
- Write each promoted outcome into the section that owns it, per the [Corpus Artifact Template](../../resources/codebase-comprehension.md#corpus-artifact-template) and the fill [Rules](../../resources/codebase-comprehension.md#rules)
