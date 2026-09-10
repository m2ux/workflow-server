---
metadata:
  version: 1.0.0
---

## Capability

Read both branch containers whole and write what the run did — which slots were filled, by which designator, over which interval, and whether the branches of each fan overlapped in time.

## Inputs

### probe_directory_outputs

The probe container: one slot per entry of `{probe_targets}`, in that order, each carrying its unit's id and that instance's reported values.

### survey_files_outputs

The file survey's branch container.

### survey_history_outputs

The history survey's branch container.

### run_started_at

The instant the run began, which every branch's own start is read against.

## Outputs

### conformance_report

What the run did, shaped by [Template](../resources/conformance-report.md#template).

#### artifact

`fan-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Read The Containers Whole

- Read `{survey_files_outputs}`, `{survey_history_outputs}` and `{probe_directory_outputs}` as they stand. Each holds one slot per branch in the order its collection named, so the correspondence is the container's own order — do not index a slot by a position authored here.

### 2. Report Each Fan's Shape

- For the heterogeneous fan, record which of the two activities filled its slot and which did not. Two containers, one slot each, is what that destination opens.
- For the homogeneous fan, record one row per entry of `{probe_targets}`: the entry's id, the `probe_id` the slot reports back, and whether the two agree. A slot whose reported designator differs from the one its unit was handed is the finding this run exists to catch, and it is reported as a mismatch rather than reconciled.

### 3. Report The Overlap

- Put every branch's `started_at` and `finished_at` on one axis against `{run_started_at}` and state, per fan, whether the branches' intervals overlap.
- Overlapping intervals are a batch. Intervals that abut end-to-start are a queue, and a queue is a correct result the report states plainly — it means the branches ran one after another, which the routing permits and the batch spawn is meant to avoid.
- Record the wall clock each fan took as the span from its earliest branch start to its latest branch finish, and the total of the branches' own durations beside it. The difference between the two is what the batch bought.

### 4. Write The Report

- Write `{conformance_report}` to `{planning_folder_path}` following [Template](../resources/conformance-report.md#template), with the [Rules](../resources/conformance-report.md#rules) governing what each section may claim.
