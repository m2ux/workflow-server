# Smart Analysis

> Part of the [prism techniques](../README.md)

The chain is assembled from the target rather than stated by the caller: what the analysis needs to know first, what is missing, which mode to run, and whether the result survives its own dispute.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one operation of the chain.

---

| Pass | Runs |
|------|------|
| [`prereq-scan`](prereq-scan.md) | What the analysis has to know about the target before a lens is chosen |
| [`knowledge-fill`](knowledge-fill.md) | The gaps that scan found, answered before the pass runs |
| [`select-mode`](select-mode.md) | Which mode the target and goal call for |
| [`run-analysis`](run-analysis.md) | The selected mode, carried |
| [`dispute-correction`](dispute-correction.md) | The result held against its own disagreement, and corrected where it does not hold |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
