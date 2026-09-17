---
metadata:
  version: 1.0.0
---

## Capability

The four-step pass: a measurement taken, weighed, compared against the run's own earlier answer, and written up.

## Rules

### each-pass-step-reads-the-one-before

Each step of the pass reads the output the step before it landed, by that output's declared name. A step that re-derives what an earlier step already reported is measuring the tree twice and can disagree with itself.
