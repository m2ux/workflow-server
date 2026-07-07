---
metadata:
  version: 2.3.0
---

## Capability

Execute the adversarial or synthesis pass of the Full Prism pipeline within an isolation model

## Inputs

### lens_name

Which lens to apply: `adversarial` or `synthesis`. Each names the lens resource the pass loads and the analytical role it performs. (The structural pass that these consume as prior context is produced separately by [structural-analysis](./structural-analysis.md).)

### prior_artifact_paths

*(optional)* Ordered file paths to the prior-pass artifacts this pass consumes as context; empty for the first pass.

## Outputs

### pass_artifact

Analysis artifact written to the filesystem

#### artifact

`adversarial-analysis.md` (`{lens_name}` `adversarial`) / `synthesis.md` (`synthesis`)

#### artifact_path

Full filesystem path to the written artifact

#### analysis_text

The full analysis output following the lens operations

## Protocol

### 1. Load Lens

- Load the lens prompt for `{lens_name}`: `adversarial` → [l12-complement-adversarial](../resources/l12-complement-adversarial.md), `synthesis` → [l12-synthesis](../resources/l12-synthesis.md)
- The lens prompt is the program — it defines the exact sequence of analytical operations to execute
- If the lens cannot be loaded, report the error and note that the valid lenses are `adversarial` and `synthesis` (all target types).

### 2. Read Prior Artifacts

- If `{prior_artifact_paths}` is provided, read each artifact file from the filesystem. If a provided artifact path does not exist, report the missing artifact.
- Label the content: first artifact as ANALYSIS 1, second as ANALYSIS 2. These labels match what the adversarial and synthesis lenses expect.

### 3. Apply Lens

- Apply every operation in the lens prompt sequentially against `{target_content}`
- If prior artifacts were read, include them as context as instructed by the lens (adversarial lenses reference 'the structural analysis'; synthesis lenses reference 'ANALYSIS 1' and 'ANALYSIS 2')
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.
- If the analysis stays at surface level without reaching the conservation law, re-execute from the structural invariant step. The depth comes from the inversion chain, not the initial claim.

### 4. Verify With Graph

- ADVERSARIAL PASS ONLY (`{lens_name}` is `adversarial`). Skip this step for the `synthesis` pass.
- Check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If the target codebase is not indexed, skip graph verification entirely.
- For each blast-radius claim in the adversarial analysis (e.g., 'this affects module X only'), take the symbol the claim names as `{$claimed_symbol}` and use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)`(target: {claimed_symbol}, direction: 'upstream')` to mechanically verify or refute. Record the measured affected-symbol count, affected-process count, and affected-module count alongside the claim.
- For each call-chain claim in the structural analysis being challenged, use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the key symbols to verify whether the claimed callers/callees are actually connected in the graph. Note confirmed and refuted edges.
- For 'dead code' or 'unused path' claims, use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) to query for incoming `CALLS` edges: `MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b {name: 'claimed_dead_symbol'}) RETURN a.name, a.filePath`. If results exist, the claim is refuted. Append a 'Graph Verification' section to the adversarial artifact with all verification results.
- Graph verification results augment the adversarial analysis, not replace it. The adversarial lens operations execute first and produce the full analysis. Graph queries then provide mechanical evidence that strengthens or refutes specific claims. Graph verification is only performed during the adversarial pass (`{lens_name}` is `adversarial`).

### 5. Write Artifact

- Write the complete analysis as `{pass_artifact}` into `{output_path}`. If the write fails, verify `{output_path}` exists and is writable.

### 6. Format Output

- Structure `{pass_artifact}.analysis_text` with clear section headers matching the lens operations
- For adversarial: wrong predictions, overclaims, underclaims, revised findings table
- For synthesis: refined conservation law, refined meta-law, definitive classification, deepest finding

## Rules

### lens-is-program

The lens resource is an imperative program. Execute its operations in order, producing the output each operation requests.
