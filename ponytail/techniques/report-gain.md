---
metadata:
  version: 1.0.0
---

## Capability

Summarize the honest gain from the lazy pass into the debt ledger's gain field. Cite the aggregate [benchmark medians](../../ponytail/resources/honesty-boundary.md#medians) — lines of code, cost, and speed — point at the ledger for the only real per-repo count, and never fabricate a per-repo savings number. This is the workflow's adaptation of the source's read-only display: it appends a summary to the ledger and mutates no source code.

## Inputs

### debt_ledger

The harvested debt [ledger](../../ponytail/resources/ponytail-marker-convention.md#convention) whose gain field the scoreboard fills — its marker count is the only genuine per-repo figure cited.

## Outputs

### gain_scoreboard

The honesty-bounded gain summary written to the debt ledger's `gain` field — the aggregate benchmark medians (lines of code, cost, speed), the real marker count as the only per-repo number, and no fabricated savings.

## Protocol

### 1. Count the real ledger

- Take the `markers` count of the `{debt_ledger}` as the one genuine per-repo figure — the number of deliberate simplifications actually recorded.

### 2. Cite benchmark medians

- Cite the published aggregate [benchmark medians](../../ponytail/resources/honesty-boundary.md#medians) — lines of code, cost, and speed. Frame them as medians measured over the fixed benchmark suite, never as this repo's measured savings.

### 3. Write the scoreboard

- Write the `{gain_scoreboard}` into the debt ledger's `gain` field per [debt-ledger](../resources/debt-ledger.md#template): the marker count, and the aggregate benchmark medians. This write is the workflow's only mutation — it fills one field of the ledger artifact and changes no source code.

## Rules

### honesty-boundary-on-reporting

Never fabricate a per-repo savings number. The only genuine per-repo figure is the [debt-ledger](../../ponytail/resources/ponytail-marker-convention.md#convention) marker count; everything else is a published aggregate [benchmark median](../../ponytail/resources/honesty-boundary.md#medians) and must be labelled as such.
