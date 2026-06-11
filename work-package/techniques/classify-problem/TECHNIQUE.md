---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 4
  legacy_id: 4
---

# Classify Problem

## Capability

Apply structured design framework to classify problems, assess complexity, and determine workflow path. Operations inherit the shared inputs, outputs, and rules below.

## Inputs

### issue_details

Summary, description, and context from the linked issue

### problem_context

*(optional)* Additional context about the problem from user or prior activities

## Outputs

### design_philosophy_doc

Records problem classification, design [rationale](../../resources/design-framework.md#design-philosophy-artifact-template), and workflow path decisions

#### design_philosophy_artifact

`design-philosophy.md`

#### problem_statement

Clear problem definition with system understanding

#### problem_type

Specific problem or inventive goal

#### complexity

simple, moderate, or complex

## Rules

### path-determines-workflow

Design philosophy determines the path through the workflow — all subsequent activities depend on this classification
