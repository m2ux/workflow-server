---
metadata:
  version: 1.0.0
---

## Capability

Record the units a capability rewrite loads, beside the units the listing command prints.

## Outputs

### units_listed

Units the listing command prints for `technique.capability`, one path and heading per line.

### units_used

Units the author step loads while rewriting the subject capability, one path and heading per line.

## Protocol

### 1. List

- Run `npx tsx guards/list-fires-on.ts technique.capability --root <corpus>` from the engine checkout. Write each printed unit into `{units_listed}`.

### 2. Load

- The rewrite of `techniques/subject.md` `## Capability` loads only the units in `{units_listed}`. Write that load set into `{units_used}`. `{units_used}` equals `{units_listed}`.
