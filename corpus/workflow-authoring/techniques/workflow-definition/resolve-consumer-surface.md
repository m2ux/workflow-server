---
metadata:
  version: 1.2.0
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

- Where the corpus is indexed — [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[resolve-graph](../../../meta/techniques/gitnexus-operations/resolve-graph.md) names the graph holding it — apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[reference-lookup](../../../meta/techniques/gitnexus-operations/reference-lookup.md) on each file of the target and take its `{referencing_files}` as the link-borne consumers. They come back exactly, and the sweep below narrows to the forms a link does not carry
- Sweep every workflow directory other than `{target_workflow_id}` for references that resolve into it: step and activity technique binds carrying it as their leading segment, technique Protocol Apply and `::` addresses, resource references qualified with it, and activity file references borrowed from it. Where the graph answered above, markdown links are already enumerated; where it did not, they are swept here too

### 2. Resolve Each Reference Against the Change Surface

- For each reference, resolve the file it names inside the target and record whether that file appears in `{changed_files}` (touched or I/O-contract closure)
- A reference resolving to a change-surface file is a consumer this change can break; the **referencing file** joins the change surface as a whole file and belongs in the surface a criteria walk covers

## Rules

### absence-is-a-result

An empty surface is a finding about reach, not a failure to look. Record that the sweep ran and found nothing rather than leaving the value unproduced, because a reader cannot tell an unproduced surface from a target nothing depends on.
