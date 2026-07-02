---
metadata:
  version: 1.1.0
---

## Capability

Classify the problem as specific (cause known/unknown) or inventive (improvement/prevention) and assess its complexity.

## Inputs

### problem_statement

The problem definition, classified into a problem type and assessed for complexity.

### issue_details

Summary, description, and context from the linked issue, used to infer the problem type and any preliminary target symbols.

### target

*(optional)* Preliminary target symbol(s) inferred from the issue, passed to the [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[complexity-signal](../../../meta/techniques/gitnexus-operations/complexity-signal.md) op for an objective complexity signal.

## Outputs

### problem_type

The classification result — one of: specific-cause-known, specific-cause-unknown, inventive-improvement, inventive-prevention.

### problem_complexity

The assessed complexity — one of: simple, moderate, or complex.

### classification_rationale

The documented rationale for the chosen problem type and complexity, including any objective complexity signal from gitnexus.

## Protocol

### 1. Classify Problem

- Walk the decision tree: is something currently broken or failing? YES → **specific problem** (root cause known → cause-known, direct fix; unknown → cause-unknown, investigate first). NO → **inventive goal** (improving an existing capability → improvement; preventing future problems → prevention).
- A specific problem focuses on fix-or-restore; an inventive goal on enhance-or-optimize — proactive improvement.
- Assess complexity as simple, moderate, or complex: simple = clear problem with a known solution or existing pattern (minor fixes completable in <30 minutes); moderate = some uncertainty in approach; complex = architectural decisions, multiple viable approaches, trade-offs or contradictions between requirements, or performance/reliability/scalability requirements.
- If preliminary target symbols can be inferred from the issue, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[complexity-signal](../../../meta/techniques/gitnexus-operations/complexity-signal.md) `{target}` for an objective complexity signal — high fan-out or many affected processes indicate higher complexity than the issue text suggests.
- Document classification rationale
