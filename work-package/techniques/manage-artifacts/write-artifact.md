---
metadata:
  version: 1.1.0
---

## Capability

Planning-folder artifact write keyed on bare filename — one numbered instance per logical artifact (find-or-update).

## Inputs

### artifact_prefix

*(optional)* The numeric `artifactPrefix` that orders artifacts (e.g., `09`); server-provided — see [artifact-prefix](./TECHNIQUE.md#artifact-prefix).

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

1. Look in `{target_dir}` for an existing instance of this artifact — a file matching `<NN>-{bare_filename}` (any two-digit prefix) or a bare `{bare_filename}`. If **more than one** matching numbered instance already exists (e.g. `01-assumptions-log.md` and `08-assumptions-log.md`), treat that as a mint conflict: UPDATE the **lowest-numbered** instance in place, do **not** create another prefix, and append one row to the planning folder's assumptions-log (bare filename `assumptions-log.md` — find-or-update that log the same way) noting the duplicate paths and that the write targeted the canonical (lowest) instance.
2. **If exactly one instance exists → UPDATE that file in place,** writing `{artifact_content}` to it. Keep its existing numeric prefix; do NOT create a second copy under a different number. (e.g. `assumptions-log.md` created as `02-assumptions-log.md` stays `02-assumptions-log.md` when a later write updates it.)
3. **If no instance exists → CREATE** `{artifact_prefix}-{bare_filename}` (e.g. `09-code-review.md`) under `{target_dir}` and write `{artifact_content}` into it. The first write's prefix becomes the artifact's permanent number.
4. **Mint-attempt guard:** Before creating under `{artifact_prefix}-{bare_filename}`, re-scan for any `<NN>-{bare_filename}`. If one appeared (race or stale listing), fall through to step 2 (update) instead of creating. Never mint a second numbered instance of the same bare filename.
5. Preserve OTHER artifacts (different bare filenames) — never overwrite a sibling that is a different logical artifact.
6. Return the full path to the file just written as `{written_artifact}`.

Note: token-templated names (e.g. `strategic-review-{n}.md`) are an intentional numbered SERIES — each interpolated name is its own logical artifact and is created, not matched against siblings.
