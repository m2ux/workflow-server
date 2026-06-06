---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.1
  order: 17
  legacy_id: 17
---

## Capability

Finalize documentation — update ADRs, complete test plans, create completion document, ensure API documentation

## Inputs

### adr

*(optional)* The [Architecture Decision Record](../resources/architecture-review.md#adr-template) created for this work package, if one exists

### test_plan

The [test plan](../resources/test-plan.md#test-plan-structure) artifact for this work package

## Protocol

### 1. Update Adr

- If the {adr} exists, update status to Accepted
- Record implementation outcome and any deviations, cross-referencing the merged PR via its {pr_number}
- If no ADR was created for this work package, skip ADR finalization and proceed with the other steps

### 2. Finalize Test Plan

- Load the {test_plan}. If it is not found at the expected path, check {planning_folder_path} for alternative names
- Add hyperlinks to actual test source file locations
- Ensure each test case references its source file and line

### 3. Create Completion Doc

- Create the {completion_document} at the {planning_folder_path}
- Summarize what was delivered
- Document what was tested and test coverage
- List deferred items and known limitations
- Follow the completion-document template in [complete-wp](../resources/complete-wp.md)

### 4. Ensure Api Docs

- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[public-api-enum](./gitnexus-operations/public-api-enum.md) to enumerate exactly the public/exported APIs in the diff that need doc comments.
- Identify public APIs in changed code
- Verify each has inline documentation (doc comments)
- Add missing doc comments where absent

## Outputs

### completion_document

[Summary](../resources/complete-wp.md#section-guidelines) of delivered work, test coverage, and deferred items

#### artifact

`COMPLETE.md`

## Rules

### completion-timing

COMPLETE.md is created after implementation is complete and PR is merged. It captures the final delivered state — what was built, tested, and deferred. Update if post-merge changes occur.

### tool-usage

Rust/Substrate: apply [cargo-operations](./cargo-operations/TECHNIQUE.md)::[doc](./cargo-operations/doc.md) (scope='--workspace --no-deps') to verify documentation builds. Other project types: run the equivalent doc command for the project. This technique does not invoke cargo directly.
