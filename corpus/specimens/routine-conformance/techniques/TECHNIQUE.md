---
metadata:
  version: 1.0.0
---

## Capability

Shared inputs and invariants for the routine conformance measurements — the cheap directory reads each pass applies, and the contract every measurement owes the run that binds it.

## Inputs

### component_path

Path of the component being probed, relative to the host repository. `.` for a regular repository, the submodule path for a monorepo.

## Rules

### a-measurement-answers-under-one-name

Every measurement a site can supply reports under `probe_result`, carrying `entry_count` and `next_target`. The run reads what it bound without knowing which measurement it bound, so a measurement answering under a name of its own is one the run's own gates cannot see — and the site, which chose the measurement, is not where those gates are written.

### name-the-next-target-or-none

A measurement names the target to follow as `next_target`, and names null once nothing follows. The run has no second source for it: the loop it holds continues while a target is held, so a measurement that reports a target it has already reported is asking for a walk that never ends, and the iteration bound is what stops it rather than anything either side intended.

### probe-cheaply

Each measurement answers its question from directory listings alone and reads no file contents. The run exists to exercise the construct, so a measurement that costs more than the construct it demonstrates has changed what is being measured.
