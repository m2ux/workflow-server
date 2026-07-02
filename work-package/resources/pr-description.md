---
name: pr-description
description: Guidelines for creating well-structured Pull Request descriptions that communicate changes clearly and facilitate effective code review.
metadata:
  version: 1.3.0
  order: 12
  legacy_id: 12
---


# Pull Request Description Guide

Apply this guide to all PRs that introduce features, fix bugs, refactor, make architectural changes, or update dependencies with breaking changes. Simplified descriptions are acceptable for documentation-only changes, typo fixes, non-breaking dependency bumps, and automated/generated changes.

## Templates

Optional sections (add when applicable): `## Migration Notes` (required steps for consumers, if breaking changes), `## Screenshots` (visual/UI changes).

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

## Rules

**Summary** — lead with what the change does and the key outcome, not how; include quantifiable impact when available; 1-2 sentences maximum. Avoid vague language ("some improvements", "various fixes").

**Motivation** — explain the problem from the user's perspective and the consequences of not addressing it; 1-2 paragraphs.

**Changes** — group by logical component (bold component names), not by file; be specific about what changed, not just where. No code: summarize in plain language — do not paste code snippets, signatures, or fenced blocks; the diff is the source of truth.

**Style** — lead with outcomes; clear technical language; scannable headers and bullets; link to artifacts (tickets, ADRs, test plans) instead of inlining their content; no process attribution ("per user request", "AI suggested").

**TODO before merging** — tracks remaining pre-merge items beyond "Ready for review" (e.g. address reviewer feedback, squash commits if needed); check items off as they complete.

**What NOT to include** (single-source-and-link):

| Do NOT Include | Where It Lives Instead |
|----------------|------------------------|
| Commit list | Git log / PR "Commits" tab |
| Files changed | PR "Files changed" tab |
| Line-by-line explanations | Inline PR comments |
| Implementation steps | Work package plan (planning artifacts) |
| Code snippets / signatures | The diff |

## Issue, ADR, Engineering, and Test Plan Links

Link related artifacts on the same line for easy scanning:

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 `Engineering`
```

The Issue link **must** point to the GitHub issue in the target repo, not the Jira ticket. The work-package workflow always captures or creates a paired GitHub issue during start-work-package (`github_issue_number` variable), so this link is always resolvable. When a Jira ticket also exists, append it as a secondary reference (see below).

**When to include each link:**
- **Issue** — always; the GitHub issue in the target repo (paired with the Jira ticket, if any).
- **Engineering** — always; links to the README.md in the engineering artifacts planning folder for the work package.
- **Jira** — secondary reference only when the work originated in Jira and a `jira_issue_key` was captured.
- **ADR** — for architectural decisions committed to the target repo (see [Architecture Review Guide](architecture-review.md)).
- **Test Plan** — when formal test documentation exists (see [Test Plan Creation Guide](test-plan.md)).

### CRITICAL: Resolving Link Placeholders

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

The `ENG_REPO_URL` comes from the **parent repo** (the repo containing `.engineering/`), not the target submodule — different repositories with different owners. The `ENG_BRANCH` is the current branch of the parent repo — do NOT assume `main`; engineering artifacts may live on a different branch (e.g., `engineering`, a user branch, or a feature branch). The Engineering link must resolve to a committed file on the remote.

**Resulting URL form (example):** `https://github.com/midnightntwrk/midnight-node/issues/1471`

**Resolved Engineering link form:**

```
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/{ENG_BRANCH}/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md
```

### Issue-skipped placeholder (when `issue_skipped == true`)

When the user explicitly skipped issue creation/verification at the `issue-verification` checkpoint in `start-work-package` (workflow variable `issue_skipped` is `true`), the Issue line **must still be rendered** so reviewers can tell the omission was intentional. Use the literal placeholder:

```markdown
🐛 _Issue: skipped_  📐 `Engineering`
```

**Rules:**
- Render exactly as `🐛 _Issue: skipped_` (italicised, no link) — the canonical form checked by `update-pr::rules.pr-body-conformance.issue-link-or-explicit-placeholder`.
- Do NOT drop the Issue line — that hides that issue tracking was intentionally skipped.
- Do NOT fabricate an issue number or invent a placeholder link. If `github_issue_number` is empty and `issue_skipped == true`, the placeholder above is the only acceptable rendering.
- The Engineering link still resolves normally, on the same line, in the same format as the linked variant.

Applies to both Initial and Final templates. The `update-pr::verify-body` phase flags a missing or fabricated Issue line under rule id `issue-link-or-explicit-placeholder`.

### Jira reference (when applicable)

When `issue_platform == 'jira'` and `jira_issue_key` is captured, include the Jira ticket as a secondary line below the link row:

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering](...)

_Jira: [{JIRA_ISSUE_KEY}](https://{JIRA_DOMAIN}/browse/{JIRA_ISSUE_KEY})_
```

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

Mark a draft PR ready for review with `gh pr ready`.
