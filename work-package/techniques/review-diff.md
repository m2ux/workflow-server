---
metadata:
  version: 2.4.0
---

## Capability

Conduct structured manual diff review using external side-by-side diff tool with indexed block references

## Inputs

### base_pr_diff

*(optional)* The base↔PR diff to review, when a review-mode baseline already derived it — read in place of re-deriving the three-dot diff.

### base_sha

*(optional)* Commit SHA of the base branch the diff is taken against, so block citations resolve at the reviewed baseline.

## Outputs

### change_block_index

[Index](../resources/manual-diff-review.md#file-index-generation) of changed blocks for external diff review, with per-block rationale paragraphs whose Block titles hyperlink to `file:line` as permanent blob URLs at the reviewed commit

#### artifact

`change-block-index.md`

#### audience

`human`

#### block_rationale

Per-block descriptive paragraphs explaining intent, context, and non-obvious design choices; Block titles link to the primary `file:line`

### reviewed_code_base_url

Permanent blob-URL prefix for citing the reviewed code at the commit under review — repository host, owner, name, `blob`, and the full head sha. A citation appends the repo-relative path and a line anchor.

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
- Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`); set `{$base_branch}` from `{base_branch}`
- If HEAD is a merge commit or the branch has merged `{$base_branch}` in, the three-dot range against the merge-base already scopes to the authored diff; log that a merge-in was detected

### 2. Parse Diff

- Parse `git diff {$base_branch}...HEAD` to extract the list of changed files and hunks
- If the diff contains no changes, verify the correct branch and commit range before proceeding
- Assign `{$row_index}` to each change block
- Estimate review time at 30 seconds per hunk (count: `git diff {$base_branch}...HEAD | grep -c "^@@"`); formula `total hunks × 0.5 minutes`, rounded to the nearest minute, displayed as "~X minutes" (or "~Xh Ym" for longer reviews)

### 3. Pin the Citation Base

- Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`); set `{reviewed_code_base_url}` from the op output.  
  > When no PR exists yet, take the repository from `{push_remote}` and the sha from that remote's tip of the branch (`git -C {target_path} ls-remote {push_remote} {branch_name}`); push the branch first when the remote does not carry it, so the sha the citations name is reachable.
- Every Block title and finding citation this technique writes is built on `{reviewed_code_base_url}`, per [permanent-blob-citations](../resources/manual-diff-review.md#permanent-blob-citations).

### 4. Create Index

- Build the change-block index per the [index and header forms](../resources/manual-diff-review.md#file-index-generation): lean-header summary line (branches compared · file count · hunk count · review-time estimate), then `## Block Rationale` with one `### [Block N — file:line]` subsection per block, each title linked under `{reviewed_code_base_url}` — no Instructions section and no file-index table
- When a block centres on a graph-resolvable symbol, enrich the Block Rationale with caller/callee/process context from [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) so the reviewer understands why the diff matters and which execution flows it touches.
- Write index to the `{change_block_index}` under `{planning_folder_path}`

### 5. Collect Flagged

- Consume flagged rows reported as block numbers only: `3, 7, 12` where those blocks carry an issue, or `none` where none does
- A bare block number covers all changes in that file; a block with a line reference (e.g. `3-L42`) focuses the interview on that specific line
- Populate `{flagged_block_indices}` from the flagged set so the activity `forEach` can bind `{current_block_index}`

### 6. Interview Blocks

- For each flagged block (activity `forEach` over `{flagged_block_indices}`): assemble the full diff content for that file into the interview context; confirm before continuing to the next block
- Record the user's description verbatim from the activity response, noting severity if mentioned (critical, minor, etc.)
- If the response marks the block as a critical blocker, set `{has_critical_blocker}`=true
- Continue to the next flagged block until all are addressed
- Detect manual review edits: compare the working tree to the last agent-written tip for paths under review; when the reviewer applied edits outside the agent, record each confirmed pattern as a retrospective candidate (in-task follow-up)

### 7. Create Report

- Write the `{manual_diff_review_report}` as the `## Manual Diff Review` section of `code-review.md`, following the [section template](../resources/manual-diff-review.md#manual-diff-review-section-template) (creating the artifact if this review runs first)
- Include flagged rows, interview responses verbatim, and severity; when the user reported `none`, the section is its one-line header only

## Rules

### rationale-quality

Each Block Rationale paragraph is 3–5 sentences covering intent, context, and any non-obvious design choices. Focus on *why* the change exists, not just *what* it does — reviewers see the *what* in the diff. Mention relevant prior state, trade-offs, or constraints that informed the approach; plain technical language per [manage-artifacts](./manage-artifacts/TECHNIQUE.md#plain-technical-language).

### review-conduct

Work systematically (top-to-bottom or by logical grouping); reference surrounding code when describing an issue; be specific — include line numbers or code snippets in finding descriptions.
