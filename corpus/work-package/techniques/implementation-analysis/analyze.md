---
metadata:
  version: 1.2.0
---

## Capability

Effectiveness, baseline metrics, and gaps of the current implementation against success criteria.

## Outputs

### located_implementation

Where the feature/component is implemented — files, modules, entry points — plus current structure, integration points, usage, and dependencies. `N/A` when no current implementation exists (a new feature).

### effectiveness_assessment

Assessment of current effectiveness and pain points, drawn from logs, metrics, tests, issues, and code comments, with evidence of problems or improvement areas.

### baseline_metrics

Quantitative baseline metrics (performance, quality, usage, reliability), each with its current value and how it was measured for reproducibility, linked to success criteria from `{requirements}`.

### gaps_identified

Gaps linked to measurable success criteria from `{requirements}`, with documented assumptions about current behavior.

## Protocol

### 1. Load Guidance

- Use attached [implementation-analysis](../../resources/implementation-analysis.md) for full guidance
- Review `{requirements}` and `{problem_statement}` for analysis scope

### 2. Gitnexus First Locate

- Take `{$concept}` as a concept `{requirements}` and `{problem_statement}` name, and `{$symbol}` as a symbol that concept reaches
- When the `{component_name}` codebase has a GitNexus index, apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[query](/gitnexus/techniques/query.md)(query: `{concept}`, repo_name: `{component_name}`) to find execution flows by concept and [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md)(name: `{symbol}`, repo_name: `{component_name}`) for 360-degree symbol usage (callers, callees, process membership)
- Read `gitnexus://repo/{component_name}/clusters` to identify functional areas and `gitnexus://repo/{component_name}/processes` for end-to-end flow inventory
- Where the component belongs to a repository group, apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[group-freshness](/gitnexus/techniques/group-freshness.md) first and read its `{group_freshness_report}` for which members the search below can actually answer from
- Then apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[group-search](/gitnexus/techniques/group-search.md) for `{concept}` and read its `{group_query_report}` for the sibling components implementing the same concept — an implementation decision here is better for seeing how they made it
- Fall back to grep/Read/glob only when the codebase is not indexed or the index is stale.

### 3. Locate Implementation

- Apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md)(repo_name: `{component_name}`) to identify where the feature/component is implemented (files, modules, entry points) — falls back to grep when not indexed
- Map usage and dependencies via [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[impact](/gitnexus/techniques/impact.md)(target: `{symbol}`, direction: `upstream`) and call-graph traversal; record architecture from cluster resources
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
