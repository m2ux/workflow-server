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

- Dispatch [L12](../resources/l12.md) to a fresh worker, configured for the {target-type} of input ('code' or 'general')
- Worker writes to {output-path}/verified-initial.md

### 2. Gap Detection

- Dispatch gap detection to a fresh worker
- Worker loads [knowledge-boundary](../resources/knowledge-boundary.md) (41) and [knowledge-audit](../resources/knowledge-audit.md) (40)
- Worker applies both to the L12 OUTPUT (not source code), writes to {output-path}/verified-gaps.md
- Gap detection prisms run on the L12 OUTPUT, not on source code

### 3. Gap Extraction

- Parse gap output for structured claims
- Construct verified_knowledge context block with gap data

### 4. Corrected Analysis

- Dispatch re-analysis to a fresh worker with [L12](../resources/l12.md)
- Worker receives: <verified_knowledge source='GAP-ANALYSIS'>
{gap_data}
</verified_knowledge>

{target-content}
- Worker writes to {output-path}/verified-corrected.md
- Return {verified-result} — its initial_path, gaps_path, and corrected_path sub-fields hold the three pipeline artifact paths.

## Outputs

### verified-result

Paths to the three verified pipeline artifacts

#### initial_path

Filesystem path to verified-initial.md

#### gaps_path

Filesystem path to verified-gaps.md

#### corrected_path

Filesystem path to verified-corrected.md

## Rules

### isolation

Corrected re-analysis worker does not see the initial L12 output — only the target content + gap context

### model-selection

L12 passes use optimal model from YAML frontmatter. Gap detection uses sonnet.

### tool-usage

use harness-compat spawn-agent for three worker dispatches in verified mode; gap-detection worker runs both boundary and audit prisms in one context; orchestrator never uses continue-agent on prior workers; spawn-agent via harness-compat for description and prompt — do NOT use continue-agent
