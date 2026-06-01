Write artifact content to the planning folder with the activity prefix applied.

## Inputs

### planning_folder_path

Path to the planning folder

### artifact_prefix

The activity's `artifactPrefix` (server-computed from the activity filename, e.g., `09` from `09-post-impl-review.toon`); provided by the server in the activity definition

### bare_filename

Technique-declared bare artifact filename (e.g., `code-review.md`)

### content

Artifact content to write

## Output

### artifact_path

Full path to the written artifact

## Protocol

1. Compose the full filename: `{artifact_prefix}-{bare_filename}` (e.g., `09-code-review.md`).
2. Compose the full path: `{planning_folder_path}/{full_filename}`.
3. Write the artifact content at the composed path. Preserve existing artifacts — do not overwrite siblings.
