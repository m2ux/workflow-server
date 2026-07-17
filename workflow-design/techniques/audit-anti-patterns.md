---
metadata:
  version: 1.7.0
---

## Capability

Audit a workflow's authored content against the anti-pattern catalog: load the catalog, apply each entry's detect / do-not-flag / fix guidance to the target files, and present findings with file, content, and recommended fix.

## Protocol

### 1. Load Catalog

- Load [anti-patterns](../resources/anti-patterns.md) via `get_resource` — it is the sole source of prohibited-pattern detect, exclusion, and fix criteria
- Do not restate, summarize, or number catalog entries in this technique; follow each entry as written

### 2. Apply Every Entry

- Walk every catalog subsection titled `### AP-XX. name` against the target workflow (`workflow.yaml`, activities, techniques, resources, READMEs as each entry's scope implies)
- For each entry: apply its **Detect** (or equivalent prose), honor **Do not flag** / caveats / exceptions, and record **Fix** when a violation is found
- For each finding record: entry **name** (primary), **AP-XX** designator, file path, offending content, recommended fix
- Prefer structural evidence (fields, shapes, phrases named by the entry) over inferred intent
- Do not cite or depend on the catalog's total entry count

### 3. Present Findings

- Present findings grouped by catalog entry **name** / **designator**: file, content, recommended fix
- Do not reproduce catalog essays in the presentation — cite the entry name and the concrete violation only
