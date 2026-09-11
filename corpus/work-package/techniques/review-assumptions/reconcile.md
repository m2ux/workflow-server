---
metadata:
  version: 1.3.0
---

## Capability

Code-analyzable assumptions closed via targeted analysis.

## Inputs

### comprehension_artifact

*(optional)* Existing comprehension [corpus artifact](../../resources/codebase-comprehension.md#corpus-artifact-template) to augment with findings.

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumption-reconciliation.md#integration-with-assumptions-log) with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining (same `assumptions-log.md` artifact, written back in place).

### has_resolvable_assumptions

Boolean gate driving the reconciliation loop — true while open code-resolvable assumptions remain (another iteration is needed), false once convergence is reached.

### has_open_assumptions

Boolean gate — true iff stakeholder-dependent assumptions remain open after convergence.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from the `{assumptions_log}`
- For each, determine whether targeted code analysis could validate or invalidate it, classifying per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)
- If the `{assumptions_log}` contains no open assumptions, there is nothing to resolve — skip reconciliation and set `{has_resolvable_assumptions}` to false and `{has_open_assumptions}` to false.
- If every open assumption classifies as not code-resolvable, convergence is immediate — set `{has_resolvable_assumptions}` to false and evaluate `{has_open_assumptions}` from the remaining open set.

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation within the codebase at `{target_path}`: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Use the [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md) operations as the primary mechanism for tracing data flows, validating contract assumptions, and confirming ordering/error-path claims — [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md) for concept-driven flow discovery, [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) for symbol-level caller/callee/process inspection, and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) for custom traces (e.g. error-path or ordering assumptions).
- Record evidence with file paths and line numbers for every finding
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies
- Where code analysis can neither validate nor invalidate an assumption outright, classify it partially resolvable per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification)

### 3. Update Assumptions

- Update the `{assumptions_log}` rows in place: write finding + evidence into the Resolution column and Validated / Invalidated / Partially Validated into the Outcome column; remove the Open Assumptions entry of any assumption that resolved
- Add any newly surfaced assumptions as new rows, Outcome `Open`, with their classification (code-resolvable or not)
- Emit the scorecard data (see [assumption-reconciliation](../../resources/assumption-reconciliation.md#scorecard)) as a bindable pass result after each pass; do NOT persist count tables in the log — the rows are the record
- Write Open Assumptions entries to the [markdown-line-breaks](../manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule

### 4. Check Convergence

- Re-classify all open assumptions after the analysis pass
- If any open assumptions are code-resolvable (including newly surfaced ones), signal that another iteration is needed — set `{has_resolvable_assumptions}` to true
- If no open assumptions are code-resolvable, convergence is reached per [Resolvability Classification](../../resources/assumption-reconciliation.md#resolvability-classification): the assumptions log is now the `{assumptions_log}` output, with all code-resolvable assumptions resolved and only stakeholder-dependent ones remaining — set `{has_resolvable_assumptions}` to false
- After convergence, evaluate whether any non-code-resolvable assumptions remain open. If none remain (all resolved), set `{has_open_assumptions}` to false. If stakeholder-dependent assumptions remain, set `{has_open_assumptions}` to true.

### 5. Update Comprehension Artifact

- If a `{comprehension_artifact}` was provided, append findings to it as a numbered deep-dive section (e.g., 'Deep-Dive N: Assumption Reconciliation')
- Update the Open Questions table in the `{comprehension_artifact}` with any questions resolved or surfaced during reconciliation
- If no `{comprehension_artifact}` was provided, skip this phase — findings are preserved in the assumptions log

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction. Converged results bind as outputs.

### classification-transparency

When emitting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.

### handoff-to-residue

After convergence, set `{has_resolvable_assumptions}` false and `{has_open_assumptions}` from the irreducible open set.

| Element | Source |
|---------|--------|
| **The irreducible open set** | Assumptions classified as not-code-resolvable after analyse (and combine, when used) |
| **Non-resolvability rationale** | The classification rationale recorded for each open assumption |
| **Technical context** | Findings from analyse / challenge cycles — validated assumptions, code patterns, partial evidence |
| **Alternatives context** | Constraints and patterns that inform the residual decision space |

Reconcile supplies evidence and flags only; it assembles no presentation of the residual set.
