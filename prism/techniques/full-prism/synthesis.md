---
metadata:
  version: 1.1.0
---

## Capability

Reconcile the structural and adversarial analyses with the synthesis lens into the definitive reading of the target

## Outputs

### definitive_synthesis

The reconciled reading of the two prior analyses: refined conservation law, refined meta-law, definitive classification, and the deepest finding.

#### artifact

`synthesis.md`

#### audience

`human`

## Protocol

### 1. Load Lens

- Load [l12-synthesis](../../resources/l12-synthesis.md) as this pass's lens prompt
- If the lens cannot be loaded, report the error.

### 2. Read Prior Artifacts

- Read each artifact file named by `{prior_artifact_paths}` from the filesystem. If a provided artifact path does not exist, report the missing artifact.
- Label the content: first artifact as ANALYSIS 1, second as ANALYSIS 2. These are the labels the lens expects.

### 3. Apply Lens

- Apply every operation in the lens prompt sequentially against `{target_content}`, with ANALYSIS 1 and ANALYSIS 2 as context
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.
- If the analysis stays at surface level without reaching the conservation law, re-execute from the structural invariant step. The depth comes from the inversion chain, not the initial claim.

### 4. Write Artifact

- Write the complete analysis as `{definitive_synthesis}` into `{output_path}`, sectioned to match the lens operations: refined conservation law, refined meta-law, definitive classification, deepest finding. If the write fails, verify `{output_path}` exists and is writable.
