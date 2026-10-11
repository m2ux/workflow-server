---
metadata:
  version: 1.0.0
---

## Capability

Pick the directories worth probing from what both surveys saw together, and name each pick so its instance has a slot, a manifest row and an identity of its own.

## Inputs

### survey_files_outputs

The file survey's branch container: one slot, carrying that branch's reported values.

### survey_history_outputs

The history survey's branch container: one slot, carrying that branch's reported values.

### survey_tree_outputs

The tree survey's branch container: one slot per entry of `{survey_plan.roots}`, in that order, each carrying the root that instance walked and what it found there.

### survey_plan

The plan the run opened with. Its `roots` are the ids the tree container's slots are expected to carry, in the same order.

### probe_budget

How many directories to pick.

## Outputs

### probe_targets

One entry per probe, in probe order.

#### id

The probe's designator, `P1` through `Pn`. Names its slot in the branch container, its row in the gather manifest, and the instance that runs it.

#### directory

The directory path this probe covers, relative to `{component_path}`.

#### reason

Why this directory was picked — which survey put it forward, and on what.

## Protocol

### 1. Read Every Container

- Read the largest directories out of `{survey_files_outputs}` and the most active ones out of `{survey_history_outputs}`. Each holds a single slot, because the destination named those two activities directly.
- Read the per-root shapes out of `{survey_tree_outputs}`, which holds one slot per entry of `{survey_plan.roots}` because the same destination fanned that activity over them. Check each slot's reported root against the entry of `{survey_plan.roots}` at the same position; the two disagreeing is an instance served a sibling's element, and it is carried into the report as a disagreement.
- Read all three the same way. Whether a container came from an activity the destination named or from an instance it fanned, its shape is one slot per branch, so the mixture needs no special handling here. A container missing a slot's values is a branch that did not report, and is a fact for the report rather than something to work around.

### 2. Pick The Directories

- Choose exactly `{probe_budget}` distinct directories, preferring those more than one survey names — a directory that is large, moving and deeply nested is where a probe is worth the most. Fall back to the largest, then to the most active, when the overlap is smaller than the budget.
- A directory appears once. Two probes over one directory would land two slots describing the same thing and neither would be wrong, which makes the duplication invisible in the report.

### 3. Name Each Pick

- Emit `{probe_targets}` in probe order, each entry carrying `id` (`P1`-`Pn`), `directory`, and the `reason` it was picked. The graph fans this activity's exit over this list, so its length is how many instances open and the ids are what the report reads the container back by.
