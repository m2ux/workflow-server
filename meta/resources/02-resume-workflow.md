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

## Resumption Rules

1. Always verify context with user before proceeding
2. Check external state (git, PRs, artifacts) before determining entry point
3. Run tests/checks before making any new changes
4. Present progress summary to user before continuing
5. Get explicit confirmation before resuming work

---

## Special Cases

### Conflicting or Stale Branch

**Situation:** Branch is significantly behind main or has conflicts.

**Checkpoint message:** "The branch is behind main and may have conflicts. How would you like to proceed?"

**Options:**
- **Rebase on main** - Bring branch up to date (may require conflict resolution)
- **Merge main into branch** - Merge main into branch (creates merge commit)
- **Continue as-is** - Proceed without syncing (not recommended)

### Failed CI or Broken Tests

**Situation:** Existing work has failing CI checks.

**Checkpoint message:** "The current branch has failing CI checks. How would you like to proceed?"

**Options:**
- **Fix failures first** - Address CI issues before continuing
- **Acknowledge and continue** - Document failures as known issues
- **Investigate** - Review failures to understand scope

### Partial Implementation with Unclear Status

**Situation:** Implementation status is unclear.

**Steps:**
1. Review the diff to understand what's been changed
2. Check for TODOs in the code indicating incomplete work
3. Ask the user to clarify what's done vs. remaining
4. Create a task list for remaining work based on findings

---

## Related Activities

- [Resume Workflow Activity](../activities/02-resume-workflow.toon)
- [Start Workflow Activity](../activities/01-start-workflow.toon)
