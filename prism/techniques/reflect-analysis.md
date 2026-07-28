---
metadata:
  version: 1.0.0
---

## Capability

Apply recursive meta-analysis to L12 output using the claim prism, then synthesize findings with constraint history

## Outputs

### structural_analysis

L12 structural analysis of the target.

#### artifact

`reflect-l12.md`

### meta_analysis

Claim meta-analysis of the structural analysis text: the hidden assumptions it carries.

#### artifact

`reflect-meta.md`

### constraint_synthesis

Synthesis over the structural and meta analyses against constraint history, in four sections: recurring patterns, unexplored dimensions, known false positives, next best scan.

#### artifact

`reflect-synthesis.md`

## Protocol

### 1. Structural Analysis

- Dispatch [L12](../resources/l12.md) to a fresh worker, passing `{target_content}` as the analysis target and `{target_type}` to frame the L12 pass
- Worker writes `{structural_analysis}` into `{output_path}`

### 2. Meta Analysis

- Dispatch [claim](../resources/claim.md) to a fresh worker
- Worker receives the L12 OUTPUT as its analysis target (not source code)
- Worker writes `{meta_analysis}` into `{output_path}`

### 3. Constraint Synthesis

- Dispatch synthesis to a fresh worker
- Worker receives: L12 output + meta output + constraint history (if available)
- Worker produces: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Worker writes `{constraint_synthesis}` into `{output_path}`
- Synthesis must produce exactly 4 sections: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Return `{structural_analysis}`, `{meta_analysis}`, and `{constraint_synthesis}`

## Rules

### meta-analysis-on-output

The meta-analysis worker receives the L12 OUTPUT as its target, not the original code — the claim prism treats the analysis text as an artifact to interrogate for hidden assumptions, making this recursive meta-analysis.
