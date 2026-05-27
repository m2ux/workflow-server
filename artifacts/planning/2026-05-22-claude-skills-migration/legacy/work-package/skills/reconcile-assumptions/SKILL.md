---
name: reconcile-assumptions
description: Iteratively resolve code-analyzable assumptions until only stakeholder-dependent ones remain.
metadata:
  ontology: legacy
  kind: skill
  version: 1.0.0
  order: 23
  legacy_id: 23
---

# Reconcile Assumptions

## Capability

Iteratively resolve code-analyzable assumptions through targeted codebase analysis until only stakeholder-dependent assumptions remain

## Inputs

### assumptions-log-path

Path to the current assumptions-log.md

### target-path

Path to the codebase to analyze

### comprehension-artifact-path

*(optional)* Path to existing comprehension artifact to augment with findings. If absent, findings are recorded only in the assumptions log.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from assumptions-log.md
- For each, determine whether targeted code analysis could validate or invalidate it
- Code-resolvable: assumptions about code behavior, data flows, type structures, API contracts, test coverage, implementation details, library behavior, ordering guarantees, error handling paths
- Not code-resolvable: stakeholder decisions, operational questions, strategic judgments, time estimates, deployment status, business priorities, external system behavior

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Use gitnexus tools as the primary mechanism for tracing data flows, validating contract assumptions, and confirming ordering/error-path claims — `gitnexus_query` for concept-driven flow discovery, `gitnexus_context` for symbol-level caller/callee/process inspection, and `gitnexus_cypher` for custom traces (e.g. error-path or ordering assumptions). See resource 27.
- Record evidence with file paths and line numbers for every finding
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies

### 3. Update Assumptions

- Update assumptions-log.md: mark resolved assumptions with finding, evidence, and resolution status
- Add any newly surfaced assumptions as Open with their classification (code-resolvable or not)
- Maintain a running count: total, validated, invalidated, partially validated, open code-resolvable, open non-code-resolvable
- Each bold-label line (Status, Resolvability, Assumption, Evidence, Risk, etc.) MUST end with two trailing spaces to produce a line break in rendered markdown. Without trailing spaces, consecutive bold lines collapse into a single paragraph. Do NOT use bullet prefixes for this — use trailing spaces only. See resource 26 for correct vs incorrect examples.

### 4. Check Convergence

- Re-classify all open assumptions after the analysis pass
- If any open assumptions are code-resolvable (including newly surfaced ones), signal that another iteration is needed — set has_resolvable_assumptions to true
- If no open assumptions are code-resolvable, convergence is reached — set has_resolvable_assumptions to false
- After convergence, evaluate whether any non-code-resolvable assumptions remain open. If none remain (all resolved), set has_open_assumptions to false. If stakeholder-dependent assumptions remain, set has_open_assumptions to true.

### 5. Update Comprehension Artifact

- If a comprehension artifact exists, append findings as a numbered deep-dive section (e.g., 'Deep-Dive N: Assumption Reconciliation')
- Update the Open Questions table in the comprehension artifact with any questions resolved or surfaced during reconciliation
- If no comprehension artifact exists, skip this phase — findings are preserved in the assumptions log

## Outputs

### reconciled-assumptions

Assumptions log with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining

- **artifact**: `assumptions-log.md`
- **resolution_counts**: Total, validated, invalidated, partially validated, open (with reason for each open item)
- **convergence_iterations**: Number of classify-analyze cycles performed before convergence
- **newly_surfaced**: Count of assumptions discovered during analysis that were not in the original set

## Rules

### no-user-interaction

The reconciliation loop runs autonomously without user checkpoints. The user is presented only the final converged result at the activity's assumptions checkpoint.

### classification-transparency

When presenting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.

### tool-usage

For code-resolvable assumptions, use `gitnexus_query` to find execution flows by concept, `gitnexus_context` to inspect a symbol's callers, callees, and process membership, and `gitnexus_cypher` for custom traces (e.g. error-path or ordering assumptions). Fall back to glob/grep only when the codebase is not indexed. See resource 27.

## Errors

### no_open_assumptions

**Cause:** No open assumptions exist in the assumptions log

**Recovery:** Skip reconciliation — nothing to resolve. Set has_resolvable_assumptions to false and has_open_assumptions to false.

### all_non_resolvable

**Cause:** All open assumptions are classified as not code-resolvable

**Recovery:** Convergence is immediate — set has_resolvable_assumptions to false and proceed to user review.

### analysis_inconclusive

**Cause:** Code analysis cannot definitively validate or invalidate an assumption

**Recovery:** Mark as Partially Validated with the evidence gathered and reasoning for inconclusiveness. Reclassify as not-code-resolvable if further code analysis would not help.

## Resources

- [assumption-reconciliation](skill:legacy/work-package/resources/assumption-reconciliation)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)
