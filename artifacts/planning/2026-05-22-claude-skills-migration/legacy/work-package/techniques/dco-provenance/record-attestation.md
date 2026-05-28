# record-attestation

Append the attestation section to provenance-log.md at the dco-sign-off checkpoint. Runs once per work package, after task work is complete.

## Inputs

- **certifier_name** — Display name from `git config user.name`
- **certifier_email** — Email from `git config user.email`
- **option** — One of: `certify` | `flag-legal`
- **legal_review_note** — *(required only when option = flag-legal)* The concern text provided by the user

## Output

- **provenance_log_path** — Path to the updated provenance-log.md

## Procedure

1. Do NOT record the attestation until the human has explicitly selected `certify` or `flag-legal` at the dco-sign-off checkpoint.
2. Append an `## Attestation` section to provenance-log.md containing: ISO 8601 timestamp, certifier identity (`{certifier_name} <{certifier_email}>`), and the selected option.
3. If `option = flag-legal`, include a `Legal Review Note` field with the provided `legal_review_note` text.

## Errors

### log_missing

**Cause:** provenance-log.md does not exist at record-attestation time — no task rows were appended during the work package

**Recovery:** Surface to the user — record-attestation runs at sign-off after task work; if no task rows exist, something went wrong with the implement loop. Retry only after the missing rows are investigated.

### attestation_without_sign_off

**Cause:** Attestation requested without the dco-sign-off checkpoint having received an explicit user selection

**Recovery:** Surface the dco-sign-off checkpoint and wait for the user's `certify` or `flag-legal` selection before retrying
