---
name: pr-description
description: PR description templates and link-row rendering forms.
metadata:
  version: 1.8.0
  order: 12
  legacy_id: 12
---


# Pull Request Description Guide

Apply this guide to all PRs that introduce features, fix bugs, refactor, make architectural changes, or update dependencies with breaking changes. Simplified descriptions are acceptable for documentation-only changes, typo fixes, non-breaking dependency bumps, and automated/generated changes.

## Lifecycle tense

- **Initial** (`pr_template_variant: initial`) — used at plan-prepare before implementation. Future-tense checklist language and an **Implementation (coming next)** Changes block are correct only in this phase.
- **Final** (`pr_template_variant: final`) — used once implementation has landed (strategic-review refresh and submit-for-review). The Changes section describes what **was** implemented in present/past tense; do not leave “coming next”, unchecked “Ready for review” theatre, or plan-only checklist state after code exists.
- Re-render with Final as soon as implementation lands (strategic-review binds `update-pr::render` with `final`) so mid-flow review does not read a stale Initial body.

## Templates

Optional sections (add when applicable): `## Migration Notes` (required steps for consumers, if breaking changes), `## Screenshots` (visual/UI changes).

### Template (Initial)

```markdown
## Summary

[1-2 sentence summary of the proposed work]


🐛 [Issue](github-issue-link)  📐 [Engineering](eng-repo-link)

---

## Motivation

[Why this change is needed]

---

## Changes

**Implementation (pending):**
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

- [ ] Runtime Update
- [ ] Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [ ] Ready for review
```

### Template (Final)

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

- [x] Runtime Update
- [ ] Client Update
- [ ] Other
- [ ] N/A

---

## 🗹 TODO before merging

- [x] Ready for review
```

## Link Row Forms

**Glyph key** (shared by every form in this section):

| Glyph | Meaning |
|-------|---------|
| 🐛 | Issue — the GitHub issue in the target repo (never the Jira ticket) |
| 📐 | Engineering — planning-folder README on the engineering remote |

**Standard link row**:

```markdown
🐛 [Issue]({TARGET_REPO_URL}/issues/{GITHUB_ISSUE_NUMBER})  📐 [Engineering]({ENG_REPO_URL}/blob/{ENG_BRANCH}/{ENG_PLANNING_PATH}/{PLANNING_FOLDER}/README.md)
```

`{ENG_PLANNING_PATH}` is the planning root relative to the root of the checkout `{ENG_BRANCH}` belongs to, so it carries the `.engineering/` segment only when the artifacts live directly in that checkout.

**Issue-skipped placeholder** (when `issue_skipped == true` — the line is rendered, italicised, no link, so reviewers can tell the omission was intentional):

```markdown
🐛 _Issue: skipped_  📐 `Engineering`
```

**Jira secondary reference** (when the work originated in Jira and a `jira_issue_key` was captured), below the link row:

```markdown
_Jira: [{JIRA_ISSUE_KEY}](https://{JIRA_DOMAIN}/browse/{JIRA_ISSUE_KEY})_
```

ADR and test-plan links are added to the row when those artifacts exist (see [architecture-review](architecture-review.md), [test-plan](test-plan.md)).

## Rules

Conformance criteria for a rendered body. Each is evaluated against the rendered text and yields one finding per failure, named by its heading here.

### Mandated sections present

Every section the selected template variant mandates appears in the rendered body as a literal heading, checked by name — each `## <heading>` the variant requires, plus the Issue and Engineering link row. `Migration Notes` and `Screenshots` are never required. A missing section is a finding naming that section, and the per-section criteria below do not substitute for this one: a body that omits a section passes them vacuously.

### Summary length

The Summary section is one or two sentences, leads with the outcome, and carries measurable impact where a figure is known.

### Engineering link present

The Engineering link is present and resolves to a committed file on the remote. Its ref and repository come from the checkout holding the planning folder, never from the host repo's when that folder is a checkout of its own.

### Issue line present

The Issue line is present. When `issue_skipped` is true it renders the [Issue-skipped placeholder](#link-row-forms) rather than dropping the line or carrying a fabricated number.

### Changes grouped by component

The Changes section groups bullets by component, the component name in bold — not by Conventional Commits header and not by commit message.

### Changes carry no file list

The Changes section does not enumerate file paths. File-level detail is already in the PR's Files-changed tab.

### Changes carry no code

The Changes section is plain-language bullets saying what changed and why: no fenced blocks, no snippets, no pasted signatures, and no inline code beyond an unavoidable bare identifier. The diff is the source of truth for code.

### Changes state the substance, not the surface

Each bullet says what the change makes true and why that matters, in the words a reader who has not opened the diff would use. The file list, the diff and the commits already state the surface, and a bullet that restates one of them tells a reader something three other views already show — which is why the rules above rule out paths, code and commit headers one at a time. A bullet naming the behaviour that changed, the constraint now enforced, or the failure now impossible passes all three without being written against them.
