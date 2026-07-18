---
name: design-assumption-reconciliation
description: Resolvability vocabulary for design assumptions settleable by schema and convention checks versus open design judgements.
metadata:
  order: 8
---


# Design Assumption Reconciliation

Resolvability vocabulary for design assumptions (counterpart framing to work-package [assumption-reconciliation](../../work-package/resources/assumption-reconciliation.md)):

| Resolvability | Meaning |
|---------------|---------|
| **audit** | Settleable by schema, convention, or principle checks against the drafted definition |
| **open** | Genuine design judgement — remains in the assumptions log for Gate 2 (`approve-to-commit`) batch accept / correct / return-to-draft |

## Reconcile while-loop

`reconcile-design-assumptions` emits `has_resolvable_assumptions`. Requirements-refinement runs an initial reconcile, then a `while` loop that rebinds the same technique until audit-resolvable assumptions converge (no open audit-resolvable rows remain). Open judgements after convergence are not interviewed mid-flow; they batch into Gate 2.

Categories and log template: [design-assumptions](./design-assumptions.md). Bold-label trailing-two-spaces formatting: work-package [assumption-reconciliation](../../work-package/resources/assumption-reconciliation.md).
