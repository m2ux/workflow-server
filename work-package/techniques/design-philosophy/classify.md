---
metadata:
  version: 1.1.0
---

## Capability

Classify the problem as specific (cause known/unknown) or inventive (improvement/prevention) and assess its complexity.

## Inputs

### target_symbol

*(optional)* The primary symbol the issue points at, where one can be inferred from it.

## Outputs

### problem_type

The classification result — one of: specific-cause-known, specific-cause-unknown, inventive-improvement, inventive-prevention.

### problem_complexity

The assessed complexity — one of: simple, moderate, or complex.

### classification_rationale

The documented rationale for the chosen problem type and complexity, including any objective complexity signal from gitnexus.

## Protocol

### 1. Classify Problem

- Settle `{problem_type}` and `{problem_complexity}` against [Problem Classification](../../resources/design-framework.md#problem-classification), which carries the type tree and what each complexity value holds
- If preliminary target symbols can be inferred from the issue, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[complexity-signal](../../../meta/techniques/gitnexus-operations/complexity-signal.md)(target: `{target_symbol}`) for an objective complexity signal — high fan-out or many affected processes indicate higher complexity than the issue text suggests.
- Document classification rationale
