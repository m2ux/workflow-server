---
metadata:
  version: 1.0.0
---

## Capability

A recommendation, with its reason, on whether a change warrants the full prism pipeline or the single inline structural pass.

## Inputs

### changed_files

The set of files the change touches.

### base_branch

The branch the change is measured against.

## Outputs

### prism_value_assessment

One or two sentences that open with the recommendation — run the full pipeline, or use the inline pass — and name the signal that decided it.

## Protocol

### 1. Read the Change

- Measure the change in `{target_path}` against `{base_branch}`: the files in `{changed_files}`, the lines added and removed, and the functional areas those files belong to.
- Read the paths the change alters for state that is created and must be reclaimed, agreement between nodes, authority checks, and data that must survive an upgrade.

### 2. Weigh the Signals

- Recommend the full pipeline where either signal holds:
  > - The change alters a path that creates state, reaches agreement between nodes, checks authority, or persists data across an upgrade.
  > - The change reaches more than one functional area.
- Recommend the inline pass where neither holds.

### 3. State the Recommendation

- Write `{prism_value_assessment}`: the recommendation, the signal that decided it, and what the full pipeline adds for this change over the one structural lens the inline pass applies — its isolated adversarial and synthesis passes and a consolidated report.
