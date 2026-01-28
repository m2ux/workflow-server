---
id: resume-here
version: 1.2.0
---

# Resume Work Package

## Overview

This document guides resuming work on an existing branch, whether the work was started using this workflow or not. The goal is to **understand the current state** and **seamlessly continue** from the appropriate phase in the [Work Package Workflow](../work-package.md).

**Minimum requirement:** An existing feature branch.

> **Key Insight:** A successful resumption requires understanding both the workflow progress AND the context of previous decisions.

---

## Resume Process

```
1. GATHER CONTEXT
   ├─ User provides: branch name (required)
   ├─ User may also provide: PR number, planning folder path
   └─ 🛑 CHECKPOINT: "Confirm the branch and any other details"

2. ASSESS CURRENT STATE
   ├─ Check branch status (commits, changes)
   ├─ Check for existing PR
   ├─ Check for planning artifacts
   └─ 🛑 CHECKPOINT: "Present state assessment"

3. DETERMINE ENTRY POINT
   ├─ Map available artifacts to workflow phases
   ├─ Identify the appropriate phase to resume from
   └─ 🛑 CHECKPOINT: "Confirm entry point"

4. ACKNOWLEDGE EXISTING WORK
   ├─ Document pre-existing changes in planning
   ├─ Create/update planning artifacts as needed
   └─ 🛑 CHECKPOINT: "Ready to continue"

5. CONTINUE WORKFLOW
   └─ Proceed with work-package.md from determined phase
```

---

## Phase 1: Gather Context

### 1.1 Required Information

Ask the user to provide the branch name and any additional context:

```markdown
## 🔄 Resume Work Package

To resume work on an existing branch, please provide:

**Required:**
- **Branch name:** The feature branch to resume work on

**Optional (provide if known):**
- **PR number:** If a PR already exists
- **Planning folder:** Path to existing planning documents
- **Issue reference:** GitHub issue # or Jira ticket

---
**What details can you provide?**
```

### 1.2 🛑 Context Checkpoint

After gathering information, confirm with user:

```markdown
## ✅ Context Confirmed

**Branch:** `[branch-name]`
**PR:** #[number] (if provided) | None specified
**Planning:** [path] (if provided) | None specified
**Issue:** #[number] or PROJ-N (if provided) | None specified

---
**Is this correct? Proceed to assess current state?**
```

---

## Phase 2: Assess Current State

### 2.1 Branch Assessment

Check the branch status:

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
```

**Capture:**
- Number of commits ahead of main
- Files changed (added, modified, deleted)
- Any uncommitted changes
- Last commit date/message

### 2.2 PR Assessment

If a PR exists (or was specified):

```bash
# Get PR details
gh pr view [number] --json title,body,state,isDraft,baseRefName,headRefName

# Check PR status
gh pr checks [number]
```

**Capture:**
- PR title and description
- Draft or ready for review
- CI status (passing/failing)
- Linked issues

If no PR was specified, check if one exists:

```bash
# Check for existing PR from this branch
gh pr list --head [branch-name]
```

### 2.3 Planning Artifacts Assessment

Check for existing planning documents:

```bash
# Check common planning locations
ls -la .engineering/artifacts/planning/

# Search for planning folders matching branch name
find .engineering/artifacts/planning -type d -name "*[work-package-name]*" 2>/dev/null
```

**Planning artifacts to look for:**

| Artifact | File | Indicates |
|----------|------|-----------|
| Requirements | `00-requirements-elicitation.md` | Phase 2 completed |
| Analysis | `01-implementation-analysis.md` | Phase 3 completed |
| Research | `02-kb-research.md` | Phase 4 completed |
| Plan | `03-work-package-plan.md` | Phase 5 completed |
| Test Plan | `04-test-plan.md` | Phase 5 completed |
| Assumptions | `05-assumptions-log.md` | Phase 6 in progress |
| ADR | `06-adr-*.md` | Phase 6 completed |
| Completion | `COMPLETE.md` | Phase 9 completed |

### 2.4 🛑 State Assessment Checkpoint

Present findings to user:

```markdown
## 📊 Current State Assessment

### Branch Status
- **Branch:** `[branch-name]`
- **Commits ahead of main:** [N]
- **Files changed:** [N] ([summary])
- **Uncommitted changes:** [Yes/No]
- **Last commit:** [date] - [message]

