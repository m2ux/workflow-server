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

### changed_files

List of files changed in the work package (from `git diff`)

### project_type

*(optional)* Detected project type (rust-substrate or other)

### planning_folder_path

Folder where the code review report is written

## Protocol

### 1. Load Guidance

- Use attached [rust-substrate-code-review](../resources/rust-substrate-code-review.md) for full review criteria
  - If the code review resource is missing, check the resources folder for `16-rust-substrate-code-review.md`.
- Establish the `{changed_files}` set by running `git diff` for all files changed since the work package started
  - If no implementation changes are found, verify the correct branch and commit range.

### 2. Bound Review Scope

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[detect-changes](../../meta/techniques/gitnexus-operations/detect-changes.md) to map the diff to affected execution flows and the changed-symbol set
- For each changed symbol of interest, apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md) `{target, direction: 'upstream'}` to surface upstream callers and bound the review's blast radius
- Use the resulting blast radius to inform severity judgements — high-fanout callers and process-critical paths raise the severity ceiling for findings in those symbols.

#### Associated-type / trait-impl swap

When the diff changes a `Config` impl, an associated type, or any trait-implementation binding, the blast radius extends beyond the changed line to every site that reads or writes through that binding — including unchanged upstream code that now resolves to the swapped type. A change that reads as locally correct can silently re-govern that unchanged code. For each such change:

- Enumerate every upstream read site and write site keyed on the changed type or binding (use the `impact upstream` result as the starting set; follow each caller to the operations it performs on the type).
- Verify the full state lifecycle stays balanced across that set: every site that **creates** state through the binding has a matching **clearer** on every path that ends the state's lifecycle, and every invariant the prior binding upheld still holds under the new one.
- Treat the unchanged upstream code as in-scope evidence — the imbalance often lives in code the diff never touched.
- A detected imbalance is a finding that classifies ≥ Minor (so it sets `needs_code_fixes`); when the imbalance causes unbounded state growth or other system harm, classify it on the matching impact axis (Major or above), so a correct-but-harmful config swap is rated above "safe".

### 3. Review Files

- Review each changed file against architecture and design patterns
- Check error handling, safety, and unwrap/expect usage
- Verify Substrate-specific patterns (weights, storage, hooks, extrinsics)
- Evaluate architecture and design pattern adherence before low-level details
- When `{project_type}` is rust-substrate, check weight annotations, storage migrations, hook implementations, and extrinsic validation

### 4. Document Findings

- Document each finding with severity (critical, high, medium, low, informational)
- Create the `{code_review_report}` in `{planning_folder_path}`

### 5. Present Summary

- Summarize critical and high findings

## Outputs

### code_review_report

Code review [report](../resources/rust-substrate-code-review.md#report-template) documenting findings by severity

#### artifact

`code-review.md`

## Rules

### evidence-required

Every finding must cite specific code with file path and line numbers

### severity-consistency

Apply severity levels consistently — critical for security/data loss, high for correctness, medium for maintainability, low for style
