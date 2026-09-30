---
metadata:
  version: 1.4.0
---

## Capability

Code-analyzable assumptions closed via targeted analysis.

## Inputs

### comprehension_artifact

*(optional)* Existing comprehension [corpus artifact](../../resources/codebase-comprehension.md#corpus-artifact-template) to augment with findings.

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumption-reconciliation.md#integration-with-assumptions-log) with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining, written back in place.

#### artifact

`assumptions-log.md`

#### audience

`human`

### assumptions_log_path

Path to the written assumptions log.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from the `{assumptions_log}`
- For each, determine whether targeted code analysis could validate or invalidate it, classifying per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation within the codebase at `{target_path}`: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Use the [gitnexus](/gitnexus/techniques/TECHNIQUE.md) techniques as the primary mechanism for tracing data flows, validating contract assumptions, and confirming ordering/error-path claims — [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[query](/gitnexus/techniques/query.md) for concept-driven flow discovery, [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md) for symbol-level caller/callee/process inspection, and [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[cypher](/gitnexus/techniques/cypher.md) for custom traces (e.g. error-path or ordering assumptions).
- Record evidence for every finding, naming the code in words linked to its lines
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies
- Where code analysis can neither validate nor invalidate an assumption outright, classify it partially resolvable per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)

### 3. Update Assumptions

- Update the `{assumptions_log}` rows in place: write finding + evidence into the Resolution column and Validated / Invalidated / Partially Validated into the Outcome column; remove the Open Assumptions entry of any assumption that resolved
- Add any newly surfaced assumptions as new rows, Outcome `Open`, with their classification (code-resolvable or not)
- Write Open Assumptions entries to the `manage-artifacts.markdown-line-breaks` rule
- Emit the log's path as `{assumptions_log_path}`

### 4. Update Comprehension Artifact

- Write each outcome the analysis settled about the code into the section of `{comprehension_artifact}` that owns it, per [Promotion](../../resources/codebase-comprehension.md#promotion)
  > When no `{comprehension_artifact}` was provided, skip this phase; the findings stay in the assumptions log.
- A question the analysis leaves open stays in the assumptions log as an open assumption; the corpus artifact takes settled outcomes only.

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction. Converged results bind as outputs.

### classification-transparency

When emitting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.

### handoff-to-residue

What the residual decision receives, and where each element comes from.

| Element | Source |
|---------|--------|
| **The irreducible open set** | Assumptions classified as not-code-resolvable after analyse (and combine, when used) |
| **Non-resolvability rationale** | The classification rationale recorded for each open assumption |
| **Technical context** | Findings from analyse / challenge cycles — validated assumptions, code patterns, partial evidence |
| **Alternatives context** | Constraints and patterns that inform the residual decision space |

Reconcile supplies evidence and flags only; it assembles no presentation of the residual set.
