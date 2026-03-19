---
id: workflow-triggering-protocol
version: 1.0.0
---

# Workflow Triggering Protocol

**Purpose:** How to trigger and manage the work-package workflow for each planned package during the implementation loop.

---

## Triggering a Work Package

### 1. Prepare Context

Before triggering the work-package workflow, gather context from the roadmap:

| Variable | Source | Description |
|----------|--------|-------------|
| `current_package` | START-HERE.md status table | Package name and metadata |
| Package plan | `NN-package-plan.md` | Scope, dependencies, effort, success criteria |
| Issue reference | Plan document or issue tracker | GitHub/Jira issue if one exists |

### 2. Start the Workflow

Call `get_workflow("work-package")` to load the work-package workflow definition. The work-package workflow begins with its own intake and planning activities.

**Context to pass:**
- Package name and description from the roadmap
- Scope boundaries from the package plan
- Dependencies and their completion status
- Planning folder path for artifact storage

### 3. Monitor Completion

The work-package workflow handles its own checkpoints and user interactions. When it completes:
- A PR has been created and merged
- Package-specific artifacts exist in the planning folder

---

## Updating Roadmap Status

After each work-package workflow completes:

### Update START-HERE.md

1. Change the package status: `⬚ Planned` → `✅ Complete`
2. Add the PR link to the PR column
3. Update the progress counter: `{completed}/{total} packages complete`

### Update README.md

Add links to any new artifacts produced by the work-package workflow.

---

## Handling Failures

If a work-package workflow fails or is cancelled:

| Scenario | Action |
|----------|--------|
| Package blocked by unresolved dependency | Mark as `⊘ Blocked`, continue with next independent package |
| Implementation fails | Mark as `⊘ Failed`, note reason, continue with next package |
| User cancels package | Mark as `⊘ Cancelled`, update progress denominator |
| Scope change mid-package | Complete current package, re-evaluate remaining packages |

---

## Completion Check

After each iteration, evaluate:

1. Are there remaining packages in `remaining_packages`?
2. If yes, select the next package by priority order and repeat
3. If no, the initiative is complete — update START-HERE.md status to "Complete"
