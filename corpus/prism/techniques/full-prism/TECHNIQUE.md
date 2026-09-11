---
metadata:
  version: 2.4.0
---

## Capability

The Full Prism passes that follow the structural pass, each executed in its own isolation model. The contract contributes the prior-pass context every pass reads and the lens-is-program invariant every pass runs under.

## Inputs

### prior_artifact_paths

*(optional)* Ordered file paths to the prior-pass artifacts this pass consumes as context; empty for the first pass.

## Rules

### lens-is-program

The lens resource is an imperative program. Execute its operations in order, producing the output each operation requests.
