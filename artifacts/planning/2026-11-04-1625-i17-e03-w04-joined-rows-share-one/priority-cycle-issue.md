## Overview

The dependency check reports unsupported cross-epic joins before calculating epic priorities, so malformed joined-unit input produces a useful diagnostic and terminates. Reciprocal joins covering every task of two epics currently reach a recursion error in priority calculation.

## Problem

- **Qualified joins enter priority calculation without a scope check.**
  Two one-row epic tables can each join the other's row. At the recorded baseline, parsing reports no problem and derives reciprocal whole-epic prerequisites.
- **The command crashes on that graph.**
  Running the recorded fixtures at revision 74e19867e905523b85d2da84c7b1cb35b2b60b53 exits with a RecursionError rather than a bounded row diagnostic.
- **Delivery and parsing expose different shapes.**
  The published delivery contract forms a unit within one epic and its bases, while the dependency parser mechanically accepts qualified cross-epic Joins.

## Proposal

- **Enforce the supported join scope.**
  Use the existing within-epic delivery-unit contract before deriving whole-epic prerequisites.
- **Refuse unsupported input at its boundary.**
  Report each offending row and its qualified join, and return a nonzero result before priority recursion.
- **Exercise the command.**
  Keep the recorded two-epic case as a CLI regression fixture, with ordinary within-epic joins covered beside it.

## Acceptance Criteria

- [ ] **AC1.** Unsupported cross-epic joins produce a bounded row-specific diagnostic from the dependency command, as a CLI regression fixture over the recorded two-epic reproducer shows.
- [ ] **AC2.** The join shapes the dependency command admits match the published joined-unit scope, as an artifact inspection and accepted/refused CLI fixtures show.

## References

- **R1.** [Dependency check at the reproducing revision](https://github.com/m2ux/workflow-server/blob/74e19867e905523b85d2da84c7b1cb35b2b60b53/skills/work-planner/scripts/deps.py) — the parser and priority calculation that accept and recurse over this input.
- **R2.** [Pinned reproduction](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-04-1625-i17-e03-w04-joined-rows-share-one/priority-recursion.json) — both input bodies, the exact revision, source hash, command and result.
