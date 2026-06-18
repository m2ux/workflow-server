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

- Branch on `{target_type}`: for `code`, [l12](../resources/l12.md) (00) + [identity](../resources/identity.md) (17) — the pair with highest pairwise uniqueness; for `general`, [l12-universal](../resources/l12-universal.md) (18) + [claim](../resources/claim.md) (07). Each pair maximizes analytical divergence.
- Identify the chosen lens identities `{$prism_a}` (the first lens) and `{$prism_b}` (the second lens)

### 2. Execute Lenses

- Dispatch prism A to a fresh worker with its resource index, passing `{target_content}` as the material to analyze  
  > Each lens runs in a fresh context; neither sees the other's output.
- Dispatch prism B to a fresh worker against the same `{target_content}` (can be parallel)
- Each worker writes its lens artifact (`{dispute_result.lens_a_path}` / `{dispute_result.lens_b_path}`) into `{output_path}`; capture the lens A artifact content as `{$output_a}` and the lens B artifact content as `{$output_b}`

### 3. Synthesize Disagreements

- Dispatch synthesis to a fresh worker with [dispute-synthesis](../resources/dispute-synthesis.md) resource (62)
- Worker constructs input: "# LENS A: `{prism_a}`\n\n`{output_a}`\n\n---\n\n# LENS B: `{prism_b}`\n\n`{output_b}`"
- Worker writes `{dispute_result.synthesis_path}` into `{output_path}`
- The synthesis focuses on DISAGREEMENTS, not agreements. Convergence is noted only to test implicit shared assumptions.
- Return `{dispute_result}`: the three artifact paths and the prism pair selected in step 1

## Outputs

### dispute_result

Paths to the three dispute artifacts and the prism pair used

#### artifact

`dispute-lens-a.md` (lens A) / `dispute-lens-b.md` (lens B) / `dispute-synthesis.md` (disagreement synthesis)

#### lens_a_path

Filesystem path to the lens A artifact

#### lens_b_path

Filesystem path to the lens B artifact

#### synthesis_path

Filesystem path to the disagreement-synthesis artifact

#### prism_pair

Resource indices and lens identities used for A and B

## Rules

### synthesis-never-sees-target

The synthesis worker receives both lens outputs but has never seen the target analyzed by either lens — it reasons only over the two analyses, focusing on their disagreements.

### automatic-pair-selection

The orthogonal prism pair is selected automatically for maximum analytical divergence; it is not user-configurable.

