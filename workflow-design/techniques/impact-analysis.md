---
metadata:
  version: 1.2.0
---

## Capability

Assess the impact of proposed changes against an existing workflow: enumerate its files, classify each file's impact, verify transition-chain, reference, and variable integrity, and record a diff-style inventory of material being removed.

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

### 6. Inventory Removals

- Compare planned changes against existing content and list every material removal (fewer lines, removed sections, dropped fields, obsolete files)
- For each removal, record a diff-style entry: what is removed and what is preserved in that region — never omit a removal from the inventory
- Set `{removal_count}` to the number of distinct inventoried removals (0 when none)

### 7. Persist Report

- Persist classification, integrity checks, and the removals inventory via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `impact-analysis.md`, following [impact-analysis](../resources/impact-analysis.md#template)
- Own facts only: link [design-specification](../resources/design-specification.md) and structural inventory rather than restating them
- Capture the written location as `{impact_analysis_path}`

## Rules

### content-preservation

Prefer additive changes. Every material reduction must appear in the removals inventory with a diff-style removed-vs-preserved entry in the impact artifact. Never silently drop content from that inventory.

### side-effect-detection

Trace the side-effects each change class implies: adding an activity may need new upstream transitions, techniques, or resources; removing one breaks incoming transitions and may orphan techniques; renaming an activity id breaks all transition references and `initialActivity`; adding a checkpoint may need new variables; modifying checkpoint options may invalidate downstream conditions; adding or removing a mode affects the mode variable and every gate that branches on it; changing a variable's type affects all conditions comparing it.
