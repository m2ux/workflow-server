---
name: respond-to-pr-review
description: Process PR review feedback by categorizing comments, prioritizing by impact, implementing changes, and posting responses.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 2
  legacy_id: 2
---

# Respond To Pr Review

## Capability

Analyze and respond to PR review comments systematically

## Inputs

### pr-number

Pull request number

### review-comments

Review comments fetched from PR

## Protocol

### 1. Fetch Comments

- Use attached [pr-review-response](../../resources/pr-review-response/SKILL.md) for full response guidance
- Fetch all review comments from PR using gh API

### 2. Categorize

- Categorize comments by type (required change, suggestion, question, nit)
- Identify actionable items vs discussion points
- Prioritize by reviewer authority and impact

### 3. Address Comments

- For each review item with follow-up actions, present the item and its actions to the user. Ask which to implement (e.g., '1,3' or 'all' or 'none').
- Only implement actions explicitly selected by the user
- Commit fix changes per concern
- Document which comments require re-planning vs inline fixes
- Group related fixes into logical commits, not one giant commit

### 4. Post Responses

- Present drafted PR responses for user approval before posting
- Post approved responses to the PR comment thread
- If disagreeing with a reviewer, explain reasoning explicitly

### 5. Update Pr

- Push all fix commits to the PR branch
- Post response summary to PR

### 6. Assess Outcome

- After applying reviewer-requested changes, apply [gitnexus-operations](../gitnexus-operations/SKILL.md)::[detect-changes](../gitnexus-operations/detect-changes.md) to inform the 'minor fix' vs 'significant change' classification — small symbol/process deltas suggest minor; broad fan-out suggests significant.
- Determine if re-review is needed (significant changes) or minor fixes suffice

## Outputs

### review-analysis

PR review analysis document

- **artifact**: `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`
- **comment_summary**: Categorized comment list with dispositions
- **changes_made**: List of changes implemented in response
- **requires_replan**: Whether significant changes require returning to planning

## Rules

### respond-to-all

Every review comment must receive a response — acknowledged, implemented, or discussed

### prioritize-required

Address required changes before suggestions and nits

## Errors

### no_comments

**Cause:** No review comments found

**Recovery:** Verify PR has been reviewed and check comment visibility

### api_error

**Cause:** GitHub API error fetching comments

**Recovery:** Check authentication and PR access
