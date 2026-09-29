---
metadata:
  version: 1.5.0
---

## Capability

Structural and content pattern extraction from comparable workflows for target alignment.

## Outputs

### pattern_analysis

Lean alignment / divergence table following the [Pattern Analysis Guide](../resources/pattern-analysis.md#template).

#### artifact

`pattern-analysis.md`

#### audience

`human`

## Protocol

### 1. Select References

- Select a shortlist of 2+ reference workflows of similar scope and structure, preferring same-domain workflows

### 2. Extract Patterns

- Extract structural conventions across the references: activity naming (NN-name), step/checkpoint ratios, exits and their graph bindings, technique assignment (primary vs supporting), artifact naming, resource organization
- Extract content conventions across the references: rule structuring, checkpoint effects, exit conditions, artifact-location references, technique protocol/inputs/output usage

### 3. Assemble Comparison

- Assemble `{pattern_analysis}` following the [Pattern Analysis Guide](../resources/pattern-analysis.md#template)
