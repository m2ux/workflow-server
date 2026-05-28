# detect-changes

Verify the scope of recent edits — confirm only expected files / symbols changed.

## Inputs

- **repo_name** — Repository name

## Output

- **delta** — Changed symbols / processes since last scan

## Procedure

1. Call `gitnexus detect_changes({ repo_name })`.
