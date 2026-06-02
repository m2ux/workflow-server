---
name: prioritize-packages
description: Order work packages by dependencies, value, risk, and effort.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Evaluate and order work packages by dependencies, value, risk, and effort

## Inputs

### package-plans

List of completed package plan documents with scope, dependencies, and effort

### dependency-map

Inter-package dependency map describing which packages block or depend on which others

## Protocol

### 1. Analyze Dependencies

- Use attached [prioritization-framework](../resources/prioritization-framework.md) (prioritization-framework) for the evaluation methodology
- Build a dependency graph from the dependency sections of all package plans
- Perform topological sort to identify valid orderings

### 2. Evaluate Criteria

- For each package, assess: business value (High/Medium/Low), risk (High/Medium/Low), effort (High/Medium/Low)
- Use the scoring guidance from the prioritization framework resource
- Document the rationale for each assessment

### 3. Propose Order

- Apply priority ordering rules: dependency-first, then high-value/low-effort, then high-risk-early
- Identify packages that could be parallelized (independent, no shared resources)
- Generate the priority table with package, value, risk, effort, and rationale
- High-risk packages should be scheduled early to surface problems before they cascade

### 4. Present Prioritization

- Present the dependency graph (text or mermaid diagram)
- Present the priority table with rationale for the proposed order
- Note alternative orderings if multiple valid sequences exist
- Never assume a priority order without presenting rationale and getting user confirmation

## Outputs

### priority-order

Ordered list of work packages with prioritization rationale

- **priority_order**: Ordered list of packages by execution priority
- **dependency_graph**: Dependency graph representation
- **prioritization_rationale**: Per-package rationale for the ordering

## Rules

### dependencies-constrain

Dependencies constrain but do not fully determine the order — within dependency layers, other criteria apply

### user-controls-final

The user controls the final priority order — present recommendations but defer to user judgment

## Errors

### circular_dependencies

**Cause:** Dependency graph contains cycles

**Recovery:** Present the cycle to the user and recommend decomposition or dependency removal

### all_same_priority

**Cause:** All packages evaluate identically on all criteria

**Recovery:** Ask the user which dimension matters most for their context to break the tie
