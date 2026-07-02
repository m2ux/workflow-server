---
name: pr-description
description: PR description templates and link-row rendering forms; composition and conformance rules live on the update-pr technique.
metadata:
  version: 1.4.0
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

## Link Row Forms

Rendering forms consumed by [update-pr::render](../techniques/update-pr/render.md) (composition and URL-resolution rules live there and in [update-pr rules](../techniques/update-pr/TECHNIQUE.md#body-composition)):

**Standard link row** (Issue = the GitHub issue in the target repo, never the Jira ticket):

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering]({ENG_REPO_URL}/blob/{ENG_BRANCH}/.engineering/artifacts/planning/{PLANNING_FOLDER}/README.md)
```

**Issue-skipped placeholder** (when `issue_skipped == true` — the line is rendered, italicised, no link, so reviewers can tell the omission was intentional; canonical form checked by `update-pr::rules.pr-body-conformance.issue-link-or-explicit-placeholder`):

```markdown
🐛 _Issue: skipped_  📐 `Engineering`
```

**Jira secondary reference** (when the work originated in Jira and a `jira_issue_key` was captured), below the link row:

```markdown
_Jira: [{JIRA_ISSUE_KEY}](https://{JIRA_DOMAIN}/browse/{JIRA_ISSUE_KEY})_
```

ADR and test-plan links are added to the row when those artifacts exist (see [architecture-review](architecture-review.md), [test-plan](test-plan.md)).
