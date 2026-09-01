---
metadata:
  version: 2.7.0
---

## Capability

Rust/Substrate code review of implementation changes for architecture, error handling, safety, and Substrate patterns.

## Inputs

### changed_files

The authored surface — the PR's changed-files set, produced canonically by `review-baseline-state`.

### expected_changes

*(optional)* The changes the PR was expected to make, when a review-mode baseline derived them — the yardstick the authored surface is judged against.

### project_type

*(optional)* Detected project type (rust-substrate or other)

## Outputs

### code_review_report

Code review [report](../resources/rust-substrate-code-review.md#report-template) stating this review's findings and its outcome. The home for the code-review findings and the manual diff review's; each other review pass states its findings in the report it owns, under its own designator series.

#### artifact

`code-review.md`

#### audience

`human`

### code_review_method

Method [record](../resources/rust-substrate-code-review.md#method-record-template) of how the review was conducted — the surface walked, the sweeps run and what each returned, and the compliance assessment.

#### artifact

`code-review-method.md`

#### audience

`human`

## Protocol

### 1. Load Guidance

- Review against the attached [Review Criteria](../resources/rust-substrate-code-review.md#review-criteria) ([resource-loading-via-tool](../../meta/techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool) — never read workflow resources from disk).
- Consume the canonical `{changed_files}` authored surface when it is established (review mode, produced by `review-baseline-state`). In create mode (no PR baseline), derive it from the local working-tree diff against the base branch.
  > If `{changed_files}` is empty, verify the correct branch and commit range.

### 2. Bound Review Scope

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[detect-changes](../../meta/techniques/gitnexus-operations/detect-changes.md) to map the diff to affected execution flows and the changed-symbol set
- For each changed symbol of interest, apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md) `{target, direction: 'upstream'}` to surface upstream callers and bound the review's blast radius
- Use the resulting blast radius to inform severity judgements — high-fanout callers and process-critical paths raise the severity ceiling for findings in those symbols.

#### Associated-type / trait-impl swap

When the diff changes a `Config` impl, an associated type, or any trait-implementation binding, the blast radius extends beyond the changed line to every site that reads or writes through that binding — including unchanged upstream code that now resolves to the swapped type. A change that reads as locally correct can silently re-govern that unchanged code, so the swapped binding is in scope for the state-lifecycle conservation walk over that upstream set.

- Run the set-wide producer/clearer conservation walk over the upstream read and write sites keyed on the changed binding — the [prism](../../prism/techniques/structural-analysis.md)::[structural-analysis](../../prism/techniques/structural-analysis.md#producerclearer-ledger) producer/clearer ledger owns the method (enumerate every producer against every clearer across the unchanged upstream set; confirm a matching clear on every termination path). Seed it from the `impact upstream` result.
- A detected imbalance is a finding that classifies ≥ Minor (so it sets `code_findings_actionable`); when the imbalance causes unbounded state growth or other system harm, classify it on the matching impact axis (Major or above), so a correct-but-harmful config swap is rated above "safe".

### 3. Review Files

- Review each changed file against architecture and design patterns
- Check error handling, safety, and unwrap/expect usage
- Verify Substrate-specific patterns (weights, storage, hooks, extrinsics)
- Evaluate architecture and design pattern adherence before low-level details
- When `{project_type}` is rust-substrate, check weight annotations, storage migrations, hook implementations, and extrinsic validation

#### Relocated manifest

When the diff moves a package manifest, lockfile, or build file, the paths that name its old location live outside the diff and keep resolving to nothing. Automated dependency configuration is the common one — a directory entry naming the old path stops updating silently rather than erroring — and continuous-integration working directories, container build contexts and documentation paths carry the same exposure. Search the repository for the old path and review every site that still names it.

#### Configuration against the document that describes it

When a change touches configuration alone, the documentation describing that configuration is in scope even though the diff does not touch it. A key renamed in a keystore and named in a readme, a default changed in one place and quoted in another — the change is internally consistent and the pair contradicts. Read the configuration against every document that states its values.

### 4. Document Findings

- State each finding in the shape [Finding Layout](../resources/findings-report.md#finding-layout) declares, carrying the fields under [Field List](../resources/rust-substrate-code-review.md#field-list) and no others, with its severity derived through the map per [Severity](../resources/findings-report.md#severity) and its reachability settled from the code the finding cites per [Reachability](../resources/findings-report.md#reachability)
- Create the `{code_review_report}` in `{planning_folder_path}` — or update it in place when the manual diff review already created it, which owns its own `##` section within it
- Emit a brief summary of critical and high findings as part of the bindable report output for the binding activity to surface

### 5. Record the Method

- Create the `{code_review_method}` in `{planning_folder_path}` from the [Method Record Template](../resources/rust-substrate-code-review.md#method-record-template): the surface enumerated, each sweep and what it returned including the clean ones, and the compliance assessment. A finding's own evidence stays on the finding, per [Report and Methodology](../resources/findings-report.md#report-and-methodology)

## Rules

### evidence-required

Every finding must cite specific code with file path and line numbers

### severity-consistency

Apply severity levels consistently — critical for security/data loss, high for correctness, medium for maintainability, low for style

### findings-constraint

Every finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` form the PR's findings; findings on other files form a separate "pre-existing" grouping.
