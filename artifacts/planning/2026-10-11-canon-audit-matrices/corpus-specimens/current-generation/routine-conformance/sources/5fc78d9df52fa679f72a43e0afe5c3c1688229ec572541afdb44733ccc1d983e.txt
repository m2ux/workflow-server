---
metadata:
  version: 1.1.0
---

## Capability

Settle one risk verdict for a change from what the graph measured about the symbol, the diff and the flows around both.

## Inputs

### impact_report

What depends on the symbol under change, at depth 1/2/3, with the execution flows reached and a risk level.

### change_report

changed symbols, changed files, affected execution flows, risk level

### process_inventory

The twenty longest execution flows the graph traced, ranked by step count, each with its name, its type and how many steps it runs — a sample of the graph's flows rather than their total.

## Outputs

### change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer is asked to exercise.

## Protocol

### 1. Reconcile The Two Ratings

- Hold the rating `{impact_report}` gives the symbol against the one `{change_report}` gives the diff. The first measures what reaches one symbol; the second measures what the whole change touched, so the higher of the two is the change's rating and the gap between them is worth stating.

### 2. Bound Against The Whole

- Read the flows both reports name as a share of the graph's flow total, which `stats.processes` in `gitnexus://repo/{repo_name}/context` carries: a change touching most of what the graph traced is a different fact from one touching five flows of three hundred, and the share is what distinguishes them.
  > `{process_inventory}` is the twenty longest flows and not the population, so a share taken against its length divides by the sample and overstates every reading. What the inventory is for is which of the flows reached are the long ones — a change landing in those is a different fact again from one landing in twenty short ones.

### 3. State The Verdict

- Record `{change_risk_verdict}` with the rating, the counts behind it, and the flows a reviewer exercises to cover it.
  > Where either report rests on a hand-derived caller set rather than on graph edges, say so in the verdict: the rating then carries the reach of the grep that produced it, and not the graph's.
