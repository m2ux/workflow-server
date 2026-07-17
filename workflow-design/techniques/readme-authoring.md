---
metadata:
  version: 1.0.0
---

## Capability

Generate a workflow README in create mode, or update it in update mode: a root README with the workflow title, description, activity sequence table, mode descriptions, usage instructions, and resource links, reflecting any structural changes when updating.

## Inputs

### is_update_mode

Whether update mode is active. In update mode the README is updated in place to reflect structural changes; in create mode it is generated fresh.

## Outputs

### workflow_readme

The workflow's root README with title, description, activity sequence table, mode descriptions, usage instructions, and resource links — generated in create mode or updated to reflect structural changes in update mode

#### artifact

`README.md`

## Protocol

### 1. Generate Or Update README

- In create mode, generate the README fresh with the workflow title, description, activity sequence table, mode descriptions, usage instructions, and resource links
- In update mode, update the existing README to reflect structural changes such as new activities, modified activity descriptions, or changed modes
- Orient with purpose, value, structure, and links; do not transcribe YAML; use positive declarative present tense
