---
name: findings-register
description: Creation guide for the findings-register planning artifact — findings rows, coverage divergences, known exclusions, sources.
metadata:
  version: 1.1.0
  order: 13
---

# Findings Register Guide

The audit record for a run: what the criteria walk found, which enumeration units it could not walk, field-level coverage evidence for units that reached the change surface, and which findings a prior pass already accepted. Read by later steps of the same run as much as by a person, so its sections are one row per item rather than prose. Canonical home for audit findings ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

Each section below is fetched on its own. A consumer that needs the row shape does not load the skeleton, and a consumer that needs the skeleton does not load the exclusion rules.

## Template

~~~~markdown
# Findings Register — `{workflow-id}`

**Date:** YYYY-MM-DD · **Mode:** Create | Update | Review
**Base ref:** `{ref}` · **Targets:** one row per target below

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | N | N |
| High     | N | N |
| Medium   | N | N |
| Low      | N | N |

**Coverage:** walked W · not-applicable N · blocked B · evidence rows E

## Findings

[One section per target swept, each holding that target's findings table.]

## Coverage

[Divergences (`blocked` / `not-applicable`) and, when any walked unit reached changed files, the Coverage evidence table.]

## Known

[Findings a prior pass accepted, excluded from the decision surface. Omit when empty.]

## Sources

[One row per input artifact consulted, label and path. Omit when none.]
~~~~

## Findings

One row per finding, in severity order — Critical, then High, Medium, Low.

| Column | Carries |
|--------|---------|
| ID | Stable within the register, so a disposition can name a row |
| Severity | `Critical` for a schema-invalid or structurally broken construct that must not be committed, then `High`, `Medium`, `Low` |
| Entry | The criteria entry by its kebab-case name — never a bare historic number, and never the catalogue's entry count |
| Location | File and field, at the depth the entry's evidence sits |
| Evidence | The construct the entry's Detect keys on, quoted or named |
| Origin | `diff` when the violation arrived with this change, `pre-existing` when it was already there at the base ref |
| Known | Set when a prior pass accepted this finding's key |
| Fix | The action the entry prescribes, in one line |

A row whose Evidence column cannot name a construct is not a finding and does not belong in the table.

## Coverage

Two kinds of row live here.

### Divergences

| Column | Carries |
|--------|---------|
| Home | The criteria home the unit belongs to |
| Unit | The unit's own anchor |
| Status | `not-applicable` with the reason it does not reach this surface, or `blocked` with what prevented the walk |

Only `blocked` represents missing coverage. `not-applicable` is an evidenced negative and does not.

### Coverage evidence

Required whenever a unit is `walked` and reaches any file in the change set. One row per inspected field or locus on those files.

| Column | Carries |
|--------|---------|
| Unit | Enumeration unit anchor (e.g. `description-hygiene-anti-patterns`) |
| File | Path under the edit surface |
| Field | Field path (`activity.description`, `steps[id].set[target].description`, …) |
| Disposition | Criteria entry kebab-case on a hit, or `clean` |
| Quote | Short quote or path:line of the construct inspected |

A unit that reaches changed files with **no** evidence rows is incomplete coverage — record it as `blocked` (missing evidence), not as a silent walk. Description Hygiene without a prose-field inventory and evidence table is the canonical form of that defect.

The obligation is one divergence row per unwalked enumeration unit of each named home, plus evidence rows for every walked unit that touches the change. The inventory of units is not restated here — it lives in the walking operation's own first phase, which is its single home.

## Known

One row per finding a prior pass accepted, carrying its key and where the acceptance was recorded. Excluded from the decision surface and from the Summary's Open column, counted under Known. Omit the section when nothing is excluded.

## Sources

One row per input artifact the register drew on, each a label and a path. A run that consulted none omits the section.

## Rules

- **Rows, not prose.** Every section is one row per item; a section that would read as a narrative belongs somewhere else.
- **Evidence is part of the decision surface.** Summary counts severities **and** coverage (walked / blocked / evidence rows). A green findings table with blocked units or missing evidence is not a clean audit.
- **Guards are not coverage.** Definition-guard results may appear under Sources or a findings entry for a guard failure; they never substitute for Coverage evidence rows.
- **Omit an empty section** rather than emitting it with a "none" row — except Coverage evidence, which is omitted only when no walked unit required it.
- **Cite entries by name.** Never a bare historic designator, and never any count of the catalogue's entries.
- **Own facts only.** Link the artifacts the register drew on; do not restate their bodies ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Line budget:** the finding and evidence rows are the length; everything around them stays inside ~80 lines.