### PR Status
- **PR:** #[number] | None found
- **State:** [Draft/Ready/Merged] | N/A
- **CI:** [Passing/Failing/Pending] | N/A
- **Issue:** #[number] linked | None linked

### Planning Artifacts
| Artifact | Status |
|----------|--------|
| Requirements (`00-`) | [Found/Not found] |
| Analysis (`01-`) | [Found/Not found] |
| Research (`02-`) | [Found/Not found] |
| Plan (`03-`) | [Found/Not found] |
| Test Plan (`04-`) | [Found/Not found] |
| Assumptions (`05-`) | [Found/Not found] |
| ADR (`06-`) | [Found/Not found] |
| Completion | [Found/Not found] |

### Summary
[Brief summary of the current state]

---
**Does this assessment look correct?**
```

---

## Phase 3: Determine Entry Point

### 3.1 Entry Point Mapping

Based on the assessment, determine where to resume in the workflow:

| Current State | Entry Point | Rationale |
|---------------|-------------|-----------|
| Branch only, no commits | Phase 1.5 | Create PR, then proceed normally |
| Branch with commits, no PR | Phase 1.7 | Create draft PR, then assess progress |
| Branch + PR, no planning | Phase 3 | Start analysis with existing code as context |
| Branch + PR + analysis | Phase 4 or 5 | Continue from research or planning |
| Branch + PR + plan | Phase 6 | Resume implementation |
| Branch + PR + partial implementation | Phase 6 | Continue implementation tasks |
| Branch + PR + implementation complete | Phase 7 | Proceed to validation |
| Branch + PR + validation passed | Phase 8 | Proceed to strategic review |
| Branch + PR + review passed | Phase 9 | Proceed to finalization |

### 3.2 Entry Point Decision Tree

```
Has PR been created?
├─ No → Create PR (Phase 1.7), then determine next phase
└─ Yes
    │
    Does planning folder exist with plan document?
    ├─ No → Start at Phase 3 (Implementation Analysis)
    └─ Yes
        │
        Is implementation complete per plan?
        ├─ No → Resume at Phase 6 (Implement Tasks)
        │       └─ Identify remaining tasks from plan
        └─ Yes
            │
            Has validation been performed?
            ├─ No → Start at Phase 7 (Verify & Validate Design)
            └─ Yes (passed)
                │
                Has strategic review been performed?
                ├─ No → Start at Phase 8 (Strategic Review)
                └─ Yes (passed)
                    │
                    Start at Phase 9 (Finalize)
```

### 3.3 🛑 Entry Point Checkpoint

Present the recommended entry point:

```markdown
## 🎯 Recommended Entry Point

Based on the assessment, I recommend resuming at:

**Phase [N]: [Phase Name]**

**Rationale:**
[Explanation of why this is the appropriate entry point]

**What's already done:**
- [List of completed phases/artifacts]

**What needs to happen:**
- [List of remaining phases/tasks]

---
**Do you agree with this entry point, or would you prefer to start from a different phase?**
```

---

## Phase 4: Acknowledge Existing Work

### 4.1 Document Pre-Existing Changes

Before continuing, acknowledge existing work in the planning:

**If no planning folder exists, create one:**

```bash
# Create planning folder
mkdir -p .engineering/artifacts/planning/YYYY-MM-DD-work-package-name
```

**Create or update the plan to acknowledge existing work:**

```markdown
## Pre-Existing Work

This work package resumes from an existing branch with prior changes.

### Existing Changes Summary

**Branch:** `[branch-name]`
**Commits:** [N] commits ahead of main
**Files changed:** [N]

### Key Changes Already Implemented

| File/Component | Change Summary |
|----------------|----------------|
| [file1] | [Brief description] |
| [file2] | [Brief description] |
| ... | ... |

### Gaps Identified

[Any gaps or issues identified in the existing work]

### Integration Notes

[How existing work integrates with the current plan]
```

### 4.2 Reconcile with Workflow Artifacts

Depending on the entry point, create missing artifacts:

| Entry Point | Required Artifacts to Create |
|-------------|------------------------------|
| Phase 3+ | None required, but recommended to create `01-implementation-analysis.md` |
| Phase 5+ | Create minimal `03-work-package-plan.md` acknowledging existing work |
| Phase 6+ | Create `03-work-package-plan.md` + task list for remaining work |
| Phase 7+ | Ensure plan documents existing implementation |

### 4.3 🛑 Ready to Continue Checkpoint

```markdown
## ✅ Ready to Continue

