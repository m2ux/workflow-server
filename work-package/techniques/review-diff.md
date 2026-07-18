---
metadata:
  version: 2.0.0
---

## Capability

Conduct structured manual diff review using external side-by-side diff tool with indexed block references

## Inputs

### branch_name

Feature branch whose diff is reviewed (synced via `git pull`, parsed via `git diff`)

### planning_folder_path

Folder where the change block index and manual diff review report are written

### pr_number

PR identifier, used to resolve the authoritative base branch via `gh pr view`

## Outputs

### change_block_index

[Index](../resources/manual-diff-review.md#file-index-generation) of changed blocks for external diff review, with per-block rationale paragraphs hyperlinked from the index table to aid manual review

#### artifact

`change-block-index.md`

#### index_table

Row (hyperlinked to rationale) | Path | File with review time estimate

#### block_rationale

Per-block descriptive paragraphs explaining intent, context, and non-obvious design choices

### manual_diff_review_report

Manual diff review [findings](../resources/manual-diff-review.md#manual-diff-review-section-template) from user-flagged blocks, written as the `## Manual Diff Review` section of `code-review.md` (the review findings' [canonical home](./manage-artifacts/TECHNIQUE.md#canonical-home-map)) — created here when this review runs first, updated in place by [review-code](./review-code.md)

#### block_findings

Per-block issues with interview responses

#### has_critical_blocker

True if any block marked as critical blocker

## Protocol

### 1. Sync Branch

- Run `git pull` on the `{branch_name}` feature branch to ensure it is up to date
- Resolve merge conflicts before proceeding if any
- Identify the base branch (`{$base_branch}`) as the PR's target branch: `gh pr view {pr_number} --json baseRefName --jq .baseRefName`
- If HEAD is a merge commit or the branch has merged `{$base_branch}` in, the three-dot range against the merge-base already scopes to the authored diff; log that a merge-in was detected

### 2. Parse Diff

- Parse `git diff {$base_branch}...HEAD` to extract the list of changed files and hunks
- If the diff contains no changes, verify the correct branch and commit range before proceeding
- Assign `{$row_index}` to each change block
- Estimate review time at 30 seconds per hunk (count: `git diff {$base_branch}...HEAD | grep -c "^@@"`); formula `total hunks × 0.5 minutes`, rounded to the nearest minute, displayed as "~X minutes" (or "~Xh Ym" for longer reviews)

### 3. Create Index

- Create the file index table — columns Row | Path (directory without filename) | File (filename only), one row per changed file sorted alphabetically by path — per the [table and header forms](../resources/manual-diff-review.md#file-index-generation); each `{row_index}` hyperlinks to its rationale section (e.g. [1](#block-1))
- Open the index with the lean-header summary line (branches compared · file count · hunk count · review-time estimate) and the reviewer instructions block from the header form
- Below the index table, generate a '## Block Rationale' section containing one subsection per block (### Block N) with a descriptive paragraph per the rationale-quality rule
- When a block centres on a graph-resolvable symbol, enrich the Block Rationale with caller/callee/process context from [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) so the reviewer understands why the diff matters and which execution flows it touches.
- Write index to the `{change_block_index}` under `{planning_folder_path}` — the binding activity surfaces the index for external diff-tool review

### 4. Collect Flagged

- Consume flagged rows from the activity response, reported as row numbers only: `3, 7, 12` (those rows have issues) or `none` (skip the interview loop, proceed to automated reviews)
- A bare row number covers all changes in that file; a row with a line reference (e.g. `3-L42`) focuses the interview on that specific line

### 5. Interview Blocks

- For each flagged row: assemble the full diff content for that file (filename and path) into the interview context the binding activity surfaces
- Record the user's description verbatim from the activity response, noting severity if mentioned (critical, minor, etc.)
- If the response marks the block as a critical blocker, set `{has_critical_blocker}`=true
- Continue to the next flagged row until all are addressed

### 6. Create Report

- Write the `{manual_diff_review_report}` as the `## Manual Diff Review` section of `code-review.md`, following the [section template](../resources/manual-diff-review.md#manual-diff-review-section-template) (creating the artifact if this review runs first)
- Include flagged rows, interview responses verbatim, and severity; when the user reported `none`, the section is its one-line header only

## Rules

### rationale-quality

Each Block Rationale paragraph is 3–5 sentences covering intent, context, and any non-obvious design choices. Focus on *why* the change exists, not just *what* it does — reviewers see the *what* in the diff. Mention relevant prior state, trade-offs, or constraints that informed the approach; plain technical language per [manage-artifacts](./manage-artifacts/TECHNIQUE.md#plain-technical-language).

### review-conduct

Work systematically (top-to-bottom or by logical grouping); reference surrounding code when describing an issue; be specific — include line numbers or code snippets in finding descriptions.
