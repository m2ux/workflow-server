---
metadata:
  version: 1.1.0
---

## Capability

The run's findings register, rolled up from every target swept.

## Inputs

### register_sections

The per-target sections gathered across the sweep, each carrying a target id with its findings, its coverage divergences and its validation result.

### verified_findings

The recalibrated finding set, each entry marked confirmed, downgraded or withdrawn.

### coverage_ledger

One row per enumeration unit the walk covered, each carrying its home, its anchor and its status.

### known_finding_keys

Keys of findings already accepted or baselined, each pairing a criteria entry with a location.

### impact_analysis_path

*(optional)* Absolute path to the impact report this run produced. Absent on a run with no impact pass behind it.

### fixes_applied

*(optional)* The per-finding record of what a remediation round edited. Absent on a first pass.

## Outputs

### findings_register

The register body: the severity summary, the change-surface membership table (touched whole files, I/O-contract closure, consumers), one findings section per target, the coverage divergences, the accepted exclusions and the sources consulted. Shaped by [Template](../../resources/findings-register.md#template). Read by later steps of the same run as much as by a person, so every section is one row per item rather than prose.

#### artifact

`findings-register.md`

#### audience

`human`

## Protocol

### 1. Roll Up the Findings

- Fold `{register_sections}` into one findings section per target, taking each row's severity, entry, location, evidence, origin and known marking from `{verified_findings}` where an entry was re-derived
- Count the severity summary from the surviving entries, with entries keyed in `{known_finding_keys}` counted under Known rather than Open
- Emit the header change-surface counts and the **Change surface** table (path × how it joined: touched whole file, I/O-contract closure, or consumer) from each target's `{changed_files}` / `{touched_files}` / `{consumer_surface}` — never a hunk list

### 2. Record the Divergences and the Exclusions

- Take the rows of `{coverage_ledger}` that carry `blocked` or `not-applicable` into the coverage section
- When any `walked` unit that intersects the change surface carries `evidence`, include a **Coverage evidence** subsection with those rows (file, field, entry-or-clean, quote) — required for Description Hygiene and every other unit that reached whole change-surface files; omit the subsection only when no unit required evidence
- Omit the coverage section entirely only when every unit was walked with no divergences and no evidence obligation
- Take the entries excluded by `{known_finding_keys}` into the known section, and omit it when nothing is excluded
- When `{fixes_applied}` is present, record what the remediation round changed against the findings it resolved

### 3. Record the Sources

- Emit one sources row per input artifact the register drew on, each a label and a path, including `{impact_analysis_path}` when it is present
- When no artifact was consulted, omit the section rather than emitting it empty

## Rules

### the-register-is-the-decision-surface

The register carries rows a reader can act on and links to the artifacts behind them. It never embeds criteria prose, and it never restates the body of an artifact it links.
