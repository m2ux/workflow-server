# Portfolio Lens: Pedagogy — Token-Use Tracking

> Lens: pedagogy (06) · Target: [token-use-tracking.md](token-use-tracking.md) comprehension + #232 design shape · 2026-07-15

Applied to the design shape this comprehension implies (usage sourced on a tool call, written to `session.json` history + a rolled-up field, aggregated in `next_activity`). The pedagogy lens asks: which choices are being made, which alternatives they invisibly reject, and which transferred assumptions fail first.

## Explicit choices and the alternatives they reject

| Choice the comprehension frames | Invisibly rejected alternative |
|---|---|
| Usage arrives via a tool-call channel (declared param or request `_meta`) | Server-side measurement (rejected because no LLM/tokenizer on the request path) — but this is rejected as *impossible*, not weighed |
| Durable home is `session.json` history + rolled-up field | Durable home is the trace store (rejected as ephemeral) or a separate usage file (not considered) |
| Aggregation happens inside the `next_activity` mutator | A separate aggregation pass at read time over `history` (rejected implicitly by preferring an incrementally-updated field) |
| Attribution unit is the activity being *exited* on `next_activity` | Attribution to the activity that actually spent the tokens (the two diverge when checkpoints/dispatches spend between transitions) |

## The transferred-assumption trap

The comprehension leans hard on "mirror the existing patterns" (`deliveredContent` for per-agent maps, `variable_set`→`variables` for event-plus-rollup, bundling-budget config for pricing knobs). Each is a genuinely good fit — but each also transfers a constraint as an assumption:

- **`context_tokens` as precedent for "agent reports a token number."** The comprehension correctly flags that `context_tokens` is a *declared window*, not a measurement. The pedagogy risk: a future implementer internalizes "agents report token numbers on tool calls" and unconsciously trusts the reported *usage* figure with the same lack of validation `context_tokens` gets. `context_tokens` being wrong only mis-sizes a bundle (self-correcting, visible); usage being wrong silently corrupts the cost record (load-bearing, invisible). The transferred pattern (trust the agent's number) is safe in its origin and unsafe in its destination.

- **event + rolled-up field, from `variable_set`/`variables`.** Sound. But `variables` is authored by explicit checkpoint effects with declared types (warn-only validation exists). Usage has no declared-type gate; transferring the pattern without transferring the validation leaves the rollup unguarded.

## Pedagogy law

*A quantity the server merely relays inherits the trust level of the mechanism it was modeled on, not the trust level its own use demands.* `context_tokens` earned low-stakes trust because a wrong value self-corrects; usage modeled on it borrows that trust into a high-stakes, non-self-correcting setting.

## Prediction — which transferred decision fails first, and slowest to discover

The **attribution-to-exited-activity** decision fails first and is discovered slowest. It produces plausible, non-crashing numbers; the totals still sum correctly per workflow, so nothing looks broken. The error only surfaces when someone compares a checkpoint-heavy activity's recorded cost against expectation and finds tokens spent during the yield/dispatch window mis-filed onto the neighboring activity — a semantic error hidden behind arithmetically-valid output.
