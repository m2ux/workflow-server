---
metadata:
  version: 1.1.2
---

## Capability

Assess the impact of proposed changes against an existing workflow: classify what the change touches, verify transition/reference/variable integrity, and inventory material removals — as a decision-facing report.

## Outputs

### removal_count

Number of distinct content removals in the inventory (diff-based and obsolete-file removals). Zero when the change is additive or string-only with no material deleted.

### impact_analysis_path

Absolute path to the written impact-analysis artifact.

#### artifact

`impact-analysis.md`

## Protocol

### 1. Enumerate Files

- Build a full inventory of the target workflow's files with paths and purposes: `workflow.yaml` (root definition), `activities/*.yaml`, `techniques/*.md` (`<slug>.md` standalone, `<group>/TECHNIQUE.md` container base contracts, `<group>/<sub>.md` nested), `resources/*.md`, and `README.md`

### 2. Classify Impact

- Classify files the change touches as directly modified, indirectly affected, or removed, each with a one-line justification
- Summarize unaffected files in one short note (counts / categories) — do not write a per-file essay for unaffected paths

### 3. Check Transition Integrity

- When activities are added, removed, or reordered: verify every `transitions[].to` references an existing activity id, verify `initialActivity` still references a valid activity, and check that no activity becomes unreachable (no incoming transitions)

### 4. Check Reference Integrity

- Verify all `techniques[]` references (`::`-path / slug) resolve to existing technique `.md` files
- Verify all resource references resolve to existing resource files

### 5. Check Variable Integrity

- Verify all `condition.variable` references in transitions, decisions, step gates (`when`/`condition`), and `kind: loop` steps resolve to defined workflow variables
- Verify all `effect.setVariable` keys in `kind: checkpoint` steps resolve to defined variables
- Check for orphaned variables (defined but never referenced)

### 6. Inventory Removals

- Compare planned changes against existing content and list every material removal (fewer lines, removed sections, dropped fields, obsolete files)
- For each removal, record a diff-style entry: what is removed and what is preserved in that region — never omit a removal from the inventory
- Set `{removal_count}` to the number of distinct inventoried removals (0 when none)

### 7. Persist Report

- Persist a decision-facing report: classification summary (direct / indirect / removed), integrity verdicts, and the removals inventory — via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `impact-analysis.md`
- Capture the written location as `{impact_analysis_path}`

## Rules

### content-preservation

Prefer additive changes. Every material reduction must appear in the removals inventory with a diff-style removed-vs-preserved entry in the impact artifact. Never silently drop content from that inventory.

### side-effect-detection

Trace the side-effects each change class implies: adding an activity may need new upstream transitions, techniques, or resources; removing one breaks incoming transitions and may orphan techniques; renaming an activity id breaks all transition references and `initialActivity`; adding a checkpoint may need new variables; modifying checkpoint options may invalidate downstream conditions; adding or removing a mode affects the mode variable and every gate that branches on it; changing a variable's type affects all conditions comparing it.
