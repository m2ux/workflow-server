# Board Delivery

The membership, Status and assignee changes [Board Status](board-status.md) proposes for delivery, applied to one board and confirmed against its saved items.

## Operations

### Record Epic Review

One epic's review status on its board.

#### 1. Read Board State

Apply [Read Board State](board.md#read-board-state "ƒ") for the board in [Review Selection](#review-selection).

#### 2. Read Configuration and Assignee

- Apply [Read Board Configuration](board.md#read-board-configuration "ƒ").
- Run [Find User](board.md#find-user "ƒ").

#### 3. Locate Epic Item

- Match the epic's issue to its board item.
- Provide an absent item as a finding and stop. The status write below needs it.

#### 4. Write and Confirm Review Status

- Apply [Record Dispatch Status](#record-dispatch-status "ƒ") with the epic as the review identity for In Review or the progress identity for In Progress, as [Review Selection](#review-selection) requests. The In Review it writes, or refuses, is the one Board Status gives the epic's review evidence.
- When the item still shows the preceding status, Apply [Record Dispatch Status](#record-dispatch-status "ƒ") again for the same review or progress identity. Apply [Read Board Configuration](board.md#read-board-configuration "ƒ") for the same item to confirm the write. The item list can lag a write.

#### 5. Provide Confirmed Status

Provide [Confirmed Statuses](#confirmed-statuses) with the confirmed status or the discrepancy left for the requester.

### Record Dispatch Status

The task and epic statuses owned by a delivery dispatch.

#### 1. Compute Dispatch Calls

- Run [Compute Dispatch Status](board-status.md#compute-dispatch-status "ƒ") for the supplied progress and review identities.
- A refusal or handoff blocker it reports is the unresolved discrepancy; run no call and continue to Provide Saved Statuses.

#### 2. Apply and Confirm Calls

- Run each provided call.
- Apply [Read Board Configuration](board.md#read-board-configuration "ƒ") for each affected item to confirm the write.

#### 3. Provide Saved Statuses

Provide [Confirmed Statuses](#confirmed-statuses) with saved statuses or unresolved discrepancies.

## Fields

### Review Selection

The epic issue identity, board identity and requested Status: In Review or In Progress.

### Saved Identities

The saved initiative, epic and task identities, board identity, output directory and repositories the board issues live in.

### Confirmed Statuses

The saved item statuses or unresolved discrepancies provided after item readback.
