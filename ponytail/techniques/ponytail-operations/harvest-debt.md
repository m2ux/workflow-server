---
metadata:
  version: 1.0.0
---

## Capability

Harvest every [ponytail marker](../../resources/ponytail-marker-convention.md#convention) across `{target_path}` into a debt ledger — one row per marker recording where it is, what was simplified, the ceiling it sets, and the trigger that would justify upgrading past it — and flag any marker missing an upgrade trigger.

## Outputs

### debt_ledger

The debt ledger — one row per [ponytail marker](../../resources/ponytail-marker-convention.md#convention) in the form `<file>:<line>, <what was simplified>. ceiling: <the limit>. upgrade: <the trigger>.`, grouped by file. Markers with no trigger are flagged as [no-trigger](../../resources/ponytail-marker-convention.md#no-trigger) so they can be given one. The ledger is the workflow's artifact form of the source's optional persisted file (`PONYTAIL-DEBT.md`).

#### artifact

`debt-ledger.md`

### has_debt_markers

Whether any ponytail marker was found — true when the ledger has at least one row, false when the tree carries no deliberate-simplification debt.

## Protocol

### 1. Grep the markers

- Search `{target_path}` for the comment-anchored marker token with `grep -rnE '(#|//) ?ponytail:' .`, skipping `node_modules`, `.git`, and build output. The comment prefix is what keeps prose that merely mentions the convention out of the ledger; add other comment prefixes if the stack uses them. Each hit is one deliberate simplification.

### 2. Build the ledger

- For each marker, add a row to `{debt_ledger}` in the form `<file>:<line>, <what was simplified>. ceiling: <the limit>. upgrade: <the trigger>.`, with the ceiling and upgrade trigger drawn from the [marker convention](../../resources/ponytail-marker-convention.md#convention). Group rows by file, one row per marker.
- Flag any marker that records no upgrade trigger as [no-trigger](../../resources/ponytail-marker-convention.md#no-trigger) — a ceiling with no defined exit is debt that can never be paid down.
- For an owner per row, optionally append the output of `git blame -L<line>,<line>` for the marker's line.

### 3. Signal the result

- Close `{debt_ledger}` with `<N> markers, <M> with no trigger.` summing the markers and the no-trigger flags. When no markers were found, write `No ponytail: debt. Clean ledger.` instead.
- Set `{has_debt_markers}` to true when the ledger has at least one row, false when no markers were found.
