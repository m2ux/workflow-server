---
metadata:
  version: 1.2.0
---

## Capability

Execute the planned probes for one investigation area — source tracing, code-graph queries, metadata comparison, or runtime/SCALE checks per the [probe-catalog](../../resources/probe-catalog.md) — within the probe budget, degrading gracefully where a toolchain gate is false, and emit the area's evidence record.

## Inputs

### current_area

The investigation area for this iteration — its `planned_probes`, `subsystems`, and `changed_files` drive probe execution.

### gitnexus_available

Routes code-graph probes: true routes through the meta `gitnexus-operations` group (`query`, `context`, `impact`, `diff-coverage-map`); false degrades them to grep and full-file reads.

### cargo_available

Gates build and metadata probes; false records them as blocked validations.

### node_binary_available

Gates runtime and SCALE-metadata probes; false records them as blocked validations.

## Outputs

### area_evidence_collection

The gathered collection of per-area evidence records — this iteration appends its record in area order. Each record carries:

#### area_id

The area this record belongs to.

#### probes_executed

Each executed probe: catalog entry, instrument used (capability path or fallback), and outcome.

#### evidence_items

Concrete observations with anchors — file:line references, command output, or graph query results.

#### blocked_validations

Probes that could not run because a toolchain gate is false — the probe, the missing instrument, and what it would have validated.

#### candidate_findings

Preliminary issue candidates surfaced by this area's evidence, with their supporting anchors, for adjudication.

## Protocol

### 1. Execute Probes

- Execute `{current_area}.planned_probes` in plan order, at most `{probe_budget_per_area}` probes; the budget is a hard stop, not a target — stop early once the area's planned validations are answered.
- Route each probe by its catalog class: code-graph probes through `gitnexus-operations` when `{gitnexus_available}` is true, otherwise grep and full-file reads; build/metadata probes only when `{cargo_available}` is true; runtime and SCALE-metadata probes only when `{node_binary_available}` is true. Cross-record correlation questions run as P7 (source trace of each join-key to its origin with a mandatory join-key discharge table). Downstream-caller propagation questions run as P8a (error propagation from changed callee through caller control flow). Post-call storage questions run as P8b (caller persistent-state mutations after a non-propagating call — the accounting-consumed-before-success class). Operational-tooling questions run as P9 (subsystem-map entrypoints and advertised-control verification). P8a and P8b each consume one probe slot per enumerated caller for the relevant half.
- Record a blocked validation for every probe whose gate is false — what could not be validated and with which instrument — and continue; a blocked probe never fails the area.

### 2. Record Evidence

- Record each probe's concrete observations as evidence items with anchors (file:line, command output, or graph result). An expectation without an anchor is not evidence.
- Flag candidate findings where evidence contradicts expected behavior, with their anchors; grading and disposition belong to adjudication, not here.
- Discharge every failure-class obligation the plan carried for this area using three-way disposition: **confirmed** (a candidate finding with its anchor), **refuted** (proof the failure mode cannot occur — join keys agree, caller storage is atomic, or the claimed defect path is unreachable), or **inconclusive** (evidence insufficient; never silently treated as refuted). Record **blocked** when a toolchain gate prevented validation. P7 refutations require a side-by-side join-key origin table; P8a/P8b refutations require a per-caller path anchor. An area does not close with a planned failure-class obligation left unaddressed.
- Append this area's record to `{area_evidence_collection}` for the gather.
