---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 9
  legacy_id: 9
---

## Capability

Run L12 analysis, detect knowledge gaps via boundary + audit prisms, then re-analyze with gap corrections for highest accuracy

## Protocol

### 1. Initial Analysis

- Dispatch [L12](../resources/l12.md) to a fresh worker, configured for the `{target_type}` of input ('code' or 'general')
- Worker writes `{verified_result.initial_path}` into `{output_path}`

### 2. Gap Detection

- Dispatch gap detection to a fresh worker
- Worker loads [knowledge-boundary](../resources/knowledge-boundary.md) (41) and [knowledge-audit](../resources/knowledge-audit.md) (40)
- Worker applies both to the L12 OUTPUT (not source code), writing `{verified_result.gaps_path}` into `{output_path}`

### 3. Gap Extraction

- Parse the structured claims `{$gap_data}` from the gap output
- Construct `verified_knowledge` context block with `{gap_data}`

### 4. Corrected Analysis

- Dispatch re-analysis to a fresh worker with [L12](../resources/l12.md)  
  > Corrected re-analysis worker does not see the initial L12 output — only the target content + gap context.
- Worker receives: `<verified_knowledge source='GAP-ANALYSIS'>`
`{gap_data}`
`</verified_knowledge>`

`{target_content}`
- Worker writes `{verified_result.corrected_path}` into `{output_path}`
- Return `{verified_result}` — its initial-path, gaps-path, and corrected-path sub-fields hold the three pipeline artifact paths.

## Outputs

### verified_result

Paths to the three verified pipeline artifacts

#### artifact

`verified-initial.md` (initial L12) / `verified-gaps.md` (gap detection) / `verified-corrected.md` (corrected re-analysis)

#### initial_path

Filesystem path to the initial L12 artifact

#### gaps_path

Filesystem path to the gap-detection artifact

#### corrected_path

Filesystem path to the corrected re-analysis artifact

## Rules

### gap-detection-on-output

Gap detection runs the boundary and audit prisms on the L12 OUTPUT, not on the source code — both prisms run in one worker context, detecting epistemic weaknesses in the analysis rather than structural properties of the code.
