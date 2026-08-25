---
metadata:
  version: 1.0.0
---

## Capability

A deferred-items register row naming the issue raised for it.

## Inputs

### current_deferred_item

The register row the raise gate approved, carrying its ID, its item text and the rationale the deferring activity recorded.

### deferred_item_issue_number

The key of the issue raised for this row.

### deferred_item_issue_url

The address of the issue raised for this row.

## Protocol

### 1. Link the Row to Its Issue

- Write `{deferred_item_issue_url}` into this row's Follow-up cell as a link labelled `{deferred_item_issue_number}`, in the shape the [register template](../../resources/deferred-items.md#template) gives that column.
- Leave the ID, item and reason columns as the deferring activity wrote them.
  > Where the cell already holds a link, the row is raised and this pass leaves it alone.
