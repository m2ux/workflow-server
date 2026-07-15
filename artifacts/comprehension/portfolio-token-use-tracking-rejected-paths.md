# Portfolio Lens: Rejected-Paths — Token-Use Tracking

> Lens: rejected-paths (09) · Target: [token-use-tracking.md](token-use-tracking.md) comprehension + #232 design shape · 2026-07-15

The rejected-paths lens traces each concrete problem to the decision that enabled it, imagines the artifact that took every rejected path, and names which dangers migrate between visible and hidden.

## Concrete problems and the enabling decision

| Concrete problem | Enabling decision | Rejected path that would prevent it (and its new cost) |
|---|---|---|
| Server cannot self-measure usage | Server is agent-opaque, runs no LLM/tokenizer | Rejected: wire a tokenizer into the request path. Would make the server self-sufficient — but re-tokenizing agent-side content approximates, not measures, native usage, and couples the server to a model's tokenizer. |
| Usage between transitions (checkpoint/dispatch) may be mis-attributed or dropped | Attribution keyed to `next_activity`'s exit block only | Rejected: capture usage on *every* mutating tool (`respond_checkpoint`, `dispatch_child`, `get_activity`). Closes the gap — but spreads the receiving channel across many handlers and multiplies the agent-cooperation surface. |
| Reported usage is unvalidated | Modeled on `context_tokens`, which is unvalidated | Rejected: validate/bound usage against declared types or sanity limits. Catches garbage — but adds a validation surface and warn-only noise, and there is no ground truth to validate against. |
| Cost depends on a pricing table that ages | Cost = tokens × config-driven per-model price | Rejected: store only raw tokens, compute cost at read time from a live source. Keeps the record fresh — but the "durable cost record with a completed work package" requirement wants a *frozen* cost, not one that drifts as prices change. |

## The artifact that took every rejected path

A server that re-tokenizes agent content itself, captures usage on every mutating tool with bounds-validation, and stores only raw tokens (deferring cost to read time). Visible problems that vanish: no agent-cooperation dependency, no attribution gaps, no stale frozen cost. Invisible dangers that emerge:

- **Approximation masquerading as measurement.** Server-side re-tokenization violates the explicit "use native usage capabilities" constraint while *looking* authoritative — the worst kind of wrong, because it reads as ground truth.
- **Tokenizer/version coupling.** The server now tracks each model's tokenizer, a maintenance burden invisible until a model updates its tokenizer.
- **Cost non-reproducibility.** Deferring cost to read time means the same completed work package reports different costs on different days — the durable-record requirement quietly broken.

## Rejected-paths law

*The danger migrates between "the number is missing" (visible) and "the number is wrong but looks right" (hidden).* Every path that removes a visible gap (missing usage, attribution holes, stale cost) does so by introducing a computation the server presents with unearned authority. The agent-reported path keeps the danger *visible* — a missing or absent usage figure is obviously absent — at the cost of depending on the agent to supply it.

## Prediction — which migration a practitioner discovers first under pressure

Under pressure to "just get numbers logged," a practitioner reaches for server-side re-tokenization (it removes the agent-cooperation dependency and produces numbers immediately). They discover the migration when the logged cost is challenged against a harness's own usage report and diverges — at which point the "authoritative" server number is revealed as an approximation, and the constraint that native usage should have been used is re-learned the expensive way. The agent-reported path defers gratification (numbers only appear once the agent is wired to report) but keeps the failure mode honest.
