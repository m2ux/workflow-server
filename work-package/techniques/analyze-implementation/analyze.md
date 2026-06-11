---
metadata:
  version: 1.0.0
---

## Capability

Locate the current implementation, evaluate its effectiveness, establish quantitative baseline metrics, and identify gaps against the work package success criteria.

## Inputs

### target_submodule

Target submodule for the work package, e.g. midnight-node, midnight-ledger (inherited from the [analyze-implementation](./TECHNIQUE.md) group root; declared here as the binding contract). Used to resolve the codebase to locate and to key the GitNexus index (`gitnexus://repo/{name}/...`).

### requirements

Work package requirements; read to set the analysis scope and to link baselines and gaps to measurable success criteria.

### problem_statement

The work package problem statement; read alongside `{requirements}` to focus the analysis.

## Outputs

### located_implementation

Where the feature/component is implemented — files, modules, entry points — plus current structure, integration points, usage, and dependencies. `N/A` when no current implementation exists (a new feature).

### effectiveness_assessment

Assessment of current effectiveness and pain points, drawn from logs, metrics, tests, issues, and code comments, with evidence of problems or improvement areas.

### baseline_metrics

Quantitative baseline metrics (performance, quality, usage, reliability) with how each was measured for reproducibility and current values recorded before any changes, linked to success criteria from `{requirements}`.

### gaps_identified

Gaps linked to measurable success criteria from `{requirements}`, with documented assumptions about current behavior.

## Protocol

### 1. Load Guidance

- Use attached [implementation-analysis](../../resources/implementation-analysis.md) for full guidance
- Review `{requirements}` and `{problem_statement}` for analysis scope

### 2. Gitnexus First Locate

- When the `{target_submodule}` codebase has a GitNexus index, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../../meta/techniques/gitnexus-operations/query.md)(query: `{$concept}`) to find execution flows by concept and [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) for 360-degree symbol usage (callers, callees, process membership)
- Read `gitnexus://repo/{name}/clusters` to identify functional areas and `gitnexus://repo/{name}/processes` for end-to-end flow inventory
- Fall back to grep/Read/glob only when the codebase is not indexed or the index is stale.

### 3. Locate Implementation

- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../../meta/techniques/gitnexus-operations/context.md) to identify where the feature/component is implemented (files, modules, entry points) — falls back to grep when not indexed
- Map usage and dependencies via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md) `{target, direction: 'upstream'}` and call-graph traversal; record architecture from cluster resources
- Document current structure and integration points
- If no current implementation exists (a new feature), document the baseline as N/A and focus the analysis on the expected metrics for the success criteria

### 4. Evaluate Effectiveness

- Review logs, metrics, tests, issues, and code comments
- Assess current effectiveness and pain points
- Identify evidence of problems or improvement areas

### 5. Establish Baselines

- Establish quantitative baseline metrics (performance, quality, usage, reliability)
- Document how each metric was measured for reproducibility
- Record current values before any changes
- Link baseline metrics to success criteria from `{requirements}`

### 6. Identify Gaps

- Link gaps to measurable success criteria from `{requirements}`
- Document assumptions about current behavior
