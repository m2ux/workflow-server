# Automatic Delivery Authorization

## Scope

On 5 November 2026 the user requested: “auto-start remaining work items”. The user then requested an upstream issue ensuring free work items are automatically started. The issue request is additional to the automatic-delivery instruction.

The active scope is the remaining I17 E03 rows on Project 17:

- W07+W08: delivery-plan admission and lane filtering.
- W09: Deliver mode forwards the requested lane.
- W10: Plan mode writes the confirmed Lane cells.
- W11+W12: Ready-unit lane reporting.
- W13: Advance mode carries the unit-lane report.
- W14: bounded diagnostics for unsupported cross-epic joins.

The instruction to start all remaining published work includes W11–W13. Their earlier reporting deferral is resolved for this automatic run, retaining the existing reporting design. Each unit still starts only when the live queue, dependencies and reservations admit it.

The upstream automatic-dispatch issue is a report for future Work Planner work; this run does not implement that new issue. Other initiatives and epics are outside this active-epic authorization.

## Coordination

One coordinator stays active until the remaining scope is delivered or it reaches a real blocker. It refreshes the live queue after each unit completes, reserves and dispatches newly free work, and tracks running sessions. Each unit uses its own worktree and session and carries its tests, PR, debt fixes and recording through completion.

The harness has four active slots including the chat parent. Capacity is shared between the coordinator, unit sessions and component contributors. Schedule contributors in batches; do not oversubscribe or duplicate a held row. Serialize GitHub issue-body writes, engineering git operations, epic-base updates and integration updates when concurrent units would reach them. Use the highest-priority eligible units, retaining published dependencies and joins.

## Completion

Finish the epic's current criterion verification and agent review and publish its current integration evidence. Required human review and the default-branch merge boundary remain binding. Keep exact PR and board states distinct. Do not declare the epic delivered until its integration and closure evidence hold.

## Checklist

- [x] Capture the user's automatic-delivery and upstream-report requests.
- [x] Publish and read back the upstream issue.
- [x] Publish this authorization and resolve the reporting deferral in the planning record.
- [x] Start the continuous delivery coordinator and verify its first unit is running.
