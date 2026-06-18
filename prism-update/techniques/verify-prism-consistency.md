---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 4
  legacy_id: 4
---

## Capability

Verify consistency across prism resources, techniques, and documentation, flagging content drift, stale references, routing mismatches, count discrepancies, and duplicate indices into a consistency report.

## Protocol

### 1. Verify Content Integrity

- For each entry in `{change_set}.modified` and `{change_set}.new`, diff the imported resource against its upstream original and flag any content difference beyond the expected filename change.

### 2. Check Stale References

- Build the stale name list from the `old_name` of each `{change_set}.renamed` entry and the `name` of each `{change_set}.deleted` entry.
- Grep all files under `prism/techniques/` and `prism/activities/` for each stale name and record the matches into `{verification_report.stale_references}`.

### 3. Verify Prompt Routing

- Parse the Prompt Guide table from `{prism_readme}` and the goal-mapping-matrix from `{plan_analysis_technique}`.
  > If either the prompt guide table or the goal-mapping matrix cannot be parsed, read the raw file content and extract the sections manually.
- For each prompt, verify the matrix routes to the claimed prism and flag mismatches into `{verification_report.routing_mismatches}`.

### 4. Verify Resource Counts

- Count the `.md` files in `{resource_path}` excluding `README.md`.
- Compare against the stated counts in `{prism_readme}` and `{prism_resources_readme}` and flag mismatches into `{verification_report.count_mismatches}`.

### 5. Check Duplicate Indices

- Extract numeric prefixes from the resource filenames and flag any that appear more than once into `{verification_report.duplicate_indices}`.

### 6. Compile Findings

- Assemble `{verification_report}` from the five checks and set both `{verification_report.has_issues}` and the top-level `{has_issues}` to `true` when any check produced a finding, `false` otherwise.

## Outputs

### verification_report

Consistency check results.

#### stale_references

Array of `{ file, line, old_name }`.

#### routing_mismatches

Array of `{ prompt, claimed_target, actual_route }`.

#### count_mismatches

Array of `{ source, stated, actual }`.

#### duplicate_indices

Array of `{ index, files }`.

#### has_issues

`true` when any check produced a finding.

### has_issues

`true` when any consistency check produced a finding, `false` otherwise.
