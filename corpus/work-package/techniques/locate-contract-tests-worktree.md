---
metadata:
  version: 1.1.0
---

## Capability

The branch and directory for contract-test files.

## Outputs

### contract_tests_branch

The branch the contract-test files stand on.

### contract_tests_path

The directory the contract-test files stand in.

## Protocol

### 1. Name the Targets

- Set `{contract_tests_branch}` to `{branch_name}` with `-contract-tests` appended.
- Set `{contract_tests_path}` to the parent directory of `{target_path}`, plus the basename of `{planning_folder_path}` with `-contract-tests` appended.
