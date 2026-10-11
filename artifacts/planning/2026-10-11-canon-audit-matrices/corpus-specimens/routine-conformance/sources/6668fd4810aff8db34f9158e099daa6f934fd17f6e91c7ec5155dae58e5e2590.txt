# Adaptive Analysis

> Part of the [prism techniques](../README.md)

Depth escalation. Each stage is a deeper and more expensive reading, and the chain stops at the first stage whose signal is adequate — so a target that yields to a cheap pass never pays for a full one.

[`TECHNIQUE.md`](TECHNIQUE.md) holds what the passes share; each pass below is one technique of the chain.

---

| Pass | Runs |
|------|------|
| [`stage-1-sdl`](stage-1-sdl.md) | The cheapest reading, and the verdict on whether it is enough |
| [`stage-2-l12`](stage-2-l12.md) | The structural reading, where stage one was not |
| [`stage-3-full`](stage-3-full.md) | The full three-pass chain, where stage two was not |
---

The chain is bound by the [activity](../../activities/README.md) for this mode, which decides the order and what each pass receives. A pass reads its prior passes as artifacts addressed by path, never as inline text.
