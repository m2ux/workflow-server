---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Discover and enumerate all .yml/.yaml files under .github/workflows/ across target submodules, classifying each by trigger types, permission scopes, checkout patterns, and referenced scripts to produce structured inventory data.

## Inputs

### target-submodules

List of submodule paths to inventory

## Protocol

### 1. Discover Files

- For each path in `target-submodules`, enumerate .github/workflows/*.yml and .github/workflows/*.yaml
- Record file path, file size, and last modified date
- If a submodule has no .github/workflows/ directory, record it as a zero-workflow submodule and skip it for scanner assignment

### 2. Classify Triggers

- Parse each workflow YAML for the 'on:' block
- Extract and classify trigger types with their configurations
- If a workflow file contains invalid YAML and cannot be parsed, record the parse error and flag the file for manual review

### 3. Map Permissions

- Extract top-level 'permissions:' block (workflow-level defaults)
- Extract per-job 'permissions:' overrides

### 4. Identify Checkouts

- Find all uses of actions/checkout in each workflow
- Extract the 'ref:' parameter value (if specified)
- Flag any checkout that references PR head SHA, head.ref, or merge commit

### 5. Identify Scripts

- Find all 'run:' blocks and referenced script files for later P7 scanning
- Assemble the classified files, triggers, permissions, and checkout patterns into the `workflow-inventory` and return it

## Outputs

### workflow-inventory

Complete [inventory of workflow files](../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data

#### file_list

All workflow file paths with metadata

#### trigger_classification

Per-workflow trigger types

#### permission_map

Per-workflow permission scopes

#### checkout_patterns

Per-workflow checkout configurations
