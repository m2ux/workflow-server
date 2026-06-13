---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 2
  legacy_id: 2
---

## Capability

Confirm the audit's target submodules and build the scope inventory: discover and enumerate all `.yml`/`.yaml` files under `.github/workflows/` across the targets, classify each by trigger types, permission scopes, checkout patterns, and referenced scripts, inventory the AI configuration files and CODEOWNERS coverage, and initialize the planning folder with its session overview.

## Inputs

### target_submodules

Comma-separated submodule paths to inventory, or `all` to inventory every submodule containing `.github/workflows/`.

## Protocol

### 1. Confirm Targets

- Resolve `{target_submodules}`: when `all`, enumerate every submodule containing a `.github/workflows/` directory; otherwise validate that each named path exists.  
  > If no target submodules are specified and none are found, fail with an error listing the available submodules.

### 2. Discover Files

- For each resolved target, enumerate `.github/workflows/*.yml` and `.github/workflows/*.yaml` and record each file's path, size, and last-modified date.  
  > If a submodule has no `.github/workflows/` directory, record it as a zero-workflow submodule and skip it for scanner assignment.

### 3. Classify Triggers

- Parse each workflow's `on:` block and classify its trigger types with their configurations, flagging `pull_request_target`, `issue_comment`, and `pull_request_review_comment` as high-priority.  
  > If a workflow file contains invalid YAML and cannot be parsed, record the parse error and flag the file for manual review.

### 4. Map Permissions

- Extract the top-level `permissions:` block (workflow-level defaults) and per-job overrides, flagging workflows with write scopes or no explicit permissions.

### 5. Identify Checkouts

- Find all `actions/checkout` uses and their `ref:` values, flagging any checkout of PR head SHA, `head.ref`, or merge commit.

### 6. Identify Scripts

- Find all `run:` blocks and referenced script files for later P7 scanning, and assemble the classified files, triggers, permissions, and checkout patterns into `{workflow_inventory}`.

### 7. Inventory AI Configs And CODEOWNERS

- For each target, record the presence and paths of AI configuration files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.cursor/rules/`) into `{ai_config_inventory}` for P6 detection.
- For each target, record whether a `CODEOWNERS` file exists and its path, since it gates P6 (AI config protection).

### 8. Assign Scanner Agents

- Assign one scanner agent (`S1`-`Sn`), one per submodule with workflow files, into `{scanner_assignments}` recording the agent-to-submodule mapping.

### 9. Initialize Planning Folder

- Create `{planning_folder_path}` and write its [session overview](../resources/start-here.md) carrying the audit scope, methodology, target inventory, and artifact index.

## Outputs

### workflow_inventory

Complete [inventory of workflow files](../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data.

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

[Agent-to-submodule mapping](../resources/intermediate-artifact-schemas.md#scanner-assignments) — one scanner agent per submodule with workflow files.

### start_here

Session overview for the audit run.

#### artifact

`START-HERE.md`
