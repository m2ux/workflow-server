---
metadata:
  version: 1.2.0
---

## Capability

Root `README.md` that orients readers to the workflow's purpose, structure, and links.

## Outputs

### workflow_readme

The workflow root README (create: generate; update: revise for structural changes)

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Generate Or Update README

- When `{operation_type}` is `create`, write `{workflow_readme}` fresh; when `update`, revise the existing README for structural changes (activities, modes, links).
- Orientation stance: [Complete Documentation Structure](/canon/resources/design-principles.md#11-complete-documentation-structure) and `readme-orients-not-transcribes` — do not transcribe YAML.
