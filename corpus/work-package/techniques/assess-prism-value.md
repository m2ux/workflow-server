---
metadata:
  version: 1.0.0
---

## Capability

A recommendation, with its reason, on whether a change warrants the full prism pipeline or the single inline structural pass.

## Inputs

### changed_file_entries

The files the change touches, each with its change status and the lines it adds and removes.

## Outputs

### prism_value_assessment

One or two sentences that open with the recommendation — run the full pipeline, or use the inline pass — name the signal that decided it, and state what the full pipeline's isolated adversarial and synthesis passes and consolidated report add for this change over the one structural lens the inline pass applies.

## Protocol

### 1. Read Change

- Group `{changed_file_entries}` by the top-level module or package each file belongs to — these are the change's functional areas.
  > An empty `{changed_file_entries}` measured no change. The assessment says so, names the measurement as the thing to repeat, and recommends neither pass.
- Read the paths the change alters in `{target_path}` for state that is created and must be reclaimed, agreement between nodes, authority checks, and data that must survive an upgrade.

### 2. Weigh Signals

- Recommend the full pipeline or the inline pass on two signals.
  > - Where the change alters a path that creates state, reaches agreement between nodes, checks authority, or persists data across an upgrade, or reaches more than one functional area, recommend the full pipeline.
  > - Where neither holds, recommend the inline pass.
- Name what the adversarial pass would contest and the synthesis pass would reconcile in the paths the deciding signal names, or that neither has a path to work on.
- Emit `{prism_value_assessment}`.
