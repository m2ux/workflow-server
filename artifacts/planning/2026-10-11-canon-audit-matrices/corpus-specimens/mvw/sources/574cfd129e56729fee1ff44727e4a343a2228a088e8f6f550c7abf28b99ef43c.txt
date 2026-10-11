# Prism Activities

> Part of the [prism workflow](../README.md)

One activity per analysis mode, plus the two that bracket them. Mode selection resolves which pass runs; each pass activity then carries that mode's chain end to end, and report generation and delivery close every route.

---

## Entry and exit

| Activity | Carries |
|----------|---------|
| [`00-select-mode`](00-select-mode.yaml) | The graph covering the target, the plan, and the mode every later activity is chosen by |
| [`06-generate-report`](06-generate-report.yaml) | The reader-facing report and the definitive findings other workflows build on |
| [`04-deliver-result`](04-deliver-result.yaml) | What the caller receives once the artifacts are written |

## The passes

Each is reached from mode selection and returns to report generation. The mode's own chain — how many passes, what each reads, whether they converge — lives in the technique the activity binds.

| Activity | Mode |
|----------|------|
| [`01-structural-pass`](01-structural-pass.yaml) | The L12 structural lens, and the entry every multi-pass mode starts from |
| [`02-adversarial-pass`](02-adversarial-pass.yaml) | The challenge to a structural pass, verified against the graph |
| [`03-synthesis-pass`](03-synthesis-pass.yaml) | The reconciliation of a structural pass with its challenge |
| [`05-behavioral-synthesis-pass`](05-behavioral-synthesis-pass.yaml) | The four behavioural lenses and their convergence |
| [`07-dispute-pass`](07-dispute-pass.yaml) | Two orthogonal lenses and the disagreement between them |
| [`08-subsystem-pass`](08-subsystem-pass.yaml) | A per-region lens assignment over a decomposed target |
| [`09-verified-pass`](09-verified-pass.yaml) | An analysis, its gaps, and the re-analysis those gaps drive |
| [`10-reflect-pass`](10-reflect-pass.yaml) | A meta-analysis over a prior pass's own output |
| [`11-smart-pass`](11-smart-pass.yaml) | A chain the system assembles from the target rather than from the caller |
| [`12-adaptive-pass`](12-adaptive-pass.yaml) | Depth escalation, stopping at the first adequate signal |

---

## Reading one

An activity file is the binding and the routing: which techniques run, in what order, what each reads and writes, and which exit the graph takes next. What a pass actually does with the target is the bound technique's, and the lens it applies is a [resource](../resources/README.md).
