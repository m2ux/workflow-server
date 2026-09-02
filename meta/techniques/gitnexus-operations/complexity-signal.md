---
metadata:
  version: 1.1.0
---

## Capability

Objective complexity estimate for an issue, from the fan-out of a preliminary target symbol.

## Inputs

### repo_name

Optional. Name of the indexed graph to address, as [resolve-graph](./resolve-graph.md) reports it. Omit only where exactly one graph is indexed.

### target

a preliminary symbol inferred from the issue (when one can be inferred)

## Outputs

### complexity_signal

fan-out and affected-process count as an objective complexity indicator

## Protocol

1. Apply [impact](./impact.md) with `{target, maxDepth: 2, repo_name}`.
   - If no `{target}` symbol can be inferred from the issue, the signal is unavailable — fall back to an issue-text complexity estimate.
   - If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Read the fan-out and affected-process count as the `{complexity_signal}`: high fan-out or many affected processes indicate higher complexity than the issue text alone might suggest.
