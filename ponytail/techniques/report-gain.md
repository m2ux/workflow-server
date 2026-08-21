---
metadata:
  version: 2.0.0
---

## Capability

Summarises what the pass can honestly claim, into the ledger's gain field.

## Inputs

### debt_ledger

The harvested debt ledger whose `gain` field this operation fills.

## Outputs

### gain_scoreboard

The gain summary the ledger's `gain` field carries: the ledger's own marker count, and the published benchmark medians for lines of code, cost and speed.

## Protocol

### 1. Count the real ledger

- Take the `markers` count of `{debt_ledger}`.

### 2. Take the benchmark medians

- Take the published [benchmark medians](../resources/honesty-boundary.md#medians) for lines of code, cost and speed.

### 3. Write the scoreboard

- Write `{gain_scoreboard}` into the ledger's `gain` field per [debt-ledger](../resources/debt-ledger.md#template).

## Rules

### honesty-boundary-on-reporting

Gain reporting stays within the [Honesty Boundary](../resources/honesty-boundary.md#rule).
