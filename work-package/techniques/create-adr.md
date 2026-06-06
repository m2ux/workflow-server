---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 21
  legacy_id: 21
---

## Capability

Create an Architecture Decision Record at .engineering/artifacts/adr/ for moderate or complex implementations

## Inputs

### complexity

Problem complexity assessment (simple|moderate|complex)

### design-philosophy-doc

Design philosophy [artifact](../resources/design-framework.md#design-philosophy-artifact-template) with rationale and alternatives

## Protocol

### 1. Gate On Complexity

- Proceed only when {complexity} is moderate or complex. For a simple assessment, do not create an ADR — simple changes do not warrant one — and return without an {adr-document}.

### 2. Determine Number

- Scan .engineering/artifacts/adr/ for existing ADR files
- Determine next sequential NNNN number
- If the next number cannot be determined, scan .engineering/artifacts/adr/ for existing files and use the next available number.

### 3. Gather Context

- Read the {design-philosophy-doc} for decision rationale, alternatives, and trade-offs. If the design philosophy document is not found, check {planning-folder} and prompt the user to locate the artifact.
- Review implementation analysis and plan from {planning-folder} for architectural choices
- Identify alternatives that were considered and rejected

### 4. Write Adr

- Write the {adr-document} as NNNN-{decision-title}.md at .engineering/artifacts/adr/
- Use standard ADR format (Title, Status, Context, Decision, Consequences)
- Set status to Proposed (finalize activity updates to Accepted)
- New ADRs are created with status Proposed — the finalize activity updates to Accepted

## Outputs

### adr-document

[Architecture Decision Record](../resources/architecture-review.md#adr-template)

#### artifact

`NNNN-{decision-title}.md`

## Rules

### alternatives-required

Every ADR must document at least one alternative that was considered
