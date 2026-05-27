---
name: review-strategy
description: Strategic review of a PR: scope discipline, investigation-artifact removal, and final architecture summary.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.5.0
  order: 12
  legacy_id: 12
---

# Review Strategy

## Capability

Review implementation to ensure changes are minimal, focused, and free of investigation artifacts

## Inputs

### branch-name

Feature branch containing implementation changes

### planning-folder-path

Path to planning folder for artifact output

### pr-number

Pull request number for scope reference

## Protocol

### 1. Load Guidance

- Use attached [strategic-review](legacy/work-package/resources/strategic-review/SKILL.md) and [architecture-review](legacy/work-package/resources/architecture-review/SKILL.md) for guidance
- Examine all changes in the PR using git diff and git log

### 2. Examine Scope

- Review changes for scope and relevance to work package
- Document any changes unrelated to requirements as scope creep
- Flag scope creep for user decision if found

### 3. Scope Discipline Check

- Apply the [gitnexus-operations](legacy/work-package/techniques/gitnexus-operations/SKILL.md) `scope-discipline-check` operation with `{requirements_scope: <work-package requirements>}`; flag any affected process outside the requirements as scope creep for user decision.

### 4. Orphan Check

- Apply `gitnexus-operations::orphan-scan` with `{changed_files: <work-package changed files>}` to surface introduced-but-unreferenced symbols as over-engineering candidates — it beats grep heuristics for orphan detection.

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
- Goal is minimal, focused changes — every line justified by requirements

### 7. Verify Pr Body Conformance

- Read the live PR body via `gh pr view {pr_number} --json body --jq .body`.
- Run update-pr::protocol.verify-body against the live body.
- If body_conforms == false, record each body_findings entry in strategic-review-{n}.md under 'PR body conformance'.

### 8. Document Findings

- Document all findings in strategic-review-{n}.md
- Categorize by type: investigation artifacts, over-engineering, orphaned infrastructure
- If all changes justified, document clean review result

### 9. Apply Cleanup

- Apply cleanup (removing identified artifacts) when user approves
- Use edit tool for cleanup modifications

### 10. Create Architecture Summary

- Create architecture-summary.md following the format defined by the summarize-architecture skill (skill 20), which is the authoritative owner of diagram conventions
- Target stakeholder communication

## Outputs

### strategic-review-doc

Strategic review findings and recommendations

- **artifact**: `strategic-review-{n}.md`
- **investigation_artifacts**: Extra logging, debug, temporary workarounds found
- **over_engineering**: Generic abstractions, unused config options
- **orphaned_infrastructure**: Commented code, unused utilities, duplicates
- **scope_assessment**: Scope creep or minimal-focus assessment

### architecture-summary-doc

Architecture summary with diagrams for stakeholders

- **artifact**: `architecture-summary.md`
- **uml_diagrams**: UML-style diagrams of implementation
- **summary**: High-level architecture description

## Errors

### scope_creep

**Cause:** PR contains changes unrelated to the work package

**Recovery:** Document and flag for user decision

### no_cleanup_needed

**Cause:** All changes are justified

**Recovery:** Document clean review result
