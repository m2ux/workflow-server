---
name: plan-work-package-scope
description: Plan an individual work package within a multi-package initiative.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

# Plan Work Package Scope

## Capability

Define scope, dependencies, effort, and success criteria for a single package within a multi-package initiative

## Inputs

### current-package

The work package currently being planned (from the forEach loop)

### planning-folder-path

Path to the planning folder for storing plan documents

## Protocol

### 1. Present Overview

- Before entering the loop, summarize all packages to be planned and the planning approach
- Explain that each package will get: scope definition, dependency analysis, effort estimate, and success criteria

### 2. Define Scope

- Identify what is in scope for the current package — specific deliverables and changes
- Identify what is explicitly out of scope with reasons for exclusion
- Apply the independence test: could this package be shipped without any other package?

### 3. Identify Dependencies

- Document hard blockers: packages or external factors that must complete first
- Document soft dependencies: helpful but not required
- Flag circular dependencies as decomposition problems requiring resolution
- Distinguish hard blockers from soft dependencies

### 4. Estimate Effort

- Assess complexity: Low / Medium / High based on scope and unknowns
- Estimate agentic time, review time, and calendar time as ranges
- Document the rationale for the estimate, noting key complexity drivers
- Use ranges for effort, not point estimates

### 5. Define Success

- Establish measurable success criteria — each must be objectively verifiable
- Include verification method for each criterion (tests, review, demonstration)
- Every success criterion must be objectively verifiable

### 6. Document Plan

- Use attached [package-plan-template](../../resources/package-plan-template/SKILL.md) (package-plan-template) for the document structure
- Create NN-{package-name}-plan.md in the planning folder using the template

## Outputs

### package-plan

Work package plan document

- **artifact**: `{package-name}-plan.md`
- **scope**: In-scope and out-of-scope definitions
- **dependencies**: Blocker and soft dependency list
- **effort**: Effort estimate with rationale
- **success_criteria**: Measurable success criteria with verification methods

## Rules

### scope-specificity

Scope items must name specific deliverables — vague scope leads to scope creep

## Errors

### circular_dependency

**Cause:** Two packages depend on each other

**Recovery:** Identify the shared component and extract it as a separate package, or merge the two packages

### scope_too_large

**Cause:** Package scope exceeds 8 hours of agentic work

**Recovery:** Split into two or more packages along natural boundaries
