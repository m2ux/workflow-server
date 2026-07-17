---
metadata:
  version: 2.2.0
---

## Capability

Elicit a single design dimension of the workflow specification — posing the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md), recording the answers at the capture depth the guide defines, and presenting the accumulated design so far.

## Inputs

### current_dimension

The design dimension to elicit — one of the dimensions listed in the [elicitation-guide](../resources/elicitation-guide.md).

## Outputs

### dimension_capture

The captured answers for `{current_dimension}` at the depth the guide's Capture column describes for that dimension.

### accumulated_design

The running design specification assembled from all dimensions elicited so far, including `{dimension_capture}` for the current dimension.

## Protocol

### 1. Pose Dimension Questions

- Pose the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md): ask what is needed to capture the dimension, skip follow-ups the user's answer already settles, and probe deeper when the answer is ambiguous

### 2. Capture Dimension

- Capture the dimension at the depth the guide's Capture column describes for that dimension — do not restate the per-dimension capture lists here; record the result as `{dimension_capture}`

### 3. Present Accumulated Design

- Fold `{dimension_capture}` into `{accumulated_design}` and present `{accumulated_design}` so progress is visible
