# Subsystem Analysis

> Part of the [prism techniques](../README.md)

A target too large for one reading is split into regions, each region given the lens its shape calls for, and the per-region findings reconciled across the boundaries between them. Code-only, since the decomposition is structural.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one technique of the chain.

---

| Pass | Runs |
|------|------|
| [`decompose`](decompose.md) | The regions the target splits into, and the boundary between each pair |
| [`calibrate`](calibrate.md) | Which lens each region is given, from what the decomposition found |
| [`execute`](execute.md) | The per-region analysis, one pass per region |
| [`synthesize`](synthesize.md) | The cross-region reading — what the boundaries hide that no single region shows |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
