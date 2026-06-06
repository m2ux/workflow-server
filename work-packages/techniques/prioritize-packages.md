---
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

List of completed package [plan documents](../resources/package-plan-template.md#template) with scope, dependencies, and effort

### dependency-map

Inter-package dependency map describing which packages block or depend on which others

## Protocol

### 1. Analyze Dependencies

- Use attached [prioritization-framework](../resources/prioritization-framework.md) (prioritization-framework) for the evaluation methodology
- Build a dependency graph from the dependency sections of all {package-plans}, cross-checking against the {dependency-map} to confirm which packages block or depend on which others
- Perform topological sort to identify valid orderings
- If the dependency graph contains cycles, present the cycle to the user and recommend decomposition or dependency removal

### 2. Evaluate Criteria

- For each package, assess: business value (High/Medium/Low), risk (High/Medium/Low), effort (High/Medium/Low)
- Use the [scoring guidance](../resources/prioritization-framework.md#scoring-guidance) from the prioritization framework
- Document the rationale for each assessment

### 3. Propose Order

- Apply priority ordering rules: dependency-first, then high-value/low-effort, then high-risk-early
- Identify packages that could be parallelized (independent, no shared resources)
- Generate the priority table with package, value, risk, effort, and rationale
- If all packages evaluate identically on every criterion, ask the user which dimension matters most for their context to break the tie

### 4. Present Prioritization

- Present the dependency graph (text or mermaid diagram)
- Present the priority table with rationale for the proposed order, forming the {priority-order} to be returned
- Note alternative orderings if multiple valid sequences exist

## Outputs

### priority-order

Ordered list of work packages with prioritization rationale

#### priority-order

Ordered list of packages by execution priority

#### dependency-graph

Dependency graph representation

#### prioritization-rationale

Per-package rationale for the ordering

## Rules

### dependencies-constrain

Dependencies constrain but do not fully determine the order — within dependency layers, other criteria apply

### user-controls-final

The user controls the final priority order — present recommendations but defer to user judgment
