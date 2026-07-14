---
metadata:
  version: 1.0.0
---

## Capability

Apply the user's amendment direction to the investigation plan — adjust area boundaries, coverage, or probe selection — and re-present the amended plan for approval, keeping the plan artifact authoritative through every revision.

## Inputs

### investigation_areas

The current derived areas being amended.

### probe_budget_per_area

Maximum probes plannable per area; amendments stay within two to this many probes per area.

## Outputs

### investigation_areas

The amended area list, re-emitted for the next approval pass and for the area-probe loop.

### investigation_plan

The amended plan document, updated in place.

#### artifact

`investigation-plan.md`

## Protocol

### 1. Apply Amendment

- Interpret the user's amendment direction — captured from the amend response at the investigation-plan-approved checkpoint: which areas, coverage, or probes to change and how — against the current `{investigation_areas}`: add, merge, split, or drop areas; adjust per-area probe selections — staying within two to `{probe_budget_per_area}` probes per area; re-ground any changed area in the [subsystem-map](../../resources/subsystem-map.md).

### 2. Update Plan

- Update `{investigation_plan}` in place — revised area table and rationale, plus an Amendments section recording what changed this pass and why — and re-emit `{investigation_areas}` for re-approval.
