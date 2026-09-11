---
metadata:
  version: 1.0.0
---

## Capability

Minimize cost by automatically escalating analysis depth from cheap/fast to deep/expensive based on signal quality assessment

## Outputs

### adaptive_result

Escalation trace for the adaptive run

#### stage_reached

One of: sdl | l12 | full — deepest stage that ran

#### signal_assessment

Final value of adaptive_signal_quality (adequate | insufficient)

## Rules

### cheapest-first

Always start with SDL/Haiku. Never skip directly to full-prism.

### stop-early

Stop escalating as soon as signal quality is adequate. Do not run deeper stages for marginal improvement.

### model-escalation

Stage 1 runs on Haiku, stage 2 on Sonnet, stage 3 on per-prism optimal models.
