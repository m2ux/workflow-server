---
metadata:
  version: 2.0.0
---

## Capability

The audit overview, dependency scan and file inventory of a target codebase pinned at its audited commit.

## Inputs

### audit_prompt_template

Path to the audit prompt template.

### target_submodule

Path to the component being audited.

### target_commit

The exact commit the target component is checked out at.

### in_scope

Crate and module paths to audit, space-separated, relative to `{target_submodule}`.

## Outputs

### file_inventory

Every in-scope source file with its line count, sorted largest first.

#### artifact

`file-inventory.txt`

#### audience

`human`

### dependency_scan_results

Known-vulnerable dependency report, or the extracted dependency manifest when no scanner is available.

#### artifact

`dependency-scan.json`

#### audience

`agent`

### start_here

Session overview with audit target, commit, methodology, and artifact index.

#### artifact

`START-HERE.md`

#### audience

`human`

## Protocol

### 1. Initialize Overview

- Write `{start_here}` in `{planning_folder_path}` from the [start-here template](../resources/start-here.md#template), recording `{target_submodule}` and `{target_commit}`, and filling its sections from the [overview](../resources/start-here.md#overview), [key artifacts](../resources/start-here.md#key-artifacts-produced) and [options at setup](../resources/start-here.md#options-at-setup).

### 2. Scan Dependencies

- Attempt to run dependency scanning tools (e.g., `cargo audit`, `cargo deny`, `npm audit`) in `{target_submodule}`, and record the result as `{dependency_scan_results}` in `{planning_folder_path}`.
  > If the scanning tools cannot be executed, extract the dependency manifest (e.g., `Cargo.lock`, `package-lock.json`) instead and mark the result as requiring manual inspection.

### 3. Generate Inventory

- Produce `{file_inventory}` in `{planning_folder_path}`, listing every source file under the `{in_scope}` paths of `{target_submodule}` with its line count, largest first.

### 4. Load Template

- Confirm the audit prompt template is accessible at `{audit_prompt_template}`.
  > Where it is not at its expected path, fail with an error showing the expected path.
