---
metadata:
  version: 1.2.0
---

## Capability

Create the private planning folder and seed its README from a template that omits the public Links table, keeping the advisory off any public surface.

## Outputs

### planning_readme

Planning-folder README seeded from the standard template with the Links table omitted, so no public PR or Issue link is recorded.

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Initialize Planning Folder

- Create `{planning_folder_path}` if it does not exist.
- Write `{planning_readme}` into `{planning_folder_path}` per [planning-readme](../../../meta/resources/planning-readme.md#template), omitting the Links table so no public PR or Issue link appears.
