---
metadata:
  version: 1.0.0
---

## Capability

Objective complexity estimate for an issue, from the fan-out of a preliminary target symbol. (classify-problem)

## Inputs

### target

a preliminary symbol inferred from the issue (when one can be inferred)

## Output

### complexity_signal

fan-out and affected-process count as an objective complexity indicator

## Protocol

1. Apply [impact](./impact.md) with `{target, maxDepth: 2}`.
2. Read the fan-out and affected-process count as the `complexity_signal`: high fan-out or many affected processes indicate higher complexity than the issue text alone might suggest.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze`, then retry

### symbol_unknown

**Cause:** no target symbol can be inferred from the issue

**Recovery:** signal unavailable — fall back to an issue-text complexity estimate
