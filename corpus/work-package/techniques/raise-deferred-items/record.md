---
metadata:
  version: 2.1.0
---

## Capability

A deferred-items register entry naming the issue raised for it.

## Inputs

### current_deferred_item

A register entry, carrying its ID, its item text and the reason it was set aside.

### deferred_item_issue_number

The key of the issue raised for this entry.

### deferred_item_issue_url

The address of the issue raised for this entry.

## Outputs

### deferred_items_register

The register's bare filename, with the entry's `issue` filled.

#### artifact

`deferred-items.json`

#### audience

`agent`

## Protocol

### 1. Link Entry to Issue

- Set the `issue` of `{current_deferred_item}` in `{deferred_items_register}` to `{deferred_item_issue_number}` and `{deferred_item_issue_url}`, in the shape the [register template](../../resources/deferred-items.md#template) gives that field.
