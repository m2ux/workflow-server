---
metadata:
  version: 1.5.0
---

## Capability

Impact assessment of proposed changes against an existing workflow.

## Inputs

### accumulated_design

The update specification: the changed design dimensions the change makes to the target workflow.

### structural_inventory

Baseline structural inventory of the target workflow: file counts, entity counts, step kinds and activity ids in order.

## Outputs

### removal_count

Number of distinct content removals in the inventory (diff-based and obsolete-file removals). Zero when the change is additive or string-only with no material deleted.

### impact_analysis

The assembled impact report: per-file classification, the integrity verdicts, and the removals inventory as removed-versus-preserved rows, at the shape [Template](../resources/impact-analysis.md#template) declares.

#### artifact

`impact-analysis.md`

#### audience

`human`

## Protocol

### 1. Enumerate Files

- Build a full inventory of the target workflow's files with paths and purposes: `workflow.yaml` (root definition), `activities/*.yaml`, `routines/*.yaml`, `techniques/*.md` (`<slug>.md` standalone, `<group>/TECHNIQUE.md` container base contracts, `<group>/<sub>.md` nested), `resources/*.md`, and `README.md`

### 2. Classify Impact

- Classify each file as unaffected, directly modified (the change explicitly affects it), indirectly affected (a side-effect such as an exit the graph no longer binds), or removed (the change makes it obsolete), with justification
- Trace the side-effects each change class in `{accumulated_design}` implies: adding an activity may need new graph bindings upstream, techniques, or resources; removing one breaks the graph bindings that lead into it and may orphan techniques; renaming an activity id breaks every graph binding naming it and `initialActivity`; adding a checkpoint may need new variables; modifying checkpoint options may invalidate downstream conditions; adding or removing a mode affects the mode variable and every gate that branches on it; changing a variable's type affects all conditions comparing it

### 3. Check Exit Integrity

- Verify the workflow's `graph` binds every exit of every activity and sends each to an existing activity id or `__terminal__`, verify `initialActivity` still references a valid activity, and check that no activity becomes unreachable (nothing bound to it)

### 4. Check Reference Integrity

- Verify all `techniques[]` references (`::`-path / slug) resolve to existing technique `.md` files
- Verify all resource references resolve to existing resource files

### 5. Check Variable Integrity

- Verify every variable read by an exit `when`, a step `when` or `condition`, or a loop's `continueWhile`, `breakCondition` or `over` resolves to a defined workflow variable
- Verify all `effect.setVariable` keys in `kind: checkpoint` steps resolve to defined variables
- Check for orphaned variables (defined but never referenced)

### 6. Inventory Removals

- Compare the planned changes in `{accumulated_design}` against the existing content `{structural_inventory}` records, and list every material removal (fewer lines, removed sections, dropped fields, obsolete files)
- Set `{removal_count}` to the number of distinct inventoried removals (0 when none)

### 7. Assemble Report

- Assemble `{impact_analysis}` from the classification, the integrity checks and the removals inventory, at the shape [Template](../resources/impact-analysis.md#template) declares

## Rules

### content-preservation

A reduction is a decision, not a side-effect of an edit. Prefer additive change, and treat a reduction that no inventory row names as unapproved regardless of how small it is.
