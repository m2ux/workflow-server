# Portfolio Synthesis — Token-Use Tracking

> Lenses: pedagogy (06) + rejected-paths (09) · Target: [token-use-tracking.md](token-use-tracking.md) · 2026-07-15

Cross-lens read of the #232 design shape. Per-lens detail: [pedagogy](portfolio-token-use-tracking-pedagogy.md), [rejected-paths](portfolio-token-use-tracking-rejected-paths.md).

## Convergence

Both lenses land independently on the same structural fault: **a relayed number presented with authority it has not earned.**

- Pedagogy reaches it via *transferred trust* — usage is modeled on `context_tokens`, borrowing that field's it-doesn't-matter-if-wrong trust into a setting where wrong is load-bearing and invisible.
- Rejected-paths reaches it via *danger migration* — every path that fills a visible gap (missing usage, attribution holes) does so by adding a server computation that looks like ground truth but is not.

Same property, two operations: the trustworthiness of the usage figure is the design's real risk, not the plumbing of getting it there.

## Divergence (the value-add)

- **Pedagogy — unique:** the *attribution-to-exited-activity* choice is the first-failing, slowest-discovered decision, because it yields arithmetically-valid but semantically-misfiled numbers. This is invisible to the rejected-paths framing (it isn't a "problem enabled by a decision," it's a silently-correct-looking output).
- **Rejected-paths — unique:** the *cost-freshness vs. reproducibility* tension (frozen config-priced cost vs. live-computed cost) and the *server-side re-tokenization* temptation. Pedagogy doesn't surface these because they are alternative *paths*, not transferred *patterns*.

## Summary table

| Finding | Lens(es) | Convergent / Unique |
|---|---|---|
| Relayed usage figure carries unearned authority / unvalidated trust | pedagogy + rejected-paths | Convergent |
| Attribution keyed to exited activity mis-files checkpoint/dispatch-window usage; arithmetic still valid | pedagogy | Unique |
| `context_tokens` precedent transfers low-stakes trust into a high-stakes use | pedagogy | Unique |
| Server-side re-tokenization is the pressure-induced trap (violates "native usage", looks authoritative) | rejected-paths | Unique |
| Frozen config-priced cost vs. live-computed cost breaks either freshness or reproducibility | rejected-paths | Unique |
| Usage-capture gap between activity transitions (checkpoint/dispatch spend) | pedagogy (mis-attribution) + rejected-paths (drop/hole) | Convergent |

## Design implications for downstream research/planning

1. Treat the usage figure's *provenance and validation* as a first-class design question, not plumbing — the convergent finding. Prefer the agent-reported channel that keeps a missing figure visibly missing over a server-computed figure that looks authoritative.
2. Decide attribution semantics explicitly: usage-to-exited-activity is only correct if no significant spend happens between transitions. If checkpoints/dispatches spend materially, capture on those tools too.
3. Fix cost as frozen-at-completion (config price × tokens, recorded), matching the durable-record requirement — and record the pricing-table version so a stale price is auditable rather than silent.
