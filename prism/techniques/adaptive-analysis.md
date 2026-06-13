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

- Dispatch [deep-scan](../resources/deep-scan.md) to a fresh worker on Haiku, passing `{target_content}` and `{target_type}` so the scan adapts to whether the input is code or general text
- Worker writes `{adaptive_result.artifact_paths}` stage-1 entry into `{output_path}`
- Assess signal quality: conservation law + word count > 300 + bug table

### 2. Assess Signal

- If all three signals are present — conservation law (regex: 'conservation law' or '= constant'), word count > 300, and a bug table — set `{adaptive_signal_quality}` to `adequate` and stop escalation. Otherwise set it to `insufficient` and continue.

### 3. Stage 2 L12

- Dispatch [L12](../resources/l12.md) to a fresh worker on Sonnet
- Worker writes `{adaptive_result.artifact_paths}` stage-2 entry into `{output_path}`
- Re-assess signal quality with same criteria

### 4. Stage 3 Full

- If still insufficient: run full-prism 3-pass pipeline
- Produces structural, adversarial ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), and synthesis ([l12-synthesis](../resources/l12-synthesis.md)) artifacts — paths recorded in `{adaptive_result}.artifact_paths`
- Return `{adaptive_result}` recording the deepest stage reached, the artifact paths produced, and the final signal assessment across all stages run

## Outputs

### adaptive_result

Paths and escalation trace for the adaptive run

#### artifact

`adaptive-stage1.md` (sdl stage) / `adaptive-stage2.md` (l12 stage); the full stage produces the full-prism `structural-analysis.md`, `adversarial-analysis.md`, and `synthesis.md`

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

Stage 1 runs on Haiku, stage 2 on Sonnet, stage 3 on per-prism optimal models.
