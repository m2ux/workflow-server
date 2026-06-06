---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

## Capability

Run 2 maximally orthogonal prisms against the same target and synthesize their disagreements for lightweight self-correction

## Protocol

### 1. Select Pair

- Branch on {target-type}: for code, [l12](../resources/l12.md) (00) + [identity](../resources/identity.md) (17) — highest pairwise uniqueness
- For general: [l12_universal](../resources/l12-universal.md) (18) + [claim](../resources/claim.md) (07)
- l12+identity for code, l12_universal+claim for general — these pairs maximize analytical divergence

### 2. Execute Lenses

- Dispatch prism A to a fresh worker with its resource index, passing {target-content} as the material to analyze
- Dispatch prism B to a fresh worker against the same {target-content} (can be parallel)
- Each worker writes to {output-path}/dispute-lens-{a|b}.md

### 3. Synthesize Disagreements

- Dispatch synthesis to a fresh worker with [dispute-synthesis](../resources/dispute-synthesis.md) resource (62)
- Worker constructs input: "# LENS A: {\$prism-a}\n\n{\$output-a}\n\n---\n\n# LENS B: {\$prism-b}\n\n{\$output-b}"
- Worker writes to {output-path}/dispute-synthesis.md
- The synthesis focuses on DISAGREEMENTS, not agreements. Convergence is noted only to test implicit shared assumptions.
- Return {dispute-result}: the three artifact paths and the prism pair selected in step 1

## Outputs

### dispute-result

Paths to the three dispute artifacts and the prism pair used

#### lens-a-path

Filesystem path to dispute-lens-a.md

#### lens-b-path

Filesystem path to dispute-lens-b.md

#### synthesis-path

Filesystem path to dispute-synthesis.md

#### prism-pair

Resource indices and lens identities used for A and B

## Rules

### isolation

Each lens runs in a fresh context; neither sees the other's output

