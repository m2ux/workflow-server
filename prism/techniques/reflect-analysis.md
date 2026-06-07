---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

Apply recursive meta-analysis to L12 output using the claim prism, then synthesize findings with constraint history

## Protocol

### 1. Structural Analysis

- Dispatch [L12](../resources/l12.md) to a fresh worker, passing `{target_content}` as the analysis target and `{target_type}` to frame the L12 pass
- Worker writes to `{output_path}`/reflect-l12.md

### 2. Meta Analysis

- Dispatch [claim](../resources/claim.md) to a fresh worker
- Worker receives the L12 OUTPUT as its analysis target (not source code)
- Worker writes to `{output_path}`/reflect-meta.md
- The claim prism runs on L12 OUTPUT, not on source code — this is recursive meta-analysis

### 3. Constraint Synthesis

- Dispatch synthesis to a fresh worker
- Worker receives: L12 output + meta output + constraint history (if available)
- Worker produces: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Worker writes to `{output_path}`/reflect-synthesis.md
- Synthesis must produce exactly 4 sections: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Return `{reflect_result}` — its `{l12_path}`, `{meta_path}`, and `{synthesis_path}` sub-fields hold the three pipeline artifact paths.

## Outputs

### reflect_result

Paths to the three reflect pipeline artifacts

#### l12_path

Filesystem path to reflect-l12.md

#### meta_path

Filesystem path to reflect-meta.md

#### synthesis_path

Filesystem path to reflect-synthesis.md

## Rules

### model-selection

L12 uses its optimal model. Claim uses its optimal model. Synthesis uses sonnet.
