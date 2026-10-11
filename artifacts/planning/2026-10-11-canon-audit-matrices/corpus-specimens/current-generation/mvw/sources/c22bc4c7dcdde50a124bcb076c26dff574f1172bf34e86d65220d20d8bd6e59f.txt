---
metadata:
  version: 1.0.0
---

## Capability

Automatically compose an analysis pipeline based on input characteristics — the only mode where the system decides the pipeline topology

## Rules

### auto-composition

Smart is the only mode that composes its pipeline automatically. Do not ask the user which sub-mode to use — decide based on input.

### conditional-steps

Each step after the prerequisite scan is conditional. Knowledge fill requires extracted questions. Subsystem decomposition requires multi-class code. Dispute requires sufficient analysis output.

### knowledge-fill-best-effort

Knowledge gap fill is best-effort: when no knowledge source can answer the extracted questions, analysis proceeds without verified facts rather than blocking.
