## Overview

A Backlog initiative pauses its ongoing delivery and moves every unfinished descendant to Backlog. Completed descendants stay Done. Work resumes through the same held units, worktrees, pull requests and observed sessions after current admission is restored.

## Problem

- **Active states resist the cascade.**
  The audited queue protects active and review-stage children while a lower initiative is retained In Progress, and an actual Backlog parent leaves those child states in place.
- **A paused parent does not gate merges.**
  The [survey's merge selector](https://github.com/m2ux/workflow-server/blob/86df5e4c2ccc2516b46cb0be7cf89e1cc258480f/skills/work-planner/scripts/deliver.py#L285-L317) has no parent-state input and offers a passing task PR beneath captured Backlog parent and epic states.
- **Sessions have no paused state.**
  The [observed inventory](https://github.com/m2ux/workflow-server/blob/86df5e4c2ccc2516b46cb0be7cf89e1cc258480f/skills/work-planner/scripts/dispatch.py#L23-L24) rejects paused state and has no cooperative checkpoint/resume contract.

## Proposal

- **The parent owns the cascade.**
  Entering or holding Backlog selects every unfinished descendant, including work In Progress or In Review. Completed Done descendants and existing abandoned-closure handling retain their terminal outcomes.
- **Pause is cooperative and evidenced.**
  Workers finish their bounded current operation, stop new dependent actions and acknowledge a checkpoint. An attempted request or a state label alone proves neither pause nor free capacity.
- **Identity survives the pause.**
  Retain the planning hold, unit, branch, worktree, recorded work and PR. Resume the existing observed session after fresh admission and checkpoint checks; an absent session is reported without duplicate dispatch.
- **Every delivery gate consumes current admission.**
  Paused descendants produce no new offers, ready merge candidates, ready handoff or merge mutation. Board reconciliation preserves the pause and confirms each status write through readback.
- **Contracts and consumers land together.**
  Each joined unit carries its owning schemas, callers and observing regressions. The complete epic reaches workspace only after integration verifies the whole behavior; there is no feature flag or temporary compatibility path.

The initiative's whole-epic prerequisites are E02 and E04, supplying finalized separated state/unit contracts and the integrated recovery/merge baseline. Task rows do not repeat those gates. W06 represents the complete joined foundation unit: its prerequisites deliver the observed-session schema, occupancy rules, worker control and parent selector together. Both cascade and resume units consume that complete producer; the admission unit consumes the completed cascade through W12. E02 W02's engineering audit commit is evidence, not a workspace ancestry prerequisite.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w01.md) | Pause coordinates saved unit state | AC1 |  | W02, W03, W04, W05, W06 | | |
| [W02](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w02.md) | Workers acknowledge pause at safe checkpoints | AC2 |  | W01, W03, W04, W05, W06 | | |
| [W03](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w03.md) | Observed sessions retain pause checkpoints | AC3 |  | W01, W02, W04, W05, W06 | | |
| [W04](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w04.md) | Paused sessions retain occupied units | AC4 |  | W01, W02, W03, W05, W06 | | |
| [W05](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w05.md) | Worker briefs carry pause and resume context | AC5 |  | W01, W02, W03, W04, W06 | | |
| [W06](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w06.md) | Parent Backlog selects unfinished descendants | AC6 |  | W01, W02, W03, W04, W05 | | |
| [W07](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w07.md) | Status changes preserve completed descendants | AC7 | W06 | W08, W09, W10, W11, W12 | | |
| [W08](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w08.md) | Queue declares the Backlog cascade | AC8 | W06 | W07, W09, W10, W11, W12 | | |
| [W09](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w09.md) | Queue places unfinished descendants in Backlog | AC9 | W06 | W07, W08, W10, W11, W12 | | |
| [W10](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w10.md) | Delivery sync respects paused descendants | AC10 | W06 | W07, W08, W09, W11, W12 | | |
| [W11](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w11.md) | Status writes admit the authorized cascade | AC11 | W06 | W07, W08, W09, W10, W12 | | |
| [W12](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w12.md) | Board delivery confirms the cascade | AC12 | W06 | W07, W08, W09, W10, W11 | | |
| [W13](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w13.md) | Delivery plans exclude paused work | AC13 | W12 | W14, W15, W16 | | |
| [W14](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w14.md) | Survey excludes paused merge candidates | AC14 | W12 | W13, W15, W16 | | |
| [W15](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w15.md) | Merge requires current unit admission | AC15 | W12 | W13, W14, W16 | | |
| [W16](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w16.md) | Integration stops for paused work | AC16 | W12 | W13, W14, W15 | | |
| [W17](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w17.md) | Resume retains session and hold identity | AC17 | W06 | W18, W19 | | |
| [W18](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w18.md) | Resume validates the captured checkout | AC18 | W06 | W17, W19 | | |
| [W19](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/w19.md) | Checkpoint validation preserves recorded work | AC19 | W06 | W17, W18 | | |

## Acceptance Criteria

- [ ] **AC1.** The pause procedure coordinates source admission, cooperative worker control, checkpoint evidence, readiness withdrawal and saved board state without claiming an acknowledgement or successful write from an attempted action, as captured pause-sequence fixtures show.
- [ ] **AC2.** The coordinator and worker stop new dependent actions after a confirmed Backlog pause, finish the bounded current operation, checkpoint the same unit and report an observed acknowledgement before claiming that worker paused, as worker acknowledgement and bounded-operation fixtures show.
- [ ] **AC3.** The observed session value represents paused state and its unit/session/hold/worktree/branch/head/PR checkpoint, distinct from requested intent and actual harness capacity, as observed-session schema fixtures show.
- [ ] **AC4.** A paused observed session retains row occupancy and cannot be selected as a new unit or free a slot merely because its label changed, as real batch-selection and occupancy fixtures show.
- [ ] **AC5.** The worker brief carries the owning pause/resume contract and checkpoint context, with no duplicate lifecycle algorithm or authority to discard another session, as fresh-context brief-reader fixtures show.
- [ ] **AC6.** A Backlog initiative selects all unfinished descendants, including In Progress and In Review, while completed descendants remain Done and existing abandoned-closure rules remain operative, as captured descendant-selector fixtures show.
- [ ] **AC7.** A proposed cascade retains completed Done descendants and names a Backlog change for every selected unfinished descendant from current parent/child evidence, as proposed-change fixtures over captured parent/child states show.
- [ ] **AC8.** The queue contract separates a retained In Progress parent from a parent entering or already in Backlog, with its selected unfinished descendants participating in the cascade, as queue contract scenarios with actual and attempted parent transitions show.
- [ ] **AC9.** Queue execution cascades a Backlog parent to selected unfinished children without the current In Progress or In Review exemptions, as real queue-computation fixtures over every child status show.
- [ ] **AC10.** Delivery reconciliation does not re-promote a Backlog-paused parent or unfinished descendant merely because a preserved hold, open PR or prior activity exists, as real reconciliation fixtures with retained holds and open pull requests show.
- [ ] **AC11.** The write jurisdiction accepts the explicitly authorized unfinished-descendant Backlog cascade while retaining unrelated write limits and completed/abandoned closure handling, as actual status-jurisdiction fixtures for authorized and unrelated writes show.
- [ ] **AC12.** Board Delivery applies the owning cascade decisions and reports saved state only after item readback, retaining failed or lagging writes as discrepancies, as captured board-application and readback fixtures with failed or lagging writes show.
- [ ] **AC13.** The delivery-plan contract offers neither starts nor merge candidates for a Backlog-paused unit while retaining its hold and delivery identity, as delivery-plan admission fixtures preserving unit identity show.
- [ ] **AC14.** The actual survey excludes new work and ready merge candidates for paused descendants, including an otherwise passing open task PR, as actual survey fixtures with passing checks and a paused parent show.
- [ ] **AC15.** A merge attempt requires current admission of its unit in addition to exact-head, target, review and check evidence; pause supplies a blocker without a merge attempt or invented permission refusal, as source-selected merge-guard fixtures observing the exact attempted mutation calls show.
- [ ] **AC16.** An integration whose current parent/unit admission is paused reaches neither ready/In Review publication nor merge or merged-success confirmation, as integration continuation fixtures observing readiness writes, merge calls and outcomes show.
- [ ] **AC17.** Resume selects the existing observed session with its same planning record, hold, checkout and PR identities after fresh admission/capacity/checkpoint evidence; an absent session remains a blocker, as same-session resume fixtures including an absent observed session show.
- [ ] **AC18.** Paused-resume validation consumes the captured checkpoint through its owning capability and preserves the separate strict clean retained-preparation contract, as paused-checkpoint and clean retained-preparation route fixtures show.
- [ ] **AC19.** Real-git checkpoint validation refuses foreign registration, changed branch/head/status/content or missing checkpoint without changing files or starting a worker, while accepting the same recorded owned work, as real local git checkpoint fixtures inspecting files before and after validation show.

## References

- **R1.** [Pause design and audit evidence](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-backlog-pause/design.md) — selected policy, current source observations, component ownership and verification boundaries.
