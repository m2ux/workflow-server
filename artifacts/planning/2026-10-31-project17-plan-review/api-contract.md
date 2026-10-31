# GitHub API capability contract

## Decision

User instruction: reconcile tickets to prefer GraphQL for everything REST cannot do; never deprecated classic GraphQL project APIs.

- Use REST for capabilities REST supports.
- Use current GraphQL for every capability REST cannot provide, including reads and writes. No per-operation user exception is required.
- Command specifications identify the missing REST capability. An authentication failure or missing permission alone does not establish a REST capability gap.
- Never use deprecated Projects (classic) fields, types or mutations. Project operations use Projects V2 APIs.

GitHub's deprecation applies to Projects (classic), not to the current GraphQL API: https://github.blog/changelog/2024-05-23-sunset-notice-projects-classic/ . Current schema distinguishes projectV2/projectsV2 from deprecated projects: https://docs.github.com/en/graphql/reference/repos . This requirement does not prohibit a credential merely because its name includes classic.

## Reconciliation and ownership

- I11 #1166 AC24: capability policy covers reads and writes, with no one-off exception and no classic Projects APIs.
- E10 #1181 W05/AC7: interface check accepts justified GraphQL-only reads/writes and rejects unjustified GraphQL and classic Projects APIs. Existing W04/W05 Joins and dependencies remain unchanged.
- E16 #1474: capture specifications follow the same policy. Existing AC1–AC7, task coverage and dependencies remain unchanged. E10 owns the generic interface guard; E16 owns capture implementation, so no new delivery-order edge is introduced.
- REQ-NF002 in the marked requirements source carries the same policy and links this decision. The original meeting remains provenance; its one-off-exception policy is superseded by this explicit user instruction.
- F03 is resolved at plan level. Implementation remains in the existing unfinished tasks; no completion ticks or board placements change.

## Verification checklist

- [x] Refresh affected tracker bodies and confirm GitHub terminology.
- [x] Reconcile requirements, task descriptions and criterion coverage.
- [x] Publish all three bodies and verify exact live readbacks.
