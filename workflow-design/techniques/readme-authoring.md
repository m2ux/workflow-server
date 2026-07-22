---
metadata:
  version: 1.0.0
---

## Capability

Root `README.md` that orients readers to the workflow's purpose, structure, and links.

## Inputs

### operation_type

The classified operation. When `update`, the README is updated in place to reflect structural changes; when `create`, it is generated fresh.

## Outputs

### workflow_readme

The workflow root README (create: generate; update: revise for structural changes)

#### artifact

`README.md`

## Protocol

### 1. Generate Or Update README

- Create: write `{workflow_readme}` fresh. Update: revise the existing README for structural changes (activities, modes, links).
- Orientation stance: [design-principles](../resources/design-principles.md) §11 and `readme-orients-not-transcribes` — do not transcribe YAML.
