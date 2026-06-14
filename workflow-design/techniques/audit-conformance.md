---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Audit drafted content for convention conformance against reference workflows — file naming, field ordering, version format, transition patterns, checkpoint structure, technique structure — flagging each divergence and deciding whether it is justified or should be brought into conformance.

## Protocol

### 1. Audit Conformance

- Compare against reference workflows for file naming (`NN-name.toon`), field ordering, version format (`X.Y.Z`), transition patterns, checkpoint structure, and technique structure
- Flag every divergence; for each, decide whether the divergence is justified or should be brought into conformance
- Where drafted content uses different naming or structural patterns than existing workflows, identify the divergence against the reference workflows and align with the established conventions

### 2. Present Findings

- Present the conformance-pass results to the user: conventions followed, conventions diverged, and the justification status for each divergence
