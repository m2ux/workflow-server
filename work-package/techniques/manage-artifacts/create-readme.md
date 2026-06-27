---
metadata:
  version: 2.0.0
---

## Capability

Create `README.md` in the planning folder from a template resource, populating its header fields from the supplied entity context.

## Inputs

### entity_context

`{ entity_title, entity_url, entity_type, current_date, status }` — context used to populate the README header fields. Generic across whatever a planning folder tracks: a tracker issue for an implementation work package, a workflow id for a workflow-design session, and so on.

### readme_template

*(optional)* `get_resource` id of the README template to populate from.

#### default

`work-package/readme`

## Outputs

### created_readme

Full path to the created `README.md`

## Protocol

1. Load the README template resource named by `{readme_template}` via `get_resource`.
2. Populate the header fields (name, date, status, type) from `{entity_context}`, the Executive Summary placeholder, and the Links table.
3. Leave the remaining overview sections as placeholder text for later steps to populate.
4. Write the populated `README.md` to `{planning_folder_path}/README.md`, and return that location as `{created_readme}`.
