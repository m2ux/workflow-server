---
metadata:
  version: 1.1.0
---

## Capability

The branch and directory for contract-test files.

## Outputs

### contract_tests_branch

`{branch_name}` with `-contract-tests` appended.

### contract_tests_path

The parent directory of `{target_path}`, plus the basename of `{planning_folder_path}` with `-contract-tests` appended.

## Protocol

### 1. Name the Branch and Directory

- Emit `{contract_tests_branch}` and `{contract_tests_path}`
