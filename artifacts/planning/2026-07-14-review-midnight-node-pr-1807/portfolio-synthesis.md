# Portfolio Synthesis — Pedagogy × Rejected-Paths

> Review midnight-node PR #1807 · codebase-comprehension · 2026-07-15

Cross-lens reading of [portfolio-pedagogy.md](portfolio-pedagogy.md) and [portfolio-rejected-paths.md](portfolio-rejected-paths.md), applied to PR #1807's from-genesis design.

## Convergence

Both lenses land on the same structural property from different operations: **the from-genesis mode validates the producer side of the seed contract (a var is referenced/set) but never the consumer side (the node's expected `*_SEED_FILE`), so a set-but-inert `SEED_PHRASE` passes every guard and the chain silently never finalizes.** Pedagogy frames it as a mis-taught constraint ("set ⇒ working"); rejected-paths frames it as a conserved trust-boundary problem whose cost was deferred by keeping provisioning out of the tool. High confidence: this is the seed-wiring blocker, now independently reached by a third route beyond triage rows #5b/#6.

## Divergence (unique per lens)

- **Pedagogy (unique):** the gap will *propagate* — a future bring-up mode built on the same "presence-not-effect" pattern replays the defect (e.g. a `--from-checkpoint` mode). The healthcheck probing RPC liveness, not block height, is why discovery is slow.
- **Rejected-paths (unique):** the alternative (provision seeds inside the tool) is not free — it introduces secret-on-disk exposure and tight coupling to the node's seed-intake contract. This reframes the blocker's *fix* as a trade-off, not a pure win, and explains why the minimal design shipped.

## Summary table

| Finding | Lens(es) | Convergent / Unique |
|---------|----------|---------------------|
| Seed contract validated on producer side only; set-but-inert `SEED_PHRASE` → silent no-finalization | pedagogy + rejected-paths | Convergent (high confidence) |
| Pattern is reusable and will replay in future bring-up modes | pedagogy | Unique |
| Slow discovery: healthcheck tests RPC liveness, not block production | pedagogy | Unique |
| Fixing in-tool trades correctness gap for secret-handling + node-coupling cost | rejected-paths | Unique |
| Warn-don't-fail degrades to silent exactly when a var is set-but-inert | pedagogy + rejected-paths | Convergent |

## Bearing on the review

The convergent finding reinforces the seed-wiring blocker at head `98dd8e11` (see [15-local-environment-tooling.md](15-local-environment-tooling.md) Blocker 1). The rejected-paths unique finding is material for the eventual recommendation: the fix is not a one-line wiring change but a design choice about where seed provisioning lives (compose author, a tool provisioning step, or documented developer responsibility) — downstream code review should frame the finding with that trade-off, not merely "wire the seed."
