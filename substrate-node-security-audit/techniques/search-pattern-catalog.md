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

### resource-id

Resource containing the pattern catalog (e.g., '05-static-analysis-patterns')

### catalog-section

Section within the resource to execute (e.g., 'Grep Patterns', 'Mechanical Checks')

### scope

Codebase paths to search against

### exclusions

*(optional)* Paths or file patterns to exclude (e.g., test, mock, bench files)

## Protocol

### 1. Load Catalog

- Fetch the resource by ID and locate the specified catalog section. Parse every pattern entry in the section. Each entry defines a search string and, optionally, triage criteria or verification steps.

### 2. Iterate Patterns

- Process every pattern in the section sequentially. No patterns may be skipped. If a pattern is inapplicable to the target codebase (e.g., a Substrate-specific pattern against a non-Substrate codebase), record it with an explicit N/A justification rather than omitting it.

### 3. Execute Search

- For each pattern, determine the execution type from the resource entry. Grep-based patterns: run the search string against the scope. Verification-based patterns (mechanical checks): run the search string, then apply the verification procedure defined in the resource (e.g., trace a variable, check field completeness, verify pairing). Record every hit with file path and line number.

### 4. Triage Hits

- For each hit, apply the triage or pass/fail criteria defined in the resource entry for that pattern. Grep patterns typically use reachability-based triage (Critical/High/Medium/Informational). Verification patterns use PASS/FAIL based on the verification procedure. Record the triage result alongside each hit.

### 5. Classify Zero Hits

- For every pattern that returned zero results, determine: (a) TRUE NEGATIVE — the pattern genuinely does not exist in the codebase, with a justification citing the codebase's architecture or technology choices; or (b) POSSIBLE FALSE NEGATIVE — the pattern may exist but was not caught (e.g., obfuscated by intermediate variables, different naming convention, or the search scope missed a relevant directory). Flag false negatives for manual review follow-up.

### 6. Format Results

- Produce a structured results table with one row per pattern hit (or per pattern for zero-hit entries). The table format is defined by the activity step that invoked this technique. Include zero-hit verdicts as a separate section or integrated into the main table.

## Outputs

### pattern-results

A structured results table and zero-hit verdicts.

#### results_table

one row per hit, with fields determined by the invoking activity step (typically: category/check ID, pattern, file:line, hit content, triage/verdict)

#### zero_hit_verdicts

one row per zero-hit pattern, with fields: pattern, category, hits (0), verdict (True Negative / Flag for Follow-up), justification

## Errors

### resource_not_found

**Cause:** The specified resource ID does not exist in the workflow

**Recovery:** List available resources and report the error to the orchestrator

### section_not_found

**Cause:** The specified catalog section does not exist in the resource

**Recovery:** List available sections in the resource and report the mismatch

### scope_empty

**Cause:** No files match the scope and exclusion criteria

**Recovery:** Report that the scope produced zero files; verify scope paths are correct
