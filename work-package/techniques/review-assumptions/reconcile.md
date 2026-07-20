---
metadata:
  version: 1.3.0
---

## Capability

Resolve code-analyzable assumptions through targeted codebase analysis until only stakeholder-dependent assumptions remain. Callable as the `{analyse}` parameter of [analyse-challenge::run-loop](../analyse-challenge/run-loop.md); residual interview is activity-level and gated on `{has_open_assumptions}`.

## Inputs

### assumptions_log

The running [log](../../resources/assumption-reconciliation.md#integration-with-assumptions-log) of open and resolved assumptions to reconcile.

### target_path

Path to the reference codebase root within which code-resolvable assumptions are investigated.

### comprehension_artifact

*(optional)* Existing comprehension [artifact](../../resources/codebase-comprehension.md#artifact-template) to augment with findings. If absent, findings are recorded only in the assumptions log.

## Outputs

### assumptions_log

Assumptions [log](../../resources/assumption-reconciliation.md#integration-with-assumptions-log) with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining (same `assumptions-log.md` artifact, written back in place).

### has_resolvable_assumptions

Boolean gate driving the reconciliation loop — true while open code-resolvable assumptions remain (another iteration is needed), false once convergence is reached.

### has_open_assumptions

Boolean gate — true iff stakeholder-dependent assumptions remain open after convergence; gates whether the interview step is entered.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from the `{assumptions_log}`
- For each, determine whether targeted code analysis could validate or invalidate it, classifying per the [code-resolvable](#code-resolvable) and [not-code-resolvable](#not-code-resolvable) rules
- If the `{assumptions_log}` contains no open assumptions, there is nothing to resolve — skip reconciliation and set `{has_resolvable_assumptions}` to false and `{has_open_assumptions}` to false.
- If every open assumption classifies as not code-resolvable, convergence is immediate — set `{has_resolvable_assumptions}` to false and evaluate `{has_open_assumptions}` from the remaining open set.

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation within the codebase at `{target_path}`: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Use the [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md) operations as the primary mechanism for tracing data flows, validating contract assumptions, and confirming ordering/error-path claims — [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md) for concept-driven flow discovery, [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) for symbol-level caller/callee/process inspection, and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) for custom traces (e.g. error-path or ordering assumptions).
- Record evidence with file paths and line numbers for every finding
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies
- If code analysis cannot definitively validate or invalidate an assumption, apply the [partially-resolvable](#partially-resolvable) rule

### 3. Update Assumptions

- Update the `{assumptions_log}` rows in place: write finding + evidence into the Resolution column and Validated / Invalidated / Partially Validated into the Outcome column; remove the Open Assumptions entry of any assumption that resolved
- Add any newly surfaced assumptions as new rows, Outcome `Open`, with their classification (code-resolvable or not)
- Emit the scorecard data (see [assumption-reconciliation](../../resources/assumption-reconciliation.md#scorecard)) as a bindable pass result after each pass; do NOT persist count tables in the log — the rows are the record
- In Open Assumptions entries, each bold-label line MUST end with two trailing spaces to produce a line break in rendered markdown (no bullet prefixes) — see the [markdown-line-breaks](../manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule

### 4. Check Convergence

- Re-classify all open assumptions after the analysis pass
- If any open assumptions are code-resolvable (including newly surfaced ones), signal that another iteration is needed — set `{has_resolvable_assumptions}` to true
- If no open assumptions are code-resolvable, convergence is reached (see the [convergence-definition](#convergence-definition) rule): the assumptions log is now the `{assumptions_log}` output, with all code-resolvable assumptions resolved and only stakeholder-dependent ones remaining — set `{has_resolvable_assumptions}` to false
- After convergence, evaluate whether any non-code-resolvable assumptions remain open. If none remain (all resolved), set `{has_open_assumptions}` to false. If stakeholder-dependent assumptions remain, set `{has_open_assumptions}` to true.

### 5. Update Comprehension Artifact

- If a `{comprehension_artifact}` was provided, append findings to it as a numbered deep-dive section (e.g., 'Deep-Dive N: Assumption Reconciliation')
- Update the Open Questions table in the `{comprehension_artifact}` with any questions resolved or surfaced during reconciliation
- If no `{comprehension_artifact}` was provided, skip this phase — findings are preserved in the assumptions log

## Rules

### no-user-interaction

Reconciliation runs autonomously, without user interaction. Converged results bind as outputs for the activity to surface.

### classification-transparency

When emitting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.

### code-resolvable

An assumption is code-resolvable if targeted reading, searching, or diffing of the codebase at `{target_path}` could validate or invalidate it: code behavior, data flows, type structures, API contracts, test coverage, implementation details, library behavior, ordering guarantees, error-handling paths. Examples:

- "Function X produces deterministic output" — trace the implementation
- "The test suite covers scenario Y" — search for relevant test cases
- "Data flows through path Z" — trace from source to sink
- "Library version A changed behavior B" — diff between tags
- "Type T uses collection C internally" — read the type definition
- "Error handling follows pattern P" — grep for error propagation
- "Module M depends on module N" — check imports and Cargo.toml
- "The override mechanism handles edge case E" — read guard conditions

### not-code-resolvable

An assumption is not code-resolvable if it depends on information outside the codebase: stakeholder decisions, operational questions, strategic judgments, time estimates, deployment status, business priorities, external-system behavior. Examples:

- "Stakeholders will approve approach A" — requires human decision
- "Override data is complete for network N" — requires operational verification
- "Timeline estimate is realistic" — judgment call
- "The deployment succeeded on environment E" — requires runtime evidence
- "Business priority favors option X over Y" — strategic decision
- "External service S behaves according to spec" — requires integration testing

### partially-resolvable

Some assumptions are partially resolvable: code analysis can narrow the uncertainty but not eliminate it. Mark these as Partially Validated with the evidence gathered and a note on what remains unresolved. If further code analysis would not help, reclassify as not-code-resolvable.

### convergence-definition

Convergence is reached when no open assumption in the log — including assumptions surfaced during analysis — is classified as code-resolvable. Convergence does NOT mean all assumptions are resolved: the remaining open set is irreducible through code analysis and requires stakeholder input, operational verification, or other external information. Indicators:

- All code-resolvable assumptions have a resolution status (Validated, Invalidated, Partially Validated)
- Every resolution cites file paths and code evidence
- No newly surfaced assumption is classified as code-resolvable
- The final open set has explicit reasons for non-resolvability

### handoff-to-residue

After convergence, set `{has_resolvable_assumptions}` false and `{has_open_assumptions}` from the irreducible open set. When bound as `{analyse}` inside [analyse-challenge](../analyse-challenge/TECHNIQUE.md), [challenge](../analyse-challenge/challenge.md) / [combine](../analyse-challenge/combine.md) may further shrink that set before the activity gates [interview](./interview.md) on `{has_open_assumptions}`.

| Element | Source |
|---------|--------|
| **The irreducible open set** | Assumptions classified as not-code-resolvable after analyse (and combine, when used) |
| **Non-resolvability rationale** | The classification rationale recorded for each open assumption |
| **Technical context** | Findings from analyse / challenge cycles — validated assumptions, code patterns, partial evidence |
| **Alternatives context** | Constraints and patterns that inform the residual decision space |

Trade-off assembly and batch/interview formatting belong to [interview](./interview.md) — reconcile supplies evidence and flags only.
