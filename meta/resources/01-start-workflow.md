---
id: start-workflow
version: 1.0.0
---

# Start Workflow Reference

**Purpose:** Reference material for starting workflows. Provides the target resolution protocol, monorepo detection, and execution model selection. Flow and checkpoints are defined in the activity.

---

## Target Resolution Protocol

### Regular Repository Detection

```bash
# Check for .gitmodules file
test -f .gitmodules && echo "monorepo" || echo "regular"
```

If `.gitmodules` does not exist, the repository is a regular repo. Set `target_path` to the repository root (`.`).

### Monorepo Submodule Detection

```bash
# Parse .gitmodules for submodule paths
git config --file .gitmodules --get-regexp path | awk '{print $2}'

# Get submodule names
git config --file .gitmodules --list | grep '\.path=' | sed 's/submodule\.\(.*\)\.path=.*/\1/'
```

If `.gitmodules` exists:
1. Present the repo-type checkpoint
2. If user confirms monorepo, parse `.gitmodules` to extract submodule names and paths
3. Present the submodule-selection checkpoint with options populated from the parsed submodules
4. Set `target_path` to the selected submodule's path

---

## Execution Model Selection

After loading the workflow definition, check its `rules[]` for an `EXECUTION MODEL` declaration:

| Rules Content | Action |
|---------------|--------|
| Contains "EXECUTION MODEL" rule | Load `orchestrate-workflow` skill and follow its protocol inline |
| No execution model rule | Continue with standard `workflow-execution` skill flow |

The orchestrator/worker pattern requires the current agent to act AS the orchestrator (inline) and dispatch a persistent worker sub-agent. The orchestrator is never a sub-agent.

---

## Workflow Discovery

When the user does not specify a workflow:

```
1. Call list_workflows to get available workflows
2. Present workflows with title, description, and tags
3. Let the user select one
```

---

## Start Checklist

- [ ] Workflow identified (from user request or selection)
- [ ] Workflow loaded via get_workflow
- [ ] State initialized with variable defaults
- [ ] Workflow rules internalized
- [ ] Execution model detected (standard or orchestrator/worker)
- [ ] Target path resolved (regular repo root or selected submodule)
- [ ] Resources discovered via list_workflow_resources
- [ ] Start resource (index 00) loaded if available
- [ ] Initial activity loaded
- [ ] First activity presented to user
- [ ] Blocking checkpoints identified for presentation

---

## Related Activities

- [Start Workflow Activity](../activities/01-start-workflow.toon)
- [Resume Workflow Activity](../activities/02-resume-workflow.toon)
