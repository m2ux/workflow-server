Create README.md in the planning folder from the [readme](../../resources/readme.md) template.

## Inputs

### planning_folder_path

Path to the planning folder

### issue_context

{ issue_title, issue_url, issue_type, current_date, status } — context used to populate header fields

## Output

### readme_path

Full path to the created README.md

## Protocol

1. Load the README template from [readme](../../resources/readme.md).
2. Populate the header fields (name, date, status, type) from `issue_context`, the Executive Summary placeholder, and the Links table.
3. Leave Problem Overview and Solution Overview as placeholder text for later activities to populate.
4. Write the populated README.md at `{planning_folder_path}/README.md`.
