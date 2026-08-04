---
metadata:
  version: 1.3.0
---

## Capability

Harvest every [ponytail marker](../../ponytail/resources/ponytail-marker-convention.md#convention) across `{target_path}` into a debt ledger — one row per marker recording where it is, what was simplified, the ceiling it sets, and the trigger that would justify upgrading past it — and flag any marker missing an upgrade trigger.

## Outputs

### debt_ledger

The debt ledger — one row per [ponytail marker](../../ponytail/resources/ponytail-marker-convention.md#convention) in the form `<file>:<line>, <what was simplified>. ceiling: <the limit>. upgrade: <the trigger>.`, grouped by file. Markers with no trigger are flagged as [no-trigger](../../ponytail/resources/ponytail-marker-convention.md#no-trigger) so they can be given one. The ledger is the workflow's artifact form of the source's optional persisted file (`PONYTAIL-DEBT.md`).

#### artifact

`debt-ledger.md`

### has_debt_markers

Whether any ponytail marker was found — true when the ledger has at least one row, false when the tree carries no deliberate-simplification debt.

## Protocol

### 1. Grep the markers

- Search `{target_path}` for the comment-anchored marker token with `grep -rnE '(#|//) ?ponytail:' .`, skipping `node_modules`, `.git`, and build output. The comment prefix is what keeps prose that merely mentions the convention out of the ledger; add other comment prefixes if the stack uses them. Each hit is one deliberate simplification.

### 2. Build the ledger

- Add a row per marker to `{debt_ledger}` in `{artifact_dir}` per [debt-ledger](../resources/debt-ledger.md#template) and its [Rules](../resources/debt-ledger.md#rules), with the ceiling and upgrade trigger drawn from the [marker convention](../../ponytail/resources/ponytail-marker-convention.md#convention) and a missing trigger flagged [no-trigger](../../ponytail/resources/ponytail-marker-convention.md#no-trigger)
- For an owner per row, optionally append the output of `git blame -L<line>,<line>` for the marker's line.

### 3. Signal the result
- Set `{has_debt_markers}` to true when the ledger has at least one row, false when no markers were found.