**Existing work acknowledged:**
- [N] commits documented
- [N] files changed documented
- Pre-existing work integrated into planning

**Entry point:** Phase [N] - [Phase Name]

**Next steps:**
1. [First action in the target phase]
2. [Second action]
3. ...

**Planning location:** `.engineering/artifacts/planning/[folder-name]/`

---
**Proceed with the workflow from Phase [N]?**
```

---

## Phase 5: Continue Workflow

### 5.1 Handoff to Work Package Workflow

After acknowledgment, continue with the standard workflow:

```markdown
## 🚀 Continuing Workflow

Proceeding to **[work-package.md](../work-package.md) Phase [N]: [Phase Name]**

All pre-existing work has been acknowledged and integrated into the planning.
The workflow will continue from this point following standard procedures.

---
```

**Then proceed directly to the target phase in `work-package.md`.**

---

## Special Cases

### Case 1: Work Started Outside This Workflow

When resuming work that wasn't started with this workflow:

1. **Create the PR if it doesn't exist** (Phase 1.7)
2. **Create a minimal planning folder** with `03-work-package-plan.md`
3. **Document all existing changes** in the "Pre-Existing Work" section
4. **Identify the issue** the work addresses (or create one)
5. **Resume from the appropriate phase** based on implementation status

### Case 2: Conflicting or Stale Branch

If the branch is significantly behind main or has conflicts:

```markdown
## ⚠️ Branch Sync Required

The branch `[branch-name]` is [N] commits behind main and may have conflicts.

**Options:**
1. **Rebase on main** - Bring branch up to date (may require conflict resolution)
2. **Merge main** - Merge main into branch (creates merge commit)
3. **Continue as-is** - Proceed without syncing (not recommended)

**Which approach would you prefer?**
```

### Case 3: Failed CI or Broken Tests

If the existing work has failing tests:

```markdown
## ⚠️ CI Failures Detected

The current branch has failing CI checks:

| Check | Status |
|-------|--------|
| [check1] | ❌ Failed |
| [check2] | ✅ Passed |
| ... | ... |

**Options:**
1. **Fix failures first** - Address CI issues before continuing
2. **Acknowledge and continue** - Document failures as known issues
3. **Investigate** - Review failures to understand scope

**Which approach would you prefer?**
```

### Case 4: Partial Implementation with Unclear Status

If implementation status is unclear:

1. **Review the diff** to understand what's been changed
2. **Check for TODOs** in the code indicating incomplete work
3. **Ask the user** to clarify what's done vs. remaining
4. **Create a task list** for remaining work based on findings

---

## Common Resumption Scenarios

### Resuming During Planning (Phases 1-5)

**Approach:** Review planning documents, confirm approach, continue to next checkpoint

### Resuming During Implementation (Phase 6)

**Approach:** Check TODO list, verify last completed task, run tests, continue from next task

### Resuming After Validation (Phases 7-8)

**Approach:** Re-run tests, confirm validation status, proceed to review/finalize

### Resuming Before Merge (Phases 9-11)

**Approach:** Check PR status, verify finalization docs, complete remaining steps

---

## Resumption Rules

1. Always read START-HERE.md before proceeding
2. Verify git branch matches expected feature branch
3. Run tests before making any new changes
4. Present progress summary to user before continuing
5. Get explicit confirmation before resuming work

---

## Resume Checklist

- [ ] Branch name confirmed with user
- [ ] Branch checked out and synced
- [ ] Existing commits and changes reviewed
- [ ] PR status assessed (exists/needs creation)
- [ ] Planning artifacts assessed
- [ ] 🛑 **State assessment confirmed with user**
- [ ] Entry point determined and 🛑 **confirmed with user**
- [ ] Pre-existing work documented in planning
- [ ] 🛑 **Ready to continue confirmed with user**
- [ ] Handed off to appropriate phase in `work-package.md`

---

## Related Guides

- [Work Package Implementation Workflow](../work-package.md)
- [Work Package START-HERE](00-start-here.md)
- [Work Package Completion Guide](16-complete.md)
