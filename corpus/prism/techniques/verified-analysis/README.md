# Verified Analysis

> Part of the [prism techniques](../README.md)

The highest-accuracy mode: an initial reading, a deliberate search for what it missed, and a re-analysis that answers the gaps. The gap pass is separate from the analysis pass so it cannot be satisfied by the reasoning it is checking.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one operation of the chain.

---

| Pass | Runs |
|------|------|
| [`initial-analysis`](initial-analysis.md) | The first reading of the target |
| [`gap-detection`](gap-detection.md) | What the first reading did not reach — boundary and audit sweeps over its own output |
| [`gap-extraction`](gap-extraction.md) | The gaps stated as corrections the re-analysis can answer |
| [`corrected-analysis`](corrected-analysis.md) | The re-analysis, against those corrections |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
