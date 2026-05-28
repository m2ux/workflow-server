# create-folder

Create the planning folder at `.engineering/artifacts/planning/YYYY-MM-DD-{initiative-name}/`.

## Inputs

- **planning_folder_parent** — Parent path for the planning folder (typically `.engineering/artifacts/planning/`)
- **issue_title** — Issue title used to derive the initiative-name slug

## Output

- **folder_path** — Full path to the created (or existing) planning folder

## Procedure

1. Derive `initiative-name` from `issue_title` (slugified: lowercase, kebab-case, alphanumerics and hyphens).
2. Compose the folder path: `{planning_folder_parent}/YYYY-MM-DD-{initiative-name}/` where `YYYY-MM-DD` is today's date.
3. Create the folder via `mkdir -p` at the composed path. Verify creation with `ls`.

## Errors

### folder_exists

**Cause:** Planning folder already exists at the composed path

**Recovery:** Use the existing folder and continue with activity-based prefixing

### permission_error

**Cause:** Cannot create the directory at the composed path

**Recovery:** Check the path and filesystem permissions
