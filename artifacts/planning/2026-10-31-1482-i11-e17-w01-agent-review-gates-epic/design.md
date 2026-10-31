# Agent review handoff design

## Contract

The integration handoff requires published agent review evidence for the current integration head and target SHA. Full diff, affected definitions/callers, acceptance evidence, findings/dispositions and validation are inspected. Missing/stale evidence or unresolved findings prevents handoff. Human approval remains separate.

## Ownership

- Agent Review owns the external JSON review record and its validation. The engineering branch stores evidence without changing the reviewed code revision.
- Review Pull Request conducts and publishes the actual review when integration requests handoff.
- Epic Integration withdraws any prior ready/In Review state before refreshing and reviewing, then admits current evidence to readiness, board and final user handoff. Failed freshness returns through withdrawal.
- Pull Request owns full REST revision metadata, draft withdrawal and readiness. Board Delivery and its board.py/deliver.py implementations share the agent-review validator.

## Verification

Behavioral fixtures cover absent/stale/current records, head and target changes, open/fixed/deferred findings, required published record links, full REST metadata, multiple integration targets, dispatch refusal and board status withdrawal. Independent live disclosure trials inspect actual caller reads and target-advance/human-approval scenarios. The full planner/shared suites and skill-file checker run before publication.

## Review findings

The first independent trial exposed a pending-human-approval ordering ambiguity. The procedure explicitly distinguishes handoff from merge. A second reviewer found stale handoff state could survive failed re-review and reduced metadata could lack revision identity. Integration withdrawal and full REST metadata resolve both. Subsequent review verifies the resulting path.

## Changes

No scope expansion, new task, criteria renumbering or unrelated initiative changes. W02 remains the separate final corpus audit. All implementation files stay within the approved W01 file-change boundaries.
