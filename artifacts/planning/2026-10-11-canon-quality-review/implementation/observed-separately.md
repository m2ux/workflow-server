# Observed separately

Defects noticed while applying the reconciled recommendations, outside this work's finite inventory. They are recorded rather than fixed, so the change stays inside the approved set.

## `snake-case-symbols` carries another entry's Fix

`snake-case-symbols` detects an id in the wrong case convention, and its Fix reads:

> (a) Name the value at the producer as `` `{$name}` ``. (b) Make the consumer read `{name}`, or drop a vestigial bind.

That is the local-binding remedy, and it was `bind-protocol-locals`' Fix verbatim at the reviewed revision. It closes nothing a case defect opens: an id in kebab case is renamed, not rebound. The entry needs a Fix that renames the symbol and repoints its binders.

The review did not reach this, because its candidates key on the Detect and exception text that generated them. Observed at `e70b44778f71d9d699f746f78a16b892531c82d3`; `bind-protocol-locals` has since taken the replacement wording from the pinned implementation check, so the two Fix blocks no longer read alike and the duplication is no longer visible from the text alone.
