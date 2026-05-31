---
name: assess-initiative-scope
description: Decompose a multi-package initiative description into distinct work packages.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

# Assess Initiative Scope

## Capability

Identify and categorize work packages from a multi-package initiative description

## Inputs

### user-initiative-description

Free-form description of the initiative from the user

## Protocol

### 1. Confirm Multi Package

- Assess whether the user's request involves multiple distinct deliverables or a single work package
- If single package, recommend using the work-package workflow directly instead
- If multiple packages, proceed with decomposition

### 2. Identify Packages

- Parse the user's description to identify distinct units of work
- Each package should be independently deliverable (its own branch, PR, and review cycle)
- Name each package descriptively using the domain language from the user's description
- Capture a one-sentence description for each package
- Package names should use domain language from the user's description, not implementation language

### 3. Present Scope

- Present the identified packages in a numbered table with name and description
- Highlight any packages that seem too large (should be split) or too small (should be merged)
- Set initiative_name based on the overall theme of the packages (see [planning-folder-template](../../resources/planning-folder-template/SKILL.md))

## Outputs

### scope-summary

Identified work packages with names and descriptions

- **initiative_name**: Name for the overall initiative
- **work_packages**: List of identified packages with names and one-sentence descriptions
- **package_count**: Total number of identified packages

## Rules

### independence-test

Each work package must be independently deliverable — if two packages cannot be shipped separately, they are one package

### granularity

Packages should be 2-8 hours of agentic work. Larger packages should be split; smaller ones merged.

## Errors

### single_package

**Cause:** User's request is actually a single work package

**Recovery:** Recommend using the work-package workflow instead of work-packages

### unclear_boundaries

**Cause:** Cannot determine where one package ends and another begins

**Recovery:** Ask the user to clarify which changes are independent and which must ship together
