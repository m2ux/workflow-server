---
metadata:
  version: 1.2.0
---

## Capability

JSON-schema and loader reference-resolution validation across a workflow's YAML files.

## Outputs

### pass_count

Count of YAML files that passed schema validation.

### fail_count

Count of YAML files that failed schema validation.

## Protocol

### 1. Validate YAML Schemas

- Run `npx tsx scripts/validate-workflow-yaml.ts <workflow-path>` on every YAML file (`workflow.yaml`, activity files, technique files), where `<workflow-path>` is the workflow directory **inside the tree under review**
- Record pass/fail per file with the validator's error message; resolve every failure
- Set `{pass_count}` and `{fail_count}`

### 2. Check Technique References

- Run `npx tsx scripts/check-all-refs.ts --root <workflows-dir>` to verify every `step.technique` reference resolves through the loader
- `<workflows-dir>` is the corpus root of the tree under review. Every guard resolves its corpus as `--root` > `WORKFLOWS_DIR` > the server checkout's own `workflows/`, so an omitted root measures that checkout and reports a clean pass on definitions the review never looked at

### 3. Check Binding Fidelity

- Run `npx tsx scripts/check-binding-fidelity.ts --root <workflows-dir>` to verify the change introduces no new binding drift — every `step.technique.inputs` key is a declared input, and every interpolation/condition read resolves to a producer (a declared id, a dollar-prefixed step-local, a `workflow.yaml` variable, or a set-target)
- A finding the guard has no verdict for is reported as untriaged. Give it one in `scripts/binding-fidelity-triage.json` — `harmless`, `fix-later`, or `live-bug`, each against a named rationale — so an accepted finding and a real defect stop being the same silence. Classification is a human judgement: there is no flag that suppresses a finding without one
