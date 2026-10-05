# Work Package Routines

> Part of [work package](../README.md)

What this folder holds, and what each member contributes. The order work runs in belongs to whatever binds them, not to this index.

| Routine | Reached for |
|---|---|
| [`challenge-concerns`](challenge-concerns.yaml) | Challenge a concern set from the given perspectives, then merge the resolutions back into it |
| [`converge-assumptions`](converge-assumptions.yaml) | Reconcile assumptions and challenge the result until no agent-resolvable item remains |
| [`ensure-graph-index`](ensure-graph-index.yaml) | Bring the component tree's graph current, and record that a usable index now covers it so the techniques gated on that flag take the graph rather than the grep fallback |
| [`publish-planning-artifacts`](publish-planning-artifacts.yaml) | Resolve the engineering checkout's publish branch and the changed planning-folder files, then commit and push them on that branch |
| [`residual-assumption-interview`](residual-assumption-interview.yaml) | Gate the residual open assumptions as a batch, record the batch answer, then interview them one at a time where the batch answer asks for it |
| [`settle-assumptions`](settle-assumptions.yaml) | Converge the collected assumptions, assemble what stays open, and put that residual set to the user |
