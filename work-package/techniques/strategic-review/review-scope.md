---
metadata:
  version: 1.3.0
---

## Capability

Scope-discipline and artifact-hygiene findings across the feature-branch diff for the strategic review document.

## Inputs

### branch_name

Feature branch under review, examined via `git diff` / `git log`.

### requirements

The work-package requirements, used as the scope baseline for the scope-discipline check.

### changed_files

List of files changed in the work package, passed to the orphan scan.

### pr_number

*(optional)* PR identifier for the PR under review. Absent when no PR exists (stealth mode).

## Outputs

### strategic_review_doc

The strategic review document holding categorized findings — scope creep, orphaned symbols, investigation artifacts, over-engineering, and PR-body conformance entries. Same artifact the group root declares.

### unsigned_commits_in_pr

Boolean — `true` when any commit in the `{$base_branch}..HEAD` range carries no valid GPG signature (`%G?` reports `N` or `B`).

### unsigned_commit_list_summary

Short human-readable summary of the unsigned commits (hash + subject, one per line); empty when all commits are signed.

## Protocol

### 1. Load Guidance

- Use attached [architecture-review](../../resources/architecture-review.md) for architecture guidance; the rules below govern the review findings
- Identify the base branch (`{$base_branch}`): the PR's target branch via `gh pr view {pr_number} --json baseRefName --jq .baseRefName` when `{pr_number}` is set; otherwise (no PR — stealth mode) the default branch of the configured push remote.
- Examine the authored surface `{changed_files}` on the feature branch `{branch_name}` using three-dot diffs against the base branch (`{$base_branch}`):
  - Consume the canonical `{changed_files}` when it is established (review mode, produced by `review-baseline-state`); otherwise (create mode, no PR baseline) derive it from the local working-tree diff against `{$base_branch}`.

  ```bash
  # For each file in {changed_files}, ask: Is this change necessary for the solution?
  git diff {$base_branch}...HEAD -- <file>
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

### 7. Scan Commit Signatures

- Scan the branch range for signature status: `git log --format='%h %G? %s' {$base_branch}..HEAD`.
- Set `{unsigned_commits_in_pr}` `true` and build `{unsigned_commit_list_summary}` from the commits reporting `N` or `B`; otherwise set it `false` with an empty summary.

### 8. Verify Pr Body Conformance

- Skip this phase when `{pr_number}` is unset (no PR exists — stealth mode).
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

### findings-constraint

Every finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` form the PR's findings; findings on other files form a separate "pre-existing" grouping.
