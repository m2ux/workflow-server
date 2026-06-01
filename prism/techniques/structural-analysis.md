---
name: structural-analysis
description: Apply L12 structural analysis to code.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 0
  legacy_id: 0
---

## Capability

Apply L12 structural analysis lens to code for deep structural findings, conservation laws, and bug detection

## Inputs

### code-content

The code to analyze. Can be a file path (agent reads it), a diff, or inline code.

### output-path

*(optional)* Directory to write the analysis artifact. Defaults to current working directory.

- **default**: .

### analysis-focus

*(optional)* Optional focus area to guide the analysis (e.g., 'error handling', 'state management', 'concurrency')

## Protocol

### 1. Load Lens

- Use attached [l12](../resources/l12.md) (l12-structural) from the prism workflow: get_skill ([l12](../resources/l12.md) attached in _resources)
- The resource contains the full L12 lens prompt — a sequence of analytical operations the agent must execute step by step

### 2. Read Target

- If code-content is a file path, read the file to obtain the code
- If an analysis-focus is provided, note it as a framing constraint but do not narrow the analysis — the lens operations are exhaustive

### 3. Gather Structural Context

- Check GitNexus availability via gitnexus_list_repos. If the target codebase is not indexed, skip this step entirely and proceed to execute-lens.
- Use gitnexus_query with queries derived from the target code's primary concerns (e.g., the module name, key function names, or analysis-focus if provided) to discover execution flows through the target — this identifies which call chains the code participates in and which are most relevant.
- Use gitnexus_context on the primary entry points and exported symbols of the target to obtain caller/callee maps — the lens can then make blast-radius claims backed by actual graph data rather than inference.
- Record the structural context (execution flows, caller counts, callee maps) as a preamble section that the lens operations can reference when making claims about impact, coupling, or dead code.
- If any GitNexus call fails, log the failure and continue without structural context — the lens operates independently.

### 4. Execute Lens

- Apply every operation in the lens prompt sequentially against the code
- Start with the falsifiable claim about the code's deepest structural problem
- Follow the construction-based reasoning chain through improvements, invariants, inversions, and conservation laws
- Conclude with the concrete bug table — every bug, edge case, and silent failure discovered at any stage

### 5. Write Artifact

- Write the complete analysis to {output-path}/structural-analysis.md
- Include a YAML front-matter header with target file, analysis date, and lens used (L12 structural)
- The analysis MUST be written to the filesystem as an artifact. In-memory-only output is not acceptable — downstream passes and callers depend on reading the artifact file.

### 6. Format Output

- Structure the output with clear section headers: Claim, Dialectic, Concealment Mechanism, Improvements, Structural Invariant, Conservation Law, Meta-Law, Bug Table
- In the Bug Table, classify each finding as fixable or structural based on whether the conservation law predicts it can be resolved
- Include file paths, line numbers, and specific function names for every finding

## Outputs

### structural-analysis

L12 structural analysis with conservation law, meta-law, and classified bug table

- **artifact**: `structural-analysis.md`
- **conservation_law**: The named conservation law between original and inverted impossibilities
- **meta_law**: What the conservation law itself conceals — the deeper finding
- **bug_table**: Every concrete bug with location, severity, and fixable/structural classification
- **concealment_mechanism**: How the code hides its real problems
- **structural_invariant**: The property that persists through every improvement

## Rules

### execute-completely

Every step in the lens prompt must be executed. Do not skip or summarize operations — the depth comes from the full chain.

### construction-over-description

Build improvements and observe what they reveal. Do not merely describe problems — construct alternatives and trace what becomes visible.

### evidence-required

All findings must cite specific code: file paths, function names, line ranges. Abstract claims without code evidence are not findings.

### meta-law-specificity

The meta-law must predict a concrete, testable consequence for this specific code. It must not generalize the conservation law to a broader category.

### graph-context-is-supplementary

Structural context from GitNexus is supplementary evidence, not a replacement for the lens operations. The L12 chain executes completely regardless of whether graph data is available. Graph data strengthens blast-radius claims and call-chain evidence but does not alter the analytical method.

## Errors

### empty_code

**Cause:** No code content provided or file not found

**Recovery:** Request the file path or code content from the caller

### shallow_analysis

**Cause:** Analysis stays at surface level without reaching conservation law

**Recovery:** Re-execute from the structural invariant step — the depth comes from the inversion chain, not the initial claim

### write_failed

**Cause:** Could not write artifact to the output path

**Recovery:** Verify the output-path directory exists and is writable
