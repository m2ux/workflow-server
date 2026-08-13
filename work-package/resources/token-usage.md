---
name: token-usage
description: Creation guide for bare filename `token-usage.md` — the run's sole cost home, carrying the per-activity ledger, the workflow totals, the coverage reconciliation, and the estimate caveat.
metadata:
  order: 30
---

# Token Usage Guide

Creation guide for bare filename `token-usage.md`. The one place a run's token counts and cost estimate live, so every other artifact links here rather than repeating a figure.

## Template

```markdown
# Token Use and Cost Estimate — {work package}

| Activity | Input | Output | Total | Cache read | Cache write | Duration (min) | Model | Price table | Cost |
|----------|------:|-------:|------:|-----------:|------------:|---------------:|-------|-------------|-----:|
| activity-id | 1,000 | 2,000 | 3,000 | 500 | 100 | 4.2 | model id | version | $0.00 \| unknown |

## Totals

**Tokens:** {input} in, {output} out, {total} total
**Duration:** {total wall minutes}
**Cost:** {total, or unknown when unpriced activities contributed}

## Coverage

{Ledger entries} recorded against {actual dispatches} dispatches, {n} unaccounted.

{When any dispatch is unaccounted, state the totals as a floor rather than a total.}

## Caveat

Cost is an estimate, meaningful for API-key per-token billing. On a subscription plan the figure is not a bill.
```

## Rules

- **A number is reconciled or labelled a floor.** An unlabelled understatement reads as a measurement, so a figure that could not be reconciled says so.
- **One row per activity.** Cache columns appear when the harness surfaced them; a null cost is `unknown` rather than zero, because zero is a measurement and unknown is not.
- **Duration converts from the harness figure.** Milliseconds to minutes, one decimal.
- **A total is a total only when coverage is complete.** With any dispatch unaccounted, the figure is labelled a floor and the unaccounted count sits beside it.
- **Cost is always an estimate.** The label and the API-key-versus-subscription caveat both stay in the body.
- **No usage, no artifact.** When session state carries no usage field, this file is not written and no README line is added — a fabricated figure is worse than a missing one.
- **A mid-run write is a draft.** It cannot include the terminal activity's own dispatch, and the same artifact is rewritten after the client exits.
- **Line budget:** one row per activity, with the four sections above and no additional prose.
