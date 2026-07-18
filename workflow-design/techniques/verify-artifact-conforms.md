---
metadata:
  version: 1.0.0
---

## Capability

Verify every planning artifact in the design-session folder against this workflow's output-discipline rules — canonical-home sections not duplicated, link-only slots not restated, null sections omitted, per-template line budgets respected — and fix violations in place. Thin design-local peer of [work-package manage-artifacts verify-artifact-conforms](../../work-package/techniques/manage-artifacts/verify-artifact-conforms.md); applies the **design** [canonical-home map](./TECHNIQUE.md#canonical-home-map), not the work-package map.

## Outputs

### artifact_conformance

The conformance envelope — the violation list plus the aggregate verdict:

#### conforms

true iff the `violations` array is empty after fixes are applied.

#### violations

array of `{ file, rule, detail, fixed }` entries — one per detected violation, where `rule` names the output-discipline rule breached (`single-source-and-link`, `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, or `line-budget`) and `fixed` records whether the in-place fix was applied.

## Protocol

1. Enumerate the planning artifacts in `{planning_folder_path}` — every `.md` file except `session.json`-adjacent state files.
2. Check each artifact against this workflow's output-discipline rules and the design [canonical-home map](./TECHNIQUE.md#canonical-home-map):
   - a section restating content whose canonical home is another artifact (map lookup) breaches `single-source-and-link`;
   - a link-only slot (a template section defined as a one-line pointer) carrying more than a link plus one line breaches `single-source-and-link`;
   - a section whose content is "None", "N/A", or a statement of non-applicability breaches `omit-null-sections`;
   - a recap table or closing summary restating the artifact's own sections breaches `state-once-per-artifact`;
   - an all-pass status table breaches `exception-only-reporting`;
   - an artifact exceeding a line budget declared in its template's `## Rules` breaches `line-budget`.
3. Fix each violation in place: replace restatement with a link to the canonical home, delete null sections and recap tables, collapse all-pass tables to one line, and condense over-budget prose. Preserve any content the user explicitly requested.
4. Compose `{artifact_conformance}`: its `violations` array lists every detected violation with its fix status; its `conforms` verdict is true iff the list is empty after fixes. Report exceptions only — a fully conformant folder is the one-line result, not a per-file table.

## Rules

### design-map-not-work-package

Always read [canonical-home-map](./TECHNIQUE.md#canonical-home-map) from this workflow's `techniques/TECHNIQUE.md`. Do not bind or follow the work-package manage-artifacts map for design-session artifacts.
