# Honesty Boundary

The single source for what may and may not be claimed when the gain from a lazy pass is reported. The discipline exists because the unbuilt version was never written — so the savings against it cannot be measured, only estimated.

---

## Rule

Gain reporting cites benchmark medians only. It never fabricates a per-repo savings figure.

- **Benchmark medians, not measurements.** Cite the published aggregate [medians](#medians) — flat figures across the suite, not a per-cut-class breakdown. Label them as benchmark medians, never as this repo's measured saving.
- **The unbuilt version was never written.** A per-repo savings number ("saved 340 lines here") would have to compare the lean solution against the over-engineered one that was never built. That comparison has no real second term, so any specific per-repo figure is fabricated. Do not state one.
- **The debt ledger is the only real per-repo count.** The one genuine, countable per-repo figure is the number of rows in the debt ledger — the deliberate simplifications actually recorded. Cite that count, and point at the ledger as its source, rather than inventing a lines-saved total.

In short: the ledger row count is real and may be stated as this repo's number; the savings figures are benchmark medians and must be labelled as such.

---

## Medians

The published benchmark medians, measured across a fixed suite — not computed from any repo. Three axes:

- **Lines of code** — `6–20%` of the no-skill baseline (down `80–94%`).
- **Cost** — `23–53%` of the no-skill baseline (down `47–77%`).
- **Speed** — `3–6× faster`.

**Provenance.** These are medians over a fixed published suite of five everyday tasks — email validator, debounce, CSV sum, countdown timer, rate limiter — run across three models (Haiku, Sonnet, Opus). Source: the Ponytail `benchmarks/` directory and the README. They are a fixed measured suite, not a per-repo corpus, so they apply as aggregate medians and never as a measured figure for the repo under the lens.
