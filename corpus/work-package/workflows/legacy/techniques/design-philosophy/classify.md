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
- Where a preliminary target symbol can be inferred from the issue, apply [gitnexus](/gitnexus/techniques/TECHNIQUE.md)::[impact](/gitnexus/techniques/impact.md)(*target*: `{target_symbol}`, *direction*: `upstream`, *max_depth*: 2) and read its `{impact_report}` fan-out and affected-process count as an objective complexity signal — a symbol many callers reach, or one many flows run through, is more complex than the issue text suggests.
  > No symbol can be inferred from some issues. The estimate then rests on the issue text alone, and `{classification_rationale}` says so.
- Document classification rationale
