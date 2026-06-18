---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Identify and categorize work packages from a multi-package initiative description

## Inputs

### user_initiative_description

Free-form description of the initiative from the user

## Protocol

### 1. Confirm Multi Package

- Read `{user_initiative_description}` and assess whether it involves multiple distinct deliverables or a single work package  
  > If it is a single package, recommend the `work-package` workflow instead and stop.
- If multiple packages, proceed with decomposition

### 2. Identify Packages

- Parse the user's description to identify distinct units of work
- If you cannot determine where one package ends and another begins, ask the user to clarify which changes are independent and which must ship together
- Each package should be independently deliverable (its own branch, PR, and review cycle)
- Name each package descriptively using the domain language from the user's description
- Capture a one-sentence description for each package

### 3. Present Scope

- Present the `{work_packages}` as a numbered table of the identified packages with name and description
- Highlight any packages that seem too large (should be split) or too small (should be merged)  
  > Packages should be 2-8 hours of agentic work. Larger packages should be split; smaller ones merged.
- Set `{initiative_name}` based on the overall theme of the packages, per the [planning-folder-template](../resources/planning-folder-template.md#folder-location)

## Outputs

### initiative_name

Name for the overall initiative

### work_packages

List of identified packages with names and one-sentence descriptions

### package_count

Total number of identified packages

## Rules

### independence-test

If two packages cannot be shipped separately, they are one package
