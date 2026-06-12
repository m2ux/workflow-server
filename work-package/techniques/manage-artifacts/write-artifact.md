---
metadata:
  version: 1.0.0
---

## Capability

Write (create or update) an artifact in the planning folder. A logical artifact — identified by its bare filename — has exactly ONE numbered instance: the one its first write created. Later writes of the same bare filename UPDATE that instance in place, preserving its original number, rather than minting a new prefix.

## Inputs

### artifact_prefix

The numeric `artifactPrefix` that orders artifacts (e.g., `09`); provided by the server.

### bare_filename

Technique-declared bare artifact filename (e.g., `code-review.md`)

### artifact_content

Artifact content to write

### target_dir

*(optional, default `planning_folder_path`)* The directory the artifact is written into. Defaults to `{planning_folder_path}`; bind it to `{comprehension_dir}` when writing into the comprehension directory rather than the planning folder.

## Outputs

### written_artifact

Full path to the written artifact

## Protocol

Find-or-create, keyed on the bare filename:

1. Look in `{target_dir}` for an existing instance of this artifact — a file matching `<NN>-{bare_filename}` (any two-digit prefix) or a bare `{bare_filename}`.
2. **If an instance exists → UPDATE that file in place,** writing `{artifact_content}` to it. Keep its existing numeric prefix; do NOT create a second copy under a different number. (e.g. `assumptions-log.md` created as `02-assumptions-log.md` stays `02-assumptions-log.md` when a later write updates it.)
3. **If no instance exists → CREATE** `{artifact_prefix}-{bare_filename}` (e.g. `09-code-review.md`) under `{target_dir}` and write `{artifact_content}` into it. The first write's prefix becomes the artifact's permanent number.
4. Preserve OTHER artifacts (different bare filenames) — never overwrite a sibling that is a different logical artifact.
5. Return the full path to the file just written as `{written_artifact}`.

Note: token-templated names (e.g. `strategic-review-{n}.md`) are an intentional numbered SERIES — each interpolated name is its own logical artifact and is created, not matched against siblings.
