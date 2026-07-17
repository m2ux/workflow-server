---
metadata:
  version: 1.2.0
---

## Capability

Audit drafted content for convention conformance against reference workflows — apply the convention-conformance checklist (naming, field order, structure), flag each divergence, and decide whether it is justified or should be brought into conformance. Definition prose voice is out of scope for this pass.

## Outputs

### conformance_finding_count

Count of conformance divergences — each a divergence with its file, the diverging construct, the reference convention, and the justified/bring-into-conformance disposition. Interpolated into the conformance-confirmed checkpoint message.

## Protocol

### 1. Load Conventions

- Load [convention-conformance](../resources/convention-conformance.md) — sole source of reference-convention criteria for this pass
- Do not restate that checklist here; follow it as written

### 2. Survey Reference Workflows

- Survey reference workflows of similar type (via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) / orchestrator-supplied definitions) as the live pattern baseline

### 3. Audit Conformance

- Compare drafted `workflow.yaml`, activities, techniques, resources, and READMEs against the reference baseline using every concern in convention-conformance
- For each divergence: record file, construct, reference convention, and disposition (justified vs bring into conformance)

### 4. Present Findings

- Present conventions followed, conventions diverged, and justification status for each divergence

### 5. Set Findings Count

- Set `{conformance_finding_count}` to the number of findings
