---
metadata:
  version: 2.1.0
---

## Capability

Elicit a single design dimension of the workflow specification — posing the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md), recording the answers at the capture depth the guide defines, and presenting the accumulated design so far.

## Inputs

### current_dimension

The design dimension to elicit this iteration — one of the dimensions listed in the [elicitation-guide](../resources/elicitation-guide.md).

## Protocol

### 1. Pose Dimension Questions

- Pose the questions for `{current_dimension}` from the [elicitation-guide](../resources/elicitation-guide.md): ask what is needed to capture the dimension, skip follow-ups the user's answer already settles, and probe deeper when the answer is ambiguous

### 2. Capture Dimension

- Capture the dimension at the depth the guide's Capture column describes for that dimension — do not restate the per-dimension capture lists here

### 3. Present Accumulated Design

- Present the accumulated design after the answer so the user can track progress; confirmation is batched once after the dimension loop at `spec-confirmed`, not per dimension
