---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Validate every YAML file in a workflow against its JSON schema and confirm every reference resolves through the loader, recording per-file pass/fail with the validator's message and resolving failures before proceeding.

## Protocol

### 1. Run Schema Validation

- Run `npx tsx scripts/validate-workflow-yaml.ts <workflow-path>` on every YAML file (`workflow.yaml`, activity files, technique files)
- Record pass/fail per file with the validator's error message; resolve every failure before proceeding
- Run `npx tsx scripts/check-all-refs.ts` to confirm every `step.technique` reference resolves through the loader
- Run `npx tsx scripts/check-binding-fidelity.ts` to confirm the change introduces no new binding drift — every `step.technique.inputs` key is a declared input, and every interpolation/condition read resolves to a producer (a declared id, a dollar-prefixed step-local, a `workflow.yaml` variable, or a set-target). It fails only on violations beyond the committed baseline; if a flagged change is intentional, re-snapshot with `--update-baseline`
