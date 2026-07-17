---
metadata:
  version: 1.12.0
---

## Capability

Audit a workflow's authored content against the anti-pattern catalog: load the catalog, apply each entry's detect / do-not-flag / fix guidance to the target files (and, for Tool-Technique-Doc Consistency entries, against the actual harness tool surface and authoritative bootstrap resources), and persist findings with file, content, and recommended fix.

## Outputs

### anti_pattern_findings

Findings grouped by catalog entry **name** / **designator**: file path, offending content, and recommended fix.

### anti_pattern_findings_path

Absolute path to the persisted anti-pattern-findings artifact.

#### artifact

`anti-pattern-findings.md`

## Protocol

### 1. Load Catalog

- Load [anti-patterns](../resources/anti-patterns.md) — sole source of prohibited-pattern detect, exclusion, and fix criteria
- Do not restate, summarize, or number catalog entries in this technique; follow each entry as written

### 2. Apply Every Entry

- Walk every catalog subsection titled `### AP-XX. name` against the target workflow (`workflow.yaml`, activities, techniques, resources, READMEs as each entry's scope implies)
- For each entry: apply its **Detect** (or equivalent prose), honor **Do not flag** / caveats / exceptions, and record **Fix** when a violation is found
- For Tool-Technique-Doc Consistency entries: also compare authored tool names and return/bootstrap claims to the actual harness tool surface and authoritative bootstrap/meta resources — those entries require surface evidence, not a prose-only skim
- For each finding record into `{anti_pattern_findings}`: entry **name** (primary), **AP-XX** designator, file path, offending content, recommended fix
- Prefer structural evidence (fields, shapes, phrases named by the entry) over inferred intent
- Do not cite or depend on the catalog's total entry count

### 3. Persist Findings

- Persist `{anti_pattern_findings}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `anti-pattern-findings.md`, following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{anti_pattern_findings_path}`
