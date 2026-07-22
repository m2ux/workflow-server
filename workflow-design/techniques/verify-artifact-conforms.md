---
metadata:
  version: 1.0.0
---

## Capability

Design-session planning-artifact conformance check against this workflow's output-discipline Rules and canonical-home map.

## Outputs

### artifact_conformance

The conformance envelope — the violation list plus the aggregate verdict:

#### conforms

true iff the `violations` array is empty after fixes are applied.

#### violations

array of `{ file, rule, detail, fixed }` entries — one per detected violation, where `rule` names the output-discipline rule breached (`single-source-and-link`, `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, or `line-budget`) and `fixed` records whether the in-place fix was applied.

## Protocol

1. Enumerate planning artifacts in `{planning_folder_path}` (every `.md` except session state files).
2. Check each against this workflow's output-discipline Rules and the design [canonical-home map](./TECHNIQUE.md#canonical-home-map) — apply `single-source-and-link`, `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, and `line-budget` by cite (do not restate Detect here).
3. Fix each violation in place (link to canonical home, delete null/recap sections, collapse all-pass tables, condense over-budget prose). Preserve user-requested content.
4. Compose `{artifact_conformance}` (`violations` + `conforms`). Report exceptions only.

## Rules

### design-map-not-work-package

Always read [canonical-home-map](./TECHNIQUE.md#canonical-home-map) from this workflow's `techniques/TECHNIQUE.md`. Do not bind or follow the work-package manage-artifacts map for design-session artifacts.
