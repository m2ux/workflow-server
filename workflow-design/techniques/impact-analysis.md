---
metadata:
  version: 1.0.0
---

## Capability

Assess the impact of proposed changes against an existing workflow: enumerate its files, classify each file's impact, verify transition-chain, reference, and variable integrity, and flag content being removed for explicit confirmation.

## Outputs

### removal_count

Number of content removals flagged for user confirmation (diff-based and obsolete-file removals). Gates the `impact-and-preservation-confirmed` checkpoint — presented only when greater than zero.

### impact_analysis_path

Absolute path to the written impact-analysis artifact. Interpolated into the impact checkpoint message as a markdown link.

#### artifact

`impact-analysis.md`

## Protocol

### 1. Enumerate Files

- Build a full inventory of the target workflow's files with paths and purposes: `workflow.yaml` (root definition), `activities/*.yaml`, `techniques/*.md` (`<slug>.md` standalone, `<group>/TECHNIQUE.md` container base contracts, `<group>/<sub>.md` nested), `resources/*.md`, and `README.md`

### 2. Classify Impact

- Classify each file as unaffected, directly modified (the change explicitly affects it), indirectly affected (a side-effect such as a broken transition chain), or removed (the change makes it obsolete), with justification

### 3. Check Transition Integrity

- When activities are added, removed, or reordered: verify every `transitions[].to` references an existing activity id, verify `initialActivity` still references a valid activity, and check that no activity becomes unreachable (no incoming transitions)

### 4. Check Reference Integrity

- Verify all `techniques[]` references (`::`-path / slug) resolve to existing technique `.md` files
- Verify all resource references resolve to existing resource files

### 5. Check Variable Integrity

- Verify all `condition.variable` references in transitions, decisions, step gates (`when`/`condition`), and `kind: loop` steps resolve to defined workflow variables
- Verify all `effect.setVariable` keys in `kind: checkpoint` steps resolve to defined variables
- Check for orphaned variables (defined but never referenced)

### 6. Flag Removals

- Inventory the material being removed across modified files (diff-based) and surface it for explicit user confirmation

### 7. Set Removal Count

- Set `{removal_count}` to the number of distinct flagged removals (0 when the change is additive or string-only with no material deleted)

### 8. Persist Report

- Persist the full impact classification, integrity checks, and flagged removals via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `impact-analysis.md`
- Capture the written location as `{impact_analysis_path}`

## Rules

### content-preservation

Before modifying any file, compare the planned changes against the existing content and identify material being removed. Flag every removal for explicit confirmation with a diff-style view of what changes and what is preserved — never silently remove content. Prefer additive changes; a modification that reduces a file (fewer lines, removed sections, dropped fields) requires the user to confirm each removal.

### side-effect-detection

Trace the side-effects each change class implies: adding an activity may need new upstream transitions, techniques, or resources; removing one breaks incoming transitions and may orphan techniques; renaming an activity id breaks all transition references and `initialActivity`; adding a checkpoint may need new variables; modifying checkpoint options may invalidate downstream conditions; adding or removing a mode affects the mode variable and every gate that branches on it; changing a variable's type affects all conditions comparing it.
