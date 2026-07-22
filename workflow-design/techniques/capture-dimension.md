---
metadata:
  version: 1.1.1
---

## Capability

User answers for a single design dimension at the elicitation-guide capture depth, folded into the running design specification.

## Inputs

### current_dimension

The design dimension just elicited — one of the dimensions listed in the [elicitation-guide](../resources/elicitation-guide.md).

### dimension_questions

The questions that were surfaced for this dimension — anchor questions and capture depth from the [elicitation-guide](../resources/elicitation-guide.md#dimensions) for `{current_dimension}`.

## Outputs

### accumulated_design

The running design specification assembled from all dimensions elicited so far, including the current dimension's capture.

## Protocol

### 1. Capture Dimension

- From the user's replies to `{dimension_questions}`, record `{$dimension_capture}` at the depth the [elicitation-guide](../resources/elicitation-guide.md) Capture column describes for `{current_dimension}` — do not restate the per-dimension capture lists here

### 2. Fold Accumulated Design

- Fold `{dimension_capture}` into `{accumulated_design}`
