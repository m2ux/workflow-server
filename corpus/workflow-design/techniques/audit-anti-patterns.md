---
metadata:
  version: 1.13.0
---

## Capability

Anti-pattern catalog audit of authored workflow content, including harness-tool and bootstrap-resource consistency entries.

## Outputs

### anti_pattern_findings

Findings grouped by catalog entry **name** / **designator**: file path, offending content, and recommended fix.

#### artifact

`anti-pattern-findings.md`

#### audience

`human`

### anti_pattern_findings_path

Absolute path to the persisted anti-pattern-findings artifact.

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

- Persist `{anti_pattern_findings}` following the [Findings Satellite Guide](../resources/findings-satellite.md#template); capture `{anti_pattern_findings_path}`
