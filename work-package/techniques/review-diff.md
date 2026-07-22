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

[Index](../resources/manual-diff-review.md#file-index-generation) of changed blocks for external diff review, with per-block rationale paragraphs whose Block titles hyperlink to `file:line`

#### artifact

`change-block-index.md`

#### block_rationale

Per-block descriptive paragraphs explaining intent, context, and non-obvious design choices; Block titles link to the primary `file:line`

### manual_diff_review_report

Manual diff review [findings](../resources/manual-diff-review.md#manual-diff-review-section-template) from user-flagged blocks, written as the `## Manual Diff Review` section of the code-review [report](../resources/rust-substrate-code-review.md#report-template) (the review findings' canonical home) — created here when this review runs first, updated in place when the full code-review report is written.

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

- Build the change-block index per the [index and header forms](../resources/manual-diff-review.md#file-index-generation): lean-header summary line (branches compared · file count · hunk count · review-time estimate), then `## Block Rationale` with one `### [Block N — file:line](relative-path:line)` subsection per block — no Instructions section and no file-index table
- When a block centres on a graph-resolvable symbol, enrich the Block Rationale with caller/callee/process context from [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) so the reviewer understands why the diff matters and which execution flows it touches.
- Write index to the `{change_block_index}` under `{planning_folder_path}` — the binding activity surfaces the index for external diff-tool review

### 4. Collect Flagged

- Consume flagged rows from the activity response, reported as block numbers only: `3, 7, 12` (those blocks have issues) or `none` (skip the interview loop, proceed to automated reviews)
- A bare block number covers all changes in that file; a block with a line reference (e.g. `3-L42`) focuses the interview on that specific line
- Populate `{flagged_block_indices}` from the flagged set so the activity `forEach` can bind `{current_block_index}`

### 5. Interview Blocks

- For each flagged block (activity `forEach` over `{flagged_block_indices}`): assemble the full diff content for that file into the interview context; confirm before continuing to the next block
- Record the user's description verbatim from the activity response, noting severity if mentioned (critical, minor, etc.)
- If the response marks the block as a critical blocker, set `{has_critical_blocker}`=true
- Continue to the next flagged block until all are addressed
- Detect manual review edits: compare the working tree to the last agent-written tip for paths under review; when the reviewer applied edits outside the agent, record each confirmed pattern as a retrospective candidate (in-task follow-up)

### 6. Create Report

- Write the `{manual_diff_review_report}` as the `## Manual Diff Review` section of `code-review.md`, following the [section template](../resources/manual-diff-review.md#manual-diff-review-section-template) (creating the artifact if this review runs first)
- Include flagged rows, interview responses verbatim, and severity; when the user reported `none`, the section is its one-line header only

## Rules

### rationale-quality

Each Block Rationale paragraph is 3–5 sentences covering intent, context, and any non-obvious design choices. Focus on *why* the change exists, not just *what* it does — reviewers see the *what* in the diff. Mention relevant prior state, trade-offs, or constraints that informed the approach; plain technical language per [manage-artifacts](./manage-artifacts/TECHNIQUE.md#plain-technical-language).

### review-conduct

Work systematically (top-to-bottom or by logical grouping); reference surrounding code when describing an issue; be specific — include line numbers or code snippets in finding descriptions.
