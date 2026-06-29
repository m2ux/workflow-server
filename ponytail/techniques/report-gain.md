---
metadata:
  version: 1.0.0
---

## Capability

Summarize the honest gain from the lazy pass, appended to the foot of the debt ledger. Cite the aggregate [benchmark medians](../resources/honesty-boundary.md#medians) — lines of code, cost, and speed — point at the ledger for the only real per-repo count, and never fabricate a per-repo savings number. This is the workflow's adaptation of the source's read-only display: it appends a summary to the ledger and mutates no source code.

## Inputs

### debt_ledger

The harvested debt [ledger](../resources/ponytail-marker-convention.md#convention) whose foot the gain scoreboard is appended to — its row count is the only genuine per-repo figure cited.

## Outputs

### gain_scoreboard

The honesty-bounded gain summary appended to the foot of the debt ledger — the aggregate benchmark medians (lines of code, cost, speed), the real ledger row count as the only per-repo number, and no fabricated savings.

## Protocol

### 1. Count the real ledger

- Take the row count of the `{debt_ledger}` as the one genuine per-repo figure — the number of deliberate simplifications actually recorded.

### 2. Cite benchmark medians

- Cite the published aggregate [benchmark medians](../resources/honesty-boundary.md#medians) — lines of code, cost, and speed. Frame them as medians measured over the fixed benchmark suite, never as this repo's measured savings.

### 3. Append the scoreboard

- Append the `{gain_scoreboard}` to the foot of the debt ledger: the ledger row count, the aggregate benchmark medians, and a pointer to the ledger as the source of the real per-repo count. This append is the workflow's only mutation — it adds a summary to the ledger artifact and changes no source code.

## Rules

### honesty-boundary-on-reporting

Never fabricate a per-repo savings number. The only genuine per-repo figure is the [debt-ledger](../resources/ponytail-marker-convention.md#convention) row count; everything else is a published aggregate [benchmark median](../resources/honesty-boundary.md#medians) and must be labelled as such.
