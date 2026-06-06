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

## Protocol

### 1. Concatenate

- Combine every list in {finding_sources} into a single flat table. Every agent finding becomes a row with fields: agent-id, finding-id, file, line, title, severity, checklist-item, evidence. No agent output is discarded.

### 2. Deduplicate

- For each row, identify whether another row describes the same root cause. Rows with the same root cause receive the same report finding number with a note: 'merged: same root cause as Finding X — [justification]'. Every row must have a mapping — unmapped rows are automatically promoted to new findings.

### 3. Apply Strategy

- Branch on {merge_strategy}. For structured-merge: assign sequential report finding numbers. For integrate: append the new rows to the {existing_table} and update its elevation mapping. For union-merge: classify each finding as consensus (present in both runs), single-source (one run only), or escalated (PASS in primary, FAIL in secondary).

### 4. Verify Completeness

- Confirm every row has a report finding number. Count merged rows (with justification), promoted rows, and total findings. Emit the completed {merge_table} with its flat table, elevation summary, and any union-merge classification.
- If a row still lacks a report finding number, auto-promote it to a new finding and note the promotion in the elevation summary.

## Outputs

### merge_table

Canonical finding flat table with elevation mapping and summary.

#### flat_table

one row per agent finding with report finding number and merge status

#### elevation_summary

total agent findings, total report findings, merged count, promoted count

#### union_merge_classification

for union-merge: consensus/single-source/escalated classification per finding
