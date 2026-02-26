---
id: pr-description
version: 1.0.0
---

# Pull Request Description Guide

**Purpose:** Guidelines for creating well-structured Pull Request descriptions that communicate changes clearly and facilitate effective code review.

---

## Overview

A well-written PR description serves multiple audiences:
- **Reviewers** need to understand what changed and why
- **Future maintainers** need context when reading git history
- **Release managers** need to assess impact and changelog entries

> **Key Insight:** The PR description is the first thing reviewers see. A clear, well-structured description reduces review time and improves feedback quality.

---

## When to Apply These Guidelines

**Apply this guide to all PRs that:**
- Introduce new features or capabilities
- Fix bugs or address issues
- Refactor existing code
- Make architectural changes
- Update dependencies with breaking changes

**Simplified descriptions are acceptable for:**
- Documentation-only changes
- Typo fixes
- Dependency bumps (non-breaking)
- Automated/generated changes

---

## PR Description Structure

### Required Sections

```markdown
## Summary

[1-2 sentence summary of the change and key benefit]


🎫 [Ticket](https://{JIRA_DOMAIN}/browse/{TICKET_ID})  📐 [Engineering](link-to-start-here)  🧪 [Test Plan](link-to-test-plan)

---

## Motivation

[1-2 paragraphs explaining why this change is needed]

---

## Changes

[Bullet list of what changed]

---

## 📌 Submission Checklist

[Standard checklist items]
```

### Optional Sections

```markdown
## Migration Notes

[Required steps for consumers, if breaking changes]

## Screenshots

[Visual changes, UI updates]
```

**Template (Initial):**

```markdown
## Summary

[1-2 sentence summary of the proposed work]


🎫 [Ticket](link)  📐 [Engineering](eng-repo-link)

---

## Motivation

[Why this change is needed]

---

## Changes

**Implementation (coming next):**
- [Task 1 description]
- [Task 2 description]

---

## 📌 Submission Checklist

- [ ] Changes are backward-compatible (or flagged if breaking)
- [ ] Pull request description explains why the change is needed
- [ ] Self-reviewed the diff
- [ ] I have included a change file, or skipped for this reason: [reason]
- [ ] If the changes introduce a new feature, I have bumped the node minor version
- [ ] Update documentation (if relevant)
- [ ] No new todos introduced

---

## 🔱 Fork Strategy

- [ ] Node Runtime Update
- [ ] Node Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [ ] Ready for review
```

**Template (Final):**

```markdown
## Summary

[1-2 sentence summary with key benefit/metric achieved]


🎫 [Ticket](link)  📐 [Engineering](eng-repo-link)  🧪 [Test Plan](branch-link)

---

## Motivation

[Why this change was needed - can keep from initial PR]

---

## Changes

- **Component A** - [What was implemented]
- **Component B** - [What was modified]
- **Tests** - [Coverage summary]

---

## 📌 Submission Checklist

- [x] Changes are backward-compatible (or flagged if breaking)
- [x] Pull request description explains why the change is needed
- [x] Self-reviewed the diff
- [x] I have included a change file, or skipped for this reason: [reason]
- [x] If the changes introduce a new feature, I have bumped the node minor version
- [x] Update documentation (if relevant)
- [x] No new todos introduced

---

## 🔱 Fork Strategy

- [x] Node Runtime Update
- [ ] Node Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [x] Ready for review
```

---

## Section Guidelines

### Summary

The summary should be scannable and communicate the key outcome:

**Good:**
```markdown
## Summary

Add hybrid search combining vector similarity with BM25 keyword matching, improving search relevance by 35% on benchmark queries.
```

**Bad:**
```markdown
## Summary

This PR adds some improvements to search.
```

**Tips:**
- Lead with what the change does, not how
- Include quantifiable impact when available
- Keep to 1-2 sentences maximum

### Ticket, ADR, Engineering, and Test Plan Links

Always link to related artifacts on the same line for easy scanning:

```markdown
🎫 [Ticket](https://{JIRA_DOMAIN}/browse/{TICKET_ID})  📐 [Engineering](https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/main/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)  🧪 [Test Plan](https://github.com/{REPO_OWNER}/{REPO_NAME}/blob/{BRANCH_NAME}/docs/tests/test-plan-hybrid-search.md)
```

