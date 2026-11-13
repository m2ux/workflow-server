---
metadata:
  version: 1.0.0
---

## Capability

Assumption outcomes recorded in the assumptions log.

## Inputs

### assumption_outcome

The decision recorded against an assumption. Empty where no decision has been asked for.

## Outputs

### assumptions_log

The assumptions log, updated with the outcome the deciding gate gave.

## Protocol

### 1. Record The Outcome

- Write `{assumption_outcome}` into `{assumptions_log}`.
