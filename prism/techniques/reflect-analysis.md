---
name: reflect-analysis
description: Apply recursive meta-analysis to L12 output and synthesize findings.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

Apply recursive meta-analysis to L12 output using the claim prism, then synthesize findings with constraint history

## Inputs

### target-content

The code or text to analyze in the L12 pass

### target-type

code or general — informs L12 and downstream framing

### output-path

Directory for reflect-l12.md, reflect-meta.md, reflect-synthesis.md

## Protocol

### 1. Structural Analysis

- Dispatch L12 ([l12](../resources/l12.md)) to a fresh worker
- Worker writes to {output-path}/reflect-l12.md

### 2. Meta Analysis

- Dispatch claim ([claim](../resources/claim.md)) to a fresh worker
- Worker receives the L12 OUTPUT as its analysis target (not source code)
- Worker writes to {output-path}/reflect-meta.md
- The claim prism runs on L12 OUTPUT, not on source code — this is recursive meta-analysis

### 3. Constraint Synthesis

- Dispatch synthesis to a fresh worker
- Worker receives: L12 output + meta output + constraint history (if available)
- Worker produces: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN
- Worker writes to {output-path}/reflect-synthesis.md
- Synthesis must produce exactly 4 sections: RECURRING PATTERNS, UNEXPLORED DIMENSIONS, KNOWN FALSE POSITIVES, NEXT BEST SCAN

## Outputs

### reflect-result

Paths to the three reflect pipeline artifacts

- **l12_path**: Filesystem path to reflect-l12.md
- **meta_path**: Filesystem path to reflect-meta.md
- **synthesis_path**: Filesystem path to reflect-synthesis.md

## Rules

### model-selection

L12 uses its optimal model. Claim uses its optimal model. Synthesis uses sonnet.

### tool-usage

spawn-agent via harness-compat for description and prompt — do NOT use continue-agent on prior workers
