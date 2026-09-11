---
metadata:
  version: 1.0.0
---

## Capability

Keys of the findings a prior pass already accepted or baselined, normalised into one comparable form.

## Outputs

### known_finding_keys

One key per already-accepted finding, each pairing the criteria entry by its kebab-case name with the location it was recorded against, in the single form a criteria walk compares against. Empty when no baseline and no prior register carry an entry for this target.

## Protocol

### 1. Read the Known-Finding Sources

- Read the guard baselines the repository commits under `scripts/` — binding fidelity, review-mode gating, identifier qualification and audience — taking only the entries whose location falls inside the target
- Read the findings register a prior run of this workflow left in `{planning_folder_path}`, taking the rows it records as accepted

### 2. Reduce to Comparable Keys

- Reduce every entry read to a key pairing its criteria entry name with its location, discarding the shape differences between the sources so one comparison serves them all
- Where a source names a violation class rather than a criteria entry, key it on the class and record that in the key, so a walk can tell an entry-keyed exclusion from a class-keyed one

## Rules

### known-is-not-absent

A known finding is excluded from the decision surface, never from the record. A key that suppresses a finding must remain readable as a suppression, so a later pass can ask whether the acceptance still holds.
