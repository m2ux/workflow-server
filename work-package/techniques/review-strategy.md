---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.5.0
  order: 12
  legacy_id: 12
---

## Capability

Review implementation to ensure changes are minimal, focused, scope-disciplined, and free of investigation artifacts, and produce a final architecture summary

## Inputs

### branch-name

Feature branch containing implementation changes

### pr-number

Pull request number for scope reference

## Protocol

### 1. Load Guidance

- Use attached [strategic-review](../resources/strategic-review.md) and [architecture-review](../resources/architecture-review.md) for guidance
- Examine all changes on the feature branch `{branch_name}` using git diff and git log

### 2. Examine Scope

- Review changes for scope and relevance to work package
- Document any changes unrelated to requirements as scope creep
- If the PR contains changes unrelated to the work package, document them and flag for user decision

### 3. Scope Discipline Check

- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[scope-discipline-check](./gitnexus-operations/scope-discipline-check.md)(requirements_scope: {$requirements}); flag any affected process outside the requirements as scope creep for user decision.

### 4. Orphan Check

- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[orphan-scan](./gitnexus-operations/orphan-scan.md)(changed_files: {$changed-files}) to surface introduced-but-unreferenced symbols as over-engineering candidates — it beats grep heuristics for orphan detection.

### 5. Changes Folder

- If changes/ exists at target_path repository root, read sibling fragments as the format template
- Create one new fragment only when none already ties to this issue/PR/work package
- Match filename convention (e.g. type.issue.ext) and section structure of existing entries
- REQUIRED: reference the GitHub issue for this work package using the variables already captured in start-work-package — do NOT re-search. When issue_platform=github, include 'Closes: #{issue_number}' or 'Fixes: #{issue_number}' (or the full {issue_url} form when sibling fragments use that style). When issue_platform=jira, search for a paired GitHub tracker issue and reference it the same way; if none exists, warn the user that the project's CI check-changes may fail and suggest creating a tracking GitHub issue or applying a skip-changes-check label.
- Validate the completed fragment against CI requirements: must contain a GitHub issue reference matching the regex github\.com/.+/issues/[0-9]+ or (Fixes|Closes|Resolves):?\s+#[0-9]+

### 6. Identify Artifacts

- Look for investigation artifacts: extra logging, debug messages, temporary workarounds
- Look for over-engineering: generic abstractions for specific problems, unused config options
- Look for orphaned infrastructure: commented-out code, unused utilities, duplicate functionality

### 7. Verify Pr Body Conformance

- Read the live PR body via `gh pr view {pr_number} --json body --jq .body`.
- Run [update-pr](./update-pr.md)::protocol.verify-body against the live body.
- If body_conforms == false, record each body_findings entry in the {strategic-review-doc} under 'PR body conformance'.

### 8. Document Findings

- Document all findings in the {strategic-review-doc}, written under {planning-folder}
- Categorize by type: investigation artifacts, over-engineering, orphaned infrastructure
- If all changes are justified and no cleanup is needed, document a clean review result

### 9. Apply Cleanup

- Apply cleanup (removing identified artifacts) when user approves
- Use edit tool for cleanup modifications

### 10. Create Architecture Summary

- Create the {architecture-summary-doc} following the format defined by the [summarize-architecture](./summarize-architecture.md) technique, which is the authoritative owner of diagram conventions
- Target stakeholder communication

## Outputs

### strategic-review-doc

Strategic review [findings](../resources/strategic-review.md#strategic-review-artifact-template) and recommendations

#### artifact

`strategic-review-{n}.md`

### architecture-summary-doc

Architecture [summary](../resources/architecture-summary.md#architecture-summary-artifact-template) with diagrams for stakeholders

#### artifact

`architecture-summary.md`

## Rules

### minimal-focused-changes

The goal is minimal, focused changes — every change must be justified by a requirement.
