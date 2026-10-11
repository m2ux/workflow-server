# Full Prism

> Part of the [prism techniques](../README.md)

Three isolated passes over one target: a structural reading, an adversarial challenge to it, and the reconciliation that survives both. The challenge is what makes the mode self-correcting — it is given the prior artifacts and nothing else, so it cannot inherit the first pass's reasoning.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one technique of the chain.

---

| Pass | Runs |
|------|------|
| [`adversarial`](adversarial.md) | The challenge to the structural pass: wrong predictions, overclaims, underclaims, and a revised findings table verified against the graph |
| [`synthesis`](synthesis.md) | The reconciliation — which findings survive the challenge, at what severity, with the conservation laws that held |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
