---
name: inventory-workflows
description: Systematic workflow file discovery and classification. Enumerates all .yml/.yaml files under .github/workflows/ in each target submodule. Classifies each workflow by trigger types, permission scopes, checkout patterns, and referenced scripts. Produces structured inventory data for scanner agent dispatch.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Discover, enumerate, and classify GitHub Actions workflow files across target submodules

## Inputs

### target-submodules

List of submodule paths to inventory

## Protocol

### 1. Discover Files

- For each submodule, enumerate .github/workflows/*.yml and .github/workflows/*.yaml
- Record file path, file size, and last modified date

### 2. Classify Triggers

- Parse each workflow YAML for the 'on:' block
- Extract and classify trigger types with their configurations

### 3. Map Permissions

- Extract top-level 'permissions:' block (workflow-level defaults)
- Extract per-job 'permissions:' overrides

### 4. Identify Checkouts

- Find all uses of actions/checkout in each workflow
- Extract the 'ref:' parameter value (if specified)
- Flag any checkout that references PR head SHA, head.ref, or merge commit

### 5. Identify Scripts

- Find all 'run:' blocks and referenced script files for later P7 scanning

## Outputs

### workflow-inventory

Complete inventory of workflow files with classification data

- **file_list**: All workflow file paths with metadata
- **trigger_classification**: Per-workflow trigger types
- **permission_map**: Per-workflow permission scopes
- **checkout_patterns**: Per-workflow checkout configurations

## Errors

### no_workflows

**Cause:** Submodule has no .github/workflows/ directory

**Recovery:** Record as zero-workflow submodule and skip for scanner assignment

### parse_failure

**Cause:** Workflow file contains invalid YAML

**Recovery:** Record parse error and flag file for manual review
