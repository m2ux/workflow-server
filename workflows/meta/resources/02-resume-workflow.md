---
id: resume-workflow
version: 1.0.0
---

# Resume Workflow Reference

**Purpose:** Reference material for resuming workflows. Provides git commands, assessment techniques, and templates. Flow and checkpoints are defined in the activity.

---

## External State Assessment

### Git Commands Reference

**Branch assessment:**

```bash
# Switch to the branch
git checkout [branch-name]
git pull origin [branch-name]

# View commit history
git log --oneline -20

# Check current status
git status

# View diff from main
git diff main..HEAD --stat

# Check if branch is behind main
git rev-list --count HEAD..origin/main
```

**Capture:**
- Number of commits ahead of main
- Files changed (added, modified, deleted)
- Any uncommitted changes
- Last commit date/message

### PR Assessment

```bash
# Get PR details
gh pr view [number] --json title,body,state,isDraft,baseRefName,headRefName

# Check PR status
gh pr checks [number]

# Check for existing PR from this branch
gh pr list --head [branch-name]
```

**Capture:**
- PR title and description
- Draft or ready for review
- CI status (passing/failing)
- Linked issues

---

## Pre-Existing Work Template

When resuming a workflow with existing changes, document them using this template:

```markdown
## Pre-Existing Work

This workflow resumes with prior changes already in place.

### Existing Changes Summary

**Branch:** `[branch-name]`
**Commits:** [N] commits ahead of main
**Files changed:** [N]

### Key Changes Already Implemented

| File/Component | Change Summary |
|----------------|----------------|
| [file1] | [Brief description] |
| [file2] | [Brief description] |

### Gaps Identified

[Any gaps or issues identified in the existing work]

### Integration Notes

[How existing work integrates with the current workflow state]
```

---

## Resume Checklist

- [ ] Workflow identified and context gathered
- [ ] External state assessed (branch, PR, artifacts)
- [ ] State assessment confirmed with user
- [ ] Entry point determined and confirmed with user
- [ ] Pre-existing work documented (if applicable)
- [ ] Ready to continue confirmed with user
- [ ] Resumed execution from entry point

---

## Related Activities

- [Resume Workflow Activity](../activities/02-resume-workflow.toon)
- [Start Workflow Activity](../activities/01-start-workflow.toon)
