---
metadata:
  version: 1.2.0
---

## Capability

Audit drafted content for convention conformance against reference workflows — apply the convention-conformance checklist, flag each divergence, and decide whether it is justified or should be brought into conformance.

## Outputs

### conformance_finding_count

Count of conformance divergences — each a divergence with its file, the diverging construct, the reference convention, and the justified/bring-into-conformance disposition. Interpolated into the conformance-confirmed checkpoint message.

## Protocol

### 1. Load Conventions

- Load [convention-conformance](../resources/convention-conformance.md) — sole source of reference-convention and documentation-voice criteria for this pass
- Do not restate that checklist here; follow it as written
- Survey reference workflows of similar type (via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) / orchestrator-supplied definitions) as the live pattern baseline

### 2. Audit Conformance

- Compare drafted `workflow.yaml`, activities, techniques, resources, and READMEs against the reference baseline using every concern in convention-conformance
- For each divergence: record file, construct, reference convention, and disposition (justified vs bring into conformance)
- Apply the documentation-voice section to definition prose (planning artifacts exempt per the resource)

### 3. Present Findings

- Present conventions followed, conventions diverged, and justification status for each divergence
- Set `{conformance_finding_count}` to the number of findings
