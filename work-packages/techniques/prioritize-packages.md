---
metadata:
  version: 1.2.0
---

## Capability

Evaluate and order work packages by dependencies, value, risk, and effort

## Inputs

### package_plans

List of completed package [plan documents](../resources/package-plan-template.md#template) with scope, dependencies, and effort

### dependency_map

Inter-package dependency map describing which packages block or depend on which others

## Outputs

### priority_order

Ordered list of work packages by execution priority, with prioritization rationale

#### artifact

`priority-ranking.md`

#### audience

`human`

#### dependency_graph

Dependency graph representation, showing which packages block or depend on which others

#### prioritization_rationale

Per-package rationale for the ordering, with the value, risk, and effort assessments behind it

## Protocol

### 1. Analyze Dependencies

- Apply the [prioritization-framework](../resources/prioritization-framework.md#step-1-dependency-graph) evaluation methodology
- Build the dependency graph from the dependency sections of all `{package_plans}`, cross-checking against `{dependency_map}` to confirm which packages block or depend on which others
- Perform topological sort to identify valid orderings  
  > A cycle is a decomposition problem: record the cycle and the packages in it, and recommend extracting the shared component or removing the dependency.

### 2. Evaluate Criteria

- For each package, assess: business value (High/Medium/Low), risk (High/Medium/Low), effort (High/Medium/Low)
- Use the [scoring guidance](../resources/prioritization-framework.md#scoring-guidance) from the prioritization framework
- Record the rationale for each assessment

### 3. Assemble Ranking

- Apply priority ordering rules: dependency-first, then high-value/low-effort, then high-risk-early
- Identify packages that could be parallelized (independent, no shared resources)
- Write `{priority_order}` as the ranking document per [priority-ranking](../resources/priority-ranking.md#template) and its [Rules](../resources/priority-ranking.md#rules)
- If all packages evaluate identically on every criterion, ask the user which dimension matters most for their context to break the tie

## Rules

### dependencies-constrain

Dependencies constrain but do not fully determine the order — within dependency layers, other criteria apply

### user-controls-final

The user controls the final priority order — present recommendations but defer to user judgment
