---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 11
  legacy_id: 11
---

## Capability

Conduct structured manual diff review using external side-by-side diff tool with indexed block references

## Protocol

### 1. Sync Branch

- Run `git pull` on the `{branch_name}` feature branch to ensure it is up to date
- Resolve merge conflicts before proceeding if any
- If the `git pull` reveals conflicts, resolve them before continuing

### 2. Parse Diff

- Parse `git diff` to extract list of changed files and hunks
- If the diff contains no changes, verify the correct branch and commit range before proceeding
- Assign `{$row_index}` to each change block
- Estimate review time (30 sec per change)

### 3. Create Index

- Create file index table with columns: Row | Path | File (each `{row_index}` hyperlinks to its rationale section, e.g. [1](#block-1))
- Include review time estimate in index
- Below the index table, generate a '## Block Rationale' section containing one subsection per block (### Block N) with a descriptive paragraph explaining what the change does and why it exists — covering intent, context, and any non-obvious design choices
- Rationale paragraphs should aid manual review by giving reviewers context before they inspect the diff
- When a block centres on a graph-resolvable symbol, enrich the Block Rationale with caller/callee/process context from [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) so the reviewer understands why the diff matters and which execution flows it touches.
- Write index to the `{change_block_index}` under `{planning_folder_path}`
- Follow the structured diff-review process in [manual-diff-review](../resources/manual-diff-review.md)

### 4. Present Index

- Present index to user for external diff tool review
- User identifies issues in their external diff tool; agent does not pre-judge

### 5. Collect Flagged

- Collect flagged row numbers from user

### 6. Interview Blocks

- Conduct focused interview for each flagged block
- Ask what the issue is and record the response
- If user marks block as critical blocker, set `{has_critical_blocker}`=true

### 7. Create Report

- Create the `{manual_diff_review_report}` with all findings
- Include flagged rows, interview responses, and severity

## Outputs

### change_block_index

[Index](../resources/manual-diff-review.md#file-index-generation) of changed blocks for external diff review, with per-block rationale paragraphs hyperlinked from the index table to aid manual review

#### change_block_index_artifact

`change-block-index.md`

#### index_table

Row (hyperlinked to rationale) | Path | File with review time estimate

#### block_rationale

Per-block descriptive paragraphs explaining intent, context, and non-obvious design choices

### manual_diff_review_report

Manual diff review [findings](../resources/manual-diff-review.md#manual-diff-review-report-template) from user-flagged blocks

#### manual_diff_review_artifact

`manual-diff-review.md`

#### findings

Per-block issues with interview responses

#### has_critical_blocker

True if any block marked as critical blocker
