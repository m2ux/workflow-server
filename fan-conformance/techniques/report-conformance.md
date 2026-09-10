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

### survey_tree_outputs

The tree survey's branch container: one slot per entry of `{survey_plan.roots}`, in that order. It came from the same destination as the two above, which named their activities directly and fanned this one over a collection.

### survey_plan

The plan the run opened with. Its `roots` are the ids the tree container's slots are expected to carry.

### note_targets

The notes the run chose to commit, each with the branch its writer landed it on. Empty where no probe found anything worth a note, which is the run that routed past the writers.

### run_started_at

The instant the run began, which every branch's own start is read against.

### merge_report

What became of each branch the isolated writers committed — merged, conflicted, or empty. Empty of rows where no probe found anything worth a note and the run routed past the writers.

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
- For the homogeneous fan, record one row per entry of `{probe_targets}`: the entry's id, the `probe_id` the slot reports back, and whether the two agree. A slot reporting a designator other than the one its unit was handed is the finding this run exists to catch, and [a-mismatch-is-not-reconciled](../resources/conformance-report.md#a-mismatch-is-not-reconciled) governs how the row is written.

### 3. Report The Overlap

- Put every branch's `started_at` and `finished_at` on one axis against `{run_started_at}` and state, per fan, whether the branches' intervals overlap.
- Overlapping intervals are a batch; intervals that abut end-to-start are a queue, meaning the branches ran one after another. Both are outcomes the routing permits, and [state-the-reading-not-the-design](../resources/conformance-report.md#state-the-reading-not-the-design) governs how each is written.
- Record the wall clock each fan took as the span from its earliest branch start to its latest branch finish, and the total of the branches' own durations beside it. The difference between the two is what the batch bought.

### 4. Report What The Isolated Writers Committed

- Record one row per entry of `{merge_report}`: the unit, the branch it committed on, and whether that branch merged, conflicted or held nothing. A conflict is printed with its paths and left as a conflict, per [a-conflict-is-reported-not-absorbed](../../meta/techniques/version-control/merge-branches.md#a-conflict-is-reported-not-absorbed).
- Where the run routed past the writers, say so in one line and give no table. No probe finding anything worth a note is an outcome of the run rather than a stage that failed, and an empty table reads as writers that produced nothing.

### 5. Write The Report

- Write `{conformance_report}` to `{planning_folder_path}` following [Template](../resources/conformance-report.md#template), with the [Rules](../resources/conformance-report.md#rules) governing what each section may claim.
