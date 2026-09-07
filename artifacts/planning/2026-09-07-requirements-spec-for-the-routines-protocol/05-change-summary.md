# Change Summary — Routines Protocol Requirements Specification

**Source**: SRC-DOC001 — Routines — proposal (Mike Clay) · SRC-DOC002 — What this folder owes before planning starts (Mike Clay) · SRC-DOC003 — Routines — decision record (Mike Clay)
**Validation**: passed after 3 correction passes

The specification did not exist, so all 83 entries are new and each carries status `pending`. Numbering is contiguous within every category, so each group below accounts for all of its identifiers.

## New Requirements

- SUCCESS-001 to SUCCESS-007: key success criteria for a shared, named run of steps.
- REQ-F001 to REQ-F009, REQ-F052, REQ-F053: the routine definition, its declaration shapes, and its signature boundary.
- REQ-F010 to REQ-F017: the reference site, argument and output binding, name resolution, and nesting.
- REQ-F018 to REQ-F026: materialisation, substitution, identifier generation, and load order.
- REQ-F027 to REQ-F033: the contract boundary and the variable declaration merge.
- REQ-F034 to REQ-F036: where a routine lives and how placement is computed.
- REQ-F037, REQ-F038: artifact prefixes and the single-reference limit on an artifact-declaring routine.
- REQ-F039 to REQ-F042: what a routine may not do.
- REQ-F043 to REQ-F051: the two delivery representations, the drift guard, and the walker.
- REQ-NF001 to REQ-NF004: which form each guard audits, and the routine as its own name scope.
- REQ-NF005: load-time enforcement of the reference lifecycle.
- REQ-NF006 to REQ-NF008: worker, session, and unseeded-variable behaviour.
- REQ-NF009, REQ-NF010: governance, and the retirement of the fragment mechanism.
- REQ-NF011 to REQ-NF014: dispatch cost, delivered payload, delivery budget, and identifier length.
- REQ-NF015 to REQ-NF023: the seven delivery stages and their acceptance criteria.

## Sources Added

- SRC-DOC001: Routines — proposal — Mike Clay
- SRC-DOC002: What this folder owes before planning starts — Mike Clay
- SRC-DOC003: Routines — decision record — Mike Clay

## Validation

Five findings were raised across four passes and all five were resolved. None was critical. The per-pass detail is in [04-validation-report-3.md](04-validation-report-3.md) and its three predecessors.

Sections 6 and 7 carry `REQ-NF###` identifiers because the identifier scheme defines no performance or
project code. Every pass recorded this as conformant, and it is confirmed for promotion.

## Promotion

Final specification staged at: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-07-requirements-spec-for-the-routines-protocol/05-final-spec.md`

Promote to: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-07-requirements-spec-for-the-routines-protocol/03-routines-protocol-requirements.md`
