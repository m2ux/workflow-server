---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 23
  legacy_id: 23
---

## Capability

Iteratively resolve code-analyzable assumptions through targeted codebase analysis until only stakeholder-dependent assumptions remain

## Inputs

### assumptions-log

The running [log](../resources/assumption-reconciliation.md#integration-with-assumptions-log) of open and resolved assumptions

### target-path

Path to the codebase to analyze

### comprehension-artifact

*(optional)* Existing comprehension [artifact](../resources/codebase-comprehension.md#artifact-template) to augment with findings. If absent, findings are recorded only in the assumptions log.

## Protocol

### 1. Classify Resolvability

- Read all open assumptions from the {assumptions-log}
- For each, determine whether targeted code analysis could validate or invalidate it
- Code-resolvable: assumptions about code behavior, data flows, type structures, API contracts, test coverage, implementation details, library behavior, ordering guarantees, error handling paths
- Not code-resolvable: stakeholder decisions, operational questions, strategic judgments, time estimates, deployment status, business priorities, external system behavior
- If the {assumptions-log} contains no open assumptions, there is nothing to resolve — skip reconciliation and set has_resolvable_assumptions to false and has_open_assumptions to false.
- If every open assumption classifies as not code-resolvable, convergence is immediate — set has_resolvable_assumptions to false and proceed to user review.

### 2. Targeted Analysis

- For each code-resolvable assumption, perform focused investigation within the codebase at {target-path}: trace relevant code paths, examine implementations, diff between versions, compare behavior
- Use the [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md) operations as the primary mechanism for tracing data flows, validating contract assumptions, and confirming ordering/error-path claims — [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[query](./gitnexus-operations/query.md) for concept-driven flow discovery, [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[context](./gitnexus-operations/context.md) for symbol-level caller/callee/process inspection, and [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[cypher](./gitnexus-operations/cypher.md) for custom traces (e.g. error-path or ordering assumptions).
- Record evidence with file paths and line numbers for every finding
- Determine resolution: Validated (evidence confirms), Invalidated (evidence refutes), or Partially Validated (evidence supports with caveats)
- Note any new assumptions that surface during investigation — these are common when tracing code paths reveals unexpected behavior or dependencies
- If code analysis cannot definitively validate or invalidate an assumption, mark it as Partially Validated with the evidence gathered and the reasoning for the inconclusiveness, and reclassify it as not-code-resolvable when further code analysis would not help.

### 3. Update Assumptions

- Update the {assumptions-log}: mark resolved assumptions with finding, evidence, and resolution status
- Add any newly surfaced assumptions as Open with their classification (code-resolvable or not)
- Maintain {$resolution-counts}: total, validated, invalidated, partially validated, open code-resolvable, open non-code-resolvable
- Each bold-label line (Status, Resolvability, Assumption, Evidence, Risk, etc.) MUST end with two trailing spaces to produce a line break in rendered markdown. Without trailing spaces, consecutive bold lines collapse into a single paragraph. Do NOT use bullet prefixes for this — use trailing spaces only. See the [formatting rule](../resources/assumption-reconciliation.md#markdown-formatting-rule) for correct vs incorrect examples.

### 4. Check Convergence

- Re-classify all open assumptions after the analysis pass
- If any open assumptions are code-resolvable (including newly surfaced ones), signal that another iteration is needed — set has_resolvable_assumptions to true
- If no open assumptions are code-resolvable, convergence is reached: the assumptions log is now the {reconciled-assumptions} output, with all code-resolvable assumptions resolved and only stakeholder-dependent ones remaining — set has_resolvable_assumptions to false
- After convergence, evaluate whether any non-code-resolvable assumptions remain open. If none remain (all resolved), set has_open_assumptions to false. If stakeholder-dependent assumptions remain, set has_open_assumptions to true.

### 5. Update Comprehension Artifact

- If a {comprehension-artifact} was provided, append findings to it as a numbered deep-dive section (e.g., 'Deep-Dive N: Assumption Reconciliation')
- Update the Open Questions table in the {comprehension-artifact} with any questions resolved or surfaced during reconciliation
- If no {comprehension-artifact} was provided, skip this phase — findings are preserved in the assumptions log

## Outputs

### reconciled-assumptions

Assumptions [log](../resources/assumption-reconciliation.md#integration-with-assumptions-log) with all code-resolvable assumptions resolved and only stakeholder-dependent assumptions remaining

#### artifact

`assumptions-log.md`

## Rules

### no-user-interaction

The reconciliation loop runs autonomously without user checkpoints. The user is presented only the final converged result at the activity's assumptions checkpoint.

### classification-transparency

When presenting the converged result, include the classification rationale for each remaining open assumption — explain why it cannot be resolved through code analysis.
