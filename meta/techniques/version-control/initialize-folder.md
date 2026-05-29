# initialize-folder

Create a planning folder for a new workflow run under `.engineering/artifacts/planning/`.

## Inputs

### initiative_name

Kebab-case identifier derived from the issue title or work-package description

## Output

### planning_folder_path

Absolute path to the created folder

## Procedure

1. Compose path: `.engineering/artifacts/planning/YYYY-MM-DD-{initiative_name}/`.
2. `mkdir -p` the path.
3. Return the absolute path as `planning_folder_path`.

## Errors

### no_folder_path

**Cause:** Attempted to write an artifact without a planning folder.

**Recovery:** Apply [initialize-folder](initialize-folder.md) first.
