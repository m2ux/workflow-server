---
metadata:
  version: 1.1.0
---

## Capability

The references other workflows hold into one target, resolved against the change surface (whole touched files closed under I/O-contract referencers).

## Inputs

### changed_files

The change surface for this target: whole touched files plus I/O-contract closure. Consumers that resolve into this set join the walk.

## Outputs

### consumer_surface

One entry per reference another workflow holds into the target: the referencing file, the reference form it uses, the target file it resolves to, and whether that target file is on `{changed_files}`. Empty when nothing outside the target references it. Every referencing file whose resolved target is on `{changed_files}` is itself part of the change surface the criteria walk covers (whole file).

## Protocol

### 1. Find the References Into the Target

- Sweep every workflow directory other than `{target_workflow_id}` for references that resolve into it: step and activity technique binds carrying it as their leading segment, technique Protocol Apply / `::` / markdown links, resource references qualified with it, and activity file references borrowed from it

### 2. Resolve Each Reference Against the Change Surface

- For each reference, resolve the file it names inside the target and record whether that file appears in `{changed_files}` (touched or I/O-contract closure)
- A reference resolving to a change-surface file is a consumer this change can break; the **referencing file** joins the change surface as a whole file and belongs in the surface a criteria walk covers

## Rules

### absence-is-a-result

An empty surface is a finding about reach, not a failure to look. Record that the sweep ran and found nothing rather than leaving the value unproduced, because a reader cannot tell an unproduced surface from a target nothing depends on.
