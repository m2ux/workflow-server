---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.1
  order: 17
  legacy_id: 17
---

# Finalize Documentation

## Capability

Finalize documentation — update ADRs, complete test plans, create completion document, ensure API documentation

## Inputs

### adr

*(optional)* The [Architecture Decision Record](../../resources/architecture-review.md#adr-template) created for this work package, if one exists

### test_plan

The [test plan](../../resources/test-plan.md#test-plan-structure) artifact for this work package

### planning_folder_path

Path to the planning folder holding the test plan and where the completion document is created

### pr_number

The merged PR number, cross-referenced when recording the ADR implementation outcome

## Outputs

### completion_document

[Summary](../../resources/complete-wp.md#section-guidelines) of delivered work, test coverage, and deferred items

#### completion_artifact

`COMPLETE.md`

## Rules

### completion-timing

`COMPLETE.md` is created after implementation is complete and PR is merged. It captures the final delivered state — what was built, tested, and deferred. Update if post-merge changes occur.

### tool-usage

Rust/Substrate: apply [cargo-operations](../cargo-operations/TECHNIQUE.md)::[doc](../cargo-operations/doc.md) (scope=`--workspace --no-deps`) to verify documentation builds. Other project types: run the equivalent doc command for the project. This technique does not invoke cargo directly.
