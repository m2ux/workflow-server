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

## Inputs

### target-content

The code or text to analyze (file path or inline content)

### target-type

Whether the input is 'code' or 'general'

### output-path

Directory for adaptive-stage1.md, adaptive-stage2.md (conditional), and full-prism artifacts (conditional)

## Protocol

### 1. Stage 1 Sdl

- Dispatch deep_scan ([deep-scan](../resources/deep-scan.md)) to a fresh worker on Haiku
- Worker writes to {output-path}/adaptive-stage1.md
- Assess signal quality: conservation law + word count > 300 + bug table

### 2. Assess Signal

- Check for conservation law: regex for 'conservation law' or '= constant'
- Check output length: > 300 words is adequate
- If conservation law, word count, and bug table are all present: set adaptive_signal_quality = adequate, stop escalation. Otherwise set insufficient and continue.
- Signal quality = conservation law presence (regex: 'conservation law' or '= constant') AND word count > 300 AND bug table presence. All three must be true for 'adequate'.

### 3. Stage 2 L12

- Dispatch L12 ([l12](../resources/l12.md)) to a fresh worker on Sonnet
- Worker writes to {output-path}/adaptive-stage2.md
- Re-assess signal quality with same criteria

### 4. Stage 3 Full

- If still insufficient: run full-prism 3-pass pipeline
- Produces structural-analysis.md, adversarial-analysis.md ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), synthesis.md ([l12-synthesis](../resources/l12-synthesis.md))

## Outputs

### adaptive-result

Paths and escalation trace for the adaptive run

- **stage_reached**: One of: sdl | l12 | full — deepest stage that ran
- **artifact_paths**: Array of filesystem paths to all produced artifacts
- **signal_assessment**: Final value of adaptive_signal_quality (adequate | insufficient)

## Rules

### cheapest-first

Always start with SDL/Haiku. Never skip directly to full-prism.

### stop-early

Stop escalating as soon as signal quality is adequate. Do not run deeper stages for marginal improvement.

### model-escalation

Stage 1: Haiku. Stage 2: Sonnet. Stage 3: per-prism optimal models.

### tool-usage

use harness-compat spawn-agent — adaptive mode uses a new worker for each stage via spawn-agent and never skips stage ordering
