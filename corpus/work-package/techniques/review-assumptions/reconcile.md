---
metadata:
  version: 1.4.0
---

## Capability

Code-analyzable assumptions closed via targeted analysis.

## Inputs

### comprehension_artifact

*(optional)* Existing comprehension [corpus artifact](../../resources/codebase-comprehension.md#corpus-artifact-template) to augment with findings.

### query_report

*(optional)* Execution flows already read for this work.

### context_report

*(optional)* Callers, callees, and flow membership already read for a symbol in this work.

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumption-reconciliation.md#integration-with-assumptions-log) with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining, written back in place.

#### artifact

`assumptions-log.md`

#### audience

`human`


## Protocol

### 1. Classify Resolvability

- Read all open assumptions from the `{assumptions_log}`
- For each, determine whether targeted code analysis could validate or invalidate it, classifying per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation within the codebase at `{target_path}`: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Where `{query_report}` is present, take concept-driven flows from it. Where `{context_report}` is present, take symbol callers, callees, and flow membership from it.
- Record evidence for every finding, naming the code in words linked to its lines
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies
- Where code analysis can neither validate nor invalidate an assumption outright, classify it partially resolvable per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)

### 3. Update Assumptions

- Update the `{assumptions_log}` rows in place: write finding + evidence into the Resolution column and Validated / Invalidated / Partially Validated into the Outcome column; remove the Open Assumptions entry of any assumption that resolved
- Add any newly surfaced assumptions as new rows, Outcome `Open`, with their classification (code-resolvable or not)
- Write Open Assumptions entries to the `manage-artifacts.markdown-line-breaks` rule

### 4. Update Comprehension Artifact

- Write each outcome the analysis settled about the code into the section of `{comprehension_artifact}` that owns it, per [Promotion](../../resources/codebase-comprehension.md#promotion)
  > When no `{comprehension_artifact}` was provided, skip this phase; the findings stay in the assumptions log.
- A question the analysis leaves open stays in the assumptions log as an open assumption; the corpus artifact takes settled outcomes only.

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction. Converged results bind as outputs.

### classification-transparency

When emitting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.

