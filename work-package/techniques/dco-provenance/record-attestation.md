---
metadata:
  version: 1.0.0
---

## Capability

Append the DCO attestation section to `provenance-log.md`, recording the human's certification. Runs once per work package.

## Inputs

### certifier_name

Display name from `git config user.name`

### certifier_email

Email from `git config user.email`

### option

One of: `certify` | `flag-legal` — the human's DCO certification selection

#### default

`certify`

### legal_review_note

*(required only when option = flag-legal)* The concern text provided by the user

## Output

### provenance_log

The updated provenance log, with the attestation section appended

## Protocol

1. Append an `## Attestation` section to the `{provenance_log}` containing: ISO 8601 timestamp, certifier identity (`{certifier_name} <{certifier_email}>`), and the selected option.  
   > Record the attestation only after the human has explicitly selected `certify` or `flag-legal`. The attestation is a record of a human decision; it must never be synthesised ahead of that decision.
   - If attestation is requested before the human has made an explicit `certify` or `flag-legal` selection, do not append — wait for the selection first.
   - If `provenance-log.md` does not exist at this point — meaning no task rows were appended during the work package — surface this to the user: a missing log means something went wrong during task work, so investigate the missing rows before retrying.
2. If `option = flag-legal`, include a `Legal Review Note` field with the provided `{legal_review_note}` text.
