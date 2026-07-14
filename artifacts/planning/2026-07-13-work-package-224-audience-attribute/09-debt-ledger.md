# Ponytail Debt Ledger — #224 V4 (audience attribute)

> harvest-debt · commit `482332e4` · 2026-07-14

Harvest of `ponytail:` markers across `target_path`
(`/home/mike1/projects/work/workflow-server/2026-07-13-work-package-224-audience-attribute/`),
via `grep -rnE '(#|//) ?ponytail:' .` (excluding `node_modules`, `.git`, build output).

## Ledger

The V4 change (13 files) introduced **no** ponytail markers. The only tree-wide matches are the
ponytail workflow's own convention documentation — the convention's illustrative examples, not
deliberate simplifications in operational code, so they are not harvestable debt:

- `workflows/ponytail/README.md:138` — a tree-diagram comment naming the convention file.
- `workflows/ponytail/resources/ponytail-marker-convention.md:23` — a fenced-code *example* marker (`hard-coded page size 50`).
- `workflows/ponytail/resources/ponytail-marker-convention.md:28` — a fenced-code *example* marker (`single concrete handler`).

No deliberate-simplification marker was left in any of the 13 changed files
(`src/schema/technique.schema.ts`, `schemas/technique.schema.json`,
`src/loaders/markdown-technique-loader.ts`, `src/tools/workflow-tools.ts`, `scripts/check-audience.ts`,
`scripts/audience-baseline.json`, `package.json`, `docs/*`, and the four test files).

## Result

```
No ponytail: debt. Clean ledger.
```

0 markers introduced by this change, 0 with no trigger.
