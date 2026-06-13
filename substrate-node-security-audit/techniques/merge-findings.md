---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Consolidate finding lists from multiple sources (e.g. multiple agents or audit passes) into a canonical flat table that serves as the finding inventory, supporting three merge strategies — structured-merge (concatenate and dedup), integration (add new items to an existing table), and union-merge (combine two independent runs with consensus flagging) — deduplicating by root cause, assigning report finding numbers, and verifying elevation completeness

## Inputs

### finding_sources

One or more structured finding lists to merge

### existing_table

*(optional)* An existing merge table to extend (for integration mode)

### merge_strategy

One of: structured-merge (concat + dedup), integrate (add to existing), union-merge (two-run consensus)

### observation_sources

*(optional)* Architectural and reconnaissance artifacts carrying emergent vulnerability domains and reconnaissance leads to be dispositioned during elevation.

## Protocol

### 1. Concatenate

- Combine every list in `{finding_sources}` into a single flat table. Every agent finding becomes a row with fields: agent-id, finding-id, file, line, title, severity, checklist-item, evidence. No agent output is discarded.

### 2. Deduplicate

- For each row, identify whether another row describes the same root cause. Rows with the same root cause receive the same report finding number with a note: 'merged: same root cause as Finding X — [justification]'. Every row must have a mapping — unmapped rows are automatically promoted to new findings.

### 3. Elevate Observations

- Review every reconnaissance lead and additional observation across `{finding_sources}`, plus every emergent vulnerability domain and reconnaissance lead in `{observation_sources}`. Each must be dispositioned as captured by an existing finding, elevated to a new finding, or not-applicable with justification, recording the `{observation_dispositions}` table. Observations describing divergent code paths, missing validation, error-path state persistence, silent error consumption, or trust boundary amplification are always security-relevant and are elevated.

### 4. Apply Strategy

- Branch on `{merge_strategy}`. For structured-merge: assign sequential report finding numbers. For integrate: append the new rows to the `{existing_table}` and update its elevation mapping. For union-merge: classify each finding as consensus (present in both runs), single-source (one run only), or escalated (PASS in primary, FAIL in secondary).

### 5. Score With Calibration

- Score every finding using the [severity rubric](../resources/severity-rubric.md). For every finding (not just High/Critical), search the [calibration benchmarks](../resources/target-profile.md#severity-calibration-benchmark) for a matching pattern; flag a divergence of one level and treat a divergence of two or more levels as a floor at the benchmark severity. Record the `{calibration_crosscheck}` table.

### 6. Reconcile

- For each agent compute Findings Submitted, In Merge Table, Explicitly Deduplicated, Elevated from Observations, and Unaccounted, recording the `{reconciliation_table}`. Unaccounted must equal zero for every agent.

### 7. Verify Completeness

- Confirm every row has a report finding number. Count merged rows (with justification), promoted rows, and total findings. Emit the completed `{merge_table}` with its flat table, elevation summary, and any union-merge classification.
- If a row still lacks a report finding number, auto-promote it to a new finding and note the promotion in the elevation summary.

## Outputs

### merge_table

Canonical finding flat table with elevation mapping and summary.

#### artifact

`m-merge.json`

#### flat_table

one row per agent finding with report finding number and merge status

#### elevation_summary

total agent findings, total report findings, merged count, promoted count

#### union_merge_classification

for union-merge: consensus/single-source/escalated classification per finding

### reconciliation_table

Per-agent finding-count reconciliation with zero Unaccounted.

### calibration_crosscheck

Per-finding calibration comparison: our score, benchmark match, benchmark score, delta, action.

### observation_dispositions

Per-observation table: source, agent, observation, disposition, finding reference.

## Rules

### no-finding-silently-dropped

Every agent finding appears in the merge table as a unique finding or an explicitly justified deduplicated entry; zero findings are silently dropped, and implicit deduplication is forbidden.

### reconciliation-zero-unaccounted

The reconciliation table is the primary validation artifact: Unaccounted must equal zero for every agent.

### calibration-is-bidirectional

Severity scoring cross-checks every finding against the calibration benchmarks; the two-or-more-level divergence gate applies bidirectionally, so over-scoring and under-scoring are both flagged.

### unconditional-defect-feasibility-floor

When evidence describes a defect that triggers on every invocation of the affected path — signalled by `unconditional`, `every invocation`, `guaranteed`, or `deterministic` — Feasibility is at minimum 3 (reachable from external input) or 4 (normal operation).

### operates-on-outputs-only

The merge operates exclusively on agent outputs; it does not read source code or apply the §3 checklist.
