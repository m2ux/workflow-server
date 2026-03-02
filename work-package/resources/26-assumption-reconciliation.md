# Assumption Reconciliation

## Methodology

Activities throughout the work-package workflow produce assumptions — implicit decisions that may or may not hold. Traditionally, these are presented to the user for manual triage: confirm, correct, or skip. This places the burden of identifying which assumptions are verifiable on the user, who must then request targeted analysis, check for newly surfaced assumptions, and iterate.

Assumption reconciliation replaces this manual loop with an autonomous classify-analyze-converge cycle. After an activity collects assumptions, the agent:

1. **Classifies** each open assumption as code-resolvable or not
2. **Analyzes** all code-resolvable assumptions through targeted codebase investigation
3. **Updates** the assumptions log with evidence-based resolutions
4. **Captures** any new assumptions surfaced during analysis
5. **Repeats** from step 1 until no code-resolvable assumptions remain

The user then reviews only the irreducible set — assumptions that genuinely require human judgment.

## Classification Criteria

### Code-resolvable

An assumption is code-resolvable if targeted reading, searching, or diffing of the codebase could validate or invalidate it. Examples:

- "Function X produces deterministic output" — trace the implementation
- "The test suite covers scenario Y" — search for relevant test cases
- "Data flows through path Z" — trace from source to sink
- "Library version A changed behavior B" — diff between tags
- "Type T uses collection C internally" — read the type definition
- "Error handling follows pattern P" — grep for error propagation
- "Module M depends on module N" — check imports and Cargo.toml
- "The override mechanism handles edge case E" — read guard conditions

### Not code-resolvable

An assumption is not code-resolvable if it depends on information outside the codebase. Examples:

- "Stakeholders will approve approach A" — requires human decision
- "Override data is complete for network N" — requires operational verification
- "Timeline estimate is realistic" — judgment call
- "The deployment succeeded on environment E" — requires runtime evidence
- "Business priority favors option X over Y" — strategic decision
- "External service S behaves according to spec" — requires integration testing

### Edge cases

Some assumptions are partially resolvable: code analysis can narrow the uncertainty but not eliminate it. Mark these as Partially Validated with the evidence gathered and a note on what remains unresolved. If further code analysis would not help, reclassify as not-code-resolvable.

## Convergence

Convergence is reached when **no open assumptions in the log are classified as code-resolvable**. This includes assumptions that were surfaced during analysis — they must also be classified and resolved if code-resolvable before convergence is declared.

Convergence does NOT mean all assumptions are resolved. It means the remaining open assumptions are irreducible through code analysis — they require stakeholder input, operational verification, or other external information.

### Convergence indicators

- All code-resolvable assumptions have a resolution status (Validated, Invalidated, Partially Validated)
- Every resolution cites file paths and code evidence
- No newly surfaced assumption is classified as code-resolvable
- The final open set has explicit reasons for non-resolvability

## Integration with Comprehension Artifacts

When a comprehension artifact exists for the codebase area, reconciliation findings are appended as numbered deep-dive sections. This serves two purposes:

1. **Traceability** — The evidence trail is preserved alongside the broader codebase understanding
2. **Reusability** — Findings from assumption reconciliation enrich the comprehension artifact for future work packages

The Open Questions table in the comprehension artifact is updated: questions answered during reconciliation are marked Resolved; new questions surfaced are added as Open.

## Integration with Assumptions Log

### Resolution statuses

| Status | Meaning |
|--------|---------|
| Validated | Code evidence confirms the assumption holds |
| Invalidated | Code evidence refutes the assumption |
| Partially Validated | Evidence supports with caveats or limitations |
| Open | Not yet resolved — includes reason (requires stakeholder input, requires operational verification, etc.) |

### Log structure after reconciliation

Each resolved assumption includes:
- **Finding** — what the analysis discovered
- **Evidence** — file paths, line numbers, commit hashes
- **Resolution** — Validated / Invalidated / Partially Validated
- **Iteration** — which reconciliation cycle resolved it

Each open assumption includes:
- **Classification rationale** — why it cannot be resolved through code analysis
- **What would resolve it** — what external input or verification is needed

## Scorecard

After reconciliation, present a summary scorecard:

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```

This gives the user an at-a-glance view of how the assumption set evolved through reconciliation.
