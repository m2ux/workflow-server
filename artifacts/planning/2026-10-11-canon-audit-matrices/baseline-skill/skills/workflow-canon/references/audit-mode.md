# Audit Mode

Reviews existing definitions: enumerates the units, walks them over the surface, attributes each finding, verifies the Highs, and reports. A single canon question uses the bounded procedure below.

## Prerequisites

Read the [canon prerequisites](canon-context.md#prerequisites), then its [terms](canon-context.md#terms).

## Canon Question

For a single question about an entry, locate its [canon home](canon-context.md#homes), [fetch the entry](commands.md#fetch-unit) with its required context, answer and stop. The full audit procedure applies when the request calls for a conformance judgment over definitions.

## Procedure

1. **Scope the surface.**
   - Read the [criteria context](canon-context.md#criteria).
   - Write each list in [scope](canon-context.md#scope) before the first unit. The walk consumes the lists.
   - A count is a summary of one. An existence claim holds over the list it was resolved against.
2. **Run the checks first.**
   - Select the project's [checks](canon-context.md#checks), preferring a delta run when it can compare the base and candidate under equivalent conditions.
3. **Enumerate units.**
   - Enumerate every unit the [canon inventory](canon-map.md#unit-inventory) gives an Audit, using [List Units](commands.md#list-units) on each home at the commit audited.
   - Apply each entry as written.
4. **Walk.**
   - Walk the units per [Walk](#walk) and the required walk rules.
   - An audit that cannot read the change surface in one pass splits the unread change-surface paths across sub-agents, in disjoint slices.
   - The parent keeps the ledger in [Walk](#walk).
   - Every sub-agent return follows [Rules](#rules).
5. **Attribute.**  Give each finding its origin per [Attribution](#attribution).
6. **Verify Highs.**
   - Re-derive each High from the cited file and the entry alone. Withdraw what that re-derivation does not reproduce. Downgrade what supports only a lesser issue.
   - Spot-confirm Mediums: the construct exists and the class is right.
   - Only confirmed findings drive fixes.
7. **Report.**
   - Read [Report Context](reporting.md#report-context) for bands, severity, row fields and coverage.
   - Report in the layout [Which Report](reporting.md#which-report) names.
8. **File a mechanised Detect.**
   - A Detect applied by pattern is a guard candidate. Name what it keys on and record it against the registry in the report; external filing follows existing user authority.
   - The threshold is the second occurrence: twice in one walk, or once in each of two consecutive walks. A `fix` finding counts.

## Walk

- **Reach.**
  The whole of every change-surface file, and the other surface files so a pre-existing defect stays attributable.
- **Ledger.**
  - Each unit is `walked`, `not-applicable` (the unit's own wording), or `blocked` (what prevented the walk). Only `blocked` is missing coverage.
  - `walked` where the unit meets the change surface needs field-level evidence on each whole file in that intersection.
  - Evidence at the hit and an assertion over the rest is `blocked` for the remainder, with the path count.
- **Paths.**
  - Each worklist path is `read` (whole file) or `unread`.
  - A search names files; it does not dispose a directory.
  - Reconcile per [File Coverage](reporting.md#file-coverage).

## Attribution

- **`diff`**
  A touched file, or a break that exists because an I/O contract on the change surface changed, including a stale bind or Apply in an untouched referencer or consumer.
- **`pre-existing`**
  The same construct and evidence at the base ref, independent of an I/O contract change on this surface.
- **`known`**  A prior pass accepted this key. Keep the row. Leave it out of the decision surface.
- **`fix`**
  Text written in this pass to close a finding. Closed within the pass by [Author](author-mode.md), never reported open.

## Rules

- **Remediation.**
  Confirmed findings go to [Author](author-mode.md) when fixing them is within the user's request. A review-only request reports the finding and any criterion correction without editing definitions, canon entries or exemption surfaces.
- **Continue.**
  When unread paths remain, a sub-agent return, including one with no new finding, is followed by the next unread slice in the same turn.
  - Record what that slice read, and fold any finding, before the next slice starts.
  - A note that the slice needs nothing further does not end the audit.
- **Stop.**
  The audit ends when the ledger is closed, or when the user says stop.
  - The ledger is closed when every change-surface path is read whole and every criterion is `walked`, `not-applicable`, or `blocked` with a reason.
