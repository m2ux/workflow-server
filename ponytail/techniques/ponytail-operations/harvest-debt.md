---
metadata:
  version: 1.0.0
---

## Capability

Harvest every [ponytail marker](../../resources/ponytail-marker-convention.md#convention) across `{target_path}` into a debt ledger — one row per marker recording where it is, what was simplified, the ceiling it sets, and the trigger that would justify upgrading past it — and flag any marker missing an upgrade trigger.

## Outputs

### debt_ledger

The debt ledger — one row per [ponytail marker](../../resources/ponytail-marker-convention.md#convention) carrying `file:line`, what was simplified, the ceiling, and the upgrade trigger. Markers with no trigger are flagged as [no-trigger](../../resources/ponytail-marker-convention.md#no-trigger) so they can be given one.

#### artifact

`debt-ledger.md`

### has_debt_markers

Whether any ponytail marker was found — true when the ledger has at least one row, false when the tree carries no deliberate-simplification debt.

## Protocol

### 1. Grep the markers

- Search `{target_path}` for the marker token with `grep -rn 'ponytail:'`. Each hit is one deliberate simplification.

### 2. Build the ledger

- For each marker, add a row to `{debt_ledger}`: `file:line`, what was simplified, the ceiling it sets, and the upgrade trigger drawn from the [marker convention](../../resources/ponytail-marker-convention.md#convention).
- Flag any marker that records no upgrade trigger as [no-trigger](../../resources/ponytail-marker-convention.md#no-trigger) — a ceiling with no defined exit is debt that can never be paid down.

### 3. Signal the result

- Set `{has_debt_markers}` to true when the ledger has at least one row, false when no markers were found.
