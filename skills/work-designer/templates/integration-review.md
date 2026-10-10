# Integration Review

## Verdict

{{Verdict, decisive evidence and the revision combination it applies to.}}

## Reviewed Scope

{{Project, selected variant or derived configuration, authoritative sources and resolved planning record.}}

| Product or Branch | PR or Head | Target | Merge Base | Reviewed Result | Role in Integration |
| --- | --- | --- | --- | --- | --- |
| {{Branch}} | {{PR and full SHA}} | {{Branch and full SHA}} | {{Full SHA}} | {{Commit or tree SHA}} | {{Responsibility}} |

{{Requirements, constituent PRs, proposed merge/deployment order, and final and exposed intermediate combinations.}}

## Findings

### {{Area of Concern}}

- **{{Finding ID and severity: concrete problem}}**
  {{Trigger, expected behavior and authoritative source, observed behavior, and consequence.}}
  - Evidence: {{Commit-pinned source and reproduction or run evidence}}
  - Ownership: {{Branch and affected consumers}}
  - Suggested correction: {{Smallest change that resolves the problem}}
  - Confidence: {{Confirmed or suspected, with uncertainty and attribution}}

{{Repeat for findings. If there are none, state that no actionable defect was found.}}

## Coverage

| Requirement or Invariant | Branches and Consumers | Failure Scenario | Required Observation | Check and Revision Pairing | Result and Evidence |
| --- | --- | --- | --- | --- | --- |
| {{Requirement and source}} | {{Affected closure}} | {{Boundary or negative case}} | {{Observable behavior}} | {{Command or inspection and full SHAs}} | {{Executed, inspected, inferred or unobserved; outcome; evidence link}} |

## Gaps and Residual Risk

{{Missing or skipped checks, unavailable environments, observation limits, pre-existing defects, current CI conclusions and deployment-order constraints. State none when there are none.}}

## Documentation and PR Accuracy

{{Material differences between the integration, its documented design and its PR bodies, including constituent-PR references. State none when there are none.}}

## Required Actions

{{The smallest concrete actions needed to resolve findings or establish missing evidence, with owning branches. State none when readiness is established.}}
