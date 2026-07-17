---
metadata:
  version: 1.1.0
---

## Capability

Validate every YAML file in a workflow against its JSON schema and verify every reference resolves through the loader, recording per-file pass/fail with the validator's message and resolving failures.

## Outputs

### pass_count

Count of YAML files that passed schema validation.

### fail_count

Count of YAML files that failed schema validation.

## Protocol

### 1. Validate YAML Schemas

- Run `npx tsx scripts/validate-workflow-yaml.ts <workflow-path>` on every YAML file (`workflow.yaml`, activity files, technique files)
- Record pass/fail per file with the validator's error message; resolve every failure
- Set `{pass_count}` and `{fail_count}`

### 2. Check Technique References

- Run `npx tsx scripts/check-all-refs.ts` to verify every `step.technique` reference resolves through the loader

### 3. Check Binding Fidelity

- Run `npx tsx scripts/check-binding-fidelity.ts` to verify the change introduces no new binding drift — every `step.technique.inputs` key is a declared input, and every interpolation/condition read resolves to a producer (a declared id, a dollar-prefixed step-local, a `workflow.yaml` variable, or a set-target). It fails only on violations beyond the committed baseline; if a flagged change is intentional, re-snapshot with `--update-baseline`
