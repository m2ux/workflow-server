---
metadata:
  version: 1.0.0
---

## Capability

Compose the `steps_complete` envelope for the activity this context carried, from what executing its steps made observable.

## Outputs

### steps_result

The `steps_complete` envelope, returned as one tagged object whose `result_type` says which kind it is:

#### result_type

discriminant literal `steps_complete`; sibling envelope is `checkpoint_pending`.

#### steps_completed

array of completed step entries, one per step this activity ran, a loop body contributing one entry per step per iteration.

#### checkpoints_responded

array of checkpoint responses (`option_id` + effects) this activity answered.

#### variables_changed

map of every bag key this activity mutated, to the value it holds.

#### artifacts_produced

array of artifact entries (`id`, `name`, `path`) this activity wrote.

#### selected_exit

optional — the exit id a checkpoint option named, set where a checkpoint effect carried one.

#### batch_may_continue

whether this context may take another activity, as its standing reports.

#### activity_definition

the activity definition this delivery carried, with its exits.

#### exit_destinations

the exit map that delivery carried, keyed by exit id.

## Protocol

### 1. Name What Ran

- Set `{$steps_completed}` to one entry per step this activity ran, `{$checkpoints_responded}` to the gates it answered, and `{$artifacts_produced}` to the artifacts it wrote.
  > A loop body contributes one entry per step per iteration, in the order the passes ran.

### 2. Read Bag Writes

- Set `{$variables_changed}` to every bag key this activity mutated: each declared step output landed under its declared id, or under the remapped name where the step remaps it, together with any checkpoint `setVariable` effect already applied.
  > The context that executed the steps is the one that saw them land, so this reading is made here and nowhere later.

### 3. Carry The Delivery

- Set `{$batch_may_continue}` from this context's standing, `{$activity_definition}` to the definition this delivery carried, and `{$exit_destinations}` to its exit map.
  > Where a checkpoint answer named an exit, set `{$selected_exit}` to the exit it named.

### 4. Return Steps Complete

- Fold those values into the `steps_complete` object and return it as `{steps_result}`.

## Rules

### the-exit-destination-is-not-read-here

This technique reports the exit the activity took and the destinations its delivery carried. Which destination the run goes to is read by the side that holds the graph, and no reading of it belongs in this envelope.

### a-bag-write-is-reported-by-the-context-that-made-it

Only the context that executed the steps can say which bag keys they landed. An envelope composed anywhere else carries whatever that place could observe, which is not the activity's writes.

### no-readme-persist-on-worker

This technique does not sync the planning-folder README, does not commit or push engineering artifacts, and does not wait for that work.
