# Honesty Boundary

The single source for what may and may not be claimed when the gain from a lazy pass is reported. The discipline exists because the unbuilt version was never written — so the savings against it cannot be measured, only estimated.

---

## Rule

Gain reporting cites benchmark medians only. It never fabricates a per-repo savings figure.

- **Benchmark medians, not measurements.** For each kind of cut made — a deleted abstraction, a stdlib replacement, a dropped dependency — cite the typical saving for that *class* of cut, drawn from benchmarks across many repos. Label it as a median for the class, never as this repo's measured saving.
- **The unbuilt version was never written.** A per-repo savings number ("saved 340 lines here") would have to compare the lean solution against the over-engineered one that was never built. That comparison has no real second term, so any specific per-repo figure is fabricated. Do not state one.
- **The debt ledger is the only real per-repo count.** The one genuine, countable per-repo figure is the number of rows in the debt ledger — the deliberate simplifications actually recorded. Cite that count, and point at the ledger as its source, rather than inventing a lines-saved total.

In short: the ledger row count is real and may be stated as this repo's number; everything else is a median for a class of cut and must be labelled as such.
