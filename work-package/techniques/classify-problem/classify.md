---
metadata:
  version: 1.0.0
---

## Capability

Classify the problem as specific (cause known/unknown) or inventive (improvement/prevention) and assess its complexity.

## Inputs

### problem_statement

The problem definition from [define](./define.md), classified into a problem type and assessed for complexity.

### issue_details

Summary, description, and context from the linked issue, used to infer the problem type and any preliminary target symbols (inherited from the [classify-problem](./TECHNIQUE.md) group root).

### target

*(optional)* Preliminary target symbol(s) inferred from the issue, passed to the [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[complexity-signal](../gitnexus-operations/complexity-signal.md) op for an objective complexity signal.

## Outputs

### problem_type

The classification result — one of: specific-cause-known, specific-cause-unknown, inventive-improvement, inventive-prevention (set as an activity variable; a field of the [design_philosophy_doc](./TECHNIQUE.md)).

### complexity

The assessed complexity — one of: simple, moderate, or complex (set as an activity variable; a field of the [design_philosophy_doc](./TECHNIQUE.md)).

### classification_rationale

The documented rationale for the chosen problem type and complexity, including any objective complexity signal from gitnexus.

## Protocol

### 1. Classify Problem

- Determine if specific problem (cause known/unknown) or inventive goal (improvement/prevention)
- Assess complexity as simple, moderate, or complex
- If preliminary target symbols can be inferred from the issue, apply [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[complexity-signal](../gitnexus-operations/complexity-signal.md) `{target}` for an objective complexity signal — high fan-out or many affected processes indicate higher complexity than the issue text suggests.
- Document classification rationale
