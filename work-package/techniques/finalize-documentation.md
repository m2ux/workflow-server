---
name: finalize-documentation
description: Finalize work-package documentation after implementation.
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

### planning-folder-path

Path to planning folder containing test plan and artifacts

### adr-path

*(optional)* Path to ADR if one was created for this work package

### test-plan-path

Path to test plan artifact

### pr-number

PR number for cross-referencing

## Protocol

### 1. Update Adr

- If ADR exists at adr_path, update status to Accepted
- Record implementation outcome and any deviations

### 2. Finalize Test Plan

- Load test plan from test_plan_path
- Add hyperlinks to actual test source file locations
- Ensure each test case references its source file and line

### 3. Create Completion Doc

- Create COMPLETE.md in planning folder
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

### completion-document

Summary of delivered work, test coverage, and deferred items

- **artifact**: `COMPLETE.md`
- **deliverables**: What was implemented
- **test_coverage**: What was tested and where
- **deferred**: Items deferred to future work
- **limitations**: Known limitations and caveats

## Rules

### completion-timing

COMPLETE.md is created after implementation is complete and PR is merged. It captures the final delivered state — what was built, tested, and deferred. Update if post-merge changes occur.

### tool-usage

Rust/Substrate: apply [cargo-operations](./cargo-operations/TECHNIQUE.md)::[doc](./cargo-operations/doc.md) (scope='--workspace --no-deps') to verify documentation builds. Other project types: run the equivalent doc command for the project. This technique does not invoke cargo directly.

## Errors

### no_adr

**Cause:** No ADR was created for this work package

**Recovery:** Skip ADR finalization and proceed with other steps

### missing_test_plan

**Cause:** Test plan not found at expected path

**Recovery:** Check planning folder for alternative names
