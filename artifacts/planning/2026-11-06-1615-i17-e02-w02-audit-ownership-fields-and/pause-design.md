# Backlog Pause Design

## Goal and Selected Boundary

The user selected “in-progress work is paused and everything moves to backlog with its initiative”, then confirmed “Completed children remain Done (Recommended)”. A parent entering or already in Backlog cascades to every unfinished descendant, including In Progress and In Review work. Existing abandoned-closure handling remains a closure outcome, not permission to reopen it. A retained In Progress parent is a different state; it is not labeled Backlog merely because a queue transition was contemplated.

This supersedes the earlier prose-only current-behavior choice. It changes runtime outcomes and is a distinct concern from ownership-only separation. Its proposed I17 epic is priority 6, after finalized separation and recovery contracts, with no implementation dependency on plan publication. The run allowance covers this placement and the bounded migration; the audit records it rather than asking an unnecessary second authorization question.

## Observed Baseline

The immutable original source is `3cf01bfe28cf16d24b823cd97bda907e85992dc8`; subsequent source-refresh evidence is recorded in the audit. The actual queue captures preserve active/review work under current rules and park idle Ready siblings. With an actual Backlog parent they move a Ready child but leave In Progress/In Review children in place. `pause-observations.json` also demonstrates a passing task PR offered as a merge candidate under captured Backlog parent and epic states. The observed inventory rejects `paused` because that state is absent from its contract.

These runs use concrete captured inputs and real local queue/review/survey functions. They neither run workers nor mutate a tracker. The new expected behavior is not relabeled as the existing baseline.

## Ownership

- Initiative owns the authoritative Backlog pause selection over its descendant graph, with Done and existing closed-state boundaries explicit.
- Board Status owns the proposed status-change value and validated write jurisdiction. Board Queue owns queue placement; Board Delivery acquires/applies/confirms the selected changes and must not revive paused work from its preserved activity evidence.
- Dispatch Batch owns observed session state, requested intent versus acknowledgement, occupancy, checkpoint identity and actual capacity. A paused label alone frees nothing.
- Deliver coordinates worker control. The new Delivery Pause protocol is justified by one concrete ordered change across board state, worker acknowledgement, checkpoint evidence and readiness; it is not an umbrella home for unrelated lifecycle rules.
- Unit Dispatch resumes an existing observed unit/session rather than creating a worker. Delivery Branches validates the recorded checkout without mutating it. The paused checkpoint contract is distinct from the strict clean retained-preparation contract supplied upstream.
- Delivery Plan and its survey exclude paused offers and merge candidates. Pull Request and Epic Integration consume current admission before ready handoff or mutation, alongside E04's exact-head, target, review/check and classified-result contracts.

## Ordered Pause

1. Read the current parent and descendant identities/state through their owning evidence operations. Missing graph or tracker evidence is explicit, not an invented empty scope.
2. A confirmed Backlog pause immediately blocks new admission and merge attempts. Request a cooperative checkpoint from each existing scoped worker; retain its observed running state until acknowledgement.
3. The worker finishes its bounded current operation, stops new dependent work and reports the same unit, planning record, hold, session, branch/worktree/head, actual recorded work state and PR identity. No forced interruption, reset, cleanup or false completion is permitted.
4. Withdraw active ready handoff through the owning PR readiness capability when applicable, retaining its write/readback evidence. A failed withdrawal is a discrepancy; it is not proof of draft state and does not allow merge.
5. Apply the cascade to unfinished descendants through the owning Board Status decisions and permitted writes. Confirm each current item directly; retain failed/lagging writes explicitly. Completed Done descendants remain Done.
6. Record only acknowledged workers as paused. Reconcile actual harness capacity separately, retain the same held rows and PR identities, and report any outstanding acknowledgement, failed write or external-state race.

## Ordered Resume

1. Fresh parent/unit scope, dependency, lane and authorization evidence must admit the unit again. Reuse the same published planning record and live hold; no release/re-reservation is inferred.
2. Require the existing observed session. An absent session is a reported blocker; it is not authority for a second dispatch.
3. Validate the recorded branch, checkout registration, full head and tracked/untracked state/content against its checkpoint without mutation. Recorded owned work may survive a cooperative pause; a fresh retained preparation still requires its separate strict clean-state validation.
4. Resume that session only after current actual capacity and checkpoint/identity checks pass. A mismatch preserves files, hold and PR. A state label alone supplies neither capacity nor validation.
5. Readiness, tests, review evidence and exact-head merge authorization are refreshed for the actual resumed result. A paused or stale result reaches no ready/In Review write or merge mutation.

## Atomic Delivery and Criteria

The concrete draft carries nineteen one-file tasks in four joined units of six, six, four and three criteria. Source contracts and their immediate consumers ship together in the affected unit. Every fixing PR carries its observing route/real-git tests; no later testing row substitutes for them. The epic integrates into workspace only when the full behavior and current integration review pass. There is no feature flag, migration shim or parallel compatibility implementation.

The foundation consumes the final separated retained-unit/board contracts and the recovery baseline, including confirmed draft restoration and distinct merge outcomes. Final whole-epic E02/E04 prerequisites are derived from the refreshed complete task graph. E05's publication behavior is not consumed. Rebind exact component paths/producer rows after E02's broad rows are refined; current anticipated files are explicitly listed in component-map.md rather than silently treated as already delivered.

## Observing Matrix

| Case | Required observation |
| --- | --- |
| Actual/desired Backlog; Ready/In Progress/In Review descendants | Every unfinished descendant receives Backlog; running work pauses cooperatively. |
| Done or abandoned closure | Done remains terminal; existing abandoned-closure handling stays with its owner. |
| Retained In Progress parent | Do not mistake a contemplated Backlog transition for actual Backlog. |
| Pause requested during bounded command | No false acknowledgement; finish/checkpoint, then stop dependent work. |
| Preserved hold/open PR | Sync does not reactivate the paused unit; no offer or merge candidate appears. |
| Pause after verification | Fresh admission blocks the mutation and success-only continuation despite earlier passing checks. |
| Failed draft/status write | Current discrepancy retained; no unsupported state assertion. |
| Paused inventory | Same occupied rows; free capacity follows the harness, not the label. |
| Same checkpoint admitted again | Exactly the existing observed session resumes, retaining hold/branch/worktree/PR. |
| Missing session, changed hold/head/worktree or modified bytes | Block without worker creation, reset, cleanup or file mutation. |
| External merge/state race | Report the actual observed result and reconcile; never claim a pause or merge solely from an attempted operation. |

## E02 Migration and Extraction Barrier

E02 W02/AC17 owns the approved decision and evidence map. E02's ownership fixes preserve their audited runtime baseline and exclude this new runtime feature from their AC5 completion claim. The dedicated epic owns pause/cascade/resume implementation, tests and integration. This prevents the feature depending on E02 while E02 waits for the feature.

Add the new epic to I17's existing extraction-readiness goal. Once its identity and final producer rows exist, refresh the downstream extraction prerequisites; a newly planned pre-cutover feature must not be omitted because the older extraction row named only the earlier fixes. The coordinator publishes records before tracker links, refreshes bodies immediately before writes and confirms saved identities/state exactly.
