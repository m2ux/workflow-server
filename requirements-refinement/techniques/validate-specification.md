---
metadata:
  version: 1.0.0
---

## Capability

Validate the updated specification against structural, identifier-uniqueness, consistency, and protocol-conformance checks, and categorize each issue as critical or correctable.

## Inputs

### working_specification

The updated specification document to validate.

## Protocol

### 1. Run Checks

- Validate `{working_specification}` against the checks in [validation-rubric](../resources/validation-rubric.md): section structure, requirement-identifier uniqueness, source-reference accuracy, markdown syntax, and cross-section consistency.

### 2. Categorize Issues

- Assign each issue a severity and type per [validation-rubric](../resources/validation-rubric.md#issue-categorization), and treat critical or irreconcilable issues as blocking and the remainder as correctable.

### 3. Compile Verdict

- Write `{validation_report}` to `{planning_folder_path}`, recording the overall verdict (passed, correctable, or critical), the categorized issues, and the correction-pass number.

## Output

### validation_report

Categorized validation findings with an overall verdict.

#### artifact

`validation-report-{correction_iteration}.md`

## Rules

### non-sequential-identifiers-accepted

Non-sequential requirement identifiers are expected and do not constitute a validation failure.
