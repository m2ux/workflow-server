---
name: full-prism
description: Execute one pass of the Full Prism pipeline.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.0
  order: 1
  legacy_id: 1
---

## Capability

Execute a single pass of the Full Prism pipeline within the prism workflow's isolation model

## Inputs

### target-content

The code or text to analyze (provided inline by the orchestrator, or a file path to read)

### lens-resource-index

Resource index to load from the prism workflow (00 for structural, 01 for adversarial, 02 for synthesis)

### prior-artifact-paths

*(optional)* File paths to prior pass artifacts. Adversarial receives [structural-analysis.md]. Synthesis receives [structural-analysis.md, adversarial-analysis.md]. Empty for the structural pass.

### output-path

Directory to write the analysis artifact

### target-type

*(optional)* Whether the input is 'code' or 'general'

- **default**: code

## Protocol

### 1. Load Lens

- Resources are attached to skill responses (loaded via get_skill or get_skills). Resource index lens-resource-index is available in the _resources field after loading the lens prompt: 00 structural ([l12](../resources/l12.md)), 01 adversarial ([l12-complement-adversarial](../resources/l12-complement-adversarial.md)), 02 synthesis ([l12-synthesis](../resources/l12-synthesis.md))
- The lens prompt is the program — it defines the exact sequence of analytical operations to execute

### 2. Read Prior Artifacts

- If prior-artifact-paths is provided, read each artifact file from the filesystem
- Label the content: first artifact as ANALYSIS 1, second as ANALYSIS 2. These labels match what the adversarial and synthesis lenses expect.
- Prior pass output MUST be read from the filesystem via the artifact path. The orchestrator provides paths, not inline content, to keep prompts focused and artifacts as the source of truth.

### 3. Apply Lens

- Apply every operation in the lens prompt sequentially against the target content
- If prior artifacts were read, include them as context as instructed by the lens (adversarial lenses reference 'the structural analysis'; synthesis lenses reference 'ANALYSIS 1' and 'ANALYSIS 2')
- Execute completely — do not abbreviate or skip operations. The analytical depth comes from the full chain.

### 4. Verify With Graph

- ADVERSARIAL PASS ONLY (lens-resource-index 01). Skip this step for structural (00) and synthesis (02) passes.
- Check GitNexus availability via gitnexus_list_repos. If the target codebase is not indexed, skip graph verification entirely.
- For each blast-radius claim in the adversarial analysis (e.g., 'this affects module X only'), use gitnexus_impact(target: claimed_symbol, direction: upstream) to mechanically verify or refute. Record the measured affected-symbol count, affected-process count, and affected-module count alongside the claim.
- For each call-chain claim in the structural analysis being challenged, use gitnexus_context on the key symbols to verify whether the claimed callers/callees are actually connected in the graph. Note confirmed and refuted edges.
- For 'dead code' or 'unused path' claims, use gitnexus_cypher to query for incoming CALLS edges: MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b {name: 'claimed_dead_symbol'}) RETURN a.name, a.filePath. If results exist, the claim is refuted. Append a 'Graph Verification' section to the adversarial artifact with all verification results.
- Graph verification results augment the adversarial analysis, not replace it. The adversarial lens operations execute first and produce the full analysis. Graph queries then provide mechanical evidence that strengthens or refutes specific claims. Graph verification is only performed during the adversarial pass (index 01).

### 5. Write Artifact

- Determine artifact filename from the pass type: structural-analysis.md (index 00), adversarial-analysis.md (index 01), synthesis.md (index 02)
- Write the complete analysis to {output-path}/{artifact-filename}
- Return the full artifact path in the output
- The analysis MUST be written to the filesystem. Return the artifact path to the orchestrator so subsequent passes can read it.

### 6. Format Output

- Structure the output with clear section headers matching the lens operations
- For structural: claim, dialectic, concealment mechanism, improvements, invariant, conservation law, meta-law, findings table
- For adversarial: wrong predictions, overclaims, underclaims, revised findings table
- For synthesis: refined conservation law, refined meta-law, definitive classification, deepest finding

## Outputs

### pass-artifact

Analysis artifact written to the filesystem

- **artifact**: `{pass-type}-analysis.md`
- **artifact_path**: Full filesystem path to the written artifact
- **analysis_text**: The full analysis output following the lens operations

## Rules

### complete-execution

Every step in the lens prompt must be executed. Do not skip or summarize — the depth comes from the full chain.

### evidence-required

All findings must cite specific code or text: file paths, function names, line ranges, specific passages.

### no-context-leakage

This worker runs in isolation. Do not reference conversations, prior interactions, or context beyond what was provided in the prompt.

### lens-is-program

The lens resource is an imperative program. Execute its operations in order, producing the output each operation requests.

## Errors

### lens_not_loaded

**Cause:** resource not found in skill response for the given index

**Recovery:** Report the error. Valid indices: 00-02 (all target types).

### prior_artifact_not_found

**Cause:** A prior pass artifact path was provided but the file does not exist

**Recovery:** Report the missing artifact. The orchestrator may need to re-dispatch the prior pass.

### shallow_analysis

**Cause:** Analysis stayed at surface level without reaching conservation law

**Recovery:** Re-execute from the structural invariant step. The depth comes from the inversion chain, not the initial claim.

### write_failed

**Cause:** Could not write artifact to the output path

**Recovery:** Verify the output-path directory exists and is writable.
