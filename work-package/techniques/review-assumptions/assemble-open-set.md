---
metadata:
  version: 1.0.0
---

## Capability

Judgement-augmentation context over the whole residual open-assumption set, ordered so a stakeholder settles the highest-impact decision first.

## Inputs

### open_assumptions

The residual open assumptions to assemble, each carrying its statement, category and the agent's position. Empty where analyse-challenge resolved every assumption.

## Outputs

### assumption_review_presentation

Judgement-augmentation context for every open assumption, each entry on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape, closing with a link to the assumptions log.

## Protocol

### 1. Build Each Entry

- Build one entry per member of `{open_assumptions}` on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape, differentiating its decision space on the [Trade-off Dimensions](../../resources/assumptions-review.md#trade-off-dimensions) that meaningfully separate its alternatives
- Carry the partial evidence reconcile and challenge produced into the entry's technical context, so what is already known is on the page
- Resolve reversibility through [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[reversibility-signal](../../../meta/techniques/gitnexus-operations/reversibility-signal.md) where the assumption names a known symbol

### 2. Order the Set

- Order the entries by decision impact
  > At five or more entries, group them by theme and order the themes by impact.

### 3. Emit the Presentation

- Close with a markdown link to the assumptions log and emit `{assumption_review_presentation}`
