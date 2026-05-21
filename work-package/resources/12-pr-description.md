---
id: pr-description
version: 1.2.0
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
- Update dependencies with breaking changes/

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


🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering](link-to-start-here)

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


🐛 [Issue](github-issue-link)  📐 [Engineering](eng-repo-link)

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


🐛 [Issue](github-issue-link)  📐 [Engineering](eng-repo-link) 

---

## Motivation

[Why this change was needed - can keep from initial PR]

---

## Changes

- **Component A** - [What was implemented]
- **Component B** - [What was modified]
- **Tests** - [Coverage summary]

---

## 🤖 AI Assistance

- **Assistant / Model:** [assistant] / [model-id]
- **Context scope:** [repo-only | web-retrieval | mixed]
- **Prompt classes:** [code-generation, test-writing, refactoring, docs — list applicable]
- **Provenance log:** [link to provenance-log.md in engineering artifacts]

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

### Issue, ADR, Engineering, and Test Plan Links

Always link to related artifacts on the same line for easy scanning:

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering]({ENG_REPO_URL}/blob/{ENG_BRANCH}/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)
```

The Issue link **must** point to the GitHub issue in the target repo, not the Jira ticket. The work-package workflow always captures or creates a paired GitHub issue during start-work-package (`github_issue_number` variable), so this link is always resolvable. When a Jira ticket also exists, append it as a secondary reference (see "Jira reference" below).

#### CRITICAL: Resolving Link Placeholders

**NEVER guess or infer repository URLs, issue numbers, or branch names.** Always resolve them from workflow variables or git remotes:

```bash
# Target repo URL (submodule where the PR is created):
TARGET_REPO_URL=$(git -C <target-path> remote get-url origin | sed 's/\.git$//')

# GitHub issue number — read from the github_issue_number workflow variable
# (captured by start-work-package via gh issue list / gh issue create).
# Do NOT guess; do NOT use jira_issue_key here.

# Engineering repo URL (parent repo where .engineering/ lives):
ENG_REPO_URL=$(git -C <parent-repo-path> remote get-url origin | sed 's/\.git$//')

# Engineering repo branch (the branch where planning artifacts are committed):
ENG_BRANCH=$(git -C <parent-repo-path> branch --show-current)

# Convert SSH URLs to HTTPS if needed:
# git@github.com:org/repo.git → https://github.com/org/repo
```

The `ENG_REPO_URL` comes from the **parent repo** (the repo containing `.engineering/`), not the target submodule. These are different repositories with different owners. The `ENG_BRANCH` is the current branch of the parent repo — do NOT assume `main`; the engineering artifacts may live on a different branch (e.g., `engineering`, a user branch, or a feature branch).

**Resulting URL form (example):**

```
https://github.com/midnightntwrk/midnight-node/issues/1471
```

#### Issue-skipped placeholder (when `issue_skipped == true`)

When the user explicitly skipped issue creation/verification at the `issue-verification` checkpoint in `start-work-package` (i.e., the workflow variable `issue_skipped` is `true`), the Issue line **must still be rendered** so reviewers can tell at a glance that the omission was intentional. Use the literal placeholder:

```markdown
🐛 _Issue: skipped_  📐 [Engineering]({ENG_REPO_URL}/blob/{ENG_BRANCH}/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)
```

**Rules:**
- Render the placeholder exactly as `🐛 _Issue: skipped_` (italicised, no link). This is the canonical form checked by `update-pr::rules.pr-body-conformance.issue-link-or-explicit-placeholder`.
- Do NOT drop the Issue line — that hides the fact that issue tracking was intentionally skipped.
- Do NOT fabricate an issue number or invent a placeholder link. If `github_issue_number` is empty and `issue_skipped == true`, the placeholder above is the only acceptable rendering.
- The Engineering link still resolves normally, on the same line, in the same format as the linked variant.

This rule applies to both the Initial and Final templates. The `update-pr::verify-body` phase will flag a missing or fabricated Issue line under rule id `issue-link-or-explicit-placeholder`.

#### Jira reference (when applicable)

When `issue_platform == 'jira'` and `jira_issue_key` is captured, include the Jira ticket as a secondary line below the link row so reviewers tracing back to the originating ticket can find it without cluttering the primary link line:

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering](...)

_Jira: [{JIRA_ISSUE_KEY}](https://{JIRA_DOMAIN}/browse/{JIRA_ISSUE_KEY})_
```

**When to include each link:**
- **Issue** - Always include; the GitHub issue in the target repo (paired with the Jira ticket, if any).
- **Engineering** - Always include; links to the README.md in the engineering artifacts planning folder for the work package. Provides reviewers access to design philosophy, planning, and review documents.
- **Jira** - Include as a secondary reference only when the work originated in Jira and a `jira_issue_key` was captured.
- **ADR** - Include for architectural decisions committed to the target repo (see [Architecture Review Guide](15-architecture-review.md))
- **Test Plan** - Include when formal test documentation exists (see [Test Plan Creation Guide](11-test-plan.md))

**Note:** Engineering links point to the engineering artifacts repository (not the target repo), on whatever branch the parent repo uses for engineering artifacts. Resolve the branch from `git branch --show-current` in the parent repo — do not assume `main`.

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
- ❌ Include planning artifact content inline (link to them instead)
- ❌ Add process attribution ("per user request", "AI suggested")

---

## Examples

### Good PR Summary

```markdown
## Summary

Implement content-aware chunking that preserves semantic boundaries, reducing retrieval errors by 40% on the evaluation dataset.


🐛 [Issue](https://github.com/{TARGET_REPO_OWNER}/{TARGET_REPO_NAME}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering](https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/{ENG_BRANCH}/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)
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
- [ ] GitHub Issue linked (always; URL form `{TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER}`, NOT a Jira browse URL)
- [ ] Jira ticket included as a secondary reference (only if `issue_platform == 'jira'`)
- [ ] ADR linked on feature branch (if applicable)
- [ ] Test plan linked (if applicable)

### Checklists Complete
- [ ] Submission checklist reviewed and checked
- [ ] Fork strategy indicated
- [ ] TODO before merging updated

### Format
- [ ] Engineering link resolves to a committed file on the remote
- [ ] No process attribution comments
- [ ] Links use branch URLs resolved from git, not hardcoded to main

---

## Related Guides

- [Architecture Review Guide](15-architecture-review.md)
- [Complete Guide](21-complete-wp.md)