**When to include each link:**
- **Ticket** - Always include if work is tracked in a ticket
- **Engineering** - Always include; links to the README.md in the engineering artifacts planning folder for the work package. This provides reviewers access to design philosophy, planning, and review documents.
- **ADR** - Include for architectural decisions committed to the target repo (see [Architecture Review Guide](15-architecture-review.md))
- **Test Plan** - Include when formal test documentation exists (see [Test Plan Creation Guide](11-test-plan.md))

**Important:** Link to ADRs and test plans on the *feature branch*, not main:
- ✅ `https://github.com/OWNER/REPO/blob/feat/hybrid-search/docs/decisions/adr-hybrid-search.md`
- ❌ `docs/decisions/adr-hybrid-search.md` (resolves to main, which won't have the file yet)

**Note:** Engineering links point to the engineering artifacts repository (not the target repo), typically on `main` since artifacts are committed there directly.

### Motivation

Explain the "why" - what problem exists and why this change addresses it:

**Good:**
```markdown
## Motivation

Search queries currently use only vector similarity, which fails to match exact terms users expect. For example, searching "API rate limiting" returns results about "throttling mechanisms" but misses documents that explicitly mention "rate limiting."

Adding BM25 keyword matching as a secondary signal ensures exact matches are boosted, improving user satisfaction and reducing zero-result queries.
```

**Bad:**
```markdown
## Motivation

We need better search.
```

**Tips:**
- Describe the problem from the user's perspective
- Explain consequences of not addressing it
- Keep to 1-2 paragraphs

### Changes

List what changed, organized by component or area:

**Good:**
```markdown
## Changes

- **Search Engine** - Add BM25 scorer alongside vector similarity
- **Query Builder** - Support hybrid query construction with configurable weights
- **API** - New `search_mode` parameter: `vector`, `keyword`, or `hybrid` (default)
- **Tests** - 15 new integration tests covering hybrid scoring scenarios
```

**Bad:**
```markdown
## Changes

- Modified search.ts
- Updated tests
- Fixed some things
```

**Tips:**
- Group by logical component, not by file
- Use bold for component names
- Be specific about what changed, not just where

### What NOT to Include

The PR description should focus on **what** and **why**, not mechanical details:

| Do NOT Include | Why | Where It Lives Instead |
|----------------|-----|------------------------|
| Commit list | Redundant with Git history | Git log / PR "Commits" tab |
| Files changed | Redundant with diff | PR "Files changed" tab |
| Line-by-line explanations | Clutters description | Inline PR comments |
| Implementation steps | Not useful for review | Work package plan (planning artifacts) |

---

## Submission Checklist

Include this checklist to ensure PR quality:

```markdown
## 📌 Submission Checklist

- [ ] Changes are backward-compatible (or flagged if breaking)
- [ ] Pull request description explains why the change is needed
- [ ] Self-reviewed the diff
- [ ] I have included a change file, or skipped for this reason: [reason]
- [ ] If the changes introduce a new feature, I have bumped the node minor version
- [ ] Update documentation (if relevant)
- [ ] No new todos introduced
```

---

## Fork Strategy Section

For projects with fork/runtime considerations:

```markdown
## 🔱 Fork Strategy

- [ ] Node Runtime Update
- [ ] Node Client Update
- [ ] Other
- [ ] N/A
```

---

## TODO Before Merging

Track remaining items before the PR can be merged:

```markdown
## 🗹 TODO before merging

- [ ] Ready for review
- [ ] Address reviewer feedback
- [ ] Squash commits (if needed)
```

---

## PR Lifecycle

### Draft PRs

**Create PRs as drafts when:**
- ADR needs review before implementation
- Work is in progress
- Seeking early feedback

```bash
# Create draft PR assigned to owner
gh pr create --draft --assignee {GITHUB_USERNAME} --title "feat: Work Package Name" --body "..."
```

### Initial PR (ADR-only)

When creating a PR with just the ADR (before implementation):

```markdown
## Summary

[1-2 sentence summary of the proposed work]


🎫 [Ticket](link)  📐 [Engineering](eng-repo-link)

---

## Motivation

[Why this change is needed]

---

## Changes

**Implementation (coming next):**
- [Task 1 description]
- [Task 2 description]

---

## 📌 Submission Checklist

- [ ] Changes are backward-compatible (or flagged if breaking)
- [ ] Pull request description explains why the change is needed
- [ ] Self-reviewed the diff
- [ ] I have included a change file, or skipped for this reason: [reason]
- [ ] If the changes introduce a new feature, I have bumped the node minor version
- [ ] Update documentation (if relevant)
- [ ] No new todos introduced

---

## 🔱 Fork Strategy

- [ ] Node Runtime Update
- [ ] Node Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [ ] Ready for review
```

### Final PR (After Implementation)

Update the description to reflect completed work:

```markdown
## Summary

[1-2 sentence summary with key benefit/metric achieved]


🎫 [Ticket](link)  📐 [Engineering](eng-repo-link)  🧪 [Test Plan](branch-link)

---

## Motivation

[Why this change was needed - can keep from initial PR]

---

## Changes

- **Component A** - [What was implemented]
- **Component B** - [What was modified]
- **Tests** - [Coverage summary]

---

## 📌 Submission Checklist

- [x] Changes are backward-compatible (or flagged if breaking)
- [x] Pull request description explains why the change is needed
- [x] Self-reviewed the diff
- [x] I have included a change file, or skipped for this reason: [reason]
- [x] If the changes introduce a new feature, I have bumped the node minor version
- [x] Update documentation (if relevant)
- [x] No new todos introduced

---

## 🔱 Fork Strategy

- [x] Node Runtime Update
- [ ] Node Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [x] Ready for review
```

---

## Updating PR Descriptions

Always use the GitHub API for PR updates (`gh pr edit` uses GraphQL which fails due to Projects Classic deprecation):

```bash
# Write the PR body to a file
cat > /tmp/pr-body.md << 'EOF'
[PR description content here]
EOF

# Update using GitHub API
gh api repos/OWNER/REPO/pulls/PR_NUMBER -X PATCH -f body="$(cat /tmp/pr-body.md)"
```

### Marking Ready for Review

```bash
# Convert draft PR to ready for review
gh pr ready
```

---

## Writing Style

### Do

- ✅ Lead with outcomes, not process
- ✅ Use clear, technical language
- ✅ Include measurable impact when available
- ✅ Keep descriptions scannable with headers and bullets
- ✅ Link to artifacts (tickets, ADRs, test plans)

### Don't

- ❌ Duplicate information available in Git history
- ❌ Include implementation details better suited to code comments
- ❌ Use vague language ("some improvements", "various fixes")
- ❌ Reference gitignored planning artifacts
- ❌ Add process attribution ("per user request", "AI suggested")

---

## Examples

### Good PR Summary

```markdown
## Summary

Implement content-aware chunking that preserves semantic boundaries, reducing retrieval errors by 40% on the evaluation dataset.


🎫 [Ticket](https://{JIRA_DOMAIN}/browse/{TICKET_ID})  📐 [Engineering](https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/main/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)  🧪 [Test Plan](https://github.com/{REPO_OWNER}/{REPO_NAME}/blob/feat/smart-chunking/docs/tests/test-plan-content-chunking.md)
```

### Good Motivation Section

```markdown
## Motivation

The current fixed-size chunking strategy splits documents at arbitrary byte boundaries, often mid-sentence or mid-paragraph. This creates two problems:

1. **Retrieval quality** - Chunks lack complete context, causing the LLM to miss relevant information
2. **User confusion** - Retrieved snippets often start or end mid-thought

Content-aware chunking respects document structure (paragraphs, sections, code blocks), ensuring each chunk contains complete, coherent information.
```

### Good Changes Section

```markdown
## Changes

- **Chunking Engine** - New `SemanticChunker` that detects natural boundaries
- **Boundary Detection** - Markdown header, paragraph, and code block detection
- **Configuration** - `chunk_strategy` option: `fixed`, `semantic`, or `hybrid`
- **Migration** - Re-chunking script for existing documents
- **Tests** - 23 new tests covering boundary detection and edge cases
```

---

## Checklist

Before submitting a PR, verify:

### Description Quality
- [ ] Summary clearly communicates the change and its impact
- [ ] Motivation explains why the change is needed
- [ ] Changes section lists what was modified by component
- [ ] No redundant information (commits, files changed)

### Links and References
- [ ] Ticket linked (if applicable)
- [ ] ADR linked on feature branch (if applicable)
- [ ] Test plan linked (if applicable)

### Checklists Complete
- [ ] Submission checklist reviewed and checked
- [ ] Fork strategy indicated
- [ ] TODO before merging updated

### Format
- [ ] No references to gitignored paths
- [ ] No process attribution comments
- [ ] Links use branch URLs, not relative paths to main

---

## Related Guides

- [Architecture Review Guide](15-architecture-review.md)
- [Test Plan Creation Guide](11-test-plan.md)
- [Complete Guide](21-complete-wp.md)
