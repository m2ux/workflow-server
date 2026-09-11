---
metadata:
  version: 1.1.0
---

## Capability

Finalize the test plan by linking each test case to its actual source location.

## Inputs

### test_plan_document

The [test plan](../../resources/test-plan.md#test-plan-structure) artifact for this work package.

## Outputs

### finalized_test_plan

The work package's [test plan](../../resources/test-plan.md#test-plan-structure) with each test case linked to its actual test source file and line.

## Protocol

1. Load the `{test_plan_document}`. If it is not found at the expected path, check `{planning_folder_path}` for alternative names.
2. Add hyperlinks to actual test source file locations per the test-ID form in [Rules](../../resources/test-plan.md#rules) (definition line, `**`-suffixed disabled tests) and [manage-artifacts](../manage-artifacts/TECHNIQUE.md#hyperlink-conventions).
3. Ensure each test case references its source file and line; verify every link resolves.
