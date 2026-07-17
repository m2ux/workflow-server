---
metadata:
  version: 1.1.0
---

## Capability

Extract structural and content patterns from comparable existing workflows for reuse in the target, persist the comparison for linked review, and present it alongside the proposed structure.

## Outputs

### pattern_analysis_path

Absolute path to the written pattern-analysis artifact. Interpolated into the `patterns-confirmed` checkpoint message as a markdown link.

#### artifact

`pattern-analysis.md`

## Protocol

### 1. Select References

- Select a shortlist of 2+ reference workflows of similar scope and structure, preferring same-domain workflows

### 2. Extract Patterns

- Extract structural conventions across the references: activity naming (NN-name), step/checkpoint ratios, transitions, technique assignment (primary vs supporting), artifact naming, resource organization
- Extract content conventions across the references: rule structuring, checkpoint effects, transition conditions, artifact-location references, technique protocol/inputs/output usage

### 3. Persist And Present

- Assemble a comparison of extracted patterns alongside the proposed structure, noting alignments and divergences
- Persist it via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `pattern-analysis.md`
- Capture the written location as `{pattern_analysis_path}`
- Present the comparison (or point the user at the artifact) as the surface for `patterns-confirmed`
