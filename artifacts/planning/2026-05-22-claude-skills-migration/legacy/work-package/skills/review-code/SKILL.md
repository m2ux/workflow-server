---
name: review-code
description: Review all implementation changes for architecture adherence, error handling, safety, and Substrate-specific patterns.
metadata:
  ontology: legacy
  kind: skill
  version: 2.0.0
  order: 0
  legacy_id: 0
---

# Review Code

## Capability

Perform comprehensive Rust/Substrate code review following established patterns

## Inputs

### changed-files

List of files changed in the work package (from git diff)

### project-type

*(optional)* Detected project type (rust-substrate or other)

## Protocol

### 1. Load Guidance

- Use attached resource 16 (rust-substrate-code-review) for full review criteria
- Identify all files changed since work package started using git diff

### 2. Bound Review Scope

- Run `gitnexus_detect_changes()` to map the diff to affected execution flows and the changed-symbol set
- For each changed symbol of interest, run `gitnexus_impact({target, direction: 'upstream'})` to surface upstream callers and bound the review's blast radius
- Use the resulting blast radius to inform severity judgements — high-fanout callers and process-critical paths raise the severity ceiling for findings in those symbols. See resource 27.

### 3. Review Files

- Review each changed file against architecture and design patterns
- Check error handling, safety, and unwrap/expect usage
- Verify Substrate-specific patterns (weights, storage, hooks, extrinsics)
- Evaluate architecture and design pattern adherence before low-level details
- For rust-substrate projects, check weight annotations, storage migrations, hook implementations, and extrinsic validation

### 4. Document Findings

- Document each finding with severity (critical, high, medium, low, informational)
- Create code-review.md report in planning folder

### 5. Present Summary

- Summarize critical and high findings for checkpoint presentation

## Outputs

### code-review-report

Code review report documenting findings by severity

- **artifact**: `code-review.md`
- **findings**: All findings with severity, affected file, line numbers, and description
- **summary**: Counts by severity level and top issues

## Rules

### evidence-required

Every finding must cite specific code with file path and line numbers

### severity-consistency

Apply severity levels consistently — critical for security/data loss, high for correctness, medium for maintainability, low for style

## Errors

### no_changes

**Cause:** No implementation changes found

**Recovery:** Verify correct branch and commit range

### resource_not_found

**Cause:** Code review resource missing

**Recovery:** Check resources folder for 16-rust-substrate-code-review.md

## Resources

- [rust-substrate-code-review](skill:legacy/work-package/resources/rust-substrate-code-review)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)
