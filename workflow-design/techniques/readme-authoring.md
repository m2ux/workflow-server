---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Generate a workflow README in create mode, or update it in update mode: a root README with the workflow title, description, activity sequence table, mode descriptions, usage instructions, and resource links, reflecting any structural changes when updating.

## Protocol

### 1. Generate Or Update README

- In create mode, generate a new `README.md` with the workflow title, description, activity sequence table, mode descriptions, usage instructions, and resource links
- In update mode, update the existing `README.md` to reflect structural changes such as new activities, modified activity descriptions, or changed modes
