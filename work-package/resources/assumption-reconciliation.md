---
name: assumption-reconciliation
description: Methodology for autonomous classify-analyze-converge resolution of assumptions through targeted codebase investigation, separating code-resolvable assumptions from those requiring stakeholder judgement.
metadata:
  version: 1.2.0
  order: 26
  legacy_id: 26
---


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

## Handoff to Judgement Augmentation

After reconciliation converges, the remaining open assumptions are presented to the user through the judgement augmentation protocol. Reconciliation directly feeds this process:

### What reconciliation provides

| Element | Source |
|---------|--------|
| **The irreducible open set** | Assumptions classified as not-code-resolvable after convergence |
| **Non-resolvability rationale** | The classification rationale recorded for each open assumption |
| **Technical context** | Findings from reconciliation cycles — validated assumptions, code patterns discovered, partial evidence gathered |
| **Alternatives context** | Constraints and patterns identified during analysis that inform the trade-off space |

### What reconciliation does NOT provide

Trade-off assembly, impact ordering, anchoring-safe presentation, reversibility flagging, grouping, and interview formatting belong to the [interview](../techniques/review-assumptions/interview.md) operation — reconciliation only supplies the raw evidence.

### All-resolved case

If reconciliation resolves every assumption (the open set is empty after convergence), the judgement augmentation format is skipped and a summary is presented confirming that all assumptions were verified through code analysis. No user input is needed.

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

The log holds one table row per assumption (see the [assumptions log template](assumptions-review.md#assumptions-log-template)); reconciliation updates rows in place:

- A **resolved** assumption's row records the finding and evidence (file paths, line numbers, commit hashes) in the Resolution column and Validated / Invalidated / Partially Validated in the Outcome column. No standalone per-assumption section is kept for resolved assumptions.
- An **open** assumption keeps its row (Outcome `Open (<reason>)`) plus a full bold-label entry under Open Assumptions carrying the classification rationale (why code analysis cannot resolve it) and what external input would resolve it. The entry is removed when the assumption resolves.

### Markdown formatting rule

Bold-label entries follow the [markdown-line-breaks](../techniques/manage-artifacts/TECHNIQUE.md#markdown-line-breaks) rule: every bold-label line except the last in its group ends with two trailing spaces (`**Status:** Validated⎵⎵`), or consecutive lines collapse into one rendered paragraph. No bullet prefixes as a substitute.

## Scorecard

After reconciliation, present a summary scorecard:

```
Total: N | Validated: N | Invalidated: N | Partially Validated: N | Open: N
Convergence iterations: N | Newly surfaced: N
```

This gives the user an at-a-glance view of how the assumption set evolved through reconciliation. If open assumptions remain, they proceed to judgement augmentation review. If the open count is zero, no user review is needed.
