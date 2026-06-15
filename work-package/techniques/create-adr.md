---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 21
  legacy_id: 21
---

## Capability

Create an Architecture Decision Record for moderate or complex implementations

## Inputs

### problem_complexity

Problem complexity assessment (simple|moderate|complex)

### design_philosophy_doc

Design philosophy [artifact](../resources/design-framework.md#design-philosophy-artifact-template) with rationale and alternatives

### adr_dir

Directory holding the project's ADR files

#### default

`.engineering/artifacts/adr/`

## Protocol

### 1. Gate On Complexity

- Proceed only when `{problem_complexity}` is moderate or complex. For a simple assessment, do not create an `{adr_document}` — simple changes do not warrant one — and return without one.

### 2. Determine Number

- Scan `{adr_dir}` for existing ADR files
- Determine next sequential NNNN number
- If the next number cannot be determined, re-scan `{adr_dir}` and use the next available number.

### 3. Gather Context

- Read the `{design_philosophy_doc}` for decision rationale, alternatives, and trade-offs. If the design philosophy document is not found, check `{planning_folder_path}` and prompt the user to locate the artifact.
- Review implementation analysis and plan from `{planning_folder_path}` for architectural choices
- Identify alternatives that were considered and rejected

### 4. Write Adr

- Write the `{adr_document}` as `NNNN-{$decision_title}.md` in `{adr_dir}`, deriving `{$decision_title}` as a slugified short title of the decision
- Use standard ADR format (Title, Status, Context, Decision, Consequences)
- Set the `{adr_document}` status to Proposed; acceptance is recorded later in a separate finalization step

## Outputs

### adr_document

[Architecture Decision Record](../resources/architecture-review.md#adr-template)

#### adr_artifact

`NNNN-{decision_title}.md`

## Rules

### alternatives-required

Every `{adr_document}` must document at least one alternative that was considered
