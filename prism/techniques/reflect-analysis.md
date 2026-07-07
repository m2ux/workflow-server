---
metadata:
  version: 1.0.0
---

## Capability

Apply recursive meta-analysis to L12 output using the claim prism, then synthesize findings with constraint history

## Outputs

### reflect_result

Paths to the three reflect pipeline artifacts

#### artifact

`reflect-l12.md` (L12 structural) / `reflect-meta.md` (claim meta-analysis) / `reflect-synthesis.md` (constraint synthesis)

#### l12_path

Filesystem path to the L12 structural artifact

#### meta_path

Filesystem path to the claim meta-analysis artifact

#### synthesis_path

Filesystem path to the constraint-synthesis artifact

## Protocol

### 1. Structural Analysis

- Dispatch [L12](../resources/l12.md) to a fresh worker, passing `{target_content}` as the analysis target and `{target_type}` to frame the L12 pass
- Worker writes `{reflect_result.l12_path}` into `{output_path}`

### 2. Meta Analysis

- Dispatch [claim](../resources/claim.md) to a fresh worker
- Worker receives the L12 OUTPUT as its analysis target (not source code)
- Worker writes `{reflect_result.meta_path}` into `{output_path}`

### 3. Constraint Synthesis

- Dispatch synthesis to a fresh worker
- Worker receives: L12 output + meta output + constraint history (if available)
- Worker produces: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Worker writes `{reflect_result.synthesis_path}` into `{output_path}`
- Synthesis must produce exactly 4 sections: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Return `{reflect_result}` — its `{reflect_result.l12_path}`, `{reflect_result.meta_path}`, and `{reflect_result.synthesis_path}` sub-fields hold the three pipeline artifact paths.

## Rules

### meta-analysis-on-output

The meta-analysis worker receives the L12 OUTPUT as its target, not the original code — the claim prism treats the analysis text as an artifact to interrogate for hidden assumptions, making this recursive meta-analysis.
