---
metadata:
  version: 1.1.0
---

## Capability

Validate the updated specification against structural, identifier-uniqueness, consistency, source-coverage, and protocol-conformance checks, and categorize each issue as critical or correctable.

## Inputs

### working_specification

The updated specification document to validate.

### requirements_analysis

The structured analysis whose source-coverage matrix is the completeness reference for validation.

## Protocol

### 1. Run Conformance Checks

- Validate `{working_specification}` against the checks in [validation-rubric](../resources/validation-rubric.md): section structure, requirement-identifier uniqueness, source-reference accuracy, markdown syntax, and cross-section consistency.

### 2. Check Source Coverage

- Using `{requirements_analysis.source_coverage_matrix}`, confirm every normative source statement maps to a requirement present in `{working_specification}`, and record any uncovered statement per [validation-rubric](../resources/validation-rubric.md#source-coverage).

### 3. Categorize Issues

- Assign each issue a severity and type per [validation-rubric](../resources/validation-rubric.md#issue-categorization), treating critical or irreconcilable issues as blocking and the remainder — including coverage gaps — as correctable.

### 4. Compile Verdict

- Write `{validation_report}` to `{planning_folder_path}`, recording the overall verdict (passed, correctable, or critical), the categorized issues, the source-coverage result, and the correction-pass number.

## Outputs

### validation_report

Categorized validation findings with an overall verdict and the source-coverage result.

#### artifact

`validation-report-{correction_iteration}.md`

## Rules

### non-sequential-identifiers-accepted

Non-sequential requirement identifiers are expected and do not constitute a validation failure.

### coverage-gaps-are-correctable

An uncovered normative source statement is a correctable finding, not a clean pass; the verdict is passed only when conformance holds and source coverage is complete.
