---
metadata:
  version: 1.4.1
---

## Capability

Audit drafted content for convention conformance against reference workflows — apply the convention-conformance checklist (naming, field order, structure), flag each divergence with justified/bring-into-conformance disposition, and persist findings when any exist. Definition prose voice is out of scope for this pass.

## Outputs

### conformance_findings

Conformance divergences — each a divergence with its file, the diverging construct, the reference convention, and the justified/bring-into-conformance disposition.

#### artifact

`conformance-findings.md`

### conformance_finding_count

Count of entries in `{conformance_findings}`.

### conformance_findings_path

Absolute path to the persisted findings artifact when `{conformance_finding_count}` is greater than zero; empty otherwise.

## Protocol

### 1. Load Conventions

- Load [convention-conformance](../resources/convention-conformance.md) — sole source of reference-convention criteria for this pass
- Do not restate that checklist here; follow it as written

### 2. Survey Reference Workflows

- Survey reference workflows of similar type (via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) / orchestrator-supplied definitions) as the live pattern baseline

### 3. Audit Conformance

- Compare drafted `workflow.yaml`, activities, techniques, resources, and READMEs against the reference baseline using every concern in convention-conformance
- For each divergence: record file, construct, reference convention, and disposition (justified vs bring into conformance) into `{conformance_findings}`

### 4. Persist Findings

- Set `{conformance_finding_count}` to the number of findings
- When `{conformance_finding_count}` is greater than zero: persist `{conformance_findings}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `conformance-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{conformance_findings_path}`
- When `{conformance_finding_count}` is zero: leave `{conformance_findings_path}` empty
