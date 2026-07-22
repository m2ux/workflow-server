---
metadata:
  version: 1.2.4
---

## Capability

Structural and content pattern extraction from comparable workflows for target alignment.

## Outputs

### pattern_analysis

Lean alignment / divergence table following the [Pattern Analysis Guide](../resources/pattern-analysis.md#template).

#### artifact

`pattern-analysis.md`

### pattern_analysis_path

Absolute path to the written pattern-analysis artifact.

## Protocol

### 1. Select References

- Select a shortlist of 2+ reference workflows of similar scope and structure, preferring same-domain workflows

### 2. Extract Patterns

- Extract structural conventions across the references: activity naming (NN-name), step/checkpoint ratios, transitions, technique assignment (primary vs supporting), artifact naming, resource organization
- Extract content conventions across the references: rule structuring, checkpoint effects, transition conditions, artifact-location references, technique protocol/inputs/output usage

### 3. Assemble Comparison

- Assemble `{pattern_analysis}` following the [Pattern Analysis Guide](../resources/pattern-analysis.md#template)

### 4. Persist Pattern Analysis

- Persist via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `pattern-analysis.md` per [pattern-analysis](../resources/pattern-analysis.md#template)
- Capture the written location as `{pattern_analysis_path}`
