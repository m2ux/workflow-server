---
metadata:
  version: 1.1.0
---

## Capability

Conduct structured manual diff review using external side-by-side diff tool with indexed block references

## Inputs

### branch_name

Feature branch whose diff is reviewed (synced via `git pull`, parsed via `git diff`)

### planning_folder_path

Folder where the change block index and manual diff review report are written

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

Manual diff review [findings](../resources/manual-diff-review.md#manual-diff-review-report-template) from user-flagged blocks

#### artifact

`manual-diff-review.md`

#### block_findings

Per-block issues with interview responses

#### has_critical_blocker

True if any block marked as critical blocker

## Protocol

### 1. Sync Branch

- Run `git pull` on the `{branch_name}` feature branch to ensure it is up to date
- Resolve merge conflicts before proceeding if any
- Identify the base branch (`{$base_branch}`) — typically `main`/`master`, the branch the PR will merge into

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
- Write index to the `{change_block_index}` under `{planning_folder_path}`

### 4. Present Index

- Present index to user for external diff tool review (VS Code, Meld, etc.)
- User identifies issues in their external diff tool; agent does not pre-judge

### 5. Collect Flagged

- Collect flagged rows from the user, reported as row numbers only: `3, 7, 12` (those rows have issues) or `none` (skip the interview loop, proceed to automated reviews)
- A bare row number covers all changes in that file; a row with a line reference (e.g. `3-L42`) focuses the interview on that specific line

### 6. Interview Blocks

- For each flagged row: display the full diff content for that file (filename and path), then ask what the issue is
- Record the user's description verbatim, noting severity if mentioned (critical, minor, etc.)
- If user marks block as critical blocker, set `{has_critical_blocker}`=true
- Continue to the next flagged row until all are addressed

### 7. Create Report

- Create the `{manual_diff_review_report}` with all findings, following the [report template](../resources/manual-diff-review.md#manual-diff-review-report-template)
- Include flagged rows, interview responses verbatim, and severity; omit the Findings section when the user reported `none`

## Rules

### rationale-quality

Each Block Rationale paragraph is 3–5 sentences covering intent, context, and any non-obvious design choices. Focus on *why* the change exists, not just *what* it does — reviewers see the *what* in the diff. Mention relevant prior state, trade-offs, or constraints that informed the approach; plain technical language per [manage-artifacts](./manage-artifacts/TECHNIQUE.md#plain-technical-language).

### review-conduct

Work systematically (top-to-bottom or by logical grouping); reference surrounding code when describing an issue; be specific — include line numbers or code snippets in finding descriptions.
