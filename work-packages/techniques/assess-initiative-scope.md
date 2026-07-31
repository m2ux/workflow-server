---
metadata:
  version: 1.0.0
---

## Capability

Identify and categorize work packages from a multi-package initiative description

## Inputs

### user_request

The user's free-form description of the initiative.

## Outputs

### initiative_name

Name for the overall initiative

### work_packages

List of identified packages with names and one-sentence descriptions

### package_count

Total number of identified packages

## Protocol

### 1. Confirm Multi Package

- Read `{user_request}` and assess whether it involves multiple distinct deliverables or a single work package  
  > If it is a single package, recommend the `work-package` workflow instead and stop.
- If multiple packages, proceed with decomposition

### 2. Identify Packages

- Parse the user's description to identify distinct units of work
- If you cannot determine where one package ends and another begins, ask the user to clarify which changes are independent and which must ship together
- Each package should be independently deliverable (its own branch, PR, and review cycle)
- Name each package descriptively using the domain language from the user's description
- Capture a one-sentence description for each package

### 3. Size and Name

- Assemble `{work_packages}` as a numbered table of the identified packages with name and description, and `{package_count}` as its row count
- Split any package larger than 8 hours of agentic work along a natural boundary, and merge any smaller than 2 hours into its nearest sibling
- Set `{initiative_name}` based on the overall theme of the packages, per the [planning-folder-template](../resources/planning-folder-template.md#folder-location)

## Rules

### independence-test

If two packages cannot be shipped separately, they are one package
