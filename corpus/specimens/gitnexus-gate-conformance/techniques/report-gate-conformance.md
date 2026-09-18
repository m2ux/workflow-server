---
metadata:
  version: 1.0.0
---

## Capability

State what each gated run measured, what its gate decided, and what that decision allowed.

## Inputs

### impact_report

What depends on the symbol the edit targets, at depth 1/2/3, with the execution flows reached and a risk level.

### edit_approved

Whether the measured blast radius was accepted at the gate.

### changes

The per-file edit list a rename preview produced.

### rename_approved

Whether the previewed edit list was accepted at the gate.

### change_report

The symbols and execution flows the applied rename moved, read back off the diff.

## Outputs

### gate_conformance_report

Per gated run: the measurement it took, whether a gate was presented, the answer it received, and what followed.

#### artifact

`gitnexus-gate-conformance-report.md`

#### audience

`human`

## Protocol

1. Record the edit gate against `{impact_report}` and `{edit_approved}`: the rating the measurement carried, whether that rating presented a gate at all, and the answer it took.
   > A rating below high presents nothing, so `{edit_approved}` holding its seeded value is the run passing rather than a gate being skipped. Say which of the two this run was.
2. Record the rename gate against `{changes}`, `{rename_approved}` and `{change_report}`: the edits the preview listed, the answer the gate took, and whether a diff followed.
   > `{change_report}` is absent where the gate refused, because the steps after it carry the answer. An absent report beside a refusal is the run behaving; an absent report beside an acceptance is not.
3. Write `{gate_conformance_report}` to `{planning_folder_path}` per [Template](../resources/conformance-report.md#template), with [Rules](../resources/conformance-report.md#rules) governing what each row may claim.
