---
metadata:
  version: 2.0.0
---

## Capability

A deferred-items register entry naming the issue raised for it.

## Inputs

### current_deferred_item

A register entry, carrying its ID, its item text and the reason it was set aside.

### deferred_item_issue_number

The key of the issue raised for this row.

### deferred_item_issue_url

The address of the issue raised for this row.

## Protocol

### 1. Link the Entry to Its Issue

- Set this entry's `issue` to `{deferred_item_issue_number}` and `{deferred_item_issue_url}`, in the shape the [register template](../../resources/deferred-items.md#template) gives that field.
