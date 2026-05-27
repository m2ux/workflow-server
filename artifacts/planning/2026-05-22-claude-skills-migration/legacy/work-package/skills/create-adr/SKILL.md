---
name: create-adr
description: Produce an ADR at .engineering/artifacts/adr/.
metadata:
  ontology: legacy
  kind: skill
  version: 1.0.0
  order: 21
  legacy_id: 21
---

# Create Adr

## Capability

Create Architecture Decision Record for moderate or complex implementations

## Inputs

### complexity

Problem complexity from design-philosophy (simple|moderate|complex)

### design-philosophy-doc

Design philosophy artifact with rationale and alternatives

### planning-folder-path

*(optional)* Path to planning folder for context

## Protocol

### 1. Determine Number

- Scan .engineering/artifacts/adr/ for existing ADR files
- Determine next sequential NNNN number

### 2. Gather Context

- Read design philosophy document for decision rationale
- Review implementation analysis and plan for architectural choices
- Identify alternatives that were considered and rejected

### 3. Write Adr

- Create NNNN-{decision-title}.md at .engineering/artifacts/adr/
- Use standard ADR format (Title, Status, Context, Decision, Consequences)
- Set status to Proposed (finalize activity updates to Accepted)
- New ADRs are created with status Proposed — the finalize activity updates to Accepted

## Outputs

### adr-document

Architecture Decision Record

- **artifact**: `NNNN-{decision-title}.md`
- **context**: Problem context and forces
- **decision**: The architectural decision made
- **rationale**: Why this decision over alternatives
- **consequences**: Expected positive and negative consequences

## Rules

### complexity-gate

Only create ADRs for moderate or complex implementations — simple changes do not warrant ADRs

### alternatives-required

Every ADR must document at least one alternative that was considered

## Errors

### adr_numbering

**Cause:** Cannot determine next ADR number

**Recovery:** Scan .engineering/artifacts/adr/ for existing files and use next available number

### missing_design_philosophy

**Cause:** Design philosophy document not found

**Recovery:** Check planning folder path and prompt user to locate the artifact
