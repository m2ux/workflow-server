---
metadata:
  version: 1.0.0
---

## Capability

The inventory of every definition-prose field on the target's changed definition surface that Description Hygiene and bound-step criteria reach.

## Inputs

### surface_files

Every definition file of the target in scope for this walk.

### changed_files

The subset of `{surface_files}` that differs from the run's base ref.

## Outputs

### prose_field_inventory

One row per prose field on `{changed_files}` that Description Hygiene or bound-step criteria can key on: file path, field path (`activity.description`, `steps[<id>].description`, `steps[<id>].set[<target>].description`, `steps[<id>].name`, checkpoint `message` / option `description`, technique `## Capability` when the file is a technique), and a short quote of the field's text. Empty when `{changed_files}` holds no such field.

## Protocol

### 1. Restrict to the Change Surface

- Take `{changed_files}` as the inventory scope. Files only in `{surface_files}` stay out of this inventory; the full-surface walk still covers them under other units.

### 2. Enumerate Prose Fields

- For each activity YAML in scope, record `description` on the activity, on unbound steps, on `action: set` entries, on checkpoint `message` and option `description` / `label` prose, and on bound `kind: technique` steps that still carry `description` or `name`
- For each technique markdown in scope, record the `## Capability` body as one field
- For each resource or README markdown in scope whose body is definition orientation (not a planning artifact), record top-level purpose paragraphs that function as description

### 3. Emit the Inventory

- Emit `{prose_field_inventory}` as one row per field at the shape its Output declaration states
- When no field qualifies, emit an empty inventory — emptiness is evidence that Description Hygiene has no changed prose to walk, not a skip

## Rules

### inventory-before-hygiene-walk

Description Hygiene Detect runs against this inventory (and the full surface for pre-existing fields). A walk that marks Description Hygiene `walked` without an inventory that covers every changed prose field is incomplete — the unit is `blocked` for missing inventory, not `walked`.
