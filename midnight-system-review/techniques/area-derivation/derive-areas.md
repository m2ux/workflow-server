---
metadata:
  version: 1.2.0
---

## Capability

Derive the investigation areas for this review by mapping the changed surface onto the subsystem map: cluster changed files into system-level areas, ground each area in subsystem knowledge, and plan a bounded probe set per area — producing the investigation plan the user approves before any probing starts.

## Inputs

### change_surface_inventory

The authoritative changed-file inventory produced at scope intake, read from the planning folder.

### probe_budget_per_area

Maximum probes plannable per area; plans select two to this many probes per area.

### insight_repo_path

*(optional)* Local path to a midnight-agent-eng insight checkout. When present, its current subsystem notes enrich the bundled snapshot; when absent, the [subsystem-map](../../resources/subsystem-map.md) resource alone is the knowledge base.

## Outputs

### investigation_areas

Ordered list of derived investigation areas — the collection the area-probe loop iterates.

#### area_id

Kebab-case identifier for the area.

#### area_title

Short human-readable area name.

#### subsystems

The subsystem-map entries the area belongs to.

#### changed_files

The changed files that put this area in scope.

#### derivation_rationale

Why this area warrants investigation for this change-set.

#### planned_probes

The catalog-selected probes for this area, at most `{probe_budget_per_area}`.

### investigation_plan

The reviewable plan document: per-area rationale, planned probes, and coverage summary against the change surface.

#### artifact

`investigation-plan.md`

## Protocol

### 1. Load Knowledge

- Load `{change_surface_inventory}` from the planning folder and the [subsystem-map](../../resources/subsystem-map.md) resource.
- If `{insight_repo_path}` is supplied, read its subsystem notes and prefer them where they are fresher than the snapshot.

### 2. Map and Cluster

- Map every changed file onto subsystem-map entries (pallet, crate, boundary, or tooling surface); flag any file that maps to no known subsystem as its own candidate area.
- Cluster the mapped files into system-level investigation areas — one area per coherent subsystem impact, not per file.
- Pull in coupled subsystems: for each in-scope subsystem, its subsystem-map *coupled with* entries are candidate co-areas at the coupling point — a changed API's callers, its correlation counterparts, and the release-and-upgrade automation for any ABI, runtime, or event-ABI change — even when none of their files appears in the diff. The release-and-upgrade automation area is mandatory whenever the change alters an event enum, a host-boundary type, runtime metadata, or `spec_version`.

### 3. Plan Probes

- For each area, select two to `{probe_budget_per_area}` probes from the [probe-catalog](../../resources/probe-catalog.md), matched to the area's subsystem class and the change kind, and note any probe whose toolchain gate is currently false (it will degrade or be recorded as blocked).
- Discharge the failure-class obligation: enumerate the subsystem-map failure classes of every subsystem the area covers (in-scope and coupled). Each failure class relevant to this change kind maps to at least one planned probe — a correlation-contract class to a P7 probe, a propagation class to a P8a probe, a caller-accounting or post-call-storage class to a P8b probe, an operational-tooling or advertised-control class to a P9 probe, an unpriced-work class to a size/weight probe, and so on — or is explicitly marked not-applicable with a one-line reason. P8a and P8b each budget one probe slot per enumerated caller for the relevant half. A named failure class left unplanned is a coverage gap the plan must resolve, not a silent omission.

### 4. Write Plan

- Write `{investigation_plan}` to the planning folder — area table, per-area rationale and planned probes, and a coverage summary showing every changed file assigned to at least one area — and emit `{investigation_areas}`.
