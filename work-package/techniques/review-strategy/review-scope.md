---
metadata:
  version: 1.0.0
---

## Capability

Examine all changes on the feature branch and assess them for scope discipline, orphaned symbols, investigation artifacts, over-engineering, and PR-body conformance — the combined diff-review and artifact-identification pass that surfaces every finding for the review document.

## Inputs

### branch_name

Feature branch under review, examined via `git diff` / `git log`; inherited from the [review-strategy](./TECHNIQUE.md) group root.

### requirements

The work-package requirements, used as the scope baseline for the scope-discipline check; inherited from the [review-strategy](./TECHNIQUE.md) group root.

### changed_files

List of files changed in the work package, passed to the orphan scan; inherited from the [review-strategy](./TECHNIQUE.md) group root.

### pr_number

PR identifier, used to read the live PR body for conformance verification; inherited from the [review-strategy](./TECHNIQUE.md) group root.

## Outputs

### strategic_review_doc

The strategic review document this pass populates with categorized findings — scope creep, orphaned symbols, investigation artifacts, over-engineering, and PR-body conformance entries. Same artifact the group root declares; this op writes the findings into it.

## Protocol

### 1. Load Guidance

- Use attached [strategic-review](../../resources/strategic-review.md) and [architecture-review](../../resources/architecture-review.md) for guidance
- Examine all changes on the feature branch `{branch_name}` using `git diff` and `git log`

### 2. Examine Scope

- Review changes for scope and relevance to work package
- Document any changes unrelated to requirements as scope creep
- If the PR contains changes unrelated to the work package, document them and flag for user decision

### 3. Scope Discipline Check

- Apply [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[scope-discipline-check](../gitnexus-operations/scope-discipline-check.md)(requirements-scope: `{requirements}`); flag any affected process outside the requirements as scope creep for user decision.

### 4. Orphan Check

- Apply [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[orphan-scan](../gitnexus-operations/orphan-scan.md)(changed_files: `{changed_files}`) to surface introduced-but-unreferenced symbols as over-engineering candidates — it beats grep heuristics for orphan detection.

### 5. Identify Artifacts

- Look for investigation artifacts: extra logging, debug messages, temporary workarounds
- Look for over-engineering: generic abstractions for specific problems, unused config options
- Look for orphaned infrastructure: commented-out code, unused utilities, duplicate functionality

### 6. Verify Pr Body Conformance

- Read the live PR body via `gh pr view {pr_number} --json body --jq .body`.
- Run [update-pr](../update-pr.md)::protocol.verify-body against the live body.
- If `body_conforms == false`, record each `body_findings` entry in the `{strategic_review_doc}` under 'PR body conformance'.
