# Update Mode Guide

Guidance for modifying existing workflows. Update mode activates when the user references an existing workflow by name or ID with a change request.

---

## Activation

Update mode is activated by recognition patterns: "update workflow", "modify workflow", "change workflow", "edit workflow". The `is_update_mode` variable is set to `true`.

## Key Differences from Create Mode

| Aspect | Create Mode | Update Mode |
|---|---|---|
| Pattern analysis | Required — extract patterns from reference workflows | Skipped — the existing workflow is the reference |
| Impact analysis | Skipped | Required — enumerate affected files and side-effects |
| Scope | All files are new | Mix of modified, added, and removed files |
| Content drafting | Write from scratch | Modify existing content with preservation checks |
| README | Generate new | Update existing to reflect changes |

## Content Preservation Rules

1. **Before modifying any file,** compare the planned changes against the existing content. Identify material being removed.

2. **Flag all removals** to the user with the `preservation-check` checkpoint. Show a diff-style view of what changes and what is preserved.

3. **Never silently remove content.** If a modification reduces the content of a file (fewer lines, removed sections, dropped fields), the user must explicitly confirm each removal.

4. **Prefer additive changes.** When possible, add new content rather than replacing existing sections. Replacement requires a checkpoint.

## Impact Analysis Procedure

### Step 1: Enumerate Existing Files

List all files in the target workflow directory with their purpose:
- `workflow.toon` — root definition
- `activities/*.toon` — activity definitions
- `skills/*.toon` — skill definitions
- `resources/*.md` — resource files
- `README.md` — documentation

### Step 2: Classify File Impact

For each file, classify as:
- **Unaffected** — no changes needed
- **Directly modified** — the change request explicitly affects this file
- **Indirectly affected** — a side-effect of the change (e.g., broken transition chain)
- **To be removed** — the change makes this file obsolete

### Step 3: Check Transition Integrity

If activities are being added, removed, or reordered:
- Verify every `transitions[].to` field references an existing activity ID
- Verify `initialActivity` still references a valid activity
- Check that no activity becomes unreachable (no incoming transitions)

### Step 4: Check Reference Integrity

- Verify all `skills.primary` and `skills.supporting` references resolve to existing skill files
- Verify all resource index references resolve to existing resource files
- Verify all `artifactLocations` keys used by activities exist in the workflow

### Step 5: Check Variable Integrity

- Verify all `condition.variable` references in transitions, decisions, and loops resolve to defined workflow variables
- Verify all `effect.setVariable` keys in checkpoints resolve to defined variables
- Check for orphaned variables (defined but never referenced)

## Side-Effect Detection Patterns

| Change Type | Potential Side-Effects |
|---|---|
| Add activity | May need new transitions from upstream activities. May need new skills or resources. |
| Remove activity | Breaks incoming transitions. May orphan skills only used by this activity. |
| Rename activity ID | Breaks all transition references, initialActivity, modeOverrides keys. |
| Add checkpoint | May need new variables for checkpoint effects. |
| Modify checkpoint options | May invalidate downstream conditions that depend on set variables. |
| Add/remove mode | Affects modeOverrides in all activities. May change skipActivities. |
| Change variable type | Affects all conditions comparing that variable. |
