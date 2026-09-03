---
metadata:
  version: 1.0.0
---

## Capability

Human DCO attestation recorded once per work package in `provenance-log.md`.

## Inputs

### attestation_option

One of: `certify` | `flag-legal` — the human's DCO certification selection

#### default

`certify`

### legal_review_note

*(optional)* The concern text provided by the user — present only when `{attestation_option}` is `flag-legal`

## Outputs

### provenance_log

The updated provenance log, with the attestation section appended


## Protocol

1. Read the certifier identity from `git config user.name` and `git config user.email` at the moment of attestation, so the record carries the identity that will author the commits rather than a value captured earlier in the run.
2. Append an `## Attestation` section to the `{provenance_log}` containing: ISO 8601 timestamp, the certifier identity as `name <email>`, and the selected option.  
   > Record the attestation only after the human has explicitly selected `certify` or `flag-legal`. The attestation is a record of a human decision; it must never be synthesised ahead of that decision.
   > - If attestation is requested before the human has made an explicit `certify` or `flag-legal` selection, do not append — wait for the selection first.
   > - If `provenance-log.md` does not exist at this point — meaning no task rows were appended during the work package — surface this to the user: a missing log means something went wrong during task work, so investigate the missing rows before retrying.
3. If `attestation_option = flag-legal`, include a `Legal Review Note` field with the provided `{legal_review_note}` text.
