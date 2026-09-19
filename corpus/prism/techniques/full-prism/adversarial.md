---
metadata:
  version: 1.1.0
---

## Capability

Challenge the structural pass's analysis with the adversarial lens, then test its blast-radius, call-chain, and dead-code claims against the code graph

## Outputs

### adversarial_analysis

The challenge to the prior analysis: wrong predictions, overclaims, underclaims, and a revised findings table, carrying a Graph Verification section when the target is indexed.

#### artifact

`adversarial-analysis.md`

#### audience

`human`

## Protocol

### 1. Load Lens

- Load [l12-complement-adversarial](../../resources/l12-complement-adversarial.md) as this pass's lens prompt
- If the lens cannot be loaded, report the error.

### 2. Read Prior Artifacts

- If `{prior_artifact_paths}` is provided, read each artifact file from the filesystem. If a provided artifact path does not exist, report the missing artifact.
- Label the content: first artifact as ANALYSIS 1, second as ANALYSIS 2. These labels match what the lens expects.

### 3. Apply Lens

- Apply every operation in the lens prompt sequentially against `{target_content}`
- Include the prior artifacts as context as the lens instructs — it references 'the structural analysis'
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.
- If the analysis stays at surface level without reaching the conservation law, re-execute from the structural invariant step. The depth comes from the inversion chain, not the initial claim.

### 4. Verify With Graph

- An empty `{repo_name}` is a target no graph covers: skip graph verification entirely. Otherwise apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[verify-index](/gitnexus/techniques/verify-index.md)(*repo_name*: `{repo_name}`) and read how far the graph trails its tree as the age every verification below carries.
- For each blast-radius claim in the analysis (e.g., 'this affects module X only'), take the symbol the claim names as `{$claimed_symbol}` and use [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[impact](/gitnexus/techniques/impact.md)(*target*: `{claimed_symbol}`, *direction*: `upstream`, *repo_name*: `{repo_name}`) to mechanically verify or refute. Record the measured affected-symbol count, affected-process count, and affected-module count alongside the claim.
- For each call-chain claim in the structural analysis being challenged, use [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[context](/gitnexus/techniques/context.md)(*repo_name*: `{repo_name}`) on the key symbols to verify whether the claimed callers/callees are actually connected in the graph. Note confirmed and refuted edges.
- For 'dead code' or 'unused path' claims, use [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[cypher](/gitnexus/techniques/cypher.md)(*repo_name*: `{repo_name}`) to query for incoming `CALLS` edges: `MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b {name: 'claimed_dead_symbol'}) RETURN a.name, a.filePath`. If results exist, the claim is refuted. Append a 'Graph Verification' section to `{adversarial_analysis}` with all verification results.
- Graph verification results augment the analysis, not replace it. The lens operations execute first and produce the full analysis; graph queries then supply mechanical evidence that strengthens or refutes specific claims.

### 5. Write Artifact

- Write the complete analysis as `{adversarial_analysis}` into `{output_path}`, sectioned to match the lens operations: wrong predictions, overclaims, underclaims, revised findings table. If the write fails, verify `{output_path}` exists and is writable.
