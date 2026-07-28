---
metadata:
  version: 1.0.0
---

## Capability

The references other workflows hold into one target, resolved against the files this run changed.

## Inputs

### changed_files

The definition files of the target that differ from the run's base ref.

## Outputs

### consumer_surface

One entry per reference another workflow holds into the target: the referencing file, the reference form it uses, the target file it resolves to, and whether that file is one this run changed. Empty when nothing outside the target references it.

## Protocol

### 1. Find the References Into the Target

- Sweep every workflow directory other than `{target_workflow_id}` for references that resolve into it: step and activity technique binds carrying it as their leading segment, resource references qualified with it, and activity file references borrowed from it

### 2. Resolve Each Reference Against the Change

- For each reference, resolve the file it names inside the target and record whether that file appears in `{changed_files}`
- A reference resolving to a changed file is a consumer this change can break, and belongs in the surface a criteria walk covers

## Rules

### absence-is-a-result

An empty surface is a finding about reach, not a failure to look. Record that the sweep ran and found nothing rather than leaving the value unproduced, because a reader cannot tell an unproduced surface from a target nothing depends on.
