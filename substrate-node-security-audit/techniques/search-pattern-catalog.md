---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Execute every pattern in a catalog section against a codebase scope, apply per-pattern triage or verification criteria, classify zero-hit patterns, and produce structured results

## Inputs

### resource_id

Resource containing the pattern catalog (e.g., `static-analysis-patterns`)

### catalog_section

Section within the resource to execute (e.g., 'Grep Patterns', 'Mechanical Checks')

### search_scope

Codebase paths to search against

### exclusions

*(optional)* Paths or file patterns to exclude (e.g., test, mock, bench files)

### output_format

*(optional)* The table shape the results are rendered in.

## Protocol

### 1. Load Catalog

- Fetch the resource named by `{resource_id}` and locate the `{catalog_section}` within it. Parse every pattern entry in that section. Each entry defines a search string and, optionally, triage criteria or verification steps.
- If no resource matches `{resource_id}`, list the available resources and report the error.
- If the resource exists but does not contain the requested `{catalog_section}`, list the available sections in the resource and report the mismatch.

### 2. Iterate Patterns

- Process every pattern in the section sequentially. No patterns may be skipped. If a pattern is inapplicable to the target codebase (e.g., a Substrate-specific pattern against a non-Substrate codebase), record it with an explicit N/A justification rather than omitting it.

### 3. Execute Search

- For each pattern, determine the execution type from the resource entry. Grep-based patterns: run the search string against the `{search_scope}`, omitting any paths or file patterns named in `{exclusions}` (e.g., test, mock, bench files). Verification-based patterns (mechanical checks): run the search string, then apply the verification procedure defined in the resource (e.g., trace a variable, check field completeness, verify pairing). Record every hit with file path and line number.
- If no files match the `{search_scope}` and exclusion criteria, report that the `{search_scope}` produced zero files and verify the `{search_scope}` paths are correct.

### 4. Triage Hits

- For each hit, apply the triage or pass/fail criteria defined in the resource entry for that pattern. Grep patterns typically use reachability-based triage (Critical/High/Medium/Informational). Verification patterns use PASS/FAIL based on the verification procedure. Record the triage result alongside each hit.

### 5. Classify Zero Hits

- For every pattern that returned zero results, determine: (a) TRUE NEGATIVE — the pattern genuinely does not exist in the codebase, with a justification citing the codebase's architecture or technology choices; or (b) POSSIBLE FALSE NEGATIVE — the pattern may exist but was not caught (e.g., obfuscated by intermediate variables, different naming convention, or the search scope missed a relevant directory). Flag false negatives for manual review follow-up.

### 6. Format Results

- Assemble the `{pattern_results}`: a structured results table with one row per pattern hit (or per pattern for zero-hit entries), rendered in `{output_format}`. Include zero-hit verdicts as a separate section or integrated into the main table.

## Outputs

### pattern_results

A structured results table and zero-hit verdicts.

#### results_table

one row per hit, with fields determined by `{output_format}` (typically: category/check ID, pattern, file:line, hit content, triage/verdict)

#### zero_hit_verdicts

one row per zero-hit pattern, with fields: pattern, category, hits (0), verdict (True Negative / Flag for Follow-up), justification

## Rules

### consensus-file-elevation-floor

Any pattern hit in a file classified as priority-1 is elevated to at minimum a Low-severity finding during aggregation; hits in these files are never suppressed during zero-hit triage or aggregation.
