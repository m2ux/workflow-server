---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.0
  order: 1
  legacy_id: 1
---

## Capability

Execute a single pass of the Full Prism pipeline within an isolation model

## Inputs

### lens-resource-index

Resource index to load from the prism workflow (00 for structural, 01 for adversarial, 02 for synthesis)

### prior-artifact-paths

*(optional)* File paths to prior pass artifacts. Adversarial receives [structural-analysis.md]. Synthesis receives [structural-analysis.md, adversarial-analysis.md]. Empty for the structural pass.

## Protocol

### 1. Load Lens

- Load the lens prompt for {lens-resource-index}: 00 → [l12](../resources/l12.md) (structural), 01 → [l12-complement-adversarial](../resources/l12-complement-adversarial.md) (adversarial), 02 → [l12-synthesis](../resources/l12-synthesis.md) (synthesis)
- The lens prompt is the program — it defines the exact sequence of analytical operations to execute
- If the lens for the given index cannot be loaded, report the error and note that valid indices are 00-02 (all target types).

### 2. Read Prior Artifacts

- If {prior-artifact-paths} is provided, read each artifact file from the filesystem. If a provided artifact path does not exist, report the missing artifact; the orchestrator may need to re-dispatch the prior pass.
- Label the content: first artifact as ANALYSIS 1, second as ANALYSIS 2. These labels match what the adversarial and synthesis lenses expect.
- Prior pass output MUST be read from the filesystem via the artifact path. The orchestrator provides paths, not inline content, to keep prompts focused and artifacts as the source of truth.

### 3. Apply Lens

- Apply every operation in the lens prompt sequentially against {target-content}
- If prior artifacts were read, include them as context as instructed by the lens (adversarial lenses reference 'the structural analysis'; synthesis lenses reference 'ANALYSIS 1' and 'ANALYSIS 2')
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.
- If the analysis stays at surface level without reaching the conservation law, re-execute from the structural invariant step. The depth comes from the inversion chain, not the initial claim.

### 4. Verify With Graph

- ADVERSARIAL PASS ONLY ({lens-resource-index} 01). Skip this step for structural (00) and synthesis (02) passes.
- Check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If the target codebase is not indexed, skip graph verification entirely.
- For each blast-radius claim in the adversarial analysis (e.g., 'this affects module X only'), use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: claimed_symbol, direction: upstream) to mechanically verify or refute. Record the measured affected-symbol count, affected-process count, and affected-module count alongside the claim.
- For each call-chain claim in the structural analysis being challenged, use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the key symbols to verify whether the claimed callers/callees are actually connected in the graph. Note confirmed and refuted edges.
- For 'dead code' or 'unused path' claims, use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../meta/techniques/gitnexus-operations/cypher.md) to query for incoming CALLS edges: MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b {name: 'claimed_dead_symbol'}) RETURN a.name, a.filePath. If results exist, the claim is refuted. Append a 'Graph Verification' section to the adversarial artifact with all verification results.
- Graph verification results augment the adversarial analysis, not replace it. The adversarial lens operations execute first and produce the full analysis. Graph queries then provide mechanical evidence that strengthens or refutes specific claims. Graph verification is only performed during the adversarial pass (index 01).

### 5. Write Artifact

- Write the complete analysis as {pass-artifact} into {output-path}. If the write fails, verify {output-path} exists and is writable.

### 6. Format Output

- Structure {pass-artifact}.analysis-text with clear section headers matching the lens operations
- For structural: claim, dialectic, concealment mechanism, improvements, invariant, conservation law, meta-law, findings table
- For adversarial: wrong predictions, overclaims, underclaims, revised findings table
- For synthesis: refined conservation law, refined meta-law, definitive classification, deepest finding

## Outputs

### pass-artifact

Analysis artifact written to the filesystem

#### artifact

`structural-analysis.md` (index 00) / `adversarial-analysis.md` (index 01) / `synthesis.md` (index 02)

#### artifact-path

Full filesystem path to the written artifact

#### analysis-text

The full analysis output following the lens operations

## Rules

### no-context-leakage

This worker runs in isolation. Do not reference conversations, prior interactions, or context beyond what was provided in the prompt.

### lens-is-program

The lens resource is an imperative program. Execute its operations in order, producing the output each operation requests.
