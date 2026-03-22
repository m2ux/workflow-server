# Default Evaluation Dimensions

Default dimension sets derived from target type when the user does not supply explicit dimensions.

## Proposal / Strategy Document

| Dimension | Description | Focus Areas |
|-----------|-------------|-------------|
| Consistency | Internal logical coherence — do the parts agree? | Cross-references between sections, stated goals vs proposed mechanisms, numerical consistency, timeline alignment |
| Veracity | Truthfulness of claims — are the assertions correct? | Empirical claims, market size assertions, cited statistics, technical capability claims |
| Plausibility | Viability of approach — are rejected alternatives properly considered? | Alternative designs dismissed, migration of problems between approaches, honesty of rejection rationale |
| Feasibility | Practical achievability — do the resources and constraints support delivery? | Resource assumptions, timeline commitments, dependency chains, team capacity, technical prerequisites |

## Codebase

| Dimension | Description | Focus Areas |
|-----------|-------------|-------------|
| Correctness | Does the code do what it claims? | Logic errors, contract violations, type safety gaps, specification conformance |
| Robustness | How does it handle failures? | Error handling coverage, edge cases, recovery paths, graceful degradation |
| Architecture | Are the design decisions sound? | Module boundaries, dependency direction, abstraction levels, coupling patterns |
| Maintainability | Will this be sustainable over time? | Code clarity, test coverage, documentation, complexity hotspots, onboarding friction |

## Mixed Targets

Combine document and code dimension patterns based on which aspect the evaluation_description emphasises. If the evaluation focuses on a proposal that includes code, weight toward proposal dimensions. If it focuses on code with supporting documentation, weight toward codebase dimensions.

## Custom Targets

For targets that don't match the above patterns, derive dimensions from the evaluation_description. Each dimension should represent an independent analytical axis that contributes to the overall evaluation.

### Dimension Object Structure

Each dimension: `{ name, description, focus_areas }` where focus_areas is an array of specific aspects to examine within that dimension.
