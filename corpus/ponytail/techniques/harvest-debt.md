---
metadata:
  version: 1.4.0
---

## Capability

Collects the deliberate simplifications standing in the tree into a ledger that can be tracked and paid down.

## Outputs

### debt_ledger

The debt ledger, in the shape [debt-ledger](../resources/debt-ledger.md#template) defines: one entry per [ponytail marker](../resources/ponytail-marker-convention.md#convention) grouped under the file it sits in, with the counts that total them. A marker carrying no trigger is entered as [no-trigger](../resources/ponytail-marker-convention.md#no-trigger).

#### artifact

`debt-ledger.json`

#### audience

`agent`

### has_debt_markers

Whether any ponytail marker was found — true when the ledger has at least one row, false when the tree carries no deliberate-simplification debt.

## Protocol

### 1. Grep the markers

- Search `{target_path}` for the marker token [Convention](../resources/ponytail-marker-convention.md#convention) defines, skipping `node_modules`, `.git`, and build output. Each hit is one deliberate simplification.

### 2. Build the ledger

- Add an entry per marker to `{debt_ledger}` in `{artifact_dir}` per [debt-ledger](../resources/debt-ledger.md#template) and its [Rules](../resources/debt-ledger.md#rules), with the ceiling and upgrade trigger drawn from the [marker convention](../resources/ponytail-marker-convention.md#convention) and a missing trigger flagged [no-trigger](../resources/ponytail-marker-convention.md#no-trigger)

### 3. Signal the result

- Set `{has_debt_markers}` to true when the ledger has at least one row, false when no markers were found.
