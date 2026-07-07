---
metadata:
  version: 1.0.0
---

## Capability

Confirm the audit's target submodules and build the scope inventory: discover and enumerate all `.yml`/`.yaml` files under `.github/workflows/` across the targets, classify each by trigger types, permission scopes, checkout patterns, and referenced scripts, inventory the AI configuration files and CODEOWNERS coverage, assign one scanner agent per submodule, and initialize the planning folder with its session overview. The operations in this set decompose that inventory into target-confirmation, file-discovery, trigger-classification, permission-mapping, checkout-identification, AI-config-and-CODEOWNERS-inventory, summary-assembly, scanner-assignment, and planning-folder-initialization phases.

## Inputs

### target_submodules

Comma-separated submodule paths to inventory, or `all` to inventory every submodule containing `.github/workflows/`.

## Outputs

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data.

#### artifact

`reconnaissance-summary.json`

#### workflow_files

All workflow file paths with metadata.

#### trigger_classification

Per-workflow trigger types.

#### permission_map

Per-workflow permission scopes.

#### checkout_patterns

Per-workflow checkout configurations.

### ai_config_inventory

AI configuration files and CODEOWNERS coverage found per target, for P6 detection.

### scanner_assignments

[Agent-to-submodule mapping](../../resources/intermediate-artifact-schemas.md#scanner-assignments) — one scanner agent per submodule with workflow files.

#### artifact

`scanner-assignments.json`

### start_here

Session overview for the audit run.

#### artifact

`START-HERE.md`
