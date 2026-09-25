# Behavioral Pipeline

> Part of the [prism techniques](../README.md)

Four behavioural lenses run independently over one target — error resilience, optimization, evolution and API surface — and a synthesis pass reads where they converge. Code-only: the lenses have no domain-neutral variants.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one technique of the chain.

---

| Pass | Runs |
|------|------|
| [`independent-lenses`](independent-lenses.md) | The four lenses, each applied without sight of the others, each augmented with graph evidence where the target is indexed |
| [`synthesis`](synthesis.md) | Where the four agree and where they do not, which is what the convergence is read from |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
