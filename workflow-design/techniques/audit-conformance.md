---
metadata:
  version: 1.1.0
---

## Capability

Audit drafted content for convention conformance against reference workflows — file naming, field ordering, version format, transition patterns, checkpoint structure, technique structure, and documentation voice — flagging each divergence and deciding whether it is justified or should be brought into conformance.

## Outputs

### conformance_finding_count

Count of conformance divergences — each a divergence with its file, the diverging construct, the reference convention, and the justified/bring-into-conformance disposition. Interpolated into the conformance-confirmed checkpoint message.

## Protocol

### 1. Audit Conformance

- Compare against reference workflows for file naming (`NN-name.yaml`), field ordering, version format (`X.Y.Z`), transition patterns, checkpoint structure, and technique structure
- Flag every divergence; for each, decide whether the divergence is justified or should be brought into conformance
- Where drafted content uses different naming or structural patterns than existing workflows, identify the divergence against the reference workflows and align with the established conventions
- Check documentation voice: every prose passage states what the system does, in positive declarative present tense — describing current behaviour and structure. Rewrite passages that state what the system avoids, or that compare the design to a prior or alternative one, as positive statements of current behaviour. Scan the drafted lines for these markers: `not`, `never`, `no longer`, `instead of`, `rather than`, `do not`, `— not X`. Planning artifacts under `artifacts/planning/` are exempt, since they record evolution by design.

### 2. Present Findings

- Present the conformance-pass results to the user: conventions followed, conventions diverged, and the justification status for each divergence
