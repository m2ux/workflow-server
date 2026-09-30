---
metadata:
  version: 1.0.1
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

### 1. Read the Change

- Group `{changed_file_entries}` by the top-level module or package each file belongs to — these are the change's functional areas.
- Read the paths the change alters in `{target_path}` for state that is created and must be reclaimed, agreement between nodes, authority checks, and data that must survive an upgrade.

### 2. Weigh the Signals

- Recommend the full pipeline where either signal holds:
  > - The change alters a path that creates state, reaches agreement between nodes, checks authority, or persists data across an upgrade.
  > - The change reaches more than one functional area.
- Recommend the inline pass where neither holds.
- Name what the adversarial pass would contest and the synthesis pass would reconcile in the paths the deciding signal names, or that neither has a path to work on.
- Emit `{prism_value_assessment}`.
