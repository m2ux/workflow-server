---
metadata:
  version: 1.0.0
---

## Capability

Finalize the test plan by linking each test case to its actual source location.

## Inputs

### test_plan

The [test plan](../../resources/test-plan.md#test-plan-structure) artifact for this work package; inherited from the [finalize-documentation](./TECHNIQUE.md) group root.

### planning_folder_path

Path to the planning folder holding the test plan; inherited from the [finalize-documentation](./TECHNIQUE.md) group root.

## Output

### finalized_test_plan

The work package's [test plan](../../resources/test-plan.md#test-plan-structure) with each test case linked to its actual test source file and line.

## Protocol

1. Load the `{test_plan}`. If it is not found at the expected path, check `{planning_folder_path}` for alternative names.
2. Add hyperlinks to actual test source file locations.
3. Ensure each test case references its source file and line.
