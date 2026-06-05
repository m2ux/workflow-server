---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 0
  legacy_id: 0
---

## Capability

Perform comprehensive Rust/Substrate code review following established patterns, examining all implementation changes for architecture adherence, error handling, safety, and Substrate-specific patterns

## Inputs

### changed-files

List of files changed in the work package (from git diff)

### project-type

*(optional)* Detected project type (rust-substrate or other)

## Protocol

### 1. Load Guidance

- Use attached [rust-substrate-code-review](../resources/rust-substrate-code-review.md) for full review criteria
  - If the code review resource is missing, check the resources folder for 16-rust-substrate-code-review.md.
- Establish the `changed-files` set by running git diff for all files changed since the work package started
  - If no implementation changes are found, verify the correct branch and commit range.

### 2. Bound Review Scope

- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[detect-changes](./gitnexus-operations/detect-changes.md) to map the diff to affected execution flows and the changed-symbol set
- For each changed symbol of interest, apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[impact](./gitnexus-operations/impact.md) `{target, direction: 'upstream'}` to surface upstream callers and bound the review's blast radius
- Use the resulting blast radius to inform severity judgements — high-fanout callers and process-critical paths raise the severity ceiling for findings in those symbols.

### 3. Review Files

- Review each changed file against architecture and design patterns
- Check error handling, safety, and unwrap/expect usage
- Verify Substrate-specific patterns (weights, storage, hooks, extrinsics)
- Evaluate architecture and design pattern adherence before low-level details
- When `project-type` is rust-substrate, check weight annotations, storage migrations, hook implementations, and extrinsic validation

### 4. Document Findings

- Document each finding with severity (critical, high, medium, low, informational)
- Create the code-review-report in planning folder

### 5. Present Summary

- Summarize critical and high findings for checkpoint presentation

## Outputs

### code-review-report

Code review [report](../resources/rust-substrate-code-review.md#report-template) documenting findings by severity

#### artifact

`code-review.md`

#### findings

All findings with severity, affected file, line numbers, and description

#### summary

Counts by severity level and top issues

## Rules

### evidence-required

Every finding must cite specific code with file path and line numbers

### severity-consistency

Apply severity levels consistently — critical for security/data loss, high for correctness, medium for maintainability, low for style
