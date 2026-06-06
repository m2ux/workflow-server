---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Verify consistency across prism resources, techniques, and documentation by running four checks: stale name references, prompt guide routing accuracy, resource count alignment, and duplicate index detection.

## Protocol

### 1. Check Stale References

- Build stale name list from {change-set}.renamed (old_name) and {change-set}.deleted (name).
- Grep all files in prism/techniques/ and prism/activities/ for each stale name. Record matches.

### 2. Verify Prompt Routing

- Parse the Prompt Guide table from prism/README.md.
- Parse the goal-mapping-matrix from prism/techniques/plan-analysis.md.
- If either the prompt guide table or the goal-mapping matrix cannot be parsed, read the raw file content and extract the sections manually.
- For each prompt, verify the matrix routes to the claimed prism. Flag mismatches.

### 3. Verify Resource Counts

- Count .md files in {resource-path} (excluding README.md).
- Compare against stated counts in prism/README.md and prism/resources/README.md. Flag mismatches.

### 4. Check Duplicate Indices

- Extract numeric prefixes from resource filenames. Flag any that appear more than once.

### 5. Compile Findings

- Assemble the {verification-report} from the four checks, populating {stale-references}, {routing-mismatches}, {count-mismatches}, and {duplicate-indices}.
- Set the report's {has-issues} = true if any findings, false otherwise.

## Outputs

### verification-report

Consistency check results

#### stale-references

Array of { file, line, old_name }

#### routing-mismatches

Array of { prompt, claimed_target, actual_route }

#### count-mismatches

Array of { source, stated, actual }

#### duplicate-indices

Array of { index, files }

#### has-issues

Boolean
