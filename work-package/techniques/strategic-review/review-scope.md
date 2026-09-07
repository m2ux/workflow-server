---
metadata:
  version: 1.6.0
---

## Capability

Scope-discipline and artifact-hygiene findings across the feature-branch diff for the strategic review document.

## Inputs

### pr_number

*(optional)* PR identifier for the PR under review. Absent when no PR exists (stealth mode).

### body_conforms

*(optional)* Whether the live pull-request body satisfies every conformance criterion in the pr-description guide. Absent where no pull request exists.

### body_findings

*(optional)* Each way the live body departs from that guide, one entry per failed criterion. Empty where the body conforms, absent where no pull request exists.

## Outputs

### strategic_review_doc

The strategic review document holding categorized findings — scope creep, orphaned symbols, investigation artifacts, over-engineering, and PR-body conformance entries. Same artifact the group root declares.

### unsigned_commits_in_pr

Boolean — `true` when any commit in the `{$base_branch}..HEAD` range carries no valid GPG signature (`%G?` reports `N` or `B`).

### unsigned_commit_list_summary

Short human-readable summary of the unsigned commits (hash + subject, one per line); empty when all commits are signed.

## Protocol

### 1. Load Guidance

- Judge the change against [Architectural Significance](../../resources/architecture-review.md#architectural-significance) and [Decision-Making Discipline](../../resources/architecture-review.md#decision-making-discipline); the rules below govern the review findings
- Identify the base branch (`{$base_branch}`): when `{pr_number}` is set, Apply [view-pr](../../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`) and take `{base_branch}`; otherwise (no PR — stealth mode) the default branch of the configured push remote.
- Examine the authored surface `{changed_files}` on the feature branch `{branch_name}` using three-dot diffs against the base branch (`{$base_branch}`):

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
- Where the leanness audit ran, over-engineering is its finding and its designator: cite the entry rather than restating the defect, and record only what this pass reached beyond it. That audit judges proportionality against the review taxonomy and this pass judges scope against the requirements, so a defect both reach is one defect seen from two angles rather than two findings.

### 5. Identify Artifacts

- Probe each area of the [Speculative Changes Audit](../../resources/strategic-review.md#speculative-changes-audit)
- Classify every candidate per the group's [finding-categories](./TECHNIQUE.md#finding-categories)

### 6. Minimality Check

- Answer the five [Minimality Check](../../resources/strategic-review.md#minimality-check) questions; record each question answered "No" as a finding for the `{strategic_review_doc}`, with the action from the "If No" column as the cleanup it warrants

### 7. Scan Commit Signatures

- Scan the branch range for signature status: `git log --format='%h %G? %s' {$base_branch}..HEAD`.
- Set `{unsigned_commits_in_pr}` `true` and build `{unsigned_commit_list_summary}` from the commits reporting `N` or `B`; otherwise set it `false` with an empty summary.

### 8. Record Pr Body Conformance

- Where `{body_conforms}` is false, record each `{body_findings}` entry in the `{strategic_review_doc}` under 'PR body conformance'.
  > - A finding an earlier conformance check already stated is cited by its designator rather than restated; a body edited since that check is re-judged whole.
  > - Where `{body_conforms}` is absent, no pull request exists and the section is omitted.

## Rules

### per-file-necessity

For each changed file, verify: the change directly supports the solution (not a speculative attempt); it is minimal (no unnecessary additions); it doesn't include debugging artifacts; and it wasn't superseded by a simpler approach.

### findings-constraint

Every finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` form the PR's findings; findings on other files form a separate "pre-existing" grouping.
