---
metadata:
  version: 1.0.0
---

## Capability

Gauge how reversible a change to a symbol is, to set the reversibility flag on judgement-augmentation assumptions. (review-assumptions)

## Inputs

### name

the symbol the assumption touches

## Output

### reversibility

`path-committing` (high caller fan-out and broad process participation) or `easily-reversible` (isolated symbol)

## Protocol

1. Apply [context](../../../meta/techniques/gitnexus-operations/context.md) for the {name} symbol the assumption touches.
   - If the index is out of date, run `npx gitnexus analyze`, then retry.
   - If the symbol does not resolve, gauge reversibility from the diff and surrounding code instead.
2. Set {reversibility} from its connectivity: high caller fan-out and broad process participation → path-committing; an isolated symbol → easily-reversible.
