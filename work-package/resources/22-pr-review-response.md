---
id: pr-review-response
version: 1.0.0
---

# PR Review Analysis and Response Guide

**Purpose:** Guidelines for analyzing review comments from a GitHub Pull Request and crafting thoughtful, professional responses. This guide covers comment gathering, analysis, response formulation, and implementation of approved changes.

---

## Overview

After a PR receives review feedback, this guide helps systematically:
1. Gather and filter review comments
2. Analyze comment relevance
3. Craft professional responses
4. Implement approved follow-up actions
5. Post responses to the PR

---

## Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Access to the target repository
- **CRITICAL**: A specific PR number must be provided

---

## Step 1: Gather PR Comments

### 1.1: Retrieve All PR Comments

```bash
gh api repos/[REPO_OWNER]/[REPO_NAME]/pulls/[PR_NUMBER]/comments --paginate
```

### 1.2: Filter to Unresolved Comments

Focus on unresolved comments to avoid redundant work:

```bash
# Check latest review dates
gh pr view [PR_NUMBER] --json reviews | jq '.reviews[] | {author: .author.login, state: .state, submittedAt: .submittedAt}' | tail -5

# Filter to comments from latest review round
gh api repos/[REPO_OWNER]/[REPO_NAME]/pulls/[PR_NUMBER]/comments --paginate | jq '.[] | select(.user.login != "[PR_AUTHOR]" and .updated_at >= "[LATEST_REVIEW_DATE]") | {id: .id, body: .body, html_url: .html_url, path: .path, line: .line}' > /tmp/unresolved_comments.json
```

### 1.3: Identify Question-Type Comments

```bash
cat /tmp/unresolved_comments.json | jq -r '.body' | grep -i "what\|how\|why\|which" | nl
```

### Verification Checklist

- [ ] Total comment count confirmed
- [ ] Unresolved comments filtered (latest review round)
- [ ] Question-type comments identified
- [ ] Comments saved for analysis

---

## Step 2: Analyze Comment Relevance

For each review comment:

1. **Read the context**: Note line numbers, file paths, and concerns raised
2. **Compare against current code**: Determine if comment still applies
3. **Categorize comments**:
   - Still applicable and needs response
   - Already addressed in updates
   - No longer relevant due to changes
   - Needs clarification or discussion

---

## Step 3: Create Response List

Generate a numbered list of applicable comments including:
- Brief description of the concern
- File path and line number
- Link to the original GitHub discussion

**Format:**
```
1. Clarify error handling - src/handler.rs:45 [Discussion](https://github.com/repo/pull/123#discussion_r1234567890)
```

---

## Step 4: Craft Responses

### Response Quality Standards

**Professional and Technical:**
- Use measured, technical language
- Avoid hyperbolic statements and superlatives
- Focus on factual observations and technical merit

**Comprehensive:**
- Address the specific concern raised
- Provide concrete examples where helpful
- Include implementation details when relevant
- Consider trade-offs and alternatives

**Properly Formatted:**
- Use blockquotes (>) for responses
- Include "Optional doc wording" when proposing text changes
- Structure for direct pasting into PR comments

---

## Step 5: Response Format Template

```markdown
### [NUMBER]. [Brief Description] - [FILE_PATH:LINE_NUMBER]

**Comment:** ["exact comment text"](link)

**Response:**

> [Detailed explanation addressing the concern]
> 
> **Optional doc wording:**
> "[Suggested documentation text]"

**Follow-up Actions:**
1. [Specific action item]
2. [Another action item]
```

---

## Step 6: Create Review Document

Create a comprehensive review analysis document:

**Location:** `.engineering/artifacts/reviews/[YYYY-MM-DD]-pr[PR_NUMBER]-review-analysis.md`

**Required Sections:**
1. Document Header with metadata
2. Executive Summary
3. Analysis Methodology
4. Review Comments and Responses (co-located Q&A)
5. Conclusion
6. Sources and References

---

## Step 7: Sequential Action Implementation

After completing the review document, process each review item:

### 7.1: Present Each Review Item

For each review item with follow-up actions:

```
Review Item 1: [Title]

Follow-up Actions:
1. [Action 1]
2. [Action 2]
3. [Action 3]

Which actions would you like me to implement? (e.g., '1,3' or 'all' or 'none')
```

### 7.2: Wait for User Input

- Accept action numbers for the current review item only
- Only implement actions explicitly requested by the user

### 7.3: Implement Selected Actions

- Execute only the specified actions
- Confirm completion: "✅ [Action description] - Completed"

### 7.4: Continue to Next Item

Process all review items sequentially.

---

## Step 8: Post PR Responses

After implementing approved actions:

### 8.1: Generate Response Comments

For each comment where actions were implemented:

```
Original Comment: "[comment text]"

Proposed Response:
"[Response acknowledging concern and stating what was done]"

Actions Implemented:
- ✅ Action 1: [Description]
- ✅ Action 2: [Description]
```

### 8.2: Request User Approval

Ask: "Please review the proposed responses. Should I post these to the PR? (yes/no/modify)"

### 8.3: Post Approved Responses

```bash
gh api repos/[REPO_OWNER]/[REPO_NAME]/pulls/comments/[COMMENT_ID]/replies --method POST --field body="[RESPONSE_TEXT]"
```

---

## Response Comment Best Practices

- **Acknowledge First**: Start by acknowledging the reviewer's valid point
- **State Actions Clearly**: Explicitly mention what was implemented
- **Be Concise**: Keep responses focused
- **Professional Tone**: Use collaborative language
- **Avoid Superlatives**: No "excellent", "amazing", "perfect"
- **Reference Implementation**: Link to specific commits when relevant

### Response Templates

```
✅ Acknowledgment + Action:
"Valid point. [Change made]. This [explains benefit]."

✅ Question Resolution:
"Correct about [concern]. [Action taken] to address this."

✅ Implementation Confirmation:
"Implemented as suggested. [Brief description] in [location]."

✅ Technical Explanation:
"[Direct answer]. [Implementation details] to resolve this."
```

---

## Completeness Checklist

- [ ] All unresolved comments analyzed
- [ ] Response document created
- [ ] Follow-up actions identified for each item
- [ ] User approved which actions to implement
- [ ] Approved actions implemented
- [ ] Response comments drafted
- [ ] User approved responses
- [ ] Responses posted to PR
- [ ] Summary of all changes provided

---

## Quality Requirements

- **Complete Coverage**: All unresolved reviewer comments addressed
- **Professional Tone**: Technical communication standards maintained
- **Ready-to-Use Responses**: Blockquote format for direct copying
- **Embedded Follow-up Actions**: Every response includes actionable items
- **Comprehensive Citations**: Technical details properly sourced
- **Verified Links**: All source code references tested
