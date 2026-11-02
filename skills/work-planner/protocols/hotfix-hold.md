# Hot-fix Hold

One confirmed hot-fix unit held for its session: its planning record published and its board item In Progress.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Delivery Plan](../artifacts/delivery-plan.md)
- [Planning Record](../artifacts/planning-record.md)
- [Board Delivery](../artifacts/board-delivery.md)

## Procedure

1. **Record.**
   Add the unit's record with [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record), named as its `unit` line gives it.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for the record's folder.
2. **Hold.**
   Run [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status) with the hot-fix issue for In Progress, the supplied board identity and the board items the latest [Plan Available Work](../artifacts/delivery-plan.md#plan-available-work) read.
   - That status is the hold [Hot-fix Units](../artifacts/delivery-plan.md#hot-fix-units) defines, so the session starts only once it is confirmed.
   - Return the record folder and the confirmed status to the caller.
