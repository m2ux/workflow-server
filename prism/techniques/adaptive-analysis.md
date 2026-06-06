---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 12
  legacy_id: 12
---

## Capability

Minimize cost by automatically escalating analysis depth from cheap/fast to deep/expensive based on signal quality assessment

## Protocol

### 1. Stage 1 Sdl

- Dispatch [deep-scan](../resources/deep-scan.md) to a fresh worker on Haiku, passing {target-content} and {target-type} so the scan adapts to whether the input is code or general text
- Worker writes to {output-path}/adaptive-stage1.md
- Assess signal quality: conservation law + word count > 300 + bug table

### 2. Assess Signal

- Check for conservation law: regex for 'conservation law' or '= constant'
- Check output length: > 300 words is adequate
- If conservation law, word count, and bug table are all present: set adaptive_signal_quality = adequate, stop escalation. Otherwise set insufficient and continue.
- Signal quality = conservation law presence (regex: 'conservation law' or '= constant') AND word count > 300 AND bug table presence. All three must be true for 'adequate'.

### 3. Stage 2 L12

- Dispatch [L12](../resources/l12.md) to a fresh worker on Sonnet
- Worker writes to {output-path}/adaptive-stage2.md
- Re-assess signal quality with same criteria

### 4. Stage 3 Full

- If still insufficient: run full-prism 3-pass pipeline
- Produces structural, adversarial ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), and synthesis ([l12-synthesis](../resources/l12-synthesis.md)) artifacts — paths recorded in {adaptive-result}.artifact_paths
- Return {adaptive-result} recording the deepest stage reached, the artifact paths produced, and the final signal assessment across all stages run

## Outputs

### adaptive-result

Paths and escalation trace for the adaptive run

#### stage_reached

One of: sdl | l12 | full — deepest stage that ran

#### artifact_paths

Array of filesystem paths to all produced artifacts

#### signal_assessment

Final value of adaptive_signal_quality (adequate | insufficient)

## Rules

### cheapest-first

Always start with SDL/Haiku. Never skip directly to full-prism.

### stop-early

Stop escalating as soon as signal quality is adequate. Do not run deeper stages for marginal improvement.

### model-escalation

Stage 1: Haiku. Stage 2: Sonnet. Stage 3: per-prism optimal models.

### tool-usage

use harness-compat spawn-agent — adaptive mode uses a new worker for each stage via spawn-agent and never skips stage ordering
