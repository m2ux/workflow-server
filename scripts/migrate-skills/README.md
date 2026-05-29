# `scripts/migrate-skills/`

One-shot, idempotent migration utility that copies pre-migrated markdown skill
content from a planning-folder `legacy/` tree into a workflows worktree at the
on-disk shape the markdown skill loader expects.

## Inputs

- **`<legacy-source-dir>`** — the `legacy/` folder under the
  `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/` planning
  artifact. Expected layout:

  ```
  <legacy-source-dir>/
  ├── meta/
  │   ├── techniques/<slug>/SKILL.md  (+ optional sibling <op>.md children)
  │   └── resources/<slug>/SKILL.md   (+ optional sibling .md children)
  └── work-package/
      ├── techniques/<slug>/SKILL.md  (+ optional sibling <op>.md children)
      └── resources/<slug>/SKILL.md   (+ optional sibling .md children)
  ```

- **`<workflows-target-dir>`** — the workflows worktree root (e.g.
  `~/projects/work/workflows/2026-05-28-markdown-skills-impl/`). Each
  workflow subdirectory present under `<workflows-target-dir>` that matches a
  workflow under `<legacy-source-dir>` receives the new `techniques/` and
  `resources/` siblings. Workflows present under the legacy tree but absent
  from the target tree are skipped with a log line.

## Outputs

For each migrated workflow:

```
<workflows-target-dir>/<workflow>/techniques/<slug>/SKILL.md
<workflows-target-dir>/<workflow>/techniques/<slug>/<op>.md   (when present in source)
<workflows-target-dir>/<workflow>/resources/<slug>/SKILL.md
<workflows-target-dir>/<workflow>/resources/<slug>/<child>.md (when present in source)
```

Per-workflow counts (techniques migrated, op-child files materialised,
resources migrated) and a grand-total summary are printed to stdout.

## Idempotency contract

- Re-running with identical inputs overwrites destination files with byte-identical
  source content. No timestamps, no markers, no synthesised content.
- Adding new slugs to the legacy source and re-running copies the new slugs
  and leaves prior slugs unchanged.
- The script never deletes target files — removing legacy slugs from a workflow
  is a separate cleanup step (`workflows/<workflow>/techniques/<dead-slug>/`)
  that the operator performs manually.

## How to rerun

From the source-side worktree (workflow-server repo):

```
tsx scripts/migrate-skills/migrate.ts \
  ../../workflow-server/.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy \
  ~/projects/work/workflows/2026-05-28-markdown-skills-impl
```

…or via the npm alias once Task B6 lands the `migrate-skills` script entry in
`package.json`:

```
npm run migrate-skills -- <legacy-source-dir> <workflows-target-dir>
```

The script exits with code `1` on missing or non-directory inputs; success
returns `0`.

## Baseline capture (TC-09)

Capturing TOON output baselines from the legacy loader for the
projection-identity tests is a follow-on task tracked under Task B6. The
baseline-capture utility will live alongside `migrate.ts` in this folder and
will write to `tests/fixtures/markdown-skills/baselines/<workflow>__<technique>.toon`.
