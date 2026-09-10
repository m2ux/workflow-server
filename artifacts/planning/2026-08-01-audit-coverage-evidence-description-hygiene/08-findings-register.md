# Findings Register — workflow-authoring (+ host guard)

**Date:** 2026-08-01 · **Mode:** Create  
**Base ref:** `workflows` @ `eaac1cf0` / host `main` @ `fee9f6df`  
**Targets:** workflow-authoring; host scripts (guard only)

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |

**Coverage:** walked (change-reaching units with evidence) · blocked 0 · evidence rows below

## Findings

_No open findings on the change surface after Detect._

## Coverage

### Coverage evidence — Description Hygiene

| Unit | File | Field | Disposition | Quote |
|------|------|-------|-------------|-------|
| description-hygiene-anti-patterns | workflow-authoring/activities/08-quality-review.yaml | activity.description | clean | `Criteria walk with field-level coverage evidence per target, consumer-surface reach, and definition guards as a separate mechanical net.` |
| description-hygiene-anti-patterns | workflow-authoring/activities/08-quality-review.yaml | steps[target-sweep-loop]/steps[validate-schema].set[register_sections].message | clean | register section append message names bag fields only — no procedure essay |
| description-hygiene-anti-patterns | workflow-authoring/activities/08-quality-review.yaml | bound technique steps | clean | no `description`/`name` on kind:technique steps (bound-step-no-description) |
| description-hygiene-anti-patterns | workflow-authoring/techniques/workflow-definition/inventory-prose-fields.md | ## Capability | clean | `The inventory of every definition-prose field on the target's changed definition surface that Description Hygiene and bound-step criteria reach.` |
| description-hygiene-anti-patterns | workflow-authoring/techniques/workflow-definition/audit-canon.md | ## Capability | clean | `One walk of every criteria home against a target's definition surface...` |
| description-hygiene-anti-patterns | workflow-authoring/techniques/workflow-definition/verify-high-findings.md | ## Capability | clean | `Independent re-derivation of the high-severity findings...` |
| description-hygiene-anti-patterns | workflow-authoring/techniques/workflow-definition/compile-report.md | ## Capability | clean | `The run's findings register, rolled up from every target swept.` |
| description-hygiene-anti-patterns | workflow-authoring/techniques/workflow-definition/audit-schema-validation.md | ## Capability | clean | `The repository's definition guards run against one target...` |
| description-hygiene-anti-patterns | workflow-authoring/resources/findings-register.md | frontmatter description | clean | `Creation guide for the findings-register planning artifact — findings rows, coverage divergences, known exclusions, sources.` |

### Coverage evidence — Technique Protocol / Schema Expressiveness (change surface)

| Unit | File | Field | Disposition | Quote |
|------|------|-------|-------------|-------|
| technique-protocol | inventory-prose-fields.md | ## Protocol phases | clean | numbered phases 1–3; Capability WHAT-only; I/O declared |
| technique-protocol | audit-canon.md | walked-requires-evidence rule | clean | status walked requires evidence list when intersecting changed_files |
| schema-expressiveness | 08-quality-review.yaml | steps[].technique | clean | inventory-prose-fields bound before sweep-canon; no procedure-in step description |
| bound-step-no-description | 08-quality-review.yaml | all technique steps | clean | id + technique (+ when/loop/actions) only |

### Divergences

_None. Units that do not reach this surface (e.g. stealth isolation on workflow-authoring alone) are not-applicable without blocking commit of this method change._

## Sources

| Label | Path / command |
|-------|----------------|
| Mechanical net | `npx tsx scripts/check-description-hygiene.ts --root <workflows-wt>` → OK |
| Fixture fail-closed | synthetic activity with procedure essay → 3 violations, exit 1 |
| check:all subset | description-hygiene, audience, checkpoint-entry, technique-template, activities, refs, anchors, variable-model, fragments, self-input, activity-tech, identifiers → 12 PASS |
| Prose inventory script | field extract on 7 changed definition files |

## Method note

This register includes **Coverage evidence** rows. Marking Description Hygiene `walked` without those rows would set `has_coverage_gap` under the updated verify-high-findings contract.
