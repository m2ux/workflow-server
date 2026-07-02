---
metadata:
  version: 1.1.0
---

## Capability

Examine all changes on the feature branch and assess them for scope discipline, orphaned symbols, investigation artifacts, over-engineering, solution minimality, and PR-body conformance — the combined diff-review and artifact-identification pass that surfaces every finding for the review document.

## Inputs

### branch_name

Feature branch under review, examined via `git diff` / `git log`.

### requirements

The work-package requirements, used as the scope baseline for the scope-discipline check.

### changed_files

List of files changed in the work package, passed to the orphan scan.

### pr_number

PR identifier, used to read the live PR body for conformance verification.

## Outputs

### strategic_review_doc

The strategic review document this pass populates with categorized findings — scope creep, orphaned symbols, investigation artifacts, over-engineering, and PR-body conformance entries. Same artifact the group root declares; this op writes the findings into it.

## Protocol

### 1. Load Guidance

- Use attached [architecture-review](../../resources/architecture-review.md) for architecture guidance; the rules below govern the review findings
- Examine all changes on the feature branch `{branch_name}` against the base branch using `git diff` and `git log`:

  ```bash
  # List all files changed in this branch
  git diff --name-only <base-branch> HEAD

  # For each file, ask: Is this change necessary for the solution?
  git diff <base-branch> HEAD -- <file>
  ```

- Assess each changed file against [per-file-necessity](#per-file-necessity)

### 2. Examine Scope

- Review changes for scope and relevance to work package
- Document any changes unrelated to requirements as scope creep
- If the PR contains changes unrelated to the work package, document them and flag for user decision

### 3. Scope Discipline Check

- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[scope-discipline-check](../../../meta/techniques/gitnexus-operations/scope-discipline-check.md)(requirements-scope: `{requirements}`); flag any affected process outside the requirements as scope creep for user decision.

### 4. Orphan Check

- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[orphan-scan](../../../meta/techniques/gitnexus-operations/orphan-scan.md)(changed_files: `{changed_files}`) to surface introduced-but-unreferenced symbols as over-engineering candidates — it beats grep heuristics for orphan detection.

### 5. Identify Artifacts

- Probe each area of the [speculative-changes-audit](#speculative-changes-audit)
- Classify every candidate per the group's [finding-categories](./TECHNIQUE.md#finding-categories)

### 6. Minimality Check

- Answer the five [minimality-check](#minimality-check) questions; record each question answered "No" as a finding for the `{strategic_review_doc}`, with the action from the "If No" column as the cleanup it warrants

### 7. Verify Pr Body Conformance

- Read the live PR body via `gh pr view {pr_number} --json body --jq .body`.
- Run [update-pr](../update-pr/TECHNIQUE.md)::[verify-body](../update-pr/verify-body.md) against the live body.
- If `body_conforms == false`, record each `body_findings` entry in the `{strategic_review_doc}` under 'PR body conformance'.

## Rules

### per-file-necessity

For each changed file, verify: the change directly supports the solution (not a speculative attempt); it is minimal (no unnecessary additions); it doesn't include debugging artifacts; and it wasn't superseded by a simpler approach.

### speculative-changes-audit

| Category | Questions to Ask |
|----------|------------------|
| **Infrastructure** | Were CI/CD changes, build configuration, or environment setup modified speculatively? Are they still needed for the final solution? |
| **Dependencies** | Were dependencies added, removed, or modified that aren't required by the final implementation? |
| **Debug Code** | Are there debug statements, verbose logging, or diagnostic outputs that should be removed? |
| **Fallback Logic** | Were fallback mechanisms added that are unnecessary given the final approach? |
| **Configuration** | Were configuration files modified beyond what the final solution requires? |

### minimality-check

| Question | If "No" |
|----------|---------|
| Is every changed file necessary for the fix? | Revert unnecessary file changes |
| Is every added line of code necessary? | Remove speculative or debug code |
| Are all new dependencies required? | Remove unused dependencies |
| Are all configuration changes required? | Revert unnecessary config changes |
| Is the solution as simple as it could be? | Consider simplification |
