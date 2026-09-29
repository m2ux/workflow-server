---
metadata:
  version: 1.3.0
---

## Capability

Impact assessment of a proposed change against an existing workflow definition.

## Inputs

### change_brief

The change brief for this run — purpose and the dimensions the change alters.

### structural_inventory

Baseline of the target's existing definition: file counts by kind, entity counts, activity ids in prefix order, and what the change touches.

## Outputs

### removal_count

Number of distinct content removals in the inventory, counting diff-based and obsolete-file removals alike. Zero when the change is additive or string-only with no material deleted.

### change_constraints

The constraints the change surface imposes on scope: the co-change set — files that must move together for the change to stay coherent — and the identifier-collision set of names already taken in the target.

### impact_analysis

The assembled impact report: per-file classification, the integrity verdicts, and the removals inventory as removed-versus-preserved rows. Shaped by [Template](../resources/impact-analysis.md#template).

#### artifact

`impact-analysis.md`

#### audience

`human`

## Protocol

### 1. Enumerate Files

- Build a full inventory of the target's files with paths and purposes: the root definition, `activities/*.yaml`, `routines/*.yaml`, techniques (`<slug>.md` standalone, `<group>/TECHNIQUE.md` container contracts, `<group>/<op>.md` nested), `resources/*.md` and the README

### 2. Classify Impact

- Classify each file as unaffected, directly modified (the change explicitly affects it), indirectly affected (a side-effect such as an exit the graph no longer binds), or removed (the change makes it obsolete), with a one-line justification
- Trace the side-effects each change class in `{change_brief}` implies: adding an activity may need new graph bindings upstream, techniques or resources; removing one breaks the graph bindings that lead into it and may orphan techniques; renaming an activity id breaks every graph binding naming it and `initialActivity`; adding a checkpoint may need new variables; changing checkpoint options may invalidate downstream conditions; adding or removing a mode affects the mode variable and every gate that branches on it; changing a variable's type affects every condition comparing it

### 3. Check Exit Integrity

- Verify the workflow's `graph` binds every exit of every activity and sends each to an existing activity id or `__terminal__`, verify `initialActivity` still names a valid activity, and verify no activity is left with nothing bound to it

### 4. Check Reference Integrity

- Verify every `techniques[]` and `technique:` reference resolves to an existing technique file, and every resource reference to an existing resource file

### 5. Check Variable Integrity

- Verify every variable read by an exit `when`, a step `when` or `condition`, or a loop's `continueWhile`, `breakCondition` or `over` resolves to a declared variable
- Verify every checkpoint `effect.setVariable` key resolves to a declared variable
- Record any variable declared and never referenced

### 6. Derive the Change Constraints

- From the classification and the reference checks, take every set of files that must move together for the change to stay coherent, and every identifier the target already uses that a new name could collide with, as `{change_constraints}`

### 7. Inventory Removals

- Compare the planned change against the existing content and list every material removal — fewer lines, removed sections, dropped fields, obsolete files
- Record each removal as a removed-versus-preserved pair naming what drops and what stays in that region
- Set `{removal_count}` to the number of distinct inventoried removals

### 8. Compose the Impact Report

- Assemble `{impact_analysis}` from the classification, the integrity verdicts and the removals inventory, at the shape [Template](../resources/impact-analysis.md#template) declares
- Link `{change_brief}` on the Change source line and `{structural_inventory}` on the Baseline line

## Rules

### content-preservation

A reduction is a decision, not a side-effect of an edit. Prefer additive change.
