---
metadata:
  version: 1.4.1
---

## Capability

Convention-conformance audit of drafted workflow content against sibling reference workflows.

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

- Survey similar-type reference workflows via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) (orchestrator-supplied definitions — [orchestrator-no-domain-work](../../meta/techniques/agent-conduct.md#orchestrator-no-domain-work))

### 3. Audit Conformance

- Compare drafted `workflow.yaml`, activities, techniques, resources, and READMEs against the reference baseline using every concern in convention-conformance
- For each divergence: record file, construct, reference convention, and disposition (justified vs bring into conformance) into `{conformance_findings}`
- Definition prose voice is out of scope for this pass

### 4. Persist Findings

- Set `{conformance_finding_count}` to the number of findings
- When `{conformance_finding_count}` is greater than zero: persist `{conformance_findings}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `conformance-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{conformance_findings_path}`
- When `{conformance_finding_count}` is zero: leave `{conformance_findings_path}` empty
