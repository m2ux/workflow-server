---
metadata:
  version: 1.0.0
---

## Capability

Create `README.md` in the planning folder from the [readme](../../resources/readme.md) template.

## Inputs

### issue_context

`{ issue_title, issue_url, issue_type, current_date, status }` — context used to populate header fields

## Outputs

### created_readme

Full path to the created `README.md`

## Protocol

1. Load the README template from [readme](../../resources/readme.md).
2. Populate the header fields (name, date, status, type) from `{issue_context}`, the Executive Summary placeholder, and the Links table.
3. Leave Problem Overview and Solution Overview as placeholder text for later steps to populate.
4. Write the populated `README.md` to `{planning_folder_path}/README.md`, and return that location as `{created_readme}`.
